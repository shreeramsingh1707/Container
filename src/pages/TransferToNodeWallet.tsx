import React, { useState, useEffect } from "react";
import { EyeIcon, EyeCloseIcon } from "../icons";
import { walletTransferApi, walletDataApi, WalletData } from "../services/api";
import { useAuth } from "../context/AuthContext";

interface TransferData {
  fromWallet: string;
  toWallet: string;
  transferTo: string;
  amount: string;
  transactionPassword: string;
  oneTimePassword: string;
  remarks: string;
  checkMeOut: boolean;
}

export default function TransferToNodeWallet() {
  const { user } = useAuth();
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [formData, setFormData] = useState<TransferData>({
    fromWallet: "",
    toWallet: "",
    transferTo: "",
    amount: "",
    transactionPassword: "",
    oneTimePassword: "",
    remarks: "",
    checkMeOut: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch wallet data to get userNodeCode
  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        const response = await walletDataApi.getAll(0, 1, 'ACTIVE', user?.nodeId || null);
        if (response.content && response.content.length > 0) {
          setWalletData(response.content[0]);
        }
      } catch (err) {
        console.error('Error fetching wallet data:', err);
      }
    };
    fetchWalletData();
  }, [user?.nodeId]);

  // Mock wallet balances
  const walletBalances = {
    mineWallet: 1250.50,
    nodeWallet: 0.00,
    capitalWallet: 850.25,
    packageWallet: 3400.75
  };

  // Wallet types configuration - value is used for form, type is the API enum value
  const walletTypes = [
    { value: "mineWallet", label: "Mine Wallet", type: "MINE_WALLET" },
    { value: "nodeWallet", label: "Node Wallet", type: "NODE_WALLET" },
    { value: "capitalWallet", label: "Capital Wallet", type: "CAPITAL_WALLET" },
  ];

  // Get wallet type enum value from form value
  const getWalletTypeEnum = (formValue: string): "MINE_WALLET" | "CAPITAL_WALLET" | "NODE_WALLET" | null => {
    const wallet = walletTypes.find(w => w.value === formValue);
    return wallet ? (wallet.type as "MINE_WALLET" | "CAPITAL_WALLET" | "NODE_WALLET") : null;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    // If fromWallet changes, reset toWallet to prevent same-type selection
    if (name === "fromWallet") {
      setFormData(prev => ({
        ...prev,
        fromWallet: value,
        toWallet: prev.toWallet && prev.toWallet === value ? "" : prev.toWallet
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value
      }));
    }
  };

  // Get available "To Wallet" options (excluding the selected "From Wallet")
  const getAvailableToWallets = () => {
    if (!formData.fromWallet) return walletTypes;
    return walletTypes.filter(wallet => wallet.value !== formData.fromWallet);
  };

  const handleSendOTP = async () => {
    setOtpLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsOtpSent(true);
      setSuccess("OTP sent successfully to your registered email/mobile");
    } catch (err) {
      setError("Failed to send OTP. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      // Basic validation
      if (!formData.fromWallet) {
        throw new Error("Please select a From Wallet");
      }
      if (!formData.toWallet) {
        throw new Error("Please select a To Wallet");
      }
      if (formData.fromWallet === formData.toWallet) {
        throw new Error("Cannot transfer to the same wallet type");
      }
      if (!formData.transferTo) {
        throw new Error("Please enter recipient user ID");
      }
      if (!formData.amount || parseFloat(formData.amount) <= 0) {
        throw new Error("Please enter a valid amount");
      }
      if (!formData.transactionPassword) {
        throw new Error("Please enter your transaction password");
      }
      if (!formData.oneTimePassword) {
        throw new Error("Please enter the OTP");
      }
      if (!formData.checkMeOut) {
        throw new Error("Please check the agreement");
      }

      // Get userNodeCode from wallet data to use as fromUserId
      const fromUserId = walletData?.userNodeCode || "";
      if (!fromUserId) {
        throw new Error("User node code not found. Please ensure your wallet is set up.");
      }

      // Get wallet type enum values
      const fromWalletType = getWalletTypeEnum(formData.fromWallet);
      const toWalletType = getWalletTypeEnum(formData.toWallet);

      if (!fromWalletType || !toWalletType) {
        throw new Error("Invalid wallet type selected");
      }

      // Prepare API request body
      const transferRequest = {
        walletTxnPkId: null,
        transactionId: null,
        fromUserId: fromUserId,
        toUserId: formData.transferTo.trim(),
        fromWallet: fromWalletType,
        toWallet: toWalletType,
        amount: parseFloat(formData.amount),
        status: "IN_PROGRESS" as const,
        remarks: formData.remarks || "",
        confirmedAt: null,
      };

      // Call API
      await walletTransferApi.create(transferRequest);

      const toWalletLabel = walletTypes.find(w => w.value === formData.toWallet)?.label || "Wallet";
      setSuccess(`Transfer completed successfully! Funds have been transferred to the ${toWalletLabel}.`);
      setFormData({
        fromWallet: "",
        toWallet: "",
        transferTo: "",
        amount: "",
        transactionPassword: "",
        oneTimePassword: "",
        remarks: "",
        checkMeOut: false,
      });
      setIsOtpSent(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10 bg-gray-900 min-h-screen">
      {/* Breadcrumb */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-md2 font-semibold text-white">
          Transfer Funds Between Wallets
        </h2>
        <nav>
          <ol className="flex items-center gap-2">
            <li><a className="font-medium text-gray-300 hover:text-white" href="/">Home /</a></li>
            <li><a className="font-medium text-gray-300 hover:text-white" href="/">Transfer /</a></li>
            <li className="font-medium text-orange-500">Transfer Funds Between Wallets</li>
          </ol>
        </nav>
      </div>

      {/* Wallet Balances */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-r from-yellow-900/40 to-yellow-800/30 rounded-xl border-2 border-yellow-500/30 p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-200 text-sm font-medium">Mine Wallet</p>
              <p className="text-white text-3xl font-bold">${walletBalances.mineWallet.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-yellow-500/20 rounded-full">
              <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-900/40 to-green-800/30 rounded-xl border-2 border-green-500/30 p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-200 text-sm font-medium">Node Wallet</p>
              <p className="text-white text-3xl font-bold">${walletBalances.nodeWallet.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-green-500/20 rounded-full">
              <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-900/40 to-blue-800/30 rounded-xl border-2 border-blue-500/30 p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-sm font-medium">Capital Wallet</p>
              <p className="text-white text-3xl font-bold">${walletBalances.capitalWallet.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-blue-500/20 rounded-full">
              <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-9 sm:grid-cols-1">
        <div className="flex flex-col gap-9">
          {/* Transfer Fund to Package Wallet */}
          <div className="rounded-xl border border-gray-700 bg-gray-800 shadow-2xl backdrop-blur-sm">
            <div className="border-b border-gray-700 py-6 px-8 bg-gradient-to-r from-gray-800 to-gray-750">
              <h3 className="font-bold text-white text-xl">
                Transfer Funds Between Wallets
              </h3>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="p-8">
                {/* Error Message */}
                {error && (
                  <div className="mb-6 rounded-lg border border-red-500/30 bg-gradient-to-r from-red-900/40 to-red-800/30 p-4 shadow-lg">
                    <p className="text-sm text-red-200 font-medium">{error}</p>
                  </div>
                )}

                {/* Success Message */}
                {success && (
                  <div className="mb-6 rounded-lg border border-green-500/30 bg-gradient-to-r from-green-900/40 to-green-800/30 p-4 shadow-lg">
                    <p className="text-sm text-green-200 font-medium">{success}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="mb-6">
                    <label className="mb-3 block text-white font-medium text-lg">
                      From Wallet
                    </label>
                    <div className="relative z-20">
                      <select
                        name="fromWallet"
                        value={formData.fromWallet}
                        onChange={handleInputChange}
                        className="relative z-20 w-full appearance-none rounded-lg border-2 border-gray-600 bg-gray-700 py-4 px-6 text-white outline-none transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 hover:border-gray-500"
                      >
                        <option value="" className="bg-gray-700">Select From Wallet--</option>
                        {walletTypes.map((wallet) => (
                          <option key={wallet.value} value={wallet.value} className="bg-gray-700">
                            {wallet.label} (${walletBalances[wallet.value as keyof typeof walletBalances]?.toLocaleString() || '0.00'})
                          </option>
                        ))}
                      </select>
                      <span className="absolute top-1/2 right-4 z-10 -translate-y-1/2">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <g opacity="0.8">
                            <path fillRule="evenodd" clipRule="evenodd" d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z" fill="#9CA3AF"/>
                          </g>
                        </svg>
                      </span>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="mb-3 block text-white font-medium text-lg">
                      To Wallet
                    </label>
                    <div className="relative z-20">
                      <select
                        name="toWallet"
                        value={formData.toWallet}
                        onChange={handleInputChange}
                        disabled={!formData.fromWallet}
                        className="relative z-20 w-full appearance-none rounded-lg border-2 border-gray-600 bg-gray-700 py-4 px-6 text-white outline-none transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 hover:border-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="" className="bg-gray-700">
                          {formData.fromWallet ? "Select To Wallet--" : "Select From Wallet first--"}
                        </option>
                        {getAvailableToWallets().map((wallet) => (
                          <option key={wallet.value} value={wallet.value} className="bg-gray-700">
                            {wallet.label} (${walletBalances[wallet.value as keyof typeof walletBalances]?.toLocaleString() || '0.00'})
                          </option>
                        ))}
                      </select>
                      <span className="absolute top-1/2 right-4 z-10 -translate-y-1/2">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <g opacity="0.8">
                            <path fillRule="evenodd" clipRule="evenodd" d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z" fill="#9CA3AF"/>
                          </g>
                        </svg>
                      </span>
                    </div>
                    {formData.fromWallet && formData.toWallet === formData.fromWallet && (
                      <p className="mt-2 text-sm text-red-400">Cannot transfer to the same wallet type</p>
                    )}
                  </div>
                </div>

                <div className="mb-6">
                  <label className="mb-3 block text-white font-medium text-lg">
                    To User ID
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="transferTo"
                      value={formData.transferTo}
                      onChange={handleInputChange}
                      placeholder="Enter recipient user ID (e.g., NODE123457)"
                      className="w-full rounded-lg border-2 border-gray-600 bg-gray-700 py-4 pl-12 pr-6 text-white font-medium outline-none transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 hover:border-gray-500 placeholder-gray-400"
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="12" cy="7" r="4" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="mb-3 block text-white font-medium text-lg">
                    Enter Amount
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      placeholder="Enter amount"
                      className="w-full rounded-lg border-2 border-gray-600 bg-gray-700 py-4 pl-12 pr-6 text-white font-medium outline-none transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 hover:border-gray-500 placeholder-gray-400"
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M2 17L12 22L22 17" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M2 12L12 17L22 12" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="mb-3 block text-white font-medium text-lg">
                    Transaction Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="transactionPassword"
                      value={formData.transactionPassword}
                      onChange={handleInputChange}
                      placeholder="Enter your transaction password"
                      className="w-full rounded-lg border-2 border-gray-600 bg-gray-700 py-4 pl-12 pr-12 text-white font-medium outline-none transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 hover:border-gray-500 placeholder-gray-400"
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 22S2 16 2 9A10 10 0 0 1 12 2A10 10 0 0 1 22 9C22 16 12 22 12 22Z" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="12" cy="9" r="3" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-400 transition-colors"
                    >
                      {showPassword ? (
                        <EyeCloseIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="mb-3 block text-white font-medium text-lg">
                    One Time Password
                  </label>
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        name="oneTimePassword"
                        value={formData.oneTimePassword}
                        onChange={handleInputChange}
                        placeholder="Enter One Time Password"
                        className="w-full rounded-lg border-2 border-gray-600 bg-gray-700 py-4 pl-12 pr-6 text-white font-medium outline-none transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 hover:border-gray-500 placeholder-gray-400"
                      />
                      <span className="absolute left-4 top-1/2 -translate-y-1/2">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 22S2 16 2 9A10 10 0 0 1 12 2A10 10 0 0 1 22 9C22 16 12 22 12 22Z" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <circle cx="12" cy="9" r="3" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleSendOTP}
                      disabled={otpLoading || isOtpSent}
                      className="px-6 py-4 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-300 whitespace-nowrap"
                    >
                      {otpLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                          Sending...
                        </div>
                      ) : isOtpSent ? (
                        "OTP Sent"
                      ) : (
                        "Send OTP"
                      )}
                    </button>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="mb-3 block text-white font-medium text-lg">
                    Remarks
                  </label>
                  <textarea
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Remarks..."
                    className="w-full rounded-lg border-2 border-gray-600 bg-gray-700 py-4 px-6 text-white font-medium outline-none transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 hover:border-gray-500 placeholder-gray-400 resize-none"
                  />
                </div>

                <div className="mb-8">
                  <label className="flex cursor-pointer items-center group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        name="checkMeOut"
                        checked={formData.checkMeOut}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <div className={`box mr-4 flex h-6 w-6 items-center justify-center rounded-lg border-2 transition-all ${
                        formData.checkMeOut 
                          ? "border-orange-500 bg-orange-500 shadow-lg shadow-orange-500/25" 
                          : "border-gray-600 bg-gray-700 group-hover:border-gray-500"
                      }`}>
                        <span className={`text-white transition-opacity ${formData.checkMeOut ? "opacity-100" : "opacity-0"}`}>
                          <svg width="12" height="9" viewBox="0 0 12 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M11.7071 0.292893C12.0976 0.683417 12.0976 1.31658 11.7071 1.70711L5.41421 8C4.63316 8.78095 3.36684 8.78095 2.58579 8L0.292893 5.70711C-0.0976311 5.31658 -0.0976311 4.68342 0.292893 4.29289C0.683417 3.90237 1.31658 3.90237 1.70711 4.29289L4 6.58579L10.2929 0.292893C10.6834 -0.0976311 11.3166 -0.0976311 11.7071 0.292893Z" fill="currentColor"/>
                          </svg>
                        </span>
                      </div>
                    </div>
                    <span className="text-white font-medium group-hover:text-orange-300 transition-colors">Check me out</span>
                  </label>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 transform hover:scale-[1.02] disabled:hover:scale-100"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-3">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        <span className="font-semibold">Processing...</span>
                      </div>
                    ) : (
                      <span className="font-bold">Submit</span>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
