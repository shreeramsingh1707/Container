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

interface Container {
  containerPkId:number;
  containerType: string;
  ownershipType: string;
  priceUsd: string;
  priceInr: string;
  min_shares: string;
  contract_months: string;
  roiPercentage: string
}

export default function Buy() {
  const [showPassword, setShowPassword] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [isAddMode, setIsAddMode] = useState(false);
  const [transactionPassword, setTransactionPassword] = useState("");
  const [otp, setOtp] = useState("");

  // Mock data for wallet addresses table
  const walletAddresses: Container[] = [
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



  return (
    <>
      <PageMeta
        title="Buy Container"
        description="Manage your  Container Here"
      />
       <div className=" mt-4">
      <PageBreadcrumb pageTitle="Buy Container"  />
      </div>

      <div className="flex justify-end mb-4">
        <Button
          onClick={() => setIsAddMode(!isAddMode)}
          className={`px-6 py-2 ${isAddMode
              ? "bg-gray-500 hover:bg-gray-600"
              : "bg-orange-500 hover:bg-orange-600"
            } text-white`}
        >
          {isAddMode ? "View All Containers" : "Add / Buy Container"}
        </Button>
      </div>



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
                Shipping containers power 90% of global trade, moving goods worth $24 trillion annually. By owning containers, you tap into the world’s biggest business—world trade. It’s the backbone of the global economy, and now you can be part of it.
              </p>
            </div>
          </div>
        </div>

        {/* Add New Wallet Address Form */}
        {isAddMode && (
        <ComponentCard title="Buy  New Container to Receive Profits">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Select Wallet */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="wallet-select">Select Container-Type</Label>
                <Select
                  options={[
                    { value: "USDT.BEP20", label: "USDT.BEP20" }
                  ]}
                  defaultValue="USDT.BEP20"
                  onChange={() => { }} // No-op since it's disabled
                  className="dark:bg-dark-900"
                />
              </div>
              <div>
                <Label htmlFor="wallet-select">Select Ownership-Type</Label>
                <Select
                  options={[
                    { value: "USDT.BEP20", label: "USDT.BEP20" }
                  ]}
                  defaultValue="USDT.BEP20"
                  onChange={() => { }} // No-op since it's disabled
                  className="dark:bg-dark-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Transaction Password */}
              <div>
                <Label htmlFor="transaction-password">Price USD</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    id="transaction-password"
                    placeholder="Enter Transaction Password"
                    value={transactionPassword}
                    onChange={(e) => setTransactionPassword(e.target.value)}
                    className="dark:bg-dark-900 pr-10"
                  />

                </div>
              </div>

              {/* One Time Password */}
              <div>
                <Label htmlFor="otp">Price INR</Label>
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
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Transaction Password */}
              <div>
                <Label htmlFor="transaction-password">Number of Shares</Label>
                <div className="relative">
                  <Input
                    type={"number"}
                    id="transaction-password"
                    placeholder="Enter Transaction Password"
                    value={transactionPassword}
                    onChange={(e) => setTransactionPassword(e.target.value)}
                    className="dark:bg-dark-900 pr-10"
                  />

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
        )}

        {/* Wallet Addresses Table */}
        {!isAddMode && (
        <ComponentCard title="Container Details">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-gray-200 dark:border-gray-700">
                  <TableCell className="font-medium text-gray-900 dark:text-gray-100">#</TableCell>
                  <TableCell className="font-medium text-gray-900 dark:text-gray-100">Container Type</TableCell>
                  <TableCell className="font-medium text-gray-900 dark:text-gray-100">Ownership Type</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {walletAddresses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500 dark:text-gray-400">
                      No Container found
                    </TableCell>
                  </TableRow>
                ) : (
                  walletAddresses.map((wallet) => (
                    <TableRow key={wallet.containerPkId} className="border-b border-gray-200 dark:border-gray-700">
                      <TableCell className="text-gray-900 dark:text-gray-100">{wallet.containerPkId}</TableCell>
                      <TableCell className="text-gray-900 dark:text-gray-100">{wallet.containerType}</TableCell>
                      <TableCell className="text-gray-900 dark:text-gray-100 font-mono text-sm">
                        {wallet.ownershipType}
                      </TableCell>
                     
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </ComponentCard>
        )}
      </div>
      
    </>
  );
}
