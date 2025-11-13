import { useState, useEffect } from 'react';
import PageMeta from '../../components/common/PageMeta';
import { depositFundApi, DepositFundItem, usersApi, User } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function AdminDeposits() {
  const { user } = useAuth();
  const [deposits, setDeposits] = useState<DepositFundItem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const normalizeStatus = (status?: string): 'pending' | 'confirmed' | 'rejected' => {
    if (!status) return 'pending';
    const s = status.toUpperCase();
    if (s === 'SUCCESS' || s.includes('CONFIRMED') || s.includes('APPROVED')) return 'confirmed';
    if (s.includes('REJECT') || s.includes('CANCEL') || s === 'FAILED') return 'rejected';
    if (s === 'IN_PROGRESS') return 'pending';
    return 'pending';
  };

  const getDepositId = (deposit: DepositFundItem): number | undefined => {
    return deposit.depositPkId;
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // Fetch users separately so they still load even if deposits fail
      let usersResponse;
      try {
        usersResponse = await usersApi.getAll(0, 100, 'ACTIVE', user?.nodeId || null);
        setUsers(usersResponse.data || []);
      } catch (userError) {
        console.error('Error fetching users:', userError);
        setUsers([]);
      }

      // Fetch deposits
      try {
        const depositsResponse = await depositFundApi.getAll(0, 100, 'ACTIVE', user?.nodeId || null);
        console.log('Deposits API response:', depositsResponse);
        console.log('Deposits content:', depositsResponse.content);
        // Log each deposit for debugging
        depositsResponse.content?.forEach((deposit, index) => {
          console.log(`Deposit ${index}:`, {
            depositPkId: deposit.depositPkId,
            userFkId: deposit.userFkId,
            userName: deposit.userName,
            userNodeCode: deposit.userNodeCode,
            status: deposit.status,
          });
        });
        setDeposits(depositsResponse.content || []);
      } catch (depositError) {
        const errorMessage = depositError instanceof Error ? depositError.message : 'Failed to load deposits';
        // If it's a 404, show a more helpful message
        if (errorMessage.includes('404') || errorMessage.includes('Not Found')) {
          setError('Deposits API endpoint not found. Please ensure the backend endpoint /api/individual/getIndividualDepositFund is configured.');
        } else {
          setError(errorMessage);
        }
        console.error('Error fetching deposits:', depositError);
        setDeposits([]);
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to load data';
      setError(errorMessage);
      console.error('Error fetching data:', e);
      setDeposits([]);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDeposit = async (depositId?: number) => {
    if (!depositId) {
      console.error('No deposit ID provided');
      setError('Invalid deposit ID. Please try refreshing the page.');
      return;
    }
    
    const confirmed = window.confirm('Are you sure you want to confirm this deposit?');
    if (!confirmed) return;

    setIsLoading(true);
    setError('');
    try {
      console.log('Confirming deposit with ID:', depositId);
      const result = await depositFundApi.confirmDeposit(depositId);
      console.log('Confirm deposit result:', result);
      await fetchData();
    } catch (e) {
      console.error('Error confirming deposit:', e);
      console.error('Error details:', {
        message: e instanceof Error ? e.message : String(e),
        depositId,
      });
      setError(e instanceof Error ? e.message : 'Failed to confirm deposit');
    } finally {
      setIsLoading(false);
    }
  };

  const getUserName = (userId?: number): string => {
    if (!userId) return 'N/A';
    const user = users.find(u => u.userPkId === userId);
    return user ? user.name : `User ${userId}`;
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

  const filteredDeposits = deposits.filter(deposit => {
    const normalizedStatus = normalizeStatus(deposit.status);
    const matchesStatus = filterStatus === 'all' || normalizedStatus === filterStatus;
    const depositId = getDepositId(deposit)?.toString() || '';
    const matchesSearch = depositId.includes(searchTerm.toLowerCase()) ||
                         deposit.currency?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         getUserName(deposit.userFkId).toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalPending = deposits.filter(d => normalizeStatus(d.status) === 'pending').length;
  const totalAmount = deposits.reduce((sum, d) => sum + (d.amount || 0), 0);

  if (isLoading && deposits.length === 0) {
    return (
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10 bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="text-gray-400 mt-4">Loading deposits...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title="Admin Deposits - StyloCoin"
        description="Admin interface for managing deposits"
      />
      
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10 bg-gray-900 min-h-screen">
        {/* Breadcrumb */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-title-md2 font-semibold text-white">
            Admin Deposits
          </h2>
          <nav>
            <ol className="flex items-center gap-2">
              <li><a className="font-medium text-gray-300 hover:text-white" href="/StyloCoin/admin">Admin Dashboard /</a></li>
              <li className="font-medium text-orange-500">Deposits</li>
            </ol>
          </nav>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-900/40 to-blue-800/30 rounded-xl border border-blue-600/30 p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm font-medium">Total Deposits</p>
                <p className="text-white text-2xl font-bold">{deposits.length}</p>
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
                  placeholder="Search deposits..."
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

        {/* Deposits Table */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-800 to-gray-750 border-b border-gray-700">
                <tr>
                  <th className="text-left py-4 px-6 font-bold text-white text-sm uppercase tracking-wider">ID</th>
                  <th className="text-left py-4 px-6 font-bold text-white text-sm uppercase tracking-wider">User</th>
                  <th className="text-left py-4 px-6 font-bold text-white text-sm uppercase tracking-wider">Amount</th>
                  <th className="text-left py-4 px-6 font-bold text-white text-sm uppercase tracking-wider">Currency</th>
                  <th className="text-left py-4 px-6 font-bold text-white text-sm uppercase tracking-wider">Status</th>
                  <th className="text-left py-4 px-6 font-bold text-white text-sm uppercase tracking-wider">Created</th>
                  <th className="text-left py-4 px-6 font-bold text-white text-sm uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredDeposits.map((deposit, index) => {
                  const isPending = normalizeStatus(deposit.status) === 'pending';
                  const depositId = getDepositId(deposit);
                  return (
                    <tr key={depositId ?? `deposit-${index}`} className="hover:bg-gray-700/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="text-white font-medium">#{depositId}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-white font-semibold">
                          {deposit.userName || getUserName(deposit.userFkId)}
                        </div>
                        {deposit.userNodeCode && (
                          <div className="text-orange-400 text-sm mt-1 font-medium">
                            Node: {deposit.userNodeCode}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-white font-semibold">
                          ${(deposit.amount || 0).toLocaleString()}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-gray-300">{deposit.currency || 'N/A'}</div>
                      </td>
                      <td className="py-4 px-6">
                        {getStatusBadge(deposit.status || 'pending')}
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-gray-300">
                          {deposit.createdDatetime 
                            ? new Date(deposit.createdDatetime).toLocaleDateString()
                            : 'N/A'}
                        </div>
                        {deposit.confirmedAt && (
                          <div className="text-gray-500 text-xs mt-1">
                            Confirmed: {new Date(deposit.confirmedAt).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        {isPending ? (
                          <button
                            onClick={() => handleConfirmDeposit(depositId)}
                            disabled={isLoading}
                            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 shadow-lg shadow-green-500/25 disabled:opacity-60"
                          >
                            Confirm
                          </button>
                        ) : (
                          <span className="text-gray-500 text-sm">{deposit.status}</span>
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

          {!isLoading && filteredDeposits.length === 0 && (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-300">No deposits found</h3>
              <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

