import React, { useEffect, useState } from "react";
import api, { DepositFundItem } from "../services/api";
import { useAuth } from "../context/AuthContext";

interface InvoiceData {
  id?: number;
  invoiceNumber: string;
  amount: number;
  currency: string;
  status: "pending" | "paid" | "cancelled";
  createdAt: string;
  dueDate: string;
  paymentMethod: string;
  description: string;
}

export default function DepositInvoice() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);

  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const normalizeStatus = (status?: string): "pending" | "paid" | "cancelled" => {
    if (!status) return "pending";
    const s = status.toLowerCase();
    if (s.includes("paid") || s.includes("approved")) return "paid";
    if (s.includes("cancel")) return "cancelled";
    return "pending";
  };

  const getDepositId = (item: DepositFundItem): number | undefined => {
    return item.depositPkId;
  };

  const toInvoice = (item: DepositFundItem): InvoiceData => {
    const created = item.createdDatetime || new Date().toISOString();
    const due = new Date(created);
    due.setDate(due.getDate() + 7);
    const depositId = getDepositId(item);
    return {
      id: depositId,
      invoiceNumber: `DF-${depositId ?? "NEW"}`,
      amount: item.amount || 0,
      currency: item.currency || "USDT",
      status: normalizeStatus(item.status),
      createdAt: created,
      dueDate: due.toISOString(),
      paymentMethod: item.currency || "-",
      description: "Deposit Fund",
    };
  };

  const fetchInvoices = async () => {
    setIsLoading(true);
    setError("");
    try {
      const { content } = await api.depositFund.getAll(0, 25, "ACTIVE", user?.nodeId || null);
      setInvoices((content || []).map(toInvoice));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load invoices");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleDelete = async (depositFundPkId?: number) => {
    if (!depositFundPkId) return;
    const confirmed = window.confirm("Are you sure you want to delete this invoice?");
    if (!confirmed) return;
    setIsLoading(true);
    setError("");
    try {
      await api.depositFund.delete(depositFundPkId);
      await fetchInvoices();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (depositFundPkId?: number, nextStatus: string = "PAID") => {
    if (!depositFundPkId) return;
    setIsLoading(true);
    setError("");
    try {
      await api.depositFund.update(depositFundPkId, { status: nextStatus });
      await fetchInvoices();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesStatus = filterStatus === "all" || invoice.status === filterStatus;
    const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
            <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full mr-1.5"></span>
            Pending
          </span>
        );
      case "paid":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5"></span>
            Paid
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
            <span className="w-1.5 h-1.5 bg-red-400 rounded-full mr-1.5"></span>
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  const totalPending = invoices.filter(inv => inv.status === "pending").length;
  const totalPaid = invoices.filter(inv => inv.status === "paid").length;
  const totalAmount = invoices.reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10 bg-gray-900 min-h-screen">
      {/* Breadcrumb */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-md2 font-semibold text-white">
          Deposit Invoice
        </h2>
        <nav>
          <ol className="flex items-center gap-2">
            <li><a className="font-medium text-gray-300 hover:text-white" href="/">Home /</a></li>
            <li className="font-medium text-orange-500">Deposit Invoice</li>
          </ol>
        </nav>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-900/40 to-blue-800/30 rounded-xl border border-blue-600/30 p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-sm font-medium">Total Invoices</p>
              <p className="text-white text-2xl font-bold">{invoices.length}</p>
            </div>
            <div className="p-3 bg-blue-500/20 rounded-full">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-900/40 to-yellow-800/30 rounded-xl border border-yellow-600/30 p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-200 text-sm font-medium">Pending</p>
              <p className="text-white text-2xl font-bold">{totalPending}</p>
            </div>
            <div className="p-3 bg-yellow-500/20 rounded-full">
              <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-900/40 to-green-800/30 rounded-xl border border-green-600/30 p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-200 text-sm font-medium">Total Amount</p>
              <p className="text-white text-2xl font-bold">${totalAmount.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-green-500/20 rounded-full">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 mb-6 shadow-lg">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search invoices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 rounded-lg border-2 border-gray-600 bg-gray-700 py-3 pl-10 pr-4 text-white placeholder-gray-400 outline-none transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
              />
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-lg border-2 border-gray-600 bg-gray-700 py-3 px-4 text-white outline-none transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
            >
              <option value="all" className="bg-gray-700">All Status</option>
              <option value="pending" className="bg-gray-700">Pending</option>
              <option value="paid" className="bg-gray-700">Paid</option>
              <option value="cancelled" className="bg-gray-700">Cancelled</option>
            </select>
          </div>

          <button
            disabled={isLoading}
            onClick={fetchInvoices}
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-orange-500/25 disabled:opacity-60"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Invoice Table */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-800 to-gray-750 border-b border-gray-700">
              <tr>
                <th className="text-left py-4 px-6 font-bold text-white text-sm uppercase tracking-wider">Invoice #</th>
                <th className="text-left py-4 px-6 font-bold text-white text-sm uppercase tracking-wider">Description</th>
                <th className="text-left py-4 px-6 font-bold text-white text-sm uppercase tracking-wider">Amount</th>
                <th className="text-left py-4 px-6 font-bold text-white text-sm uppercase tracking-wider">Payment Method</th>
                <th className="text-left py-4 px-6 font-bold text-white text-sm uppercase tracking-wider">Status</th>
                <th className="text-left py-4 px-6 font-bold text-white text-sm uppercase tracking-wider">Created</th>
                <th className="text-left py-4 px-6 font-bold text-white text-sm uppercase tracking-wider">Due Date</th>
                <th className="text-left py-4 px-6 font-bold text-white text-sm uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.invoiceNumber} className="hover:bg-gray-700/50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="text-white font-medium">{invoice.invoiceNumber}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-gray-300">{invoice.description}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-white font-semibold">
                      ${invoice.amount.toLocaleString()} {invoice.currency}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-gray-300">{invoice.paymentMethod}</div>
                  </td>
                  <td className="py-4 px-6">
                    {getStatusBadge(invoice.status)}
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-gray-300">{new Date(invoice.createdAt).toLocaleDateString()}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-gray-300">{new Date(invoice.dueDate).toLocaleDateString()}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleUpdateStatus(invoice.id, 'PAID')}
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                        disabled={isLoading}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(invoice.id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                        disabled={isLoading}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {isLoading && (
          <div className="text-center py-6 text-gray-300">Loading...</div>
        )}

        {error && (
          <div className="text-center py-6 text-red-300">{error}</div>
        )}

        {!isLoading && filteredInvoices.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-300">No invoices found</h3>
            <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="mt-6 flex items-center justify-between">
        <div className="text-sm text-gray-400">
          Showing {filteredInvoices.length} of {invoices.length} invoices
        </div>
        <div className="flex space-x-2">
          <button className="px-3 py-2 text-sm font-medium text-gray-400 bg-gray-800 border border-gray-600 rounded-lg hover:bg-gray-700 hover:text-white transition-colors">
            Previous
          </button>
          <button className="px-3 py-2 text-sm font-medium text-white bg-orange-500 border border-orange-500 rounded-lg hover:bg-orange-600 transition-colors">
            1
          </button>
          <button className="px-3 py-2 text-sm font-medium text-gray-400 bg-gray-800 border border-gray-600 rounded-lg hover:bg-gray-700 hover:text-white transition-colors">
            2
          </button>
          <button className="px-3 py-2 text-sm font-medium text-gray-400 bg-gray-800 border border-gray-600 rounded-lg hover:bg-gray-700 hover:text-white transition-colors">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
