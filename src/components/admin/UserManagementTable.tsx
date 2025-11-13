import React, { useState, useEffect } from 'react';
import { User, WalletData, usersApi, walletDataApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface UserManagementTableProps {
  selectedWalletType?: 'mine' | 'node' | 'capital' | 'credit';
  onTransactionApproval?: (userId: number) => void;
}

const UserManagementTable: React.FC<UserManagementTableProps> = ({ 
  selectedWalletType,
  onTransactionApproval 
}) => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [walletData, setWalletData] = useState<WalletData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortField, setSortField] = useState<keyof User>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Fetch users and wallet data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [usersResponse, walletResponse] = await Promise.all([
        usersApi.getAll(0, 100, 'ACTIVE', user?.nodeId || null),
        walletDataApi.getAll(0, 100, 'ACTIVE', user?.nodeId || null)
      ]);
      
      setUsers(usersResponse.data);
      setWalletData(walletResponse.content);
    } catch (error) {
      console.error('Error fetching data:', error);
      // Use mock data for development
      setUsers([
        {
          userPkId: 1,
          versionId: 'test-1',
          nodeId: 'NODE001',
          name: 'John Doe',
          email: 'john@example.com',
          password: '',
          country: 'USA',
          mobile: '1234567890',
          referralCode: '',
          position: 'Left',
          isUserIsAdmin: false,
          roles: [{ roleId: 502, name: 'NORMAL_USER' }],
          enabled: true,
          authorities: [{ authority: 'NORMAL_USER' }],
          username: 'john@example.com',
          accountNonExpired: true,
          accountNonLocked: true,
          credentialsNonExpired: true,
          isDeleted: false,
          isGenericFlag: false
        }
      ]);
      setWalletData([
        {
          walletPkId: 1,
          mineWallet: 1000,
          nodeWallet: 2000,
          capitalWallet: 500,
          totalCredit: 3500,
          totalDebit: 0,
          userFkId: 1
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      await usersApi.delete(userId);
      await fetchData(); // Refresh the list
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user. Please try again.');
    }
  };

  const handleToggleStatus = async (userId: number, currentStatus: boolean) => {
    try {
      await usersApi.updateStatus(userId, !currentStatus);
      await fetchData(); // Refresh the list
    } catch (error) {
      console.error('Error updating user status:', error);
      alert('Failed to update user status. Please try again.');
    }
  };

  const handleApproveTransaction = (userId: number) => {
    if (onTransactionApproval) {
      onTransactionApproval(userId);
    }
  };

  const handleConfirmUser = async (nodeId: string, userName: string) => {
    if (!window.confirm(`Are you sure you want to confirm user ${userName} (${nodeId}) for mining access?`)) {
      return;
    }

    try {
      await usersApi.confirmUser(nodeId);
      await fetchData(); // Refresh the list
    } catch (error) {
      console.error('Error confirming user:', error);
      alert('Failed to confirm user. Please try again.');
    }
  };

  // Get wallet data for a specific user
  const getUserWalletData = (userId: number): WalletData | null => {
    return walletData.find(wallet => wallet.userFkId === userId) || null;
  };

  // Filter and sort users
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.nodeId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    return sortDirection === 'asc' ? 1 : -1;
  });

  // Pagination
  const totalPages = Math.ceil(sortedUsers.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentUsers = sortedUsers.slice(startIndex, endIndex);

  const handleSort = (field: keyof User) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getStatusBadge = (enabled: boolean) => {
    if (enabled) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
          <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
          Active
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
        <span className="w-2 h-2 bg-red-400 rounded-full mr-2"></span>
        Inactive
      </span>
    );
  };

  const getConfirmationBadge = (isConfirmed: boolean | undefined) => {
    if (isConfirmed) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5"></span>
          Confirmed
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
        <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full mr-1.5"></span>
        Pending
      </span>
    );
  };

  const getRoleBadge = (roles: Array<{ roleId: number; name: string }>) => {
    const isAdmin = roles.some(role => role.name === 'ADMIN_USER');
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
        isAdmin 
          ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
          : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
      }`}>
        {isAdmin ? 'Admin' : 'User'}
      </span>
    );
  };

  const formatAmount = (amount: number) => {
    return amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const getHighlightedClass = (walletType: string) => {
    if (!selectedWalletType) return '';
    
    const highlightMap = {
      'mine': 'bg-orange-100 dark:bg-orange-900/20',
      'node': 'bg-blue-100 dark:bg-blue-900/20',
      'capital': 'bg-green-100 dark:bg-green-900/20',
      'credit': 'bg-purple-100 dark:bg-purple-900/20'
    };
    
    return highlightMap[selectedWalletType] || '';
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
        <p className="text-gray-400 mt-2">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <h3 className="text-white font-bold text-xl">
            {selectedWalletType ? `${selectedWalletType.charAt(0).toUpperCase() + selectedWalletType.slice(1)} Wallet Users` : 'All Users'}
          </h3>
          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 rounded-lg border-2 border-gray-600 bg-gray-700 py-3 pl-10 pr-4 text-white placeholder-gray-400 outline-none transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
              />
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-gray-800 to-gray-750 border-b border-gray-700">
            <tr>
              <th className="text-left py-4 px-6 font-bold text-white text-sm uppercase tracking-wider">#</th>
              <th 
                className="text-left py-4 px-6 font-bold text-white text-sm uppercase tracking-wider cursor-pointer hover:bg-gray-700"
                onClick={() => handleSort('nodeId')}
              >
                Node ID {sortField === 'nodeId' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className="text-left py-4 px-6 font-bold text-white text-sm uppercase tracking-wider cursor-pointer hover:bg-gray-700"
                onClick={() => handleSort('name')}
              >
                Name {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className="text-left py-4 px-6 font-bold text-white text-sm uppercase tracking-wider cursor-pointer hover:bg-gray-700"
                onClick={() => handleSort('email')}
              >
                Email {sortField === 'email' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th className="text-left py-4 px-6 font-bold text-white text-sm uppercase tracking-wider">Country</th>
              <th className="text-left py-4 px-6 font-bold text-white text-sm uppercase tracking-wider">Mobile</th>
              <th className="text-left py-4 px-6 font-bold text-white text-sm uppercase tracking-wider">Role</th>
              <th className="text-left py-4 px-6 font-bold text-white text-sm uppercase tracking-wider">Mine Wallet</th>
              <th className="text-left py-4 px-6 font-bold text-white text-sm uppercase tracking-wider">Node Wallet</th>
              <th className="text-left py-4 px-6 font-bold text-white text-sm uppercase tracking-wider">Capital Wallet</th>
              <th className="text-left py-4 px-6 font-bold text-white text-sm uppercase tracking-wider">Total Credit/Debit</th>
              <th className="text-left py-4 px-6 font-bold text-white text-sm uppercase tracking-wider">Status</th>
              <th className="text-left py-4 px-6 font-bold text-white text-sm uppercase tracking-wider">Confirmed</th>
              <th className="text-left py-4 px-6 font-bold text-white text-sm uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {currentUsers.length > 0 ? (
              currentUsers.map((user, index) => {
                const wallet = getUserWalletData(user.userPkId);
                return (
                  <tr key={user.userPkId} className="hover:bg-gray-700/50 transition-colors">
                    <td className="py-4 px-6 text-white font-medium">{startIndex + index + 1}</td>
                    <td className="py-4 px-6 text-blue-400 font-medium">{user.nodeId}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-sm">
                          {user.name.charAt(0)}
                        </div>
                        <span className="text-white font-semibold">{user.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-300">{user.email}</td>
                    <td className="py-4 px-6 text-gray-300">{user.country}</td>
                    <td className="py-4 px-6 text-gray-300">{user.mobile}</td>
                    <td className="py-4 px-6">
                      {getRoleBadge(user.roles)}
                    </td>
                    <td className={`py-4 px-6 text-green-400 font-bold ${getHighlightedClass('mine')}`}>
                      ${wallet ? formatAmount(wallet.mineWallet) : '0.00'}
                    </td>
                    <td className={`py-4 px-6 text-blue-400 font-bold ${getHighlightedClass('node')}`}>
                      ${wallet ? formatAmount(wallet.nodeWallet) : '0.00'}
                    </td>
                    <td className={`py-4 px-6 text-emerald-400 font-bold ${getHighlightedClass('capital')}`}>
                      ${wallet ? formatAmount(wallet.capitalWallet) : '0.00'}
                    </td>
                    <td className={`py-4 px-6 text-purple-400 font-bold ${getHighlightedClass('credit')}`}>
                      ${wallet ? `${formatAmount(wallet.totalCredit)} / ${formatAmount(wallet.totalDebit)}` : '0.00 / 0.00'}
                    </td>
                    <td className="py-4 px-6">
                      {getStatusBadge(user.enabled)}
                    </td>
                    <td className="py-4 px-6">
                      {getConfirmationBadge(user.isConfirmed)}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleApproveTransaction(user.userPkId)}
                          className="p-2 text-green-400 hover:text-green-300 hover:bg-green-500/20 rounded-lg transition-colors"
                          title="Approve Transaction"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>
                        {!user.isConfirmed && (
                          <button
                            onClick={() => handleConfirmUser(user.nodeId, user.name)}
                            className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-lg transition-colors"
                            title="Confirm User for Mining"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </button>
                        )}
                        <button
                          onClick={() => handleToggleStatus(user.userPkId, user.enabled)}
                          className={`p-2 rounded-lg transition-colors ${
                            user.enabled 
                              ? 'text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/20'
                              : 'text-green-400 hover:text-green-300 hover:bg-green-500/20'
                          }`}
                          title={user.enabled ? 'Deactivate' : 'Activate'}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.userPkId)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={14} className="py-12 text-center">
                  <div className="text-gray-400">
                    <svg className="mx-auto h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                    <p className="text-lg font-medium">No users found</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-6 py-4 border-t border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2 text-gray-400">
          <span>Row Per Page</span>
          <select
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="rounded border border-gray-600 bg-gray-700 px-2 py-1 text-white text-sm"
          >
            <option value={5} className="bg-gray-700">5</option>
            <option value={10} className="bg-gray-700">10</option>
            <option value={25} className="bg-gray-700">25</option>
            <option value={50} className="bg-gray-700">50</option>
          </select>
          <span>Entries</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-gray-600 bg-gray-700 text-gray-400 hover:text-white hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                page === currentPage
                  ? "bg-orange-500 text-white"
                  : "text-gray-400 bg-gray-700 border border-gray-600 hover:text-white hover:bg-gray-600"
              }`}
            >
              {page}
            </button>
          ))}
          
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-gray-600 bg-gray-700 text-gray-400 hover:text-white hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserManagementTable;
