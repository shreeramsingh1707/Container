import { useEffect, useState } from "react";
import { sellMonthlyInterest, WithdrawRequest } from "../services/api";

/* ============================
   Types
============================ */
interface RoiTransaction {
  roiTxnPkId: number;
  investmentFkId: number;
  contractMonth: number;
  monthlyPayout: number;
  roiPercentage: number;
  currency: string;
  status: "ACTIVE" | "WITHDRAWN" | "PENDING";
  creditedAt: string;
}

/* ============================
   API Service
============================ */
const BASE_URL =
  "http://containershipment-app-env.eba-p7ijagki.ap-south-1.elasticbeanstalk.com/api/container";

const api = {
  // Fetch all ROI transactions for a user
  getRoiTransactions: async (userFkId: string): Promise<RoiTransaction[]> => {
    const res = await fetch(
      `${BASE_URL}/getRoiTransaction?page=1&size=25&filterBy=ACTIVE&inputPkId=null&inputFkId=${userFkId}`
    );
    if (!res.ok) throw new Error("Failed to fetch ROI transactions");
    const data = await res.json();
    return data.data || [];
  },

  // Submit withdraw request — sellMonthlyInterest.add() is already a typed API
  // call that returns Promise<WithdrawRequest> (parsed JSON), so we just await it.
  // Do NOT call .ok or .json() on it — it's not a raw Response object.
  addWithdrawRequest: async (
    payload: WithdrawRequest
  ): Promise<WithdrawRequest> => {
    try {
      const result = await sellMonthlyInterest.add(payload);

      return result;
    } catch (err: any) {
      // apiCall() already throws on non-2xx, forward the message cleanly
      throw new Error(err?.message || "Failed to submit withdraw request");
    }
  },

  // Fetch withdraw history for a user
  getWithdrawRequests: async (
    userFkId: string
  ): Promise<WithdrawRequest[]> => {
    const res = await fetch(
      `${BASE_URL}/withdraw/getWithdrawRequests?userFkId=${userFkId}&page=1&size=25&filterBy=ALL`
    );
    if (!res.ok) throw new Error("Failed to fetch withdraw history");
    const data = await res.json();
    return data.content || data.data || [];
  },
};

/* ============================
   Helpers
============================ */
const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem("stylocoin_user") || "{}");
  } catch {
    return {};
  }
};

const isEligible = (creditedAt: string): boolean => {
  const diffInDays =
    (Date.now() - new Date(creditedAt).getTime()) / (1000 * 60 * 60 * 24);
  return diffInDays >= 30;
};

const formatDate = (iso: string) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const statusColor: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700 border-yellow-200",
  APPROVED: "bg-blue-100 text-blue-700 border-blue-200",
  WITHDRAWN: "bg-green-100 text-green-700 border-green-200",
  REJECTED: "bg-red-100 text-red-700 border-red-200",
};

