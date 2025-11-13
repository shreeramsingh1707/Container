import React, { useState } from "react";
import { EyeIcon, EyeCloseIcon } from "../icons";

interface WalletAddressData {
  id: number;
  wallet: string;
  address: string;
  createdAt: string;
  status: "active" | "inactive";
}

interface FormData {
  selectWallet: string;
  address: string;
  transactionPassword: string;
  oneTimePassword: string;
}

export default function WalletAddress() {
  const [formData, setFormData] = useState<FormData>({
    selectWallet: "USDT.BEP20",
    address: "NODE68718484",
    transactionPassword: "",
    oneTimePassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Mock data for existing wallet addresses
  const [walletAddresses] = useState<WalletAddressData[]>([
    {
      id: 1,
      wallet: "USDT.BEP20",
      address: "0x1234567890abcdef1234567890abcdef12345678",
      createdAt: "2024-01-15",
      status: "active"
    },
    {
      id: 2,
      wallet: "USDT.BEP20",
      address: "0xabcdef1234567890abcdef1234567890abcdef12",
      createdAt: "2024-01-10",
      status: "inactive"
    }
  ]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Basic validation
      if (!formData.address || formData.address.trim().length === 0) {
        throw new Error("Please enter a valid wallet address");
      }
      if (!formData.transactionPassword) {
        throw new Error("Please enter your transaction password");
      }
      if (!formData.oneTimePassword) {
        throw new Error("Please enter the OTP");
      }

      setSuccess("Wallet address added successfully! You can now receive profits to this address.");
      setFormData({
        selectWallet: "USDT.BEP20",
        address: "NODE68718484",
        transactionPassword: "",
        oneTimePassword: "",
      });
      setIsOtpSent(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === "active") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5"></span>
          Active
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
        <span className="w-1.5 h-1.5 bg-red-400 rounded-full mr-1.5"></span>
        Inactive
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const truncateAddress = (address: string) => {
    if (address.length <= 20) return address;
    return `${address.slice(0, 10)}...${address.slice(-8)}`;
  };

  return (
    <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10 bg-gray-900 min-h-screen">
      {/* Breadcrumb */}
      <div className="mb-6">
        <h2 className="text-title-md2 font-semibold text-white mb-2">
          Wallet Address
        </h2>
        <nav>
          <ol className="flex items-center gap-2">
            <li><a className="font-medium text-gray-300 hover:text-white" href="/">Home /</a></li>
            <li><a className="font-medium text-gray-300 hover:text-white" href="/">Setting /</a></li>
            <li className="font-medium text-gray-300">Wallet Address</li>
          </ol>
        </nav>
      </div>

      {/* Gentle Reminder */}
      <div className="mb-8 bg-gradient-to-r from-blue-900/40 to-blue-800/30 rounded-xl border border-blue-600/30 p-6 shadow-lg">
        <div className="flex items-start gap-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/20 ring-2 ring-blue-400/30">
            <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-blue-200 text-lg mb-2">Gentle Reminder</h3>
            <p className="text-blue-100 leading-relaxed">
              Kindly update your USDT.BEP20 Wallet Address to get withdrawals into your account. Please connect with your up-line for further assistance regarding the same.
            </p>
          </div>
        </div>
      </div>

      {/* Add New USDT.BEP20 Address Form */}
      <div className="mb-8">
        <h3 className="font-bold text-white text-xl mb-6">
          Add New USDT.BEP20 Address to Receive Profits
        </h3>
        
        <div className="rounded-xl border border-gray-700 bg-gray-800 shadow-2xl backdrop-blur-sm">

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
                  Select Wallet
                </label>
                <input
                  type="text"
                  name="selectWallet"
                  value={formData.selectWallet}
                  readOnly
                  className="w-full rounded-lg border-2 border-gray-600 bg-gray-700 py-4 px-6 text-gray-400 font-medium outline-none cursor-not-allowed"
                />
              </div>

              <div className="mb-6">
                <label className="mb-3 block text-white font-medium text-lg">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border-2 border-gray-600 bg-gray-700 py-4 px-6 text-white font-medium outline-none transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 hover:border-gray-500"
                />
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

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 transform hover:scale-[1.02] disabled:hover:scale-100"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-3">
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

      {/* Wallet Address Table */}
      <div>
        <h3 className="font-bold text-white text-xl mb-6">Wallet Address</h3>
        
        <div className="rounded-xl border border-gray-700 bg-gray-800 shadow-2xl backdrop-blur-sm">

        <div className="p-8">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-800 to-gray-750 border-b border-gray-700">
                <tr>
                  <th className="text-left py-4 px-6 font-bold text-white text-sm uppercase tracking-wider">#</th>
                  <th className="text-left py-4 px-6 font-bold text-white text-sm uppercase tracking-wider">Wallet</th>
                  <th className="text-left py-4 px-6 font-bold text-white text-sm uppercase tracking-wider">Address</th>
                  <th className="text-left py-4 px-6 font-bold text-white text-sm uppercase tracking-wider">Created At</th>
                  <th className="text-left py-4 px-6 font-bold text-white text-sm uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <div className="text-gray-400">
                      <svg className="mx-auto h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      <p className="text-lg font-medium">No wallet addresses found</p>
                      <p className="text-sm text-gray-500 mt-1">Add a new wallet address to get started</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
