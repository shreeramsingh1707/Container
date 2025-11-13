import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import PageMeta from '../../components/common/PageMeta';
import UserManagementTable from '../../components/admin/UserManagementTable';
import TransactionApprovalModal from '../../components/admin/TransactionApprovalModal';
import { User, WalletData, usersApi, walletDataApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function AdminUsers() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [users, setUsers] = useState<User[]>([]);
  const [walletData, setWalletData] = useState<WalletData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [transactionModalOpen, setTransactionModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  // Get filter parameters from URL
  const statusFilter = searchParams.get('status');
  const roleFilter = searchParams.get('role');

  // Fetch users and wallet data
  useEffect(() => {
    fetchData();
  }, [statusFilter, roleFilter]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [usersResponse, walletResponse] = await Promise.all([
        usersApi.getAll(0, 100, 'ACTIVE', user?.nodeId || null),
        walletDataApi.getAll(0, 100, 'ACTIVE', user?.nodeId || null)
      ]);
      
      let filteredUsers = usersResponse.data;
      
      // Apply filters
      if (statusFilter === 'active') {
        filteredUsers = filteredUsers.filter(user => user.enabled);
      } else if (statusFilter === 'inactive') {
        filteredUsers = filteredUsers.filter(user => !user.enabled);
      }
      
      if (roleFilter === 'admin') {
        filteredUsers = filteredUsers.filter(user => 
          user.roles?.some(role => role.name === 'ADMIN_USER')
        );
      }
      
      setUsers(filteredUsers);
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
        },
        {
          userPkId: 2,
          versionId: 'test-2',
          nodeId: 'NODE002',
          name: 'Jane Smith',
          email: 'jane@example.com',
          password: '',
          country: 'Canada',
          mobile: '0987654321',
          referralCode: '',
          position: 'Right',
          isUserIsAdmin: true,
          roles: [{ roleId: 501, name: 'ADMIN_USER' }],
          enabled: true,
          authorities: [{ authority: 'ADMIN_USER' }],
          username: 'jane@example.com',
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
        },
        {
          walletPkId: 2,
          mineWallet: 2500,
          nodeWallet: 1500,
          capitalWallet: 1000,
          totalCredit: 5000,
          totalDebit: 500,
          userFkId: 2
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTransactionApproval = (userId: number) => {
    setSelectedUserId(userId);
    setTransactionModalOpen(true);
  };

  const getSelectedUser = () => {
    if (!selectedUserId) return null;
    return users.find(user => user.userPkId === selectedUserId) || null;
  };

  const getSelectedUserWallet = () => {
    if (!selectedUserId) return null;
    return walletData.find(wallet => wallet.userFkId === selectedUserId) || null;
  };

  const getPageTitle = () => {
    if (statusFilter === 'active') return 'Active Users';
    if (statusFilter === 'inactive') return 'Inactive Users';
    if (roleFilter === 'admin') return 'Admin Users';
    return 'All Users';
  };

  const getFilterDescription = () => {
    if (statusFilter === 'active') return 'Showing only active users';
    if (statusFilter === 'inactive') return 'Showing only inactive users';
    if (roleFilter === 'admin') return 'Showing only admin users';
    return 'Showing all users';
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10 bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="text-gray-400 mt-4">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title={`${getPageTitle()} - Admin`}
        description="Admin user management interface"
      />
      
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10 bg-gray-900 min-h-screen">
        {/* Breadcrumb */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-title-md2 font-semibold text-white">
            {getPageTitle()}
          </h2>
          <nav>
            <ol className="flex items-center gap-2">
              <li><a className="font-medium text-gray-300 hover:text-white" href="/StyloCoin/admin">Admin Dashboard /</a></li>
              <li className="font-medium text-orange-500">{getPageTitle()}</li>
            </ol>
          </nav>
        </div>

        {/* Filter Info */}
        <div className="mb-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-semibold mb-1">{getPageTitle()}</h3>
              <p className="text-gray-400 text-sm">{getFilterDescription()}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-400 text-sm">Total Users</p>
              <p className="text-2xl font-bold text-white">{users.length}</p>
            </div>
          </div>
        </div>

        {/* User Management Table */}
        <UserManagementTable
          onTransactionApproval={handleTransactionApproval}
        />

      </div>
    </>
  );
}
