import React, { useState, useEffect } from "react";
import { rankRewardApi, RankReward } from "../services/api";

interface RankData {
  id: number;
  rank: string;
  matching: number;
  reward: number;
  status: "achieved" | "not-achieved";
  progress?: number; // Percentage of progress towards next rank
}

export default function RankAndReward() {
  const [searchTerm, setSearchTerm] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // State for rank data from API
  const [rankData, setRankData] = useState<RankReward[]>([]);

  // Fetch ranks from API
  const fetchRanks = async () => {
    try {
      setIsLoading(true);
      const response = await rankRewardApi.getAll(0, 100, 'ACTIVE'); // Get all ranks for user view
      setRankData(response.content);
    } catch (error) {
      console.error('Error fetching ranks:', error);
      // Fallback to mock data if API fails
      setRankData([
        {
          rankId: 1,
          rankName: "Star",
          matching: 25,
          reward: 100,
          achieved: false
        },
        {
          rankId: 2,
          rankName: "Golden Star",
          matching: 50,
          reward: 300,
          achieved: false
        },
        {
          rankId: 3,
          rankName: "Executive Star",
          matching: 100,
          reward: 500,
          achieved: false
        },
        {
          rankId: 4,
          rankName: "Royal Star",
          matching: 500,
          reward: 3000,
          achieved: false
        },
        {
          rankId: 5,
          rankName: "Opal",
          matching: 1000,
          reward: 5000,
          achieved: false
        },
        {
          rankId: 6,
          rankName: "Diamond",
          matching: 2000,
          reward: 10000,
          achieved: false
        },
        {
          rankId: 7,
          rankName: "Pearl",
          matching: 5000,
          reward: 25000,
          achieved: false
        },
        {
          rankId: 8,
          rankName: "Ruby",
          matching: 10000,
          reward: 50000,
          achieved: false
        },
        {
          rankId: 9,
          rankName: "Emerald",
          matching: 25000,
          reward: 100000,
          achieved: false
        },
        {
          rankId: 10,
          rankName: "Topaz",
          matching: 50000,
          reward: 250000,
          achieved: false
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRanks();
  }, []);

  // Filter ranks based on search term
  const filteredRanks = (rankData || []).filter(rank =>
    rank.rankName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredRanks.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentRanks = filteredRanks.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const getStatusBadge = (achieved: boolean) => {
    if (achieved) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
          <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
          Achieved
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
        <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>
        Not-Achieve
      </span>
    );
  };

  const getProgressBar = (progress: number) => {
    return (
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div 
          className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${Math.min(progress, 100)}%` }}
        ></div>
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10 bg-gray-900 min-h-screen">
      {/* Breadcrumb */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-md2 font-semibold text-white">
          Rank & Reward
        </h2>
        <nav>
          <ol className="flex items-center gap-2">
            <li><a className="font-medium text-gray-300 hover:text-white" href="/">Home /</a></li>
            <li className="font-medium text-orange-500">Rank & Reward</li>
          </ol>
        </nav>
      </div>

      {/* Note Section */}
      <div className="mb-8 bg-gradient-to-r from-yellow-900/40 to-yellow-800/30 rounded-xl border border-yellow-600/30 p-6 shadow-lg">
        <div className="flex items-start gap-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-500/20 ring-2 ring-yellow-400/30">
            <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-yellow-200 text-lg mb-2">Note</h3>
            <p className="text-yellow-100 leading-relaxed">
              Ranks & Rewards will be calculated based on active package from the power leg and the weaker leg.
            </p>
          </div>
        </div>
      </div>

      {/* Rank & Reward Table */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-gray-700">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <h3 className="text-white font-bold text-xl">Rank & Reward</h3>
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
                <th className="text-left py-4 px-6 font-bold text-white text-sm uppercase tracking-wider">Rank</th>
                <th className="text-left py-4 px-6 font-bold text-white text-sm uppercase tracking-wider">Matching</th>
                <th className="text-left py-4 px-6 font-bold text-white text-sm uppercase tracking-wider">Reward</th>
                <th className="text-left py-4 px-6 font-bold text-white text-sm uppercase tracking-wider">Progress</th>
                <th className="text-left py-4 px-6 font-bold text-white text-sm uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <div className="text-gray-400">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
                      <p className="text-lg font-medium">Loading ranks...</p>
                    </div>
                  </td>
                </tr>
              ) : currentRanks.length > 0 ? (
                currentRanks.map((rank, index) => (
                  <tr key={rank.rankId} className="hover:bg-gray-700/50 transition-colors">
                    <td className="py-4 px-6 text-white font-medium">{startIndex + index + 1}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-sm">
                          {rank.rankName.charAt(0)}
                        </div>
                        <span className="text-white font-semibold">{rank.rankName}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-300 font-medium">{formatNumber(rank.matching)}</td>
                    <td className="py-4 px-6 text-green-400 font-bold">${rank.reward.toLocaleString()}</td>
                    <td className="py-4 px-6">
                      <div className="w-32">
                        {getProgressBar(0)} {/* Progress calculation would need user data */}
                        <span className="text-xs text-gray-400 mt-1 block">0%</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {getStatusBadge(rank.achieved)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <div className="text-gray-400">
                      <svg className="mx-auto h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-lg font-medium">No ranks found</p>
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
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
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
