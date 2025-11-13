import { useState, useEffect } from 'react';
import PageMeta from '../../components/common/PageMeta';
import { walletTransactionApi, WalletTransaction, usersApi, User } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function AdminWalletTransactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const normalizeStatus = (status?: string): 'pending' | 'confirmed' | 'rejected' => {
    if (!status) return 'pending';
    const s = status.toUpperCase();
    if (s === 'SUCCESS' || s.includes('CONFIRMED') || s.includes('APPROVED')) return 'confirmed';
    if (s.includes('REJECT') || s.includes('CANCEL') || s === 'FAILED') return 'rejected';
    if (s === 'IN_PROGRESS') return 'pending';
    return 'pending';
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // Fetch users separately so they still load even if transactions fail
      let usersResponse;
      try {
        usersResponse = await usersApi.getAll(0, 100, 'ACTIVE', user?.nodeId || null);
        setUsers(usersResponse.data || []);
      } catch (userError) {
        console.error('Error fetching users:', userError);
        setUsers([]);
      }

      // Fetch transactions
      try {
        const transactionsResponse = await walletTransactionApi.getAll(0, 100, 'ACTIVE', user?.nodeId || null);
        setTransactions(transactionsResponse.content || []);
      } catch (transactionError) {
        const errorMessage = transactionError instanceof Error ? transactionError.message : 'Failed to load wallet transactions';
        // If it's a 404, show a more helpful message
        if (errorMessage.includes('404') || errorMessage.includes('Not Found')) {
          setError('Wallet transactions API endpoint not found. Please ensure the backend endpoint /api/admin/getWalletTransaction is configured.');
        } else {
          setError(errorMessage);
        }
        console.error('Error fetching transactions:', transactionError);
        setTransactions([]);
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to load data';
      setError(errorMessage);
      console.error('Error fetching data:', e);
      setTransactions([]);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmTransaction = async (walletTxnPkId?: number) => {
    if (!walletTxnPkId) return;
    
    const confirmed = window.confirm('Are you sure you want to confirm this wallet transaction?');
    if (!confirmed) return;

    setIsLoading(true);
    setError('');
    try {
      await walletTransactionApi.confirmWalletTransaction(walletTxnPkId);
      await fetchData();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to confirm transaction');
    } finally {
      setIsLoading(false);
    }
  };

  const getUserName = (transaction: WalletTransaction): string => {
    // Prefer userName from transaction if available
    if (transaction.userName) return transaction.userName;
    
    // Fallback to user lookup by userFkId
    if (transaction.userFkId) {
      const user = users.find(u => u.userPkId === transaction.userFkId);
      if (user) return user.name;
    }
    
    // If transaction has fromUserId, use that as identifier
    if (transaction.fromUserId) return transaction.fromUserId;
    
    return transaction.userFkId ? `User ${transaction.userFkId}` : 'N/A';
  };

  const getStatusBadge = (status: string) => {
    const normalized = normalizeStatus(status);
    const statusUpper = status?.toUpperCase();
    
    switch (normalized) {
      case 'pending':
        // Show IN_PROGRESS for that specific status
        if (statusUpper === 'IN_PROGRESS') {
          return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-1.5"></span>
              In Progress
            </span>
          );
        }
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
            <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full mr-1.5"></span>
            Pending
          </span>
        );
      case 'confirmed':
        // Show SUCCESS for that specific status
        if (statusUpper === 'SUCCESS') {
          return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5"></span>
              Success
            </span>
          );
        }
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5"></span>
            Confirmed
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
            <span className="w-1.5 h-1.5 bg-red-400 rounded-full mr-1.5"></span>
            {statusUpper === 'FAILED' ? 'Failed' : 'Rejected'}
          </span>
        );
      default:
        return null;
    }
  };

  const getTypeBadge = (transaction: WalletTransaction) => {
    // If transaction has fromWallet and toWallet, it's a transfer
    if (transaction.fromWallet && transaction.toWallet) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
          Transfer
        </span>
      );
    }
    
    const t = (transaction.transactionType || '').toUpperCase();
    if (t.includes('DEPOSIT')) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
          Deposit
        </span>
      );
    }
    if (t.includes('WITHDRAWAL') || t.includes('WITHDRAW')) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
          Withdrawal
        </span>
      );
    }
    if (t.includes('TRANSFER')) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
          Transfer
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300">
        {transaction.transactionType || 'Unknown'}
      </span>
    );
  };

  const filteredTransactions = transactions.filter(transaction => {
    const normalizedStatus = normalizeStatus(transaction.status);
    const matchesStatus = filterStatus === 'all' || normalizedStatus === filterStatus;
    const transactionType = (transaction.transactionType || '').toUpperCase();
    const matchesType = filterType === 'all' || 
                       (filterType === 'deposit' && transactionType.includes('DEPOSIT')) ||
                       (filterType === 'withdrawal' && (transactionType.includes('WITHDRAWAL') || transactionType.includes('WITHDRAW'))) ||
                       (filterType === 'transfer' && transactionType.includes('TRANSFER'));
    const transactionId = transaction.walletTxnPkId?.toString() || '';
    const fromUserId = transaction.fromUserId || '';
    const toUserId = transaction.toUserId || '';
    const matchesSearch = transactionId.includes(searchTerm.toLowerCase()) ||
                         getUserName(transaction).toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (transaction.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (transaction.remarks || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         fromUserId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         toUserId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (transaction.transactionId || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesType && matchesSearch;
  });

  const totalPending = transactions.filter(t => normalizeStatus(t.status) === 'pending').length;
  const totalAmount = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);

  if (isLoading && transactions.length === 0) {
    return (
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10 bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="text-gray-400 mt-4">Loading wallet transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title="Admin Wallet Transactions - StyloCoin"
        description="Admin interface for managing wallet transactions"
      />
      
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10 bg-gray-900 min-h-screen">
        {/* Breadcrumb */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-title-md2 font-semibold text-white">
            Admin Wallet Transactions
          </h2>
          <nav>
            <ol className="flex items-center gap-2">
              <li><a className="font-medium text-gray-300 hover:text-white" href="/StyloCoin/admin">Admin Dashboard /</a></li>
              <li className="font-medium text-orange-500">Wallet Transactions</li>
            </ol>
          </nav>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-900/40 to-blue-800/30 rounded-xl border border-blue-600/30 p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm font-medium">Total Transactions</p>
                <p className="text-white text-2xl font-bold">{transactions.length}</p>
              </div>
              <div className="p-3 bg-blue-500/20 rounded-full">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
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
                  placeholder="Search transactions..."
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
                <option value="confirmed" className="bg-gray-700">Confirmed</option>
                <option value="rejected" className="bg-gray-700">Rejected</option>
              </select>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="rounded-lg border-2 border-gray-600 bg-gray-700 py-3 px-4 text-white outline-none transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
              >
                <option value="all" className="bg-gray-700">All Types</option>
                <option value="deposit" className="bg-gray-700">Deposit</option>
                <option value="withdrawal" className="bg-gray-700">Withdrawal</option>
                <option value="transfer" className="bg-gray-700">Transfer</option>
              </select>
            </div>

            <button
              disabled={isLoading}
              onClick={fetchData}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-orange-500/25 disabled:opacity-60"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-800 to-gray-750 border-b border-gray-700">
                <tr>
                  <th className="text-left py-4 px-6 font-bold text-white text-sm uppercase tracking-wider">ID</th>
                  <th className="text-left py-4 px-6 font-bold text-white text-sm uppercase tracking-wider">User</th>
                  <th className="text-left py-4 px-6 font-bold text-white text-sm uppercase tracking-wider">Type</th>
                  <th className="text-left py-4 px-6 font-bold text-white text-sm uppercase tracking-wider">Amount</th>
                  <th className="text-left py-4 px-6 font-bold text-white text-sm uppercase tracking-wider">Wallet</th>
                  <th className="text-left py-4 px-6 font-bold text-white text-sm uppercase tracking-wider">Status</th>
                  <th className="text-left py-4 px-6 font-bold text-white text-sm uppercase tracking-wider">Created</th>
                  <th className="text-left py-4 px-6 font-bold text-white text-sm uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredTransactions.map((transaction, index) => {
                  const isPending = normalizeStatus(transaction.status) === 'pending';
                  return (
                    <tr key={transaction.walletTxnPkId ?? `transaction-${index}`} className="hover:bg-gray-700/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="text-white font-medium">#{transaction.walletTxnPkId}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-gray-300">{getUserName(transaction)}</div>
                        {transaction.fromUserId && transaction.fromUserId !== transaction.toUserId && (
                          <div className="text-gray-500 text-xs mt-1">
                            From: {transaction.fromUserId}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        {getTypeBadge(transaction)}
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-white font-semibold">
                          ${(transaction.amount || 0).toLocaleString()}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        {transaction.transactionType?.toUpperCase().includes('TRANSFER') && transaction.fromWallet && transaction.toWallet ? (
                          <div className="space-y-1">
                            <div className="text-gray-300 text-xs">
                              <span className="text-gray-400">From:</span> {transaction.fromWallet}
                            </div>
                            <div className="text-gray-300 text-xs">
                              <span className="text-gray-400">To:</span> {transaction.toWallet}
                            </div>
                            {transaction.fromUserId && transaction.toUserId && (
                              <div className="text-gray-400 text-xs pt-1">
                                {transaction.fromUserId} → {transaction.toUserId}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-gray-300">
                            {transaction.walletType || 'N/A'}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        {getStatusBadge(transaction.status || 'pending')}
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-gray-300">
                          {transaction.createdDatetime 
                            ? new Date(transaction.createdDatetime).toLocaleDateString()
                            : 'N/A'}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        {isPending ? (
                          <button
                            onClick={() => handleConfirmTransaction(transaction.walletTxnPkId)}
                            disabled={isLoading}
                            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 shadow-lg shadow-green-500/25 disabled:opacity-60"
                          >
                            Confirm
                          </button>
                        ) : (
                          <span className="text-gray-500 text-sm">{transaction.status}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {error && (
            <div className="text-center py-6 text-red-300">{error}</div>
          )}

          {!isLoading && filteredTransactions.length === 0 && (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-300">No transactions found</h3>
              <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

