import { useState } from "react";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import ComponentCard from "../components/common/ComponentCard";
import Button from "../components/ui/button/Button";
import Input from "../components/form/input/InputField";
import Label from "../components/form/Label";
import { EyeCloseIcon, EyeIcon } from "../icons";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../components/ui/table";

interface ReportData {
  id: number;
  userId: string;
  name: string;
  amount: string;
  mode: string;
  date: string;
  remarks: string;
}

export default function ServicePackage() {
  const [showPassword, setShowPassword] = useState(false);
  const [transactionPassword, setTransactionPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [remarks, setRemarks] = useState("");
  const [checkMeOut, setCheckMeOut] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Mock data for report table
  const reportData: ReportData[] = [
    // Empty for now as shown in the image
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Service package form submitted", {
      transactionPassword,
      otp,
      remarks,
      checkMeOut,
    });
  };

  const handleSendOTP = () => {
    console.log("Send OTP clicked");
  };

  const filteredData = reportData.filter(item =>
    item.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.amount.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.mode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <PageMeta
        title="Service Package - StyloCoin"
        description="Activate your service package and view reports"
      />
      <PageBreadcrumb pageTitle="Service Package" />
      
      <div className="space-y-6">
        {/* Notification Section */}
        
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-blue-700 dark:text-blue-300">Notification</span>
          </div>
          <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
            Here, you can activate your service package of $125 from your Node Wallet.
          </p>
        </div>

        {/* Node Wallet Section */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-2">Node Wallet</h3>
          <div className="text-3xl font-bold text-white">$0</div>
        </div>

        {/* Main Content - 4/8 Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Fill Details Form - 4 Columns */}
          <div className="lg:col-span-4 h-full">
            <ComponentCard title="Fill Details" className="h-full flex flex-col">
            <form onSubmit={handleSubmit} className="space-y-6 flex-1">
              {/* User ID */}
              <div>
                <Label htmlFor="user-id">User ID</Label>
                <Input
                  type="text"
                  id="user-id"
                  value="NODE6871844"
                  disabled
                  className="dark:bg-gray-700 dark:text-gray-300"
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">alaa ibrahim</p>
              </div>

              {/* Mode */}
              <div>
                <Label htmlFor="mode">Mode</Label>
                <Input
                  type="text"
                  id="mode"
                  value="Package Activation"
                  disabled
                  className="dark:bg-gray-700 dark:text-gray-300"
                />
              </div>

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
                    className="px-4 py-2 text-sm whitespace-nowrap bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                  >
                    Send OTP
                  </Button>
                </div>
              </div>

              {/* Remarks */}
              <div>
                <Label htmlFor="remarks">Remarks</Label>
                <textarea
                  id="remarks"
                  placeholder="Remarks..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-dark-900 dark:text-white"
                  rows={3}
                />
              </div>

              {/* Checkbox */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="check-me-out"
                  checked={checkMeOut}
                  onChange={(e) => setCheckMeOut(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="check-me-out" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Check me out
                </label>
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
          </div>

          {/* Report Table - 8 Columns */}
          <div className="lg:col-span-8 h-full">
            <ComponentCard title="Report" className="h-full flex flex-col">
            <div className="space-y-4 flex-1 flex flex-col">
              {/* Search Bar */}
              <div className="flex justify-end">
                <div className="w-64">
                  <Input
                    type="text"
                    placeholder="Search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="dark:bg-dark-900"
                  />
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto flex-1">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-gray-200 dark:border-gray-700">
                      <TableCell className="font-medium text-gray-900 dark:text-gray-100">#</TableCell>
                      <TableCell className="font-medium text-gray-900 dark:text-gray-100">ID</TableCell>
                      <TableCell className="font-medium text-gray-900 dark:text-gray-100">Name</TableCell>
                      <TableCell className="font-medium text-gray-900 dark:text-gray-100">Amount</TableCell>
                      <TableCell className="font-medium text-gray-900 dark:text-gray-100">Mode</TableCell>
                      <TableCell className="font-medium text-gray-900 dark:text-gray-100">Date</TableCell>
                      <TableCell className="font-medium text-gray-900 dark:text-gray-100">Remarks</TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-gray-500 dark:text-gray-400">
                          No data available in table
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredData.map((item, index) => (
                        <TableRow key={item.id} className="border-b border-gray-200 dark:border-gray-700">
                          <TableCell className="text-gray-900 dark:text-gray-100">{index + 1}</TableCell>
                          <TableCell className="text-gray-900 dark:text-gray-100">{item.userId}</TableCell>
                          <TableCell className="text-gray-900 dark:text-gray-100">{item.name}</TableCell>
                          <TableCell className="text-gray-900 dark:text-gray-100">{item.amount}</TableCell>
                          <TableCell className="text-gray-900 dark:text-gray-100">{item.mode}</TableCell>
                          <TableCell className="text-gray-900 dark:text-gray-100">{item.date}</TableCell>
                          <TableCell className="text-gray-900 dark:text-gray-100">{item.remarks}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Row Per Page</span>
                  <select
                    value={rowsPerPage}
                    onChange={(e) => setRowsPerPage(Number(e.target.value))}
                    className="px-4 py-1 border border-gray-300 dark:border-gray-600 rounded dark:bg-dark-900 dark:text-white text-sm"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Entries</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            </ComponentCard>
          </div>
        </div>
      </div>
    </>
  );
}
