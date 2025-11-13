import { useState } from "react";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import ComponentCard from "../components/common/ComponentCard";
import Button from "../components/ui/button/Button";
import Input from "../components/form/input/InputField";
import Label from "../components/form/Label";
import Select from "../components/form/Select";
import { EyeCloseIcon, EyeIcon, InfoIcon } from "../icons";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../components/ui/table";

interface WalletAddress {
  id: number;
  wallet: string;
  address: string;
  createdAt: string;
  status: "Active" | "Inactive";
}

export default function Wallet() {
  const [showPassword, setShowPassword] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [transactionPassword, setTransactionPassword] = useState("");
  const [otp, setOtp] = useState("");

  // Mock data for wallet addresses table
  const walletAddresses: WalletAddress[] = [
    // Empty for now as shown in the image
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log("Wallet form submitted", {
      walletAddress,
      transactionPassword,
      otp,
    });
  };

  const handleSendOTP = () => {
    // Handle OTP sending
    console.log("Send OTP clicked");
  };

  return (
    <>
      <PageMeta
        title="Wallet Address - StyloCoin"
        description="Manage your USDT.BEP20 wallet addresses"
      />
      <PageBreadcrumb pageTitle="Wallet Address" />
      
      <div className="space-y-6">
        {/* Gentle Reminder Section */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <InfoIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                Gentle Reminder
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Kindly update your USDT.BEP20 Wallet Address to get withdrawals into your account. 
                Please connect with your up-line for further assistance regarding the same.
              </p>
            </div>
          </div>
        </div>

        {/* Add New Wallet Address Form */}
        <ComponentCard title="Add New USDT.BEP20 Address to Receive Profits">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Select Wallet */}
              <div>
                <Label htmlFor="wallet-select">Select Wallet</Label>
                <Select
                  options={[
                    { value: "USDT.BEP20", label: "USDT.BEP20" }
                  ]}
                  defaultValue="USDT.BEP20"
                  onChange={() => {}} // No-op since it's disabled
                  className="dark:bg-dark-900"
                />
              </div>

              {/* Wallet Address */}
              <div>
                <Label htmlFor="wallet-address">Address</Label>
                <Input
                  type="text"
                  id="wallet-address"
                  placeholder="Enter Wallet Address"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  className="dark:bg-dark-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Transaction Password */}
              <div>
                <Label htmlFor="transaction-password">Transaction Password</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    id="transaction-password"
                    placeholder="Enter Transaction Password"
                    value={transactionPassword}
                    onChange={(e) => setTransactionPassword(e.target.value)}
                    className="dark:bg-dark-900 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showPassword ? <EyeCloseIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* One Time Password */}
              <div>
                <Label htmlFor="otp">One Time Password</Label>
                <div className="flex space-x-2">
                  <div className="flex-1">
                    <Input
                      type="text"
                      id="otp"
                      placeholder="Enter One Time Password"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="dark:bg-dark-900"
                    />
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleSendOTP}
                    className="px-4 py-2 text-sm whitespace-nowrap"
                  >
                    Send OTP
                  </Button>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3"
              >
                Submit
              </Button>
            </div>
          </form>
        </ComponentCard>

        {/* Wallet Addresses Table */}
        <ComponentCard title="Wallet Address">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-gray-200 dark:border-gray-700">
                  <TableCell className="font-medium text-gray-900 dark:text-gray-100">#</TableCell>
                  <TableCell className="font-medium text-gray-900 dark:text-gray-100">Wallet</TableCell>
                  <TableCell className="font-medium text-gray-900 dark:text-gray-100">Address</TableCell>
                  <TableCell className="font-medium text-gray-900 dark:text-gray-100">Created At</TableCell>
                  <TableCell className="font-medium text-gray-900 dark:text-gray-100">Status</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {walletAddresses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500 dark:text-gray-400">
                      No wallet addresses found
                    </TableCell>
                  </TableRow>
                ) : (
                  walletAddresses.map((wallet) => (
                    <TableRow key={wallet.id} className="border-b border-gray-200 dark:border-gray-700">
                      <TableCell className="text-gray-900 dark:text-gray-100">{wallet.id}</TableCell>
                      <TableCell className="text-gray-900 dark:text-gray-100">{wallet.wallet}</TableCell>
                      <TableCell className="text-gray-900 dark:text-gray-100 font-mono text-sm">
                        {wallet.address}
                      </TableCell>
                      <TableCell className="text-gray-900 dark:text-gray-100">{wallet.createdAt}</TableCell>
                      <TableCell>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          wallet.status === 'Active' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {wallet.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </ComponentCard>
      </div>
    </>
  );
}
