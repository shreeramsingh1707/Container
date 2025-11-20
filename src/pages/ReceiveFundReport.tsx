import React, { useState ,useEffect} from "react";
import {walletTransactionApi,WalletTransaction}from "../services/api";


interface ReceiveRecord {
  id: number;
  userId: string;
  name: string;
  transferAmount: number;
  receiveAmount: number;
  particular: string;
  date: string;
}

export default function ReceiveFundReport() {
  const [startDate, setStartDate] = useState("2025-10-13");
  const [endDate, setEndDate] = useState("2025-10-13");
  const [searchTerm, setSearchTerm] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');


  const user = JSON.parse(localStorage.getItem("stylocoin_user") || "{}");
  const userNodeId = user?.nodeId;
  // const  userNodeId=""  // dynamically change after login

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError('');
       

      // Fetch transactions
      try {
        const transactionsResponse = await walletTransactionApi.getAll(0, 100, 'ACTIVE', null,userNodeId, user?.nodeId || null);
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
    
    } finally {
      setIsLoading(false);
    }
  };

  // Filter records based on search term
  const filteredRecords = transactions.filter(record =>
    // record.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record?.userName.toLowerCase().includes(searchTerm.toLowerCase()) 
    // record.particular.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate total amount
  const totalAmount = filteredRecords.reduce(
    (sum, record) => sum + (record?.amount || 0),
    0
  ) ;
  // Pagination
  const totalPages = Math.ceil(filteredRecords.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentRecords = filteredRecords.slice(startIndex, endIndex);

  const handleFilter = () => {
    // In a real app, this would trigger an API call with the date range
    console.log("Filtering from", startDate, "to", endDate);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10 bg-gray-900 min-h-screen">
      {/* Breadcrumb */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-md2 font-semibold text-white">
          Receive Fund Report
        </h2>
        <nav>
          <ol className="flex items-center gap-2">
            <li><a className="font-medium text-gray-300 hover:text-white" href="/">Home /</a></li>
            <li><a className="font-medium text-gray-300 hover:text-white" href="/">Transfer /</a></li>
            <li className="font-medium text-orange-500">Receive Fund Report</li>
          </ol>
        </nav>
      </div>

      {/* Total Amount Box */}
      <div className="mb-6 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white font-bold text-2xl">Total Amount!</h3>
            <p className="text-orange-100 text-lg font-semibold">${totalAmount.toLocaleString()}</p>
          </div>
          <div className="p-3 bg-white/20 rounded-full">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
        </div>
      </div>

      {/* Date Filter Section */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 mb-6 shadow-lg">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="rounded-lg border-2 border-gray-600 bg-gray-700 py-3 px-4 text-white outline-none transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
              />
            </div>
            <div className="relative">
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="rounded-lg border-2 border-gray-600 bg-gray-700 py-3 px-4 text-white outline-none transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
              />
            </div>
          </div>
          <button
            onClick={handleFilter}
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-orange-500/25"
          >
            Filter
          </button>
        </div>
      </div>

      {/* Report Table */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-gray-700">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <h3 className="text-white font-bold text-xl">Receive Fund Report</h3>
            <div className="relative">
              <input
                type="text"
                placeholder="Search"
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

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-800 to-gray-750 border-b border-gray-700">
              <tr>
                <th className="text-left py-4 px-6 font-bold text-white text-sm uppercase tracking-wider">#</th>
                <th className="text-left py-4 px-6 font-bold text-white text-sm uppercase tracking-wider">User Id</th>
                <th className="text-left py-4 px-6 font-bold text-white text-sm uppercase tracking-wider">User Name</th>
                {/* <th className="text-left py-4 px-6 font-bold text-white text-sm uppercase tracking-wider">Transfer Amount</th> */}
                <th className="text-left py-4 px-6 font-bold text-white text-sm uppercase tracking-wider">Receive Amount</th>
                <th className="text-left py-4 px-6 font-bold text-white text-sm uppercase tracking-wider">Particular</th>
                <th className="text-left py-4 px-6 font-bold text-white text-sm uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {currentRecords.length > 0 ? (
                currentRecords.map((record, index) => (
                  <tr key={record.id} className="hover:bg-gray-700/50 transition-colors">
                    <td className="py-4 px-6 text-white font-medium">{startIndex + index + 1}</td>
                    <td className="py-4 px-6 text-gray-300">{record.fromUserId}</td>
                    <td className="py-4 px-6 text-white font-medium">{record.userName}</td>
                    <td className="py-4 px-6 text-white font-semibold">${record.amount}</td>
                    <td className="py-4 px-6 text-gray-300">{record.remarks}</td>
                    <td className="py-4 px-6 text-gray-300">{formatDate(record.createdDatetime)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <div className="text-gray-400">
                      <svg className="mx-auto h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-lg font-medium">No data available in table</p>
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
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-600 bg-gray-700 text-gray-400 hover:text-white hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="px-3 py-2 text-white font-medium">
              {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
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
    </div>
  );
}
