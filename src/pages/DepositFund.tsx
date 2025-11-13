import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { EyeIcon, EyeCloseIcon } from "../icons";
import api, { AddDepositFundRequest, walletDataApi, WalletData } from "../services/api";
import { useAuth } from "../context/AuthContext";

interface DepositFundData {
  currency: string;
  amount: string;
  transactionPassword: string;
  checkMeOut: boolean;
}

export default function DepositFund() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [formData, setFormData] = useState<DepositFundData>({
    currency: "USDT BEP20",
    amount: "",
    transactionPassword: "",
    checkMeOut: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      // Basic validation
      if (!formData.amount || parseFloat(formData.amount) <= 0) {
        throw new Error("Please enter a valid amount");
      }
      if (!formData.transactionPassword) {
        throw new Error("Please enter your transaction password");
      }
      if (!formData.checkMeOut) {
        throw new Error("Please check the agreement");
      }

      // Get userNodeCode from wallet data
      const userNodeCode = walletData?.userNodeCode || "";
      if (!userNodeCode) {
        throw new Error("User node code not found. Please ensure your wallet is set up.");
      }

      const payload: AddDepositFundRequest = {
        depositPkId: null,
        currency: formData.currency,
        amount: parseFloat(formData.amount),
        transactionPassword: formData.transactionPassword,
        userNodeCode: userNodeCode,
      };

      const depositResponse = await api.depositFund.add(payload);

      // Navigate to confirmation page with deposit data
      navigate("/StyloCoin/depositConfirmation", {
        state: {
          deposit: depositResponse,
          amount: parseFloat(formData.amount),
          currency: formData.currency,
        },
      });
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
          Deposit Fund
        </h2>
        <nav>
          <ol className="flex items-center gap-2">
            <li><a className="font-medium text-gray-300 hover:text-white" href="/">Home /</a></li>
            <li><a className="font-medium text-gray-300 hover:text-white" href="/">Deposit /</a></li>
            <li className="font-medium text-orange-500">Deposit Fund</li>
          </ol>
        </nav>
      </div>

      {/* Important Reminder */}
      <div className="mb-6 rounded-lg border border-blue-600/30 bg-gradient-to-r from-blue-900/40 to-blue-800/30 p-6 shadow-lg">
        <div className="flex items-start gap-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/20 ring-2 ring-blue-400/30">
            <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-blue-200 text-lg">Important Reminder</h3>
            <p className="mt-2 text-sm text-blue-100 leading-relaxed">
              Here, you can add fund by paying crypto currency and it will automatically credit into your package wallet after payment confirmation.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-9 sm:grid-cols-1">
        <div className="flex flex-col gap-9">
          {/* Fill Details */}
          <div className="rounded-xl border border-gray-700 bg-gray-800 shadow-2xl backdrop-blur-sm">
            <div className="border-b border-gray-700 py-6 px-8 bg-gradient-to-r from-gray-800 to-gray-750">
              <h3 className="font-bold text-white text-xl">
                Fill Details
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

                <div className="mb-6">
                  <label className="mb-3 block text-white font-medium text-lg">
                    Select Currency
                  </label>
                  <div className="relative z-20">
                    <select
                      name="currency"
                      value={formData.currency}
                      onChange={handleInputChange}
                      className="relative z-20 w-full appearance-none rounded-lg border-2 border-gray-600 bg-gray-700 py-4 px-6 text-white outline-none transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 hover:border-gray-500"
                    >
                      <option value="USDT BEP20" className="bg-gray-700">USDT BEP20</option>
                      <option value="USDT TRC20" className="bg-gray-700">USDT TRC20</option>
                      <option value="USDT ERC20" className="bg-gray-700">USDT ERC20</option>
                      <option value="BTC" className="bg-gray-700">Bitcoin (BTC)</option>
                      <option value="ETH" className="bg-gray-700">Ethereum (ETH)</option>
                      <option value="BNB" className="bg-gray-700">Binance Coin (BNB)</option>
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
                    Amount (USD)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      placeholder="Enter amount in USD"
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

                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex w-full justify-center rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 py-4 px-8 font-bold text-white text-lg shadow-lg shadow-orange-500/25 hover:from-orange-600 hover:to-orange-700 hover:shadow-xl hover:shadow-orange-500/30 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-lg disabled:hover:shadow-orange-500/25 transition-all duration-300 transform hover:scale-[1.02] disabled:hover:scale-100"
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
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
