import { useState, useEffect } from 'react';
import PageMeta from '../../components/common/PageMeta';
import AdminModal, { FormField } from '../../components/admin/AdminModal';
import { rankRewardApi, RankReward, AddRankRewardRequest } from '../../services/api';

export default function ManageRankReward() {
  const [ranks, setRanks] = useState<RankReward[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRank, setEditingRank] = useState<RankReward | null>(null);
  const [modalError, setModalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Fetch ranks from API
  const fetchRanks = async () => {
    try {
      setIsLoading(true);
      const response = await rankRewardApi.getAll(currentPage - 1, rowsPerPage, 'ACTIVE');
      setRanks(response.content);
    } catch (error) {
      console.error('Error fetching ranks:', error);
      // For now, use mock data if API fails
      setRanks([
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
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRanks();
  }, [currentPage, rowsPerPage]);

  // Modal form fields
  const rankFields: FormField[] = [
    {
      name: 'rankName',
      label: 'Rank Name',
      type: 'text',
      placeholder: 'Enter rank name',
      required: true
    },
    {
      name: 'matching',
      label: 'Matching Requirement',
      type: 'number',
      placeholder: 'Enter matching requirement',
      required: true,
      min: 0
    },
    {
      name: 'reward',
      label: 'Reward Amount',
      type: 'number',
      placeholder: 'Enter reward amount',
      required: true,
      min: 0,
      step: 0.01
    },
    {
      name: 'achieved',
      label: 'Achieved',
      type: 'checkbox'
    }
  ];

  const handleAddRank = () => {
    setEditingRank(null);
    setModalError('');
    setIsModalOpen(true);
  };

  const handleEditRank = (rank: RankReward) => {
    setEditingRank(rank);
    setModalError('');
    setIsModalOpen(true);
  };

  const handleDeleteRank = async (rankId: number) => {
    if (!window.confirm('Are you sure you want to delete this rank?')) {
      return;
    }

    try {
      await rankRewardApi.delete(rankId);
      await fetchRanks(); // Refresh the list
    } catch (error) {
      console.error('Error deleting rank:', error);
      alert('Failed to delete rank. Please try again.');
    }
  };

  const handleModalSubmit = async (formData: any) => {
    try {
      setIsSubmitting(true);
      setModalError('');

      if (editingRank) {
        // Update existing rank
        await rankRewardApi.update(editingRank.rankId!, formData);
      } else {
        // Add new rank
        const addData: AddRankRewardRequest = {
          rankId: null,
          rankName: formData.rankName,
          matching: formData.matching,
          reward: formData.reward,
          achieved: formData.achieved || false
        };
        await rankRewardApi.add(addData);
      }

      await fetchRanks(); // Refresh the list
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving rank:', error);
      setModalError(error instanceof Error ? error.message : 'Failed to save rank');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter and paginate ranks
  const filteredRanks = (ranks || []).filter(rank =>
    rank.rankName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredRanks.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentRanks = filteredRanks.slice(startIndex, endIndex);

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
        Not Achieved
      </span>
    );
  };

  return (
    <>
      <PageMeta
        title="Manage Rank & Reward - Admin"
        description="Admin panel for managing rank and reward system"
      />
      
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10 bg-gray-900 min-h-screen">
        {/* Breadcrumb */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-title-md2 font-semibold text-white">
            Manage Rank & Reward
          </h2>
          <nav>
            <ol className="flex items-center gap-2">
              <li><a className="font-medium text-gray-300 hover:text-white" href="/StyloCoin/">Home /</a></li>
              <li><a className="font-medium text-gray-300 hover:text-white" href="/StyloCoin/admin">Admin /</a></li>
              <li className="font-medium text-orange-500">Manage Rank & Reward</li>
            </ol>
          </nav>
        </div>

        {/* Admin Panel */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-2xl overflow-hidden">
          <div className="p-6 border-b border-gray-700">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <h3 className="text-white font-bold text-xl">Rank & Reward Management</h3>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search ranks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:w-64 rounded-lg border-2 border-gray-600 bg-gray-700 py-3 pl-10 pr-4 text-white placeholder-gray-400 outline-none transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                  />
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <button
                  onClick={handleAddRank}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Rank
                </button>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
              <p className="text-gray-400 mt-2">Loading ranks...</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-800 to-gray-750 border-b border-gray-700">
                    <tr>
                      <th className="text-left py-4 px-6 font-bold text-white text-sm uppercase tracking-wider">#</th>
                      <th className="text-left py-4 px-6 font-bold text-white text-sm uppercase tracking-wider">Rank Name</th>
                      <th className="text-left py-4 px-6 font-bold text-white text-sm uppercase tracking-wider">Matching</th>
                      <th className="text-left py-4 px-6 font-bold text-white text-sm uppercase tracking-wider">Reward</th>
                      <th className="text-left py-4 px-6 font-bold text-white text-sm uppercase tracking-wider">Status</th>
                      <th className="text-left py-4 px-6 font-bold text-white text-sm uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {currentRanks.length > 0 ? (
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
                            {getStatusBadge(rank.achieved)}
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEditRank(rank)}
                                className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDeleteRank(rank.rankId!)}
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
            </>
          )}
        </div>

        {/* Modal */}
        <AdminModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleModalSubmit}
          title={editingRank ? 'Edit Rank' : 'Add New Rank'}
          fields={rankFields}
          initialData={editingRank}
          isLoading={isSubmitting}
          error={modalError}
        />
      </div>
    </>
  );
}
