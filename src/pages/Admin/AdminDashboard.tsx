import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import PageMeta from '../../components/common/PageMeta';
import MetricCard from '../../components/admin/MetricCard';
import { User, WalletData, usersApi, walletDataApi,ieDataApi,DataApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
 
export default function AdminDashboard() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [walletData, setWalletData] = useState<WalletData[]>([]);
  const [dataApi, setDataApi] = useState<DataApi[]>([]);
 
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
 
  // Fetch users and wallet data
  useEffect(() => {
    fetchData();
  }, []);
 
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [usersResponse, walletResponse, dataResponse] = await Promise.all([
        usersApi.getAll(0, 100, 'ACTIVE', user?.nodeId || null),
        walletDataApi.getAll(0, 100, 'ACTIVE', user?.nodeId || null),
        ieDataApi.getAll(0, 100, 'ACTIVE', user?.nodeId || null),
      ]);
 
      console.log('Users: dataResponse', dataResponse.content)
      setUsers(usersResponse.data);
      setWalletData(walletResponse.content);
      setDataApi(dataResponse.content);
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
          userStatus:"ACTIVE",
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
 
  // Calculate comprehensive dashboard data
  const getDashboardData = () => {
    const totalMineWallet = walletData.reduce((sum, wallet) => sum + wallet.mineWallet, 0);
    const totalNodeWallet = walletData.reduce((sum, wallet) => sum + wallet.nodeWallet, 0);
    const totalCapitalWallet = walletData.reduce((sum, wallet) => sum + wallet.capitalWallet, 0);
    const totalCredit = walletData.reduce((sum, wallet) => sum + wallet.totalCredit, 0);
    const totalDebit = walletData.reduce((sum, wallet) => sum + wallet.totalDebit, 0);
   
    // Calculate additional metrics
    const activeUsers = users.filter(user => user.enabled).length;
    const inactiveUsers = users.filter(user => !user.enabled).length;
    const adminUsers = users.filter(user => user.roles?.some(role => role.name === 'ADMIN_USER')).length;
    const normalUsers = users.filter(user => user.roles?.some(role => role.name === 'NORMAL_USER')).length;
   
    // Calculate total investments (simulated)
    const totalInvestments = totalMineWallet + totalNodeWallet + totalCapitalWallet;
   
    // Calculate ROI income (simulated - 10% of investments)
    const roiIncome = totalInvestments * 0.1;
   
    // Calculate direct income (simulated)
    const directIncome = totalCredit * 0.05;
   
    // Calculate total deposits and withdrawals
    const totalDeposits = totalCredit;
    const totalWithdrawals = totalDebit;
 
    return {
      // User metrics
      totalUsers: users.length,
      activeUsers,
      inactiveUsers,
      adminUsers,
      normalUsers,
     
      // Wallet metrics
      totalWallet: totalMineWallet + totalNodeWallet + totalCapitalWallet,
      mineWallet: totalMineWallet,
      nodeWallet: totalNodeWallet,
      capitalWallet: totalCapitalWallet,
     
      // Financial metrics
      totalInvestments,
      roiIncome,
      directIncome,
      totalDeposits,
      totalWithdrawals,
      totalCredit,
      totalDebit
    };
  };
 
  const dashboardData = getDashboardData();
 
  // Click handlers for cards
  const handleCardClick = (cardType: string) => {
    switch (cardType) {
      case 'totalUsers':
        navigate('/StyloCoin/admin/users');
        break;
      case 'activeUsers':
        navigate('/StyloCoin/admin/users?status=active');
        break;
      case 'inactiveUsers':
        navigate('/StyloCoin/admin/users?status=inactive');
        break;
      case 'adminUsers':
        navigate('/StyloCoin/admin/users?role=admin');
        break;
      case 'normalUsers':
        navigate('/StyloCoin/admin/users?role=normal');
        break;
      case 'totalWallet':
      case 'mineWallet':
      case 'nodeWallet':
      case 'capitalWallet':
        // Navigate to wallet details or show wallet-specific users
        navigate('/StyloCoin/admin/users');
        break;
      case 'totalInvestments':
      case 'roiIncome':
      case 'directIncome':
      case 'totalRevenue':
        // Navigate to financial reports or income details
        navigate('/StyloCoin/admin/users');
        break;
      case 'totalDeposits':
      case 'totalWithdrawals':
      case 'totalCredit':
      case 'totalDebit':
        // Navigate to transaction details
        navigate('/StyloCoin/admin/users');
        break;
      case 'netProfit':
        // Navigate to financial summary
        navigate('/StyloCoin/admin/users');
        break;
      default:
        navigate('/StyloCoin/admin/users');
    }
  };
 
  if (isLoading) {
    return (
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10 bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="text-gray-400 mt-4">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }
 
  return (
    <>
      <PageMeta
        title="Admin Dashboard - StyloCoin"
        description="Admin dashboard for managing users and wallet transactions"
      />
     
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10 bg-gray-900 min-h-screen">
        {/* Breadcrumb */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-title-md2 font-semibold text-white">
            Admin Dashboard
          </h2>
          <nav>
            <ol className="flex items-center gap-2">
              <li><a className="font-medium text-gray-300 hover:text-white" href="/StyloCoin/">Home /</a></li>
              <li className="font-medium text-orange-500">Admin Dashboard</li>
            </ol>
          </nav>
        </div>
 
        {/* Dashboard Overview */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
            <svg className="w-6 h-6 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
            </svg>
            Dashboard Overview
          </h3>
         
          {/* First Row - User and Wallet Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <MetricCard
              title="Total Users"
              value={dataApi?.response?.totalUser || 0.00}
              icon={
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
              }
              color="blue"
              chart="bar"
              // onClick={() => handleCardClick('totalUsers')}
            />
            <MetricCard
              title="Total Wallet"
              value={dataApi?.response?.totalWallet || 0.00}
              icon={
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"/>
                </svg>
              }
              color="purple"
              chart="bar"
              // onClick={() => handleCardClick('totalWallet')}
            />
            <MetricCard
              title="Mine Wallet"
              value={dataApi?.response?.totalMineWallet || 0.00}
              icon={
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              }
              color="green"
              chart="bar"
              // onClick={() => handleCardClick('mineWallet')}
            />
          </div>
 
          {/* Second Row - Financial Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <MetricCard
              title="Total Investments"
              value={dataApi?.response?.totalMineInvestment || 0.00}
              icon={
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              }
              color="orange"
              chart="line"
              // onClick={() => handleCardClick('totalInvestments')}
            />
            <MetricCard
              title="Node Wallet"
              value={dataApi?.response?.nodewallet || 0.00}
              icon={
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              }
              color="red"
              chart="line"
              // onClick={() => handleCardClick('nodeWallet')}
            />
            <MetricCard
              title="Capital Wallet"
              value={dataApi?.response?.capitalWallet || 0.00}
              icon={
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              }
              color="blue"
              chart="line"
              //  onClick={() => handleCardClick('capitalWallet')}
            />
          </div>
 
          {/* Third Row - Financial Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <MetricCard
              title="ROI Income"
              value={dataApi?.response?.totalROIIncome || 0.00}
              icon={
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                </svg>
              }
              color="green"
              chart="line"
              // onClick={() => handleCardClick('roiIncome')}
            />
            <MetricCard
              title="Total Withdrawals"
              value={dataApi?.response?.totalWithdrawal || 0.00}
              icon={
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              }
              color="purple"
              chart="bar"
              // onClick={() => handleCardClick('totalWithdrawals')}
            />
            <MetricCard
              title="Active Users"
              value={dataApi?.response?.totalActiveUser || 0.00}
              icon={
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              }
              color="orange"
              chart="bar"
              // onClick={() => handleCardClick('activeUsers')}
            />
          </div>
 
          {/* Fourth Row - Additional Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <MetricCard
              title="Direct Income"
              value={dataApi?.response?.totalDirectIncome || 0.00}
              icon={
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              }
              color="red"
              chart="line"
              // onClick={() => handleCardClick('directIncome')}
            />
            <MetricCard
              title="Admin Users"
              value={dataApi?.response?.totalAdminUser || 0.00}
              icon={
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"  />
                </svg>
              }
              color="blue"
              chart="bar"
              // onClick={() => handleCardClick('adminUsers')}
            />
            <MetricCard
              title="Normal Users"
              value={dataApi?.response?.totalNormalUser || 0.00}
              icon={
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              }
              color="green"
              chart="bar"
              // onClick={() => handleCardClick('normalUsers')}
            />
          </div>
 
          {/* Fifth Row - Additional Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <MetricCard
              title="Total Deposits"
              value={dataApi?.response?.totalDeposit || 0.00}
              icon={
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              }
              color="purple"
              chart="bar"
              // onClick={() => handleCardClick('totalDeposits')}
            />
            <MetricCard
              title="Inactive Users"
              value={dataApi?.response?.totalInactiveUser || 0.00}
              icon={
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              }
              color="orange"
              chart="bar"
              // onClick={() => handleCardClick('inactiveUsers')}
            />
            <MetricCard
              title="Total Credit"
              value={dataApi.response.totalCredit || 0.00}
              icon={
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              }
              color="red"
              chart="bar"
              // onClick={() => handleCardClick('totalCredit')}
            />
          </div>
 
          {/* Fifth Row - Additional Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MetricCard
              title="Total Debit"
              value={dataApi?.response?.totalDebit || 0.00}
              icon={
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              }
              color="blue"
              chart="bar"
              // onClick={() => handleCardClick('totalDebit')}
            />
            <MetricCard
              title="Total Revenue"
              value={dataApi?.response?.totalROIIncome + dataApi?.response?.totalDirectIncome || 0.00 }
              icon={
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                </svg>
              }
              color="green"
              chart="line"
              // onClick={() => handleCardClick('totalRevenue')}
            />
            <MetricCard
              title="Net Profit"
              value={dataApi?.response?.totalDeposit - dataApi?.response?.totalWithdrawal || 0.00}
              icon={
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              }
              color="purple"
              chart="line"
              // onClick={() => handleCardClick('netProfit')}
            />
          </div>
        </div>
 
     
      </div>
    </>
  );
}
 