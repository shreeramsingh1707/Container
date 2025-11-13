import { useEffect, useState } from "react";
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
import { Modal } from "../components/ui/modal";
import { AddMiningPackageRequest, miningPackageApi, MiningPackageItem } from "../services/api";
import { useAuth } from "../context/AuthContext";

interface MiningReportRow {
  id: number;
  userId: string;
  name: string;
  amount: string;
  mode: string;
  date: string;
  remarks: string;
  originalData?: MiningPackageItem; // Store original data for editing
}

export default function MiningPackage() {
  const { user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [transactionPassword, setTransactionPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [remarks, setRemarks] = useState("");
  const [checkMeOut, setCheckMeOut] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [filterBy] = useState("ACTIVE");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MiningPackageItem | null>(null);
  const [editRemarks, setEditRemarks] = useState("");
  const [editPackageStatus, setEditPackageStatus] = useState<string>("IN_PROGRESS");
  const [updating, setUpdating] = useState(false);
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState("");

  const [data, setData] = useState<MiningReportRow[]>([]);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await miningPackageApi.getAll(currentPage, rowsPerPage, filterBy, user?.nodeId || null);
      const mapped: MiningReportRow[] = (response.content || []).map((item: MiningPackageItem, idx: number) => ({
        id: Number(item.miningPackagePkId ?? idx + 1),
        userId: String(item.userNodeCode ?? "-"),
        name: String("-"),
        amount: String(item.packageAmount ?? 0),
        mode: String(item.mode ?? "NODE"),
        date: (() => {
          if (item.timeStamp) {
            return new Date(typeof item.timeStamp === 'number' ? item.timeStamp : parseInt(item.timeStamp)).toLocaleString();
          }
          if (item.localDateTime) {
            return new Date(item.localDateTime).toLocaleString();
          }
          if (item.createdDatetime) {
            return new Date(item.createdDatetime).toLocaleString();
          }
          if (item.effectiveDateTime) {
            return new Date(item.effectiveDateTime).toLocaleString();
          }
          return "-";
        })(),
        remarks: String(item.remarks ?? item.notesG11nBigTxt ?? ""),
        originalData: item, // Store original data for editing
      }));
      setData(mapped);
      setTotalItems(response.totalElements || response.count || mapped.length);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, rowsPerPage, filterBy, user?.nodeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted!", { 
      user, 
      transactionPassword: transactionPassword ? "***" : "", 
      checkMeOut,
      userConfirmed: user?.isConfirmed,
      userNodeId: user?.nodeId 
    });
    setError("");
    setSuccess("");

    //add submit request to add mining package
    const payload: AddMiningPackageRequest = {
      miningPackagePkId: null,
      userNodeCode: user?.nodeId || "",
      packageAmount: 250,
      mode: "NODE",
      transactionPassword,
      remarks,
      packageStatus: 'IN_PROGRESS' as const,
      localDateTime: new Date().toISOString(), // Set current date/time
    };
    const result = await miningPackageApi.add(payload);
    console.log("API call successful:", result);
    setSuccess("Mining package activated successfully!");
    setTransactionPassword("");
    setOtp("");
    setRemarks("");
    setCheckMeOut(false);
    await loadData();
    
    // Check if user is confirmed for mining access (only block if explicitly false, allow undefined)
    if (user?.isConfirmed === false) {
      const errorMsg = "You are not confirmed for mining access. Please contact an administrator.";
      console.log("Validation failed: User not confirmed");
      setError(errorMsg);
      return;
    }
    
    if (!user?.nodeId) {
      const errorMsg = "User node ID is not available. Please try logging in again.";
      console.log("Validation failed: No nodeId", user);
      setError(errorMsg);
      return;
    }
    
    if (!transactionPassword || transactionPassword.trim() === "") {
      const errorMsg = "Please enter your transaction password";
      console.log("Validation failed: No transaction password");
      setError(errorMsg);
      return;
    }
    
    if (!checkMeOut) {
      const errorMsg = "Please check the agreement";
      console.log("Validation failed: Agreement not checked");
      setError(errorMsg);
      return;
    }
    
    console.log("All validations passed, submitting...");
    setSubmitting(true);
    try {
      const payload: AddMiningPackageRequest = {
        miningPackagePkId: null,
        userNodeCode: user.nodeId,
        packageAmount: 250,
        mode: "NODE",
        transactionPassword,
        remarks,
        packageStatus: 'IN_PROGRESS' as const,
        localDateTime: new Date().toISOString(), // Set current date/time
      };
      console.log("API call payload:", payload);
      const result = await miningPackageApi.add(payload);
      console.log("API call successful:", result);
      setSuccess("Mining package activated successfully!");
      setTransactionPassword("");
      setOtp("");
      setRemarks("");
      setCheckMeOut(false);
      await loadData();
      // Auto-hide success message after 5 seconds
      setTimeout(() => setSuccess(""), 5000);
    } catch (e) {
      console.error("API call failed:", e);
      const errorMsg = e instanceof Error ? e.message : "Failed to submit mining package";
      setError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendOTP = () => {
    // Hook up to real OTP API when available
    console.log("Send OTP clicked");
  };

  const handleEdit = (item: MiningReportRow) => {
    if (item.originalData) {
      setEditingItem(item.originalData);
      setEditRemarks(item.originalData.remarks || "");
      setEditPackageStatus(item.originalData.packageStatus || "IN_PROGRESS");
      setIsEditModalOpen(true);
      setEditError("");
      setEditSuccess("");
    }
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingItem(null);
    setEditRemarks("");
    setEditPackageStatus("IN_PROGRESS");
    setEditError("");
    setEditSuccess("");
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editingItem.miningPackagePkId) {
      setEditError("Invalid item to update");
      return;
    }

    setUpdating(true);
    setEditError("");
    setEditSuccess("");

    try {
      // Include all existing fields to prevent deletion, only update the fields we're changing
      const updateData: Partial<MiningPackageItem> = {
        ...editingItem, // Preserve all existing fields
        remarks: editRemarks,
        packageStatus: editPackageStatus,
        localDateTime: new Date().toISOString(), // Set to current date/time
      };

      await miningPackageApi.update(editingItem.miningPackagePkId, updateData);
      setEditSuccess("Mining package updated successfully!");
      await loadData();
      setTimeout(() => {
        closeEditModal();
        setSuccess("Mining package updated successfully!");
        setTimeout(() => setSuccess(""), 5000);
      }, 1000);
    } catch (e) {
      console.error("Update failed:", e);
      setEditError(e instanceof Error ? e.message : "Failed to update mining package");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (id: number) => {
    setError("");
    try {
      await miningPackageApi.delete(id);
      await loadData();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete record");
    }
  };

  const filteredData = data.filter(item =>
    item.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.amount.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.mode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <PageMeta
        title="Mining Package - StyloCoin"
        description="Activate your mining package and view reports"
      />
      <PageBreadcrumb pageTitle="Mining Package" />
      
      <div className="space-y-6">
        {error && (
          <div className="border border-red-500 text-red-600 dark:text-red-400 dark:border-red-700 rounded p-3 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="border border-green-500 text-green-600 dark:text-green-400 dark:border-green-700 rounded p-3 text-sm">
            {success}
          </div>
        )}
        {/* Notification Section */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-blue-700 dark:text-blue-300">Notification</span>
          </div>
          <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
            Here, you can activate your mining package of $250 from your Node Wallet.
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
                  value={user?.nodeId || ""}
                  disabled
                  className="dark:bg-gray-700 dark:text-gray-300"
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{user?.name || ""}</p>
              </div>

              {/* Mode */}
              <div>
                <Label htmlFor="mode">Mode</Label>
                <Input
                  type="text"
                  id="mode"
                  value="Mining Package Activation"
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
                  type="submit"
                  disabled={submitting}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "Submitting..." : "Submit"}
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
                      <TableCell className="font-medium text-gray-900 dark:text-gray-100">Actions</TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-gray-500 dark:text-gray-400">
                          Loading...
                        </TableCell>
                      </TableRow>
                    ) : filteredData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-gray-500 dark:text-gray-400">
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
                          <TableCell className="text-gray-900 dark:text-gray-100">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                                onClick={() => handleEdit(item)}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                className="px-3 py-1 text-xs bg-red-600 hover:bg-red-700 text-white border-red-600"
                                onClick={() => handleDelete(item.id)}
                              >
                                Delete
                              </Button>
                            </div>
                          </TableCell>
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
                  <button
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                    disabled={currentPage === 0}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    onClick={() => setCurrentPage((p) => p + 1)}
                    disabled={(currentPage + 1) * rowsPerPage >= totalItems}
                  >
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

      {/* Edit Modal */}
      <Modal isOpen={isEditModalOpen} onClose={closeEditModal} className="max-w-2xl">
        <div className="p-8 bg-white dark:bg-gray-800">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Edit Mining Package</h2>
          
          {editError && (
            <div className="mb-6 rounded-lg border border-red-500 text-red-600 dark:text-red-400 dark:border-red-700 p-4">
              <p className="text-sm font-medium">{editError}</p>
            </div>
          )}

          {editSuccess && (
            <div className="mb-6 rounded-lg border border-green-500 text-green-600 dark:text-green-400 dark:border-green-700 p-4">
              <p className="text-sm font-medium">{editSuccess}</p>
            </div>
          )}

          {editingItem && (
            <form onSubmit={handleUpdate}>
              <div className="space-y-6">
                {/* User Node Code */}
                <div>
                  <Label htmlFor="edit-user-node-code">User Node Code</Label>
                  <Input
                    type="text"
                    id="edit-user-node-code"
                    value={editingItem.userNodeCode || ""}
                    disabled
                    className="dark:bg-gray-700 dark:text-gray-300"
                  />
                </div>

                {/* Package Amount */}
                <div>
                  <Label htmlFor="edit-package-amount">Package Amount</Label>
                  <Input
                    type="text"
                    id="edit-package-amount"
                    value={editingItem.packageAmount || ""}
                    disabled
                    className="dark:bg-gray-700 dark:text-gray-300"
                  />
                </div>

                {/* Mode */}
                <div>
                  <Label htmlFor="edit-mode">Mode</Label>
                  <Input
                    type="text"
                    id="edit-mode"
                    value={editingItem.mode || ""}
                    disabled
                    className="dark:bg-gray-700 dark:text-gray-300"
                  />
                </div>

                {/* Package Status */}
                <div>
                  <Label htmlFor="edit-package-status">Package Status</Label>
                  <select
                    id="edit-package-status"
                    value={editPackageStatus}
                    onChange={(e) => setEditPackageStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-dark-900 dark:text-white"
                  >
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="APPROVED">APPROVED</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>

                {/* Remarks */}
                <div>
                  <Label htmlFor="edit-remarks">Remarks</Label>
                  <textarea
                    id="edit-remarks"
                    placeholder="Remarks..."
                    value={editRemarks}
                    onChange={(e) => setEditRemarks(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-dark-900 dark:text-white"
                    rows={4}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeEditModal}
                    disabled={updating}
                    className="px-6 py-2"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={updating}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updating ? "Updating..." : "Update"}
                  </Button>
                </div>
              </div>
            </form>
          )}
        </div>
      </Modal>
    </>
  );
}
