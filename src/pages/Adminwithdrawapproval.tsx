import { useEffect, useState } from "react";
import {  sellMonthlyInterest } from "../services/api";


/* ============================
   Types
============================ */
interface WithdrawRequest {
  withdrawRequestPkId: number;
  userFkId: string;
  investmentFkId: number;
  requestAmount: number;
  currency: string;
  withdrawalMethod: string;
  withdrawalAddress: string;
  status: "PENDING" | "APPROVED" | "WITHDRAWN" | "REJECTED";
  requestedAt: string;
  approvedAt: string;
  paidAt: string;
  adminRemark: string;
}

type FilterStatus = "ALL" | "PENDING" | "APPROVED" | "WITHDRAWN" | "REJECTED";

/* ============================
   API
============================ */
const BASE_URL =
  "http://containershipment-app-env.eba-p7ijagki.ap-south-1.elasticbeanstalk.com/api/container/withdraw";

const adminApi = {
  // Get all withdraw requests (admin)
  getAllRequests: async (
    filterBy: FilterStatus,
    page: number,
    size: number
  ): Promise<{ content: WithdrawRequest[]; totalElements: number }> => {
    const res = await fetch(
      `${BASE_URL}/getWithdrawRequests?filterBy=${filterBy}&page=${page}&size=${size}&userFkId=null`
    );
    if (!res.ok) throw new Error("Failed to fetch requests");
    const data = await res.json();
    return {
      content: data.content || data.data || [],
      totalElements: data.totalElements || 0,
    };
  },

  // Approve a request
  approveRequest: async (
    id: number,
    adminRemark: string
  ): Promise<void> => {
    const res = await fetch(
      `${BASE_URL}/approveWithdrawRequest/${id}?adminRemark=${encodeURIComponent(adminRemark)}`,
      { method: "PUT" }
    );
    if (!res.ok) throw new Error("Failed to approve request");
  },

  // Mark as paid / withdrawn
  markAsPaid: async (id: number, adminRemark: string): Promise<void> => {
    const res = await fetch(
      `${BASE_URL}/markWithdrawPaid/${id}?adminRemark=${encodeURIComponent(adminRemark)}`,
      { method: "PUT" }
    );
    if (!res.ok) throw new Error("Failed to mark as paid");
  },

  // Reject a request
  rejectRequest: async (
    id: number,
    adminRemark: string
  ): Promise<void> => {
    const res = await fetch(
      `${BASE_URL}/rejectWithdrawRequest/${id}?adminRemark=${encodeURIComponent(adminRemark)}`,
      { method: "PUT" }
    );
    if (!res.ok) throw new Error("Failed to reject request");
  },
};

/* ============================
   Helpers
============================ */
const formatDate = (iso: string) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatAddress = (addr: string) => {
  if (!addr) return "—";
  return `${addr.slice(0, 10)}...${addr.slice(-6)}`;
};

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; dot: string }
> = {
  PENDING: {
    label: "Pending",
    color: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-400",
  },
  APPROVED: {
    label: "Approved",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    dot: "bg-blue-400",
  },
  WITHDRAWN: {
    label: "Paid",
    color: "bg-green-50 text-green-700 border-green-200",
    dot: "bg-green-400",
  },
  REJECTED: {
    label: "Rejected",
    color: "bg-red-50 text-red-700 border-red-200",
    dot: "bg-red-400",
  },
};

/* ============================
   Action Modal Component
============================ */
interface ActionModalProps {
  request: WithdrawRequest | null;
  action: "approve" | "reject" | "paid" | null;
  onClose: () => void;
  onConfirm: (remark: string) => void;
  isLoading: boolean;
}

