import { useState } from "react";
import { EyeIcon } from "../icons";

interface RewardIncomeRecord {
  id: number;
  rank: string;
  income: string;
  date: string;
}

const sampleData: RewardIncomeRecord[] = [
  {
    id: 1,
    rank: "Gold",
    income: "$2,500.00",
    date: "2024-01-15"
  },
  {
    id: 2,
    rank: "Platinum",
    income: "$3,750.50",
    date: "2024-01-14"
  },
  {
    id: 3,
    rank: "Silver",
    income: "$1,250.75",
    date: "2024-01-13"
  },
  {
    id: 4,
    rank: "Diamond",
    income: "$5,000.25",
    date: "2024-01-12"
  },
  {
    id: 5,
    rank: "Gold",
    income: "$2,100.00",
    date: "2024-01-11"
  },
  {
    id: 6,
    rank: "Bronze",
    income: "$800.00",
    date: "2024-01-10"
  },
  {
    id: 7,
    rank: "Platinum",
    income: "$3,200.50",
    date: "2024-01-09"
  },
  {
    id: 8,
    rank: "Gold",
    income: "$2,800.00",
    date: "2024-01-08"
  },
  {
    id: 9,
    rank: "Silver",
    income: "$1,500.75",
    date: "2024-01-07"
  },
  {
    id: 10,
    rank: "Diamond",
    income: "$4,500.00",
    date: "2024-01-06"
  }
];

export default function RewardIncome() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filteredData = sampleData.filter(record =>
    record.rank.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.income.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.date.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  // Calculate total reward income
  const totalRewardIncome = sampleData.reduce((sum, record) => {
    return sum + parseFloat(record.income.replace('$', '').replace(',', ''));
  }, 0);

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <div className="mb-6">
        <nav className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          <span>Home</span> / <span>Income</span> / <span className="text-gray-900 dark:text-white">Reward Income</span>
        </nav>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Reward Income</h1>
      </div>

      {/* Total Income Section */}
      <div className="mb-6">
        <div className="bg-orange-500 rounded-lg p-6 text-white">
          <h2 className="text-lg font-medium">Total Income!</h2>
          <p className="text-2xl font-bold mt-2">${totalRewardIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Reward Income</h2>
            <div className="relative">
              <svg 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">#</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Rank</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Income</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Action</th>
                </tr>
              </thead>
              <tbody>
                {currentData.length > 0 ? (
                  currentData.map((record, index) => (
                    <tr key={record.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{startIndex + index + 1}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          record.rank === 'Diamond' 
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            : record.rank === 'Platinum'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                            : record.rank === 'Gold'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            : record.rank === 'Silver'
                            ? 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                            : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                        }`}>
                          {record.rank}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-900 dark:text-white font-medium text-green-600 dark:text-green-400">{record.income}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{record.date}</td>
                      <td className="py-3 px-4">
                        <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                          <EyeIcon className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500 dark:text-gray-400">
                      No data available in table
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-6">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700 dark:text-gray-300">Row Per Page</span>
              <select
                value={rowsPerPage}
                onChange={(e) => setRowsPerPage(Number(e.target.value))}
                className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span className="text-sm text-gray-700 dark:text-gray-300">Entries</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-1 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-1 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
