import React, { useState } from "react";

interface WithdrawRecord {
  id: number;
  withdrawFrom: string;
  amount: number;
  fee: number;
  gross: number;
  addressBank: string;
  date: string;
  status: "pending" | "completed" | "failed" | "processing";
  transactionHash: string;
  remarks: string;
}

export default function WithdrawReport() {
  const [searchTerm, setSearchTerm] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Mock data for withdraw report
  const [withdrawRecords] = useState<WithdrawRecord[]>([
    {
      id: 1,
      withdrawFrom: "Mine Wallet",
      amount: 1500.00,
      fee: 15.00,
      gross: 1485.00,
      addressBank: "0x1234567890abcdef1234567890abcdef12345678",
      date: "2025-01-15",
      status: "completed",
      transactionHash: "0xabc123def456ghi789jkl012mno345pqr678stu901",
      remarks: "Withdrawal to personal wallet"
    },
    {
      id: 2,
      withdrawFrom: "Package Wallet",
      amount: 2500.00,
      fee: 25.00,
      gross: 2475.00,
      addressBank: "0xabcdef1234567890abcdef1234567890abcdef12",
      date: "2025-01-14",
      status: "processing",
      transactionHash: "0xdef456ghi789jkl012mno345pqr678stu901vwx234",
      remarks: "Package withdrawal"
    },
    {
      id: 3,
      withdrawFrom: "Capital Wallet",
      amount: 750.00,
      fee: 7.50,
      gross: 742.50,
      addressBank: "0x9876543210fedcba9876543210fedcba98765432",
      date: "2025-01-13",
      status: "pending",
      transactionHash: "0xghi789jkl012mno345pqr678stu901vwx234yza567",
      remarks: "Capital withdrawal request"
    },
    {
      id: 4,
      withdrawFrom: "Mine Wallet",
      amount: 3200.00,
      fee: 32.00,
      gross: 3168.00,
      addressBank: "0x5555555555555555555555555555555555555555",
      date: "2025-01-12",
      status: "completed",
      transactionHash: "0xjkl012mno345pqr678stu901vwx234yza567bcd890",
      remarks: "Large withdrawal"
    },
    {
      id: 5,
      withdrawFrom: "Node Wallet",
      amount: 1800.00,
      fee: 18.00,
      gross: 1782.00,
      addressBank: "0x1111111111111111111111111111111111111111",
      date: "2025-01-11",
      status: "failed",
      transactionHash: "0xmno345pqr678stu901vwx234yza567bcd890efg123",
      remarks: "Failed due to insufficient gas"
    },
    {
      id: 6,
      withdrawFrom: "Package Wallet",
      amount: 950.00,
      fee: 9.50,
      gross: 940.50,
      addressBank: "0x2222222222222222222222222222222222222222",
      date: "2025-01-10",
      status: "completed",
      transactionHash: "0xpqr678stu901vwx234yza567bcd890efg123hij456",
      remarks: "Regular withdrawal"
    },
    {
      id: 7,
      withdrawFrom: "Mine Wallet",
      amount: 4200.00,
      fee: 42.00,
      gross: 4158.00,
      addressBank: "0x3333333333333333333333333333333333333333",
      date: "2025-01-09",
      status: "processing",
      transactionHash: "0xstu901vwx234yza567bcd890efg123hij456klm789",
      remarks: "Premium withdrawal"
    },
    {
      id: 8,
      withdrawFrom: "Capital Wallet",
      amount: 1650.00,
      fee: 16.50,
      gross: 1633.50,
      addressBank: "0x4444444444444444444444444444444444444444",
      date: "2025-01-08",
      status: "completed",
      transactionHash: "0xvwx234yza567bcd890efg123hij456klm789nop012",
      remarks: "Capital management"
    }
  ]);

  // Filter records based on search term
  const filteredRecords = withdrawRecords.filter(record =>
    record.withdrawFrom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.addressBank.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.transactionHash.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.remarks.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate total amount
  const totalAmount = filteredRecords.reduce((sum, record) => sum + record.gross, 0);

  // Pagination
  const totalPages = Math.ceil(filteredRecords.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentRecords = filteredRecords.slice(startIndex, endIndex);

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

  const truncateHash = (hash: string) => {
    if (hash.length <= 16) return hash;
    return `${hash.slice(0, 8)}...${hash.slice(-8)}`;
  };

  const truncateAddress = (address: string) => {
    if (address.length <= 20) return address;
    return `${address.slice(0, 10)}...${address.slice(-8)}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5"></span>
            Completed
          </span>
        );
      case "processing":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-1.5"></span>
            Processing
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
            <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full mr-1.5"></span>
            Pending
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
            <span className="w-1.5 h-1.5 bg-red-400 rounded-full mr-1.5"></span>
            Failed
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10 bg-gray-900 min-h-screen">
      {/* Breadcrumb */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-md2 font-semibold text-white">
          Withdraw Report
        </h2>
        <nav>
          <ol className="flex items-center gap-2">
            <li><a className="font-medium text-gray-300 hover:text-white" href="/">Home /</a></li>
            <li><a className="font-medium text-gray-300 hover:text-white" href="/">Financial /</a></li>
            <li className="font-medium text-orange-500">Withdraw Report</li>
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

      {/* Withdraw Report Table */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-gray-700">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <h3 className="text-white font-bold text-xl">Withdraw Report</h3>
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
          <table className="w-full min-w-[1200px]">
            <thead className="bg-gradient-to-r from-gray-800 to-gray-750 border-b border-gray-700">
              <tr>
                <th className="text-left py-4 px-6 font-bold text-white text-sm uppercase tracking-wider">#</th>
                <th className="text-left py-4 px-6 font-bold text-white text-sm uppercase tracking-wider">Withdraw From</th>
                <th className="text-left py-4 px-6 font-bold text-white text-sm uppercase tracking-wider">Amount</th>
                <th className="text-left py-4 px-6 font-bold text-white text-sm uppercase tracking-wider">Fee(-)</th>
                <th className="text-left py-4 px-6 font-bold text-white text-sm uppercase tracking-wider">Gross(+)</th>
                <th className="text-left py-4 px-6 font-bold text-white text-sm uppercase tracking-wider">Address/Bank</th>
                <th className="text-left py-4 px-6 font-bold text-white text-sm uppercase tracking-wider">Date</th>
                <th className="text-left py-4 px-6 font-bold text-white text-sm uppercase tracking-wider">Status</th>
                <th className="text-left py-4 px-6 font-bold text-white text-sm uppercase tracking-wider">Transaction Hash</th>
                <th className="text-left py-4 px-6 font-bold text-white text-sm uppercase tracking-wider">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {currentRecords.length > 0 ? (
                currentRecords.map((record, index) => (
                  <tr key={record.id} className="hover:bg-gray-700/50 transition-colors">
                    <td className="py-4 px-6 text-white font-medium">{startIndex + index + 1}</td>
                    <td className="py-4 px-6 text-gray-300">{record.withdrawFrom}</td>
                    <td className="py-4 px-6 text-white font-semibold">${record.amount.toLocaleString()}</td>
                    <td className="py-4 px-6 text-red-400 font-semibold">-${record.fee.toLocaleString()}</td>
                    <td className="py-4 px-6 text-green-400 font-semibold">+${record.gross.toLocaleString()}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-mono text-sm">{truncateAddress(record.addressBank)}</span>
                        <button className="text-orange-400 hover:text-orange-300 transition-colors" title="Copy address">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-300">{formatDate(record.date)}</td>
                    <td className="py-4 px-6">
                      {getStatusBadge(record.status)}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-mono text-sm">{truncateHash(record.transactionHash)}</span>
                        <button className="text-blue-400 hover:text-blue-300 transition-colors" title="View transaction">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-300">{record.remarks}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="py-12 text-center">
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
            <input
              type="number"
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="w-16 rounded border border-gray-600 bg-gray-700 px-2 py-1 text-white text-sm"
              min="1"
              max="100"
            />
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
