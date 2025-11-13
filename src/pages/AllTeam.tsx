import { useState } from "react";
import { EyeIcon } from "../icons";

interface TeamMember {
  id: number;
  userId: string;
  name: string;
  miningPackage: string;
  status: "Active" | "Inactive";
  rank: string;
  joiningDate: string;
  activationDate: string;
}

const sampleData: TeamMember[] = [
  {
    id: 1,
    userId: "USR001",
    name: "John Smith",
    miningPackage: "Premium",
    status: "Active",
    rank: "Gold",
    joiningDate: "2024-03-14",
    activationDate: "2024-03-20"
  },
  {
    id: 2,
    userId: "USR002",
    name: "Sarah Johnson",
    miningPackage: "Standard",
    status: "Active",
    rank: "Silver",
    joiningDate: "2024-01-09",
    activationDate: "2024-01-12"
  },
  {
    id: 3,
    userId: "USR003",
    name: "Mike Davis",
    miningPackage: "Basic",
    status: "Inactive",
    rank: "Bronze",
    joiningDate: "2023-11-22",
    activationDate: "2023-12-01"
  },
  {
    id: 4,
    userId: "USR004",
    name: "Emily Wilson",
    miningPackage: "Premium",
    status: "Active",
    rank: "Platinum",
    joiningDate: "2024-04-03",
    activationDate: "2024-04-05"
  },
  {
    id: 5,
    userId: "USR005",
    name: "David Brown",
    miningPackage: "Standard",
    status: "Active",
    rank: "Silver",
    joiningDate: "2024-02-10",
    activationDate: "2024-02-13"
  }
];

export default function AllTeam() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [startDate, setStartDate] = useState("2025-06-10");
  const [endDate, setEndDate] = useState("2025-06-10");
  const [leftFilter, setLeftFilter] = useState("");

  const filteredData = sampleData.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.miningPackage.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.rank.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <div className="mb-6">
        <nav className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          <span>Home</span> / <span>Network</span> / <span className="text-gray-900 dark:text-white">All Team</span>
        </nav>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">All Team</h1>
      </div>

      {/* Summary Box */}
      <div className="mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border-2 border-orange-500 p-6">
          <h2 className="text-orange-500 text-xl font-semibold">Total Amount!</h2>
        </div>
      </div>

      {/* Filter Section */}
      <div className="mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-700 dark:text-gray-300">From:</label>
              <div className="relative">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <svg 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-700 dark:text-gray-300">To:</label>
              <div className="relative">
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <svg 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-700 dark:text-gray-300">Left:</label>
              <select
                value={leftFilter}
                onChange={(e) => setLeftFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">Select Team</option>
                <option value="direct">Direct Team</option>
                <option value="indirect">Indirect Team</option>
                <option value="all">All Teams</option>
              </select>
            </div>

            <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-medium transition-colors">
              Filter
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">All Team</h2>
            <div className="relative">
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">#</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">User ID</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Mining Package</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Rank</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Joining Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Activation Date</th>
                </tr>
              </thead>
              <tbody>
                {currentData.length > 0 ? (
                  currentData.map((member, index) => (
                    <tr key={member.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{startIndex + index + 1}</td>
                      <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">{member.userId}</td>
                      <td className="py-3 px-4 text-gray-900 dark:text-white">{member.name}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          member.miningPackage === 'Premium' 
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                            : member.miningPackage === 'Standard'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                        }`}>
                          {member.miningPackage}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          member.status === 'Active'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {member.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">{member.rank}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{member.joiningDate}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{member.activationDate}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-gray-500 dark:text-gray-400">
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