function ActionModal({
  request,
  action,
  onClose,
  onConfirm,
  isLoading,
}: ActionModalProps) {
  const [remark, setRemark] = useState("");

  useEffect(() => {
    setRemark("");
  }, [action, request]);

  if (!request || !action) return null;

  const config = {
    approve: {
      title: "Approve Withdrawal",
      desc: "This will approve the withdrawal request. The user will be notified.",
      btnLabel: "Approve",
      btnClass: "bg-blue-600 hover:bg-blue-700",
      remarkPlaceholder: "Optional remark for user...",
      remarkRequired: false,
    },
    paid: {
      title: "Mark as Paid",
      desc: "Confirm that the payment has been sent to the user's wallet address.",
      btnLabel: "Mark as Paid",
      btnClass: "bg-green-600 hover:bg-green-700",
      remarkPlaceholder: "Transaction hash or payment reference...",
      remarkRequired: false,
    },
    reject: {
      title: "Reject Withdrawal",
      desc: "This will reject the withdrawal request. Please provide a reason.",
      btnLabel: "Reject",
      btnClass: "bg-red-600 hover:bg-red-700",
      remarkPlaceholder: "Reason for rejection (required)...",
      remarkRequired: true,
    },
  }[action];

  const canSubmit =
    !isLoading && (!config.remarkRequired || remark.trim().length > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-6 border border-gray-100 dark:border-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {config.title}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {config.desc}
        </p>

        {/* Request Summary */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">User</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {request.userFkId}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Amount</span>
            <span className="font-bold text-gray-900 dark:text-white">
              {request.currency} {Number(request.requestAmount).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Wallet</span>
            <span className="font-mono text-xs text-gray-700 dark:text-gray-300">
              {formatAddress(request.withdrawalAddress)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Requested</span>
            <span className="text-gray-700 dark:text-gray-300">
              {formatDate(request.requestedAt)}
            </span>
          </div>
        </div>

        {/* Full wallet address */}
        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-1">Full Wallet Address</p>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2 font-mono text-xs text-gray-700 dark:text-gray-300 break-all border border-gray-200 dark:border-gray-700">
            {request.withdrawalAddress || "—"}
          </div>
        </div>

        {/* Remark Input */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Admin Remark{" "}
            {config.remarkRequired && (
              <span className="text-red-500">*</span>
            )}
          </label>
          <textarea
            rows={3}
            className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            placeholder={config.remarkPlaceholder}
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            disabled={!canSubmit}
            onClick={() => onConfirm(remark.trim())}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${config.btnClass}`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Processing...
              </>
            ) : (
              config.btnLabel
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================
   Main Admin Component
============================ */
export default function AdminWithdrawApproval() {
  const [requests, setRequests] = useState<WithdrawRequest[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("PENDING");
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const [isLoading, setIsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);

  // Modal state
  const [selectedRequest, setSelectedRequest] =
    useState<WithdrawRequest | null>(null);
  const [selectedAction, setSelectedAction] = useState<
    "approve" | "reject" | "paid" | null
  >(null);

  /* ============================
     Toast
  ============================ */
  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  /* ============================
     Fetch
  ============================ */
  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      const result = await adminApi.getAllRequests(filterStatus, page, pageSize);
      setRequests(result.content);
      setTotalElements(result.totalElements);
    } catch (err: any) {
      showToast("error", err.message || "Failed to load requests");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [filterStatus]);

  useEffect(() => {
    fetchRequests();
  }, [filterStatus, page]);

  /* ============================
     Stats (derived from current list)
  ============================ */
  const stats = {
    PENDING: requests.filter((r) => r.status === "PENDING").length,
    APPROVED: requests.filter((r) => r.status === "APPROVED").length,
    WITHDRAWN: requests.filter((r) => r.status === "WITHDRAWN").length,
    REJECTED: requests.filter((r) => r.status === "REJECTED").length,
  };

  /* ============================
     Handle Action
  ============================ */
  const openModal = (
    req: WithdrawRequest,
    action: "approve" | "reject" | "paid"
  ) => {
    setSelectedRequest(req);
    setSelectedAction(action);
  };

  const closeModal = () => {
    setSelectedRequest(null);
    setSelectedAction(null);
  };

  const handleConfirm = async (remark: string) => {
    if (!selectedRequest || !selectedAction) return;

    try {
      setActionLoading(true);
      const id = selectedRequest.withdrawRequestPkId;

      if (selectedAction === "approve") {
        await sellMonthlyInterest.approveRequest(id, remark);
        showToast("success", "Request approved successfully");
      } else if (selectedAction === "paid") {
        await sellMonthlyInterest.markAsPaid(id, remark);
        showToast("success", "Marked as paid successfully");
      } else if (selectedAction === "reject") {
        await sellMonthlyInterest.rejectRequest(id, remark);
        showToast("success", "Request rejected");
      }

      closeModal();
      await fetchRequests();
    } catch (err: any) {
      showToast("error", err.message || "Action failed");
    } finally {
      setActionLoading(false);
    }
  };

  /* ============================
     Pagination
  ============================ */
  const totalPages = Math.ceil(totalElements / pageSize);

  /* ============================
     Render
  ============================ */
  const FILTER_TABS: FilterStatus[] = [
    "ALL",
    "PENDING",
    "APPROVED",
    "WITHDRAWN",
    "REJECTED",
  ];

  return (
    <section className="max-w-7xl mx-auto mt-8 px-4 pb-20">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-sm font-medium transition-all
          ${toast.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}
        >
          {toast.type === "success" ? "✓" : "✕"} {toast.msg}
        </div>
      )}

      {/* Action Modal */}
      <ActionModal
        request={selectedRequest}
        action={selectedAction}
        onClose={closeModal}
        onConfirm={handleConfirm}
        isLoading={actionLoading}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Withdrawal Requests
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage and approve monthly interest withdrawal requests
          </p>
        </div>
        <button
          onClick={fetchRequests}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          <svg
            className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Pending", key: "PENDING", color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900" },
          { label: "Approved", key: "APPROVED", color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900" },
          { label: "Paid", key: "WITHDRAWN", color: "text-green-600", bg: "bg-green-50 dark:bg-green-950/30 border-green-100 dark:border-green-900" },
          { label: "Rejected", key: "REJECTED", color: "text-red-600", bg: "bg-red-50 dark:bg-red-950/30 border-red-100 dark:border-red-900" },
        ].map((s) => (
          <div
            key={s.key}
            className={`rounded-2xl border p-4 ${s.bg} cursor-pointer`}
            onClick={() => setFilterStatus(s.key as FilterStatus)}
          >
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>
              {stats[s.key as keyof typeof stats]}
            </p>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 mb-5 w-fit">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setFilterStatus(tab)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize
              ${filterStatus === tab
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
          >
            {tab === "WITHDRAWN" ? "PAID" : tab}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-7 gap-3 px-6 py-3 bg-gray-50 dark:bg-gray-800 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100 dark:border-gray-700">
          <span>User ID</span>
          <span>Amount</span>
          <span>Wallet Address</span>
          <span>Requested At</span>
          <span>Status</span>
          <span>Remark</span>
          <span className="text-center">Actions</span>
        </div>

        {/* Loading */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-gray-400">
            <svg className="animate-spin w-6 h-6 mr-3" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Loading requests...
          </div>
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <svg className="w-12 h-12 mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-sm">No {filterStatus !== "ALL" ? filterStatus.toLowerCase() : ""} requests found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {requests.map((req) => {
              const statusCfg = STATUS_CONFIG[req.status] || STATUS_CONFIG["PENDING"];
              return (
                <div
                  key={req.withdrawRequestPkId}
                  className="grid grid-cols-7 gap-3 px-6 py-4 items-center hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-sm"
                >
                  {/* User ID */}
                  <div className="font-medium text-gray-900 dark:text-white truncate">
                    {req.userFkId}
                  </div>

                  {/* Amount */}
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">
                      {req.currency} {Number(req.requestAmount).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-400">{req.withdrawalMethod}</p>
                  </div>

                  {/* Wallet */}
                  <div
                    className="font-mono text-xs text-gray-600 dark:text-gray-400 truncate cursor-pointer hover:text-gray-900 dark:hover:text-white transition-colors"
                    title={req.withdrawalAddress}
                    onClick={() => navigator.clipboard.writeText(req.withdrawalAddress)}
                  >
                    {formatAddress(req.withdrawalAddress)}
                    <span className="ml-1 text-gray-300 dark:text-gray-600">⧉</span>
                  </div>

                  {/* Date */}
                  <div className="text-gray-500 text-xs">
                    {formatDate(req.requestedAt)}
                  </div>

                  {/* Status Badge */}
                  <div>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusCfg.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                      {statusCfg.label}
                    </span>
                  </div>

                  {/* Remark */}
                  <div className="text-gray-400 text-xs truncate" title={req.adminRemark}>
                    {req.adminRemark || "—"}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-center gap-2">
                    {req.status === "PENDING" && (
                      <>
                        <button
                          onClick={() => openModal(req, "approve")}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => openModal(req, "reject")}
                          className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-semibold rounded-lg transition-colors"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {req.status === "APPROVED" && (
                      <button
                        onClick={() => openModal(req, "paid")}
                        className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg transition-colors"
                      >
                        Mark Paid
                      </button>
                    )}
                    {(req.status === "WITHDRAWN" || req.status === "REJECTED") && (
                      <span className="text-xs text-gray-400 italic">No action</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-gray-800">
            <p className="text-xs text-gray-500">
              Showing {(page - 1) * pageSize + 1}–
              {Math.min(page * pageSize, totalElements)} of {totalElements} requests
            </p>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1.5 text-xs font-medium border border-gray-200 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                ← Prev
              </button>
              <span className="px-3 py-1.5 text-xs font-semibold bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg">
                {page}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 text-xs font-medium border border-gray-200 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}