/* ============================
   Component
============================ */
export default function SellMonthlyInterest() {
  const user = getUser();
  const userFkId: string = user?.nodeId || "";

  // State
  const [activeTab, setActiveTab] = useState<"withdraw" | "history">("withdraw");
  const [roiList, setRoiList] = useState<RoiTransaction[]>([]);
  const [withdrawHistory, setWithdrawHistory] = useState<WithdrawRequest[]>([]);
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  const [withdrawalAddress, setWithdrawalAddress] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [roiLoading, setRoiLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);

  /* ============================
     Show Toast
  ============================ */
  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  /* ============================
     Fetch ROI Transactions
  ============================ */
  const fetchRoi = async () => {
    if (!userFkId) return;
    try {
      setRoiLoading(true);
      const data = await api.getRoiTransactions(userFkId);
      setRoiList(data);
    } catch (err: any) {
      showToast("error", err.message || "Failed to load ROI data");
    } finally {
      setRoiLoading(false);
    }
  };

  /* ============================
     Fetch Withdraw History
  ============================ */
  const fetchHistory = async () => {
    if (!userFkId) return;
    try {
      setHistoryLoading(true);
      const data = await api.getWithdrawRequests(userFkId);
      setWithdrawHistory(data);
    } catch (err: any) {
      showToast("error", err.message || "Failed to load history");
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchRoi();
  }, []);

  // useEffect(() => {
  //   if (activeTab === "history") fetchHistory();
  // }, [activeTab]);
  useEffect(() => {
    if (activeTab === "history") {
      fetchHistory();
    } else {
      // Clear stale history when leaving tab so next visit re-fetches
      setWithdrawHistory([]);
    }
  }, [activeTab]);

  /* ============================
     Derived Values
  ============================ */
  const availableRois = roiList.filter(
    (r) => r.status?.toUpperCase() === "ACTIVE"
  );

  const totalInterest = availableRois.reduce(
    (sum, r) => sum + Number(r.monthlyPayout || 0),
    0
  );

  const isAnyEligible = availableRois.some((r) => isEligible(r.creditedAt));

  const primaryCurrency = availableRois[0]?.currency || "INR";
  const primaryInvestmentFkId = availableRois[0]?.investmentFkId;

  const amountNum = parseFloat(withdrawAmount) || 0;

  /* ============================
     Validation
  ============================ */
  const validate = (): string | null => {
    if (amountNum <= 0) return "Please enter a valid amount";
    if (amountNum > totalInterest)
      return `Amount cannot exceed ${primaryCurrency} ${totalInterest.toFixed(2)}`;
    if (!withdrawalAddress.trim())
      return "Please enter a withdrawal wallet address";
    if (!isAnyEligible)
      return "Withdrawal is allowed only after 30 days from crediting";
    return null;
  };

  /* ============================
     Handle Withdraw Submit
  ============================ */
  // const handleWithdraw = async () => {
  //   const validationError = validate();
  //   if (validationError) {
  //     showToast("error", validationError);
  //     return;
  //   }

  //   try {
  //     setIsSubmitting(true);

  //     // withdrawRequestPkId: 0 — backend ignores it on insert and assigns real ID
  //     const payload: WithdrawRequest = {
  //       withdrawRequestPkId: 0,
  //       userFkId,
  //       investmentFkId: primaryInvestmentFkId!,
  //       requestAmount: amountNum,
  //       currency: primaryCurrency,
  //       withdrawalMethod: "CRYPTO",
  //       withdrawalAddress: withdrawalAddress.trim(),
  //       status: "PENDING",
  //       requestedAt: new Date().toISOString(),
  //       approvedAt: "",
  //       paidAt: "",
  //       adminRemark: "",
  //     };

  //     await api.addWithdrawRequest(payload);

  //     showToast("success", "Withdraw request submitted successfully!");
  //     setWithdrawAmount("");
  //     setWithdrawalAddress("");
  //     await fetchRoi();
  //   } catch (err: any) {
  //     showToast("error", err.message || "Something went wrong");
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };

  //   const handleWithdraw = async () => {
  //   const validationError = validate();
  //   if (validationError) {
  //     showToast("error", validationError);
  //     return;
  //   }

  //   try {
  //     setIsSubmitting(true);

  //     const payload: WithdrawRequest = {
  //       withdrawRequestPkId: 0,
  //       userFkId,
  //       investmentFkId: primaryInvestmentFkId!,
  //       requestAmount: amountNum,
  //       currency: primaryCurrency,
  //       withdrawalMethod: "CRYPTO",
  //       withdrawalAddress: withdrawalAddress.trim(),
  //       status: "PENDING",
  //       requestedAt: new Date().toISOString(),
  //       approvedAt: "",
  //       paidAt: "",
  //       adminRemark: "",
  //     };

  //     await api.addWithdrawRequest(payload);

  //     // ✅ Optimistic update — mark ROIs as PENDING locally immediately
  //     // so total interest drops to 0 before fetchRoi() completes
  //     setRoiList((prev) =>
  //       prev.map((r) =>
  //         r.investmentFkId === primaryInvestmentFkId
  //           ? { ...r, status: "PENDING" as const }
  //           : r
  //       )
  //     );

  //     showToast("success", "Withdraw request submitted successfully!");
  //     setWithdrawAmount("");
  //     setWithdrawalAddress("");

  //     // Then sync with server
  //     await fetchRoi();
  //   } catch (err: any) {
  //     showToast("error", err.message || "Something went wrong");
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };

  const handleWithdraw = async () => {
    const validationError = validate();
    if (validationError) {
      showToast("error", validationError);
      return;
    }

    try {
      setIsSubmitting(true);

      const payload: WithdrawRequest = {
        withdrawRequestPkId: 0,
        userFkId,
        investmentFkId: primaryInvestmentFkId!,
        requestAmount: amountNum,
        currency: primaryCurrency,
        withdrawalMethod: "CRYPTO",
        withdrawalAddress: withdrawalAddress.trim(),
        status: "PENDING",
        requestedAt: new Date().toISOString(),
        approvedAt: "",
        paidAt: "",
        adminRemark: "",
      };

      await api.addWithdrawRequest(payload);

      // ✅ Optimistic update — set ALL rois to PENDING locally
      // Do NOT call fetchRoi() after this — it will overwrite with ACTIVE from server
      setRoiList((prev) =>
        prev.map((r) =>
          r.investmentFkId === primaryInvestmentFkId
            ? { ...r, status: "PENDING" as const }
            : r
        )
      );

      showToast("success", "Withdraw request submitted successfully!");
      setWithdrawAmount("");
      setWithdrawalAddress("");

      // ❌ REMOVE this line — it overwrites the optimistic update with ACTIVE from server
      // await fetchRoi();

    } catch (err: any) {
      showToast("error", err.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };
  /* ============================
     Render
  ============================ */
  return (
    <section className="max-w-3xl mx-auto mt-10 px-4 pb-20">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-sm font-medium transition-all
          ${toast.type === "success"
              ? "bg-green-600 text-white"
              : "bg-red-600 text-white"
            }`}
        >
          {toast.type === "success" ? "✓" : "✕"} {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
          Monthly Interest Withdrawal
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Withdraw your earned monthly container rent interest
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 mb-6">
        {(["withdraw", "history"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all capitalize
              ${activeTab === tab
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
          >
            {tab === "withdraw" ? "Withdraw Interest" : "Withdrawal History"}
          </button>
        ))}
      </div>

      {/* ===== WITHDRAW TAB ===== */}
      {activeTab === "withdraw" && (
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-8">
          {roiLoading ? (
            <div className="flex items-center justify-center py-16 text-gray-400">
              <svg className="animate-spin w-6 h-6 mr-3" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Loading interest data...
            </div>
          ) : (
            <>
              {/* Total Available Interest */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border border-green-100 dark:border-green-900 rounded-2xl p-5 mb-6">
                <p className="text-xs font-medium text-green-700 dark:text-green-400 uppercase tracking-wide mb-1">
                  Total Available Interest
                </p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {primaryCurrency} {totalInterest.toFixed(2)}
                </p>
                {!isAnyEligible && availableRois.length > 0 && (
                  <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                    ⚠ Withdrawal available after 30 days from crediting
                  </p>
                )}
                {availableRois.length === 0 && !roiLoading && (
                  <p className="text-xs text-gray-500 mt-2">
                    No active ROI transactions found
                  </p>
                )}
              </div>

              {/* ROI Breakdown */}
              {availableRois.length > 0 && (
                <div className="mb-6">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                    ROI Breakdown ({availableRois.length} active)
                  </p>
                  <div className="grid gap-2 max-h-36 overflow-y-auto pr-1">
                    {availableRois.map((roi) => (
                      <div
                        key={roi.roiTxnPkId}
                        className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded-lg px-4 py-2 text-sm"
                      >
                        <span className="text-gray-600 dark:text-gray-400">
                          Month {roi.contractMonth} · {roi.roiPercentage}% ROI
                        </span>
                        <span className="font-semibold text-gray-800 dark:text-white">
                          {roi.currency} {Number(roi.monthlyPayout).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Amount Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Enter Amount{" "}
                  <span className="text-gray-400 font-normal">
                    (max: {primaryCurrency} {totalInterest.toFixed(2)})
                  </span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
                    {primaryCurrency}
                  </span>
                  <input
                    type="number"
                    min={0}
                    max={totalInterest}
                    step="0.01"
                    className="w-full border border-gray-200 dark:border-gray-700 rounded-xl pl-14 pr-16 py-3 text-gray-900 dark:text-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-green-400"
                    placeholder="0.00"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setWithdrawAmount(totalInterest.toFixed(2))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-green-600 font-semibold hover:text-green-700"
                  >
                    MAX
                  </button>
                </div>
              </div>

              {/* Withdrawal Address */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Withdrawal Wallet Address
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-green-400 font-mono text-sm"
                  placeholder="Enter your crypto wallet address"
                  value={withdrawalAddress}
                  onChange={(e) => setWithdrawalAddress(e.target.value)}
                />
                <p className="text-xs text-gray-400 mt-1">
                  Double-check your address. Transactions are irreversible.
                </p>
              </div>

              {/* Charges Applied */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Charges Applied
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 text-gray-500 cursor-not-allowed"
                  value="0.00"
                  readOnly
                />
              </div>

              {/* Summary Row */}
              {amountNum > 0 && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 mb-5 flex justify-between text-sm">
                  <span className="text-gray-500">You will receive</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {primaryCurrency} {amountNum.toFixed(2)}
                  </span>
                </div>
              )}

              {/* Withdraw Button */}
              <button
                disabled={isSubmitting || !isAnyEligible || availableRois.length === 0}
                onClick={handleWithdraw}
                className="w-full bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl font-semibold text-base transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Processing...
                  </>
                ) : (
                  "Submit Withdraw Request"
                )}
              </button>
            </>
          )}
        </div>
      )}

      {/* ===== HISTORY TAB ===== */}
      {activeTab === "history" && (
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
          {historyLoading ? (
            <div className="flex items-center justify-center py-16 text-gray-400">
              <svg className="animate-spin w-6 h-6 mr-3" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Loading history...
            </div>
          ) : withdrawHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <svg className="w-12 h-12 mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-sm">No withdrawal requests yet</p>
            </div>
          ) : (
            <div>
              {/* Table Header */}
              <div className="grid grid-cols-4 gap-4 px-6 py-3 bg-gray-50 dark:bg-gray-800 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100 dark:border-gray-700">
                <span>Amount</span>
                <span>Status</span>
                <span>Requested</span>
                <span>Remark</span>
              </div>

              {/* Rows */}
              <div className="divide-y divide-gray-50 dark:divide-gray-800">
                {withdrawHistory.map((w) => (
                  <div
                    key={w.withdrawRequestPkId}
                    className="grid grid-cols-4 gap-4 px-6 py-4 items-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm"
                  >
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {w.currency} {Number(w.requestAmount).toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5 font-mono truncate">
                        {w.withdrawalAddress
                          ? `${w.withdrawalAddress.slice(0, 8)}...${w.withdrawalAddress.slice(-4)}`
                          : "—"}
                      </p>
                    </div>

                    <div>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusColor[w.status] || statusColor["PENDING"]}`}>
                        {w.status}
                      </span>
                    </div>

                    <div className="text-gray-500">
                      {formatDate(w.requestedAt)}
                    </div>

                    <div className="text-gray-400 text-xs truncate">
                      {w.adminRemark || "—"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}