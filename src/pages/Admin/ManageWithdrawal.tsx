import React, { useState, useEffect, useMemo } from 'react';
import PageMeta from '../../components/common/PageMeta';
import { sellRequestApi, SellRequestUser } from '../../services/api';

/* ============================
   Bugs Fixed:
   1. formatAmount() was called on currency (a string) — fixed to use correct fields
   2. withdrawal.final_amount → withdrawal.finalAmount (consistent casing)
   3. console.log inside JSX map() removed (causes expression issues)
   4. Unused imports removed: AdminModal, manageWithdrawalApi, WithdrawalType
   5. Unused handlers removed: handleAddWithdrawal, handleEditWithdrawal,
      handleDeleteWithdrawal, handleApproveWithdrawal, handleRejectWithdrawal,
      editingWithdrawal, isModalOpen, modalError, isSubmitting states
   6. handlePaymentAction now shows toast instead of alert()
   7. Avatar initial falls back to userFkId first char, then 'U'
   8. Status badge added to table for visibility
============================ */

/* ============================
   Toast Component
============================ */
interface ToastProps {
  type: 'success' | 'error';
  msg: string;
}

/* ============================
   Status Badge
============================ */
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    REQUESTED: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
    APPROVED:  'bg-green-500/15 text-green-400 border border-green-500/30',
    REJECTED:  'bg-red-500/15 text-red-400 border border-red-500/30',
    ACTIVE:    'bg-blue-500/15 text-blue-400 border border-blue-500/30',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${map[status] ?? 'bg-gray-500/15 text-gray-400 border border-gray-500/30'}`}>
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70" />
      {status}
    </span>
  );
}

/* ============================
   Main Component
============================ */
export default function SellRequests() {
  const [withdrawals, setWithdrawals] = useState<SellRequestUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [error, setError] = useState('');
  const [toast, setToast] = useState<ToastProps | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  /* ============================
     Toast Helper
  ============================ */
  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  /* ============================
     Fetch
  ============================ */
  const fetchWithdrawals = async () => {
  try {
    setIsLoading(true);
    setError('');
    const response = await sellRequestApi.getAll(1, 25, 'ACTIVE');
    console.log('API response:', response);

    if (response?.content && Array.isArray(response.content)) {
      // ✅ API returns { data: [...] } not { content: [...] }
      setWithdrawals(response.content);
    } else if (response?.content && Array.isArray(response.content)) {
      setWithdrawals(response.content);
    } else {
      setWithdrawals([]);
    }
  } catch (err) {
    console.error('Error fetching sell requests:', err);
    setError('Failed to load sell requests. Please try again.');
    setWithdrawals([]);
  } finally {
    setIsLoading(false);
  }
};

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  /* ============================
     Approve / Reject
  ============================ */
  const handlePaymentAction = async (
    paymentId: number,
    status: 'APPROVED' | 'REJECTED'
  ) => {
    try {
      setActionLoadingId(paymentId);
      const approvedAt = new Date().toISOString().split('T')[0];
      await sellRequestApi.update(paymentId, { status, approvedAt });
      showToast('success', `Request ${status.toLowerCase()} successfully`);
      await fetchWithdrawals();
    } catch (err) {
      console.error(`Error updating status to ${status}:`, err);
      showToast('error', `Failed to ${status.toLowerCase()} request. Try again.`);
    } finally {
      setActionLoadingId(null);
    }
  };

  /* ============================
     Filter + Paginate
  ============================ */
  const filteredWithdrawals = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return (withdrawals ?? []).filter((w) =>
      w.investment?.userFkId?.toLowerCase().includes(term) ||
      w.investment?.containerType?.toLowerCase().includes(term) ||
      w.finalAmount?.toString().includes(term)
    );
  }, [withdrawals, searchTerm]);

  const totalPages = Math.ceil(filteredWithdrawals.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentWithdrawals = filteredWithdrawals.slice(startIndex, startIndex + rowsPerPage);

  // Reset to page 1 on search
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  /* ============================
     Formatters
  ============================ */
  const formatDate = (dateString: string) => {
    if (!dateString) return '—';
    try {
      return new Date(dateString).toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const formatAmount = (amount: number | undefined | null) => {
    if (amount == null || isNaN(Number(amount))) return '—';
    return Number(amount).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const getInitial = (w: SellRequestUser) =>
    w.user?.name?.charAt(0)?.toUpperCase() ||
    w.investment?.userFkId?.charAt(0)?.toUpperCase() ||
    'U';

  /* ============================
     Render
  ============================ */
  return (
    <>
      <PageMeta
        title="Sell Requests — Admin"
        description="Admin panel for managing sell requests"
      />

      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl text-sm font-semibold transition-all
          ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.type === 'success'
            ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
            : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
          }
          {toast.msg}
        </div>
      )}

      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10 bg-gray-900 min-h-screen">

        {/* Header */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Sell Requests</h2>
            <p className="text-sm text-gray-400 mt-0.5">Review and manage container sell requests</p>
          </div>
          <nav>
            <ol className="flex items-center gap-2 text-sm">
              <li className="text-gray-400">Admin</li>
              <li className="text-gray-600">/</li>
              <li className="font-semibold text-orange-500">Sell Requests</li>
            </ol>
          </nav>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-4 flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
            <button onClick={fetchWithdrawals} className="ml-auto text-red-400 hover:text-red-300 underline text-xs">Retry</button>
          </div>
        )}

        {/* Panel */}
        <div className="bg-[#0f0f0f] rounded-2xl border border-[#232323] shadow-2xl overflow-hidden">

          {/* Panel Header */}
          <div className="px-6 py-5 border-b border-[#232323] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <h3 className="text-white font-bold text-lg">All Sell Requests</h3>
              {!isLoading && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-500/15 text-orange-400 border border-orange-500/20">
                  {filteredWithdrawals.length}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* Search */}
              <div className="relative flex-1 sm:flex-none">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by user, container..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-64 rounded-xl border border-[#333] bg-[#1a1a1a] py-2.5 pl-9 pr-4 text-sm text-white placeholder-gray-500 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 transition-all"
                />
              </div>

              {/* Refresh */}
              <button
                onClick={fetchWithdrawals}
                disabled={isLoading}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-[#333] bg-[#1a1a1a] text-gray-400 hover:text-white hover:border-gray-500 disabled:opacity-50 transition-all text-sm"
              >
                <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#333] border-t-orange-500 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">Loading sell requests...</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#232323] bg-[#141414]">
                      {['#', 'User', 'Container Type', 'Currency', 'Requested Amount', 'Status', 'Requested At', 'Actions'].map((h) => (
                        <th key={h} className="text-left py-3.5 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1c1c1c]">
                    {currentWithdrawals.length > 0 ? (
                      currentWithdrawals.map((withdrawal, index) => {
                        const isActioning = actionLoadingId === withdrawal.sellRequestPkId;
                        const showActions = withdrawal.status === 'REQUESTED';

                        return (
                          <tr
                            key={withdrawal.investmentPkId ?? index}
                            className="hover:bg-white/[0.02] transition-colors group"
                          >
                            {/* # */}
                            <td className="py-4 px-5 text-gray-500 text-sm font-medium">
                              {startIndex + index + 1}
                            </td>

                            {/* User */}
                            <td className="py-4 px-5">
                              <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-rose-600 text-white text-xs font-bold shadow-lg">
                                  {getInitial(withdrawal)}
                                </div>
                                <span className="text-white text-sm font-medium">
                                  {withdrawal.investment?.userFkId || '—'}
                                </span>
                              </div>
                            </td>

                            {/* Container Type */}
                            <td className="py-4 px-5">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                {withdrawal.investment?.containerType || '—'}
                              </span>
                            </td>

                            {/* Currency */}
                            <td className="py-4 px-5 text-gray-300 text-sm font-mono font-semibold">
                              {/* ✅ Fixed: was formatAmount(withdrawal.investment.currency) which is a string */}
                              {withdrawal.investment?.currency || '—'}
                            </td>

                            {/* Requested Amount */}
                            <td className="py-4 px-5">
                              <span className="text-orange-400 font-mono font-bold text-sm">
                                {/* ✅ Fixed: was withdrawal.final_amount (snake_case) */}
                                {formatAmount(withdrawal.finalAmount)}
                              </span>
                            </td>

                            {/* Status */}
                            <td className="py-4 px-5">
                              <StatusBadge status={withdrawal.status || 'REQUESTED'} />
                            </td>

                            {/* Date */}
                            <td className="py-4 px-5 text-gray-400 text-xs whitespace-nowrap">
                              {formatDate(withdrawal.requestedAt)}
                            </td>

                            {/* Actions */}
                            <td className="py-4 px-5">
                              {showActions ? (
                                <div className="flex items-center gap-2">
                                  <button
                                    disabled={isActioning}
                                    onClick={() => handlePaymentAction(withdrawal.sellRequestPkId, 'APPROVED')}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-xs font-semibold transition-colors"
                                  >
                                    {isActioning ? (
                                      <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                      </svg>
                                    ) : (
                                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                      </svg>
                                    )}
                                    Approve
                                  </button>

                                  <button
                                    disabled={isActioning}
                                    onClick={() => handlePaymentAction(withdrawal.sellRequestPkId, 'REJECTED')}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600/80 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-xs font-semibold transition-colors"
                                  >
                                    {isActioning ? (
                                      <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                      </svg>
                                    ) : (
                                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                    )}
                                    Reject
                                  </button>
                                </div>
                              ) : (
                                <span className="text-xs text-gray-600 italic">No action</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={8} className="py-16 text-center">
                          <svg className="mx-auto h-10 w-10 text-gray-700 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <p className="text-gray-500 font-medium">No sell requests found</p>
                          {searchTerm && (
                            <p className="text-gray-600 text-sm mt-1">
                              No results for "<span className="text-gray-400">{searchTerm}</span>"
                            </p>
                          )}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-[#1c1c1c] flex flex-col sm:flex-row justify-between items-center gap-3">
                  <p className="text-xs text-gray-500">
                    Showing <span className="text-gray-300 font-medium">{startIndex + 1}</span>–
                    <span className="text-gray-300 font-medium">{Math.min(startIndex + rowsPerPage, filteredWithdrawals.length)}</span> of{' '}
                    <span className="text-gray-300 font-medium">{filteredWithdrawals.length}</span> entries
                  </p>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setCurrentPage((p) => p - 1)}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg border border-[#333] bg-[#1a1a1a] text-gray-400 hover:text-white hover:border-gray-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                      .reduce<(number | '...')[]>((acc, p, i, arr) => {
                        if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push('...');
                        acc.push(p);
                        return acc;
                      }, [])
                      .map((item, i) =>
                        item === '...' ? (
                          <span key={`ellipsis-${i}`} className="px-2 text-gray-600 text-sm">…</span>
                        ) : (
                          <button
                            key={item}
                            onClick={() => setCurrentPage(item as number)}
                            className={`min-w-[36px] h-9 px-3 text-sm font-medium rounded-lg transition-all ${
                              item === currentPage
                                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                                : 'border border-[#333] bg-[#1a1a1a] text-gray-400 hover:text-white hover:border-gray-500'
                            }`}
                          >
                            {item}
                          </button>
                        )
                      )}

                    <button
                      onClick={() => setCurrentPage((p) => p + 1)}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg border border-[#333] bg-[#1a1a1a] text-gray-400 hover:text-white hover:border-gray-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}