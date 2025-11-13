import { useState, useEffect } from "react";
import { individualIncomeSummaryApi, IndividualIncomeSummary, AddIndividualIncomeSummaryRequest } from "../services/api";
import { useAuth } from "../context/AuthContext";

interface IncomeRecord {
  id: number;
  date: string;
  transactionType: string;
  bonus: number;
  summaryId: number; // Add reference to the original summary
}

export default function IncomeSummary() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [fromDate, setFromDate] = useState("13/10/2025");
  const [toDate, setToDate] = useState("13/10/2025");
  const [incomeFilter, setIncomeFilter] = useState("All Income");

  // API data states
  const [incomeSummaryData, setIncomeSummaryData] = useState<IndividualIncomeSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSummary, setEditingSummary] = useState<IndividualIncomeSummary | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingSummaryId, setDeletingSummaryId] = useState<number | null>(null);
  
  // Form data
  const [formData, setFormData] = useState<AddIndividualIncomeSummaryRequest>({
    individualIncomeSummaryPkId: null,
    serviceGenerationAmount: 0,
    matchingIncomeAmount: 0,
    clubIncomeAmount: 0,
    rewardIncomeAmount: 0,
    fastTrackBonusAmount: 0,
    miningProfitSharingAmount: 0,
    miningGenerationIncomeAmount: 0,
    nodeBusinessSharingAmount: 0,
    userFkId: 1
  });

  // Convert IndividualIncomeSummary to IncomeRecord for display
  const convertToIncomeRecords = (data: IndividualIncomeSummary[]): IncomeRecord[] => {
    const records: IncomeRecord[] = [];
    
    data.forEach((summary) => {
      // Add each income type as a separate record
      if (summary.serviceGenerationAmount > 0) {
        records.push({
          id: summary.individualIncomeSummaryPkId * 100 + 1,
          date: summary.createdDatetime ? new Date(summary.createdDatetime).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      transactionType: "Service Generation Income",
          bonus: summary.serviceGenerationAmount,
          summaryId: summary.individualIncomeSummaryPkId
        });
      }
      
      if (summary.matchingIncomeAmount > 0) {
        records.push({
          id: summary.individualIncomeSummaryPkId * 100 + 2,
          date: summary.createdDatetime ? new Date(summary.createdDatetime).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      transactionType: "Matching Income",
          bonus: summary.matchingIncomeAmount,
          summaryId: summary.individualIncomeSummaryPkId
        });
      }
      
      if (summary.clubIncomeAmount > 0) {
        records.push({
          id: summary.individualIncomeSummaryPkId * 100 + 3,
          date: summary.createdDatetime ? new Date(summary.createdDatetime).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      transactionType: "Club Income",
          bonus: summary.clubIncomeAmount,
          summaryId: summary.individualIncomeSummaryPkId
        });
      }
      
      if (summary.rewardIncomeAmount > 0) {
        records.push({
          id: summary.individualIncomeSummaryPkId * 100 + 4,
          date: summary.createdDatetime ? new Date(summary.createdDatetime).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      transactionType: "Reward Income",
          bonus: summary.rewardIncomeAmount,
          summaryId: summary.individualIncomeSummaryPkId
        });
      }
      
      if (summary.fastTrackBonusAmount > 0) {
        records.push({
          id: summary.individualIncomeSummaryPkId * 100 + 5,
          date: summary.createdDatetime ? new Date(summary.createdDatetime).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      transactionType: "Fast Track Bonus",
          bonus: summary.fastTrackBonusAmount,
          summaryId: summary.individualIncomeSummaryPkId
        });
      }
      
      if (summary.miningProfitSharingAmount > 0) {
        records.push({
          id: summary.individualIncomeSummaryPkId * 100 + 6,
          date: summary.createdDatetime ? new Date(summary.createdDatetime).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          transactionType: "Mining Profit Sharing",
          bonus: summary.miningProfitSharingAmount,
          summaryId: summary.individualIncomeSummaryPkId
        });
      }
      
      if (summary.miningGenerationIncomeAmount > 0) {
        records.push({
          id: summary.individualIncomeSummaryPkId * 100 + 7,
          date: summary.createdDatetime ? new Date(summary.createdDatetime).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      transactionType: "Mining Generation Income",
          bonus: summary.miningGenerationIncomeAmount,
          summaryId: summary.individualIncomeSummaryPkId
        });
      }
      
      if (summary.nodeBusinessSharingAmount > 0) {
        records.push({
          id: summary.individualIncomeSummaryPkId * 100 + 8,
          date: summary.createdDatetime ? new Date(summary.createdDatetime).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      transactionType: "Node Business Sharing",
          bonus: summary.nodeBusinessSharingAmount,
          summaryId: summary.individualIncomeSummaryPkId
        });
      }
    });
    
    return records;
  };

  // Fetch data from API
  useEffect(() => {
    const fetchIncomeSummaryData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log('Fetching income summary data from API...');
        const response = await individualIncomeSummaryApi.getAll(0, 100, 'ACTIVE', user?.nodeId || null);
        
        console.log('API response:', response);
        
        // Handle the actual API response structure
        // The response has a 'data' array containing the income summary records
        const apiData = response.data || [];
        
        // Ensure all numeric values are properly converted
        const processedData = apiData.map((summary: IndividualIncomeSummary) => ({
          ...summary,
          serviceGenerationAmount: Number(summary.serviceGenerationAmount) || 0,
          matchingIncomeAmount: Number(summary.matchingIncomeAmount) || 0,
          clubIncomeAmount: Number(summary.clubIncomeAmount) || 0,
          rewardIncomeAmount: Number(summary.rewardIncomeAmount) || 0,
          fastTrackBonusAmount: Number(summary.fastTrackBonusAmount) || 0,
          miningProfitSharingAmount: Number(summary.miningProfitSharingAmount) || 0,
          miningGenerationIncomeAmount: Number(summary.miningGenerationIncomeAmount) || 0,
          nodeBusinessSharingAmount: Number(summary.nodeBusinessSharingAmount) || 0,
          userFkId: Number(summary.userFkId) || 1
        }));
        
        console.log('Processed income summary data:', processedData);
        setIncomeSummaryData(processedData);
        
      } catch (err) {
        console.error('Error fetching income summary data:', err);
        setError('Failed to load income summary data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchIncomeSummaryData();
  }, []);

  // Convert API data to display format
  const incomeRecords = convertToIncomeRecords(incomeSummaryData);

  // Filter records based on search term
  const filteredRecords = incomeRecords.filter(record =>
    record.transactionType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate total income
  const totalIncome = filteredRecords.reduce((sum, record) => sum + record.bonus, 0);

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

  const handleFilter = async () => {
    // Filter logic based on date range and income type
    console.log("Filtering from:", fromDate, "to:", toDate, "type:", incomeFilter);
    setCurrentPage(1);
    
    // You can implement additional filtering logic here
    // For now, we'll just refresh the data
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await individualIncomeSummaryApi.getAll(0, 100, 'ACTIVE', user?.nodeId || null);
      
      // Handle the actual API response structure
      const apiData = response.data || [];
      
      const processedData = apiData.map((summary: IndividualIncomeSummary) => ({
        ...summary,
        serviceGenerationAmount: Number(summary.serviceGenerationAmount) || 0,
        matchingIncomeAmount: Number(summary.matchingIncomeAmount) || 0,
        clubIncomeAmount: Number(summary.clubIncomeAmount) || 0,
        rewardIncomeAmount: Number(summary.rewardIncomeAmount) || 0,
        fastTrackBonusAmount: Number(summary.fastTrackBonusAmount) || 0,
        miningProfitSharingAmount: Number(summary.miningProfitSharingAmount) || 0,
        miningGenerationIncomeAmount: Number(summary.miningGenerationIncomeAmount) || 0,
        nodeBusinessSharingAmount: Number(summary.nodeBusinessSharingAmount) || 0,
        userFkId: Number(summary.userFkId) || 1
      }));
      
      setIncomeSummaryData(processedData);
    } catch (err) {
      console.error('Error filtering income summary data:', err);
      setError('Failed to filter income summary data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await individualIncomeSummaryApi.getAll(0, 100, 'ACTIVE', user?.nodeId || null);
      
      // Handle the actual API response structure
      const apiData = response.data || [];
      
      const processedData = apiData.map((summary: IndividualIncomeSummary) => ({
        ...summary,
        serviceGenerationAmount: Number(summary.serviceGenerationAmount) || 0,
        matchingIncomeAmount: Number(summary.matchingIncomeAmount) || 0,
        clubIncomeAmount: Number(summary.clubIncomeAmount) || 0,
        rewardIncomeAmount: Number(summary.rewardIncomeAmount) || 0,
        fastTrackBonusAmount: Number(summary.fastTrackBonusAmount) || 0,
        miningProfitSharingAmount: Number(summary.miningProfitSharingAmount) || 0,
        miningGenerationIncomeAmount: Number(summary.miningGenerationIncomeAmount) || 0,
        nodeBusinessSharingAmount: Number(summary.nodeBusinessSharingAmount) || 0,
        userFkId: Number(summary.userFkId) || 1
      }));
      
      setIncomeSummaryData(processedData);
    } catch (err) {
      console.error('Error refreshing income summary data:', err);
      setError('Failed to refresh income summary data');
    } finally {
      setIsLoading(false);
    }
  };

  // CRUD Functions
  const handleInputChange = (field: keyof AddIndividualIncomeSummaryRequest, value: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addIncomeSummary = async () => {
    try {
      setIsAdding(true);
      setError(null);
      
      console.log('Adding income summary with data:', formData);
      
      const newSummary = await individualIncomeSummaryApi.add(formData);
      
      console.log('API response for add income summary:', newSummary);
      
      // Refresh data after adding
      await handleRefresh();
      
      setShowAddModal(false);
      
      // Reset form
      setFormData({
        individualIncomeSummaryPkId: null,
        serviceGenerationAmount: 0,
        matchingIncomeAmount: 0,
        clubIncomeAmount: 0,
        rewardIncomeAmount: 0,
        fastTrackBonusAmount: 0,
        miningProfitSharingAmount: 0,
        miningGenerationIncomeAmount: 0,
        nodeBusinessSharingAmount: 0,
        userFkId: 1
      });
      
      console.log('Income summary added successfully');
      
    } catch (err) {
      console.error('Error adding income summary:', err);
      setError(`Failed to add income summary: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsAdding(false);
    }
  };

  const updateIncomeSummary = async () => {
    if (!editingSummary) return;
    
    try {
      setIsUpdating(true);
      setError(null);
      
      console.log('Updating income summary with data:', formData);
      
      const updatedSummary = await individualIncomeSummaryApi.update(editingSummary.individualIncomeSummaryPkId, {
        ...formData,
        individualIncomeSummaryPkId: editingSummary.individualIncomeSummaryPkId
      });
      
      console.log('API response for update income summary:', updatedSummary);
      
      // Refresh data after updating
      await handleRefresh();
      
      setShowEditModal(false);
      setEditingSummary(null);
      
      // Reset form
      setFormData({
        individualIncomeSummaryPkId: null,
        serviceGenerationAmount: 0,
        matchingIncomeAmount: 0,
        clubIncomeAmount: 0,
        rewardIncomeAmount: 0,
        fastTrackBonusAmount: 0,
        miningProfitSharingAmount: 0,
        miningGenerationIncomeAmount: 0,
        nodeBusinessSharingAmount: 0,
        userFkId: 1
      });
      
      console.log('Income summary updated successfully');
      
    } catch (err) {
      console.error('Error updating income summary:', err);
      setError(`Failed to update income summary: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteIncomeSummary = async (summaryId: number) => {
    if (!window.confirm('Are you sure you want to delete this income summary? This action cannot be undone.')) {
      return;
    }

    try {
      setIsDeleting(true);
      setDeletingSummaryId(summaryId);
      setError(null);
      
      console.log('Attempting to delete income summary with ID:', summaryId);
      
      // Call the delete API
      await individualIncomeSummaryApi.delete(summaryId);
      
      console.log('Delete API call successful');
      
      // Refresh data after deleting
      await handleRefresh();
      
      console.log('Income summary deleted successfully');
      
    } catch (err) {
      console.error('Error deleting income summary:', err);
      setError(`Failed to delete income summary: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsDeleting(false);
      setDeletingSummaryId(null);
    }
  };

  const handleEditSummary = (summary: IndividualIncomeSummary) => {
    setEditingSummary(summary);
    setFormData({
      individualIncomeSummaryPkId: null, // Keep as null for form data
      serviceGenerationAmount: summary.serviceGenerationAmount,
      matchingIncomeAmount: summary.matchingIncomeAmount,
      clubIncomeAmount: summary.clubIncomeAmount,
      rewardIncomeAmount: summary.rewardIncomeAmount,
      fastTrackBonusAmount: summary.fastTrackBonusAmount,
      miningProfitSharingAmount: summary.miningProfitSharingAmount,
      miningGenerationIncomeAmount: summary.miningGenerationIncomeAmount,
      nodeBusinessSharingAmount: summary.nodeBusinessSharingAmount,
      userFkId: summary.userFkId
    });
    setShowEditModal(true);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10 bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading income summary data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10 bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-2">Error Loading Data</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10 bg-gray-900 min-h-screen">
      {/* Breadcrumb */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-md2 font-semibold text-white">
          Income Summary
        </h2>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Income Summary
          </button>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </button>
        <nav>
          <ol className="flex items-center gap-2">
            <li><a className="font-medium text-gray-300 hover:text-white" href="/">Home /</a></li>
            <li><a className="font-medium text-gray-300 hover:text-white" href="/">Financial /</a></li>
            <li className="font-medium text-orange-500">Income Summary</li>
          </ol>
        </nav>
        </div>
      </div>

      {/* Total Income Box */}
      <div className="mb-6 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white font-bold text-2xl">Total Income!</h3>
            <p className="text-orange-100 text-lg font-semibold">${totalIncome.toLocaleString()}</p>
          </div>
          <div className="p-3 bg-white/20 rounded-full">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="mb-6 bg-gray-800 rounded-xl border border-gray-700 p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="text"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-32 rounded-lg border-2 border-gray-600 bg-gray-700 py-3 px-4 text-white placeholder-gray-400 outline-none transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                placeholder="From Date"
              />
              <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            
            <div className="relative">
              <input
                type="text"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-32 rounded-lg border-2 border-gray-600 bg-gray-700 py-3 px-4 text-white placeholder-gray-400 outline-none transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                placeholder="To Date"
              />
              <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>

            <select
              value={incomeFilter}
              onChange={(e) => setIncomeFilter(e.target.value)}
              className="rounded-lg border-2 border-gray-600 bg-gray-700 py-3 px-4 text-white outline-none transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
            >
              <option value="All Income" className="bg-gray-700">All Income</option>
              <option value="Direct Team Bonus" className="bg-gray-700">Direct Team Bonus</option>
              <option value="Service Generation" className="bg-gray-700">Service Generation</option>
              <option value="Matching Income" className="bg-gray-700">Matching Income</option>
              <option value="Club Income" className="bg-gray-700">Club Income</option>
              <option value="Reward Income" className="bg-gray-700">Reward Income</option>
              <option value="Fast Track Bonus" className="bg-gray-700">Fast Track Bonus</option>
              <option value="Mining Income" className="bg-gray-700">Mining Income</option>
            </select>
          </div>

          <button
            onClick={handleFilter}
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            Filter
          </button>
        </div>
      </div>

      {/* Income Summary Table */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-gray-700">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <h3 className="text-white font-bold text-xl">Income Summary</h3>
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
                <th className="text-left py-4 px-6 font-bold text-white text-sm uppercase tracking-wider">Date</th>
                <th className="text-left py-4 px-6 font-bold text-white text-sm uppercase tracking-wider">Transaction Type</th>
                <th className="text-left py-4 px-6 font-bold text-white text-sm uppercase tracking-wider">Bonus</th>
                <th className="text-left py-4 px-6 font-bold text-white text-sm uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {currentRecords.length > 0 ? (
                currentRecords.map((record, index) => {
                  // Find the original summary for this record
                  const originalSummary = incomeSummaryData.find(s => s.individualIncomeSummaryPkId === record.summaryId);
                  
                  return (
                  <tr key={record.id} className="hover:bg-gray-700/50 transition-colors">
                    <td className="py-4 px-6 text-white font-medium">{startIndex + index + 1}</td>
                    <td className="py-4 px-6 text-gray-300">{formatDate(record.date)}</td>
                    <td className="py-4 px-6 text-white font-medium">{record.transactionType}</td>
                    <td className="py-4 px-6 text-green-400 font-bold">${record.bonus.toLocaleString()}</td>
                      <td className="py-4 px-6 text-sm font-medium">
                        {originalSummary && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditSummary(originalSummary)}
                              className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteIncomeSummary(originalSummary.individualIncomeSummaryPkId)}
                              disabled={isDeleting && deletingSummaryId === originalSummary.individualIncomeSummaryPkId}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                            >
                              {isDeleting && deletingSummaryId === originalSummary.individualIncomeSummaryPkId ? 'Deleting...' : 'Delete'}
                            </button>
                          </div>
                        )}
                      </td>
                  </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
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

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Add Income Summary</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Service Generation Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.serviceGenerationAmount}
                  onChange={(e) => handleInputChange('serviceGenerationAmount', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Matching Income Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.matchingIncomeAmount}
                  onChange={(e) => handleInputChange('matchingIncomeAmount', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Club Income Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.clubIncomeAmount}
                  onChange={(e) => handleInputChange('clubIncomeAmount', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Reward Income Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.rewardIncomeAmount}
                  onChange={(e) => handleInputChange('rewardIncomeAmount', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Fast Track Bonus Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.fastTrackBonusAmount}
                  onChange={(e) => handleInputChange('fastTrackBonusAmount', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Mining Profit Sharing Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.miningProfitSharingAmount}
                  onChange={(e) => handleInputChange('miningProfitSharingAmount', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Mining Generation Income Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.miningGenerationIncomeAmount}
                  onChange={(e) => handleInputChange('miningGenerationIncomeAmount', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Node Business Sharing Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.nodeBusinessSharingAmount}
                  onChange={(e) => handleInputChange('nodeBusinessSharingAmount', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  User ID
                </label>
                <input
                  type="number"
                  value={formData.userFkId}
                  onChange={(e) => handleInputChange('userFkId', parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addIncomeSummary}
                disabled={isAdding}
                className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors disabled:opacity-50"
              >
                {isAdding ? 'Adding...' : 'Add Income Summary'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Edit Income Summary</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Service Generation Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.serviceGenerationAmount}
                  onChange={(e) => handleInputChange('serviceGenerationAmount', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Matching Income Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.matchingIncomeAmount}
                  onChange={(e) => handleInputChange('matchingIncomeAmount', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Club Income Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.clubIncomeAmount}
                  onChange={(e) => handleInputChange('clubIncomeAmount', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Reward Income Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.rewardIncomeAmount}
                  onChange={(e) => handleInputChange('rewardIncomeAmount', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Fast Track Bonus Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.fastTrackBonusAmount}
                  onChange={(e) => handleInputChange('fastTrackBonusAmount', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Mining Profit Sharing Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.miningProfitSharingAmount}
                  onChange={(e) => handleInputChange('miningProfitSharingAmount', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Mining Generation Income Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.miningGenerationIncomeAmount}
                  onChange={(e) => handleInputChange('miningGenerationIncomeAmount', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Node Business Sharing Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.nodeBusinessSharingAmount}
                  onChange={(e) => handleInputChange('nodeBusinessSharingAmount', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  User ID
                </label>
                <input
                  type="number"
                  value={formData.userFkId}
                  onChange={(e) => handleInputChange('userFkId', parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={updateIncomeSummary}
                disabled={isUpdating}
                className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors disabled:opacity-50"
              >
                {isUpdating ? 'Updating...' : 'Update Income Summary'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
