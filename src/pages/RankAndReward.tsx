import React, { useState, useEffect } from "react";

interface RankData {
  rankId: number;
  rankName: string;
  rankCodeFkId: string;
  userNodeId: string;
  matching: number;
  reward: number;
  achieved: boolean;
}

export default function RankAndReward() {
  const [searchTerm, setSearchTerm] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Rank Data Array
  const [rankData, setRankData] = useState<RankData[]>([]);

  // Fetch Rank Data
  const fetchIndividaulRanks = async () => {
    const userData = localStorage.getItem("stylocoin_user");
    const parsed = userData ? JSON.parse(userData) : null;

    const nodeId = parsed?.nodeId || parsed?.userNodeId || parsed?.node_id;
    console.log("******************",nodeId)

    try {
      setIsLoading(true);

      const url = `http://minecryptos-env.eba-nsbmtw9i.ap-south-1.elasticbeanstalk.com/api/individual/getIndividualRankReward?page=0&size=50&filterBy=ACTIVE&inputPkId=null&inputFkId=NODE38359974`;

      const response = await fetch(url);
      const apiRes = await response.json();

      // API returns → { status, data: [...] }
      const mapped =
        apiRes?.data?.map((item: any) => ({
          rankId: item.individualRankPkId,
          rankName: item.rankName || "N/A",
          rankCodeFkId: item.rankCodeFkId,
          userNodeId: item.userNodeId,
          matching: item.matching,
          reward: item.reward,
          achieved: item.achieved,
        })) || [];

      setRankData(mapped);
    } catch (error) {
      console.error("Error fetching ranks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIndividaulRanks();
  }, []);

  // 🔍 Filter by search input
  const filteredRanks = rankData.filter((rank) =>
    rank.rankName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredRanks.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentRanks = filteredRanks.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => setCurrentPage(page);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getStatusBadge = (achieved: boolean) =>
    achieved ? (
      <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-700 text-green-200 text-xs">
        ● Achieved
      </span>
    ) : (
      <span className="inline-flex items-center px-3 py-1 rounded-full bg-yellow-700 text-yellow-200 text-xs">
        ● Not Achieved
      </span>
    );

  return (
    <div className="mx-auto max-w-screen-2xl p-6 bg-gray-900 min-h-screen">
      <h2 className="text-2xl font-semibold text-white mb-6">Rank & Reward</h2>

      {/* Search Box */}
      <div className="mb-4 flex justify-end">
        <input
          type="text"
          placeholder="Search Rank..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-64 bg-gray-800 border border-gray-600 text-white p-2 rounded-lg"
        />
      </div>

      {/* Table */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-700">
            <tr>
              <th className="p-4 text-left text-white">#</th>
              <th className="p-4 text-left text-white">Rank</th>
              <th className="p-4 text-left text-white">Matching</th>
              <th className="p-4 text-left text-white">Reward</th>
              <th className="p-4 text-left text-white">Status</th>
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="py-10 text-center text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : currentRanks.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-10 text-center text-gray-400">
                  No ranks found
                </td>
              </tr>
            ) : (
              currentRanks.map((rank, index) => (
                <tr
                  key={rank.rankId}
                  className="border-t border-gray-700 hover:bg-gray-700/50"
                >
                  <td className="p-4 text-white">{startIndex + index + 1}</td>
                  <td className="p-4 text-white">{rank.rankName}</td>
                  <td className="p-4 text-gray-300">
                    {formatNumber(rank.matching)}
                  </td>
                  <td className="p-4 text-green-400 font-bold">
                    ₹ {rank.reward}
                  </td>
                  <td className="p-4">{getStatusBadge(rank.achieved)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="p-4 flex justify-between items-center border-t border-gray-700">
          <div className="text-gray-400 text-sm">
            Rows per page:{" "}
            <select
              className="bg-gray-800 text-white border border-gray-600 p-1 rounded"
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
              className="px-3 py-2 bg-gray-700 text-white rounded disabled:opacity-40"
            >
              Prev
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-2 rounded ${
                  currentPage === page
                    ? "bg-orange-500 text-white"
                    : "bg-gray-700 text-gray-300"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
              className="px-3 py-2 bg-gray-700 text-white rounded disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
