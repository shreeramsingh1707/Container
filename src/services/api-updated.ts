// API Service Layer for StyloCoin Admin Dashboard
// Centralized API calls with authentication handling

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// Get auth token from localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem("stylocoin_token");
};

// Create headers with auth token
const createHeaders = (): HeadersInit => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Generic API call function
const apiCall = async <T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any
): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    method,
    headers: createHeaders(),
    ...(body && { body: JSON.stringify(body) })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Rank & Reward API functions
export interface RankReward {
  rankId: number | null;
  rankName: string;
  matching: number;
  reward: number;
  achieved: boolean;
  // Additional fields for updates
  notesG11nBigTxt?: string | null;
  effectiveDateTime?: string;
  saveStateCodeFkId?: string;
  activeStateCodeFkId?: string;
  recordStateCodeFkId?: string;
  createdDatetime?: string;
  lastModifiedDateTime?: string;
  isDeleted?: boolean;
  isGenericFlag?: boolean;
}

export interface AddRankRewardRequest {
  rankId: null;
  rankName: string;
  matching: number;
  reward: number;
  achieved: boolean;
}

export const rankRewardApi = {
  // Get all ranks with pagination and filtering
  getAll: (page: number = 0, size: number = 25, filterBy: string = 'ACTIVE'): Promise<{ content: RankReward[], totalElements: number }> => 
    apiCall<any>(`/api/admin/getRankAndReward?page=${page}&size=${size}&filterBy=${filterBy}&inputPkId=null&inputFkId=null`).then(response => ({
      content: response.data || [],
      totalElements: response.count || 0
    })),

  // Add new rank
  add: (data: AddRankRewardRequest): Promise<RankReward> => 
    apiCall<any>('/api/admin/addRankAndReward', 'POST', data).then(response => response.data?.[0] || response),

  // Update existing rank
  update: (id: number, data: Partial<RankReward>): Promise<RankReward> => 
    apiCall<any>(`/api/admin/updateRankAndReward/${id}`, 'PUT', data).then(response => response.data?.[0] || response),

  // Delete rank
  delete: (id: number): Promise<void> => 
    apiCall<void>(`/api/admin/deleteRankAndReward/${id}`, 'DELETE')
};

// Income Type API functions
export interface IncomeType {
  incomeTypePkId: number | null;
  incomeName: string;
  percentage: number;
  // Additional fields for updates
  notesG11nBigTxt?: string | null;
  effectiveDateTime?: string;
  saveStateCodeFkId?: string;
  activeStateCodeFkId?: string;
  recordStateCodeFkId?: string;
  createdDatetime?: string;
  lastModifiedDateTime?: string;
  isDeleted?: boolean;
  isGenericFlag?: boolean;
}

export interface AddIncomeTypeRequest {
  incomeTypePkId: null;
  incomeName: string;
  percentage: number;
}

// Wallet Data interfaces
export interface WalletData {
  walletPkId: number;
  mineWallet: number;
  nodeWallet: number;
  capitalWallet: number;
  totalCredit: number;
  totalDebit: number;
  userFkId: number;
  isGenericFlag?: boolean;
  isDeleted?: boolean;
  notesG11nBigTxt?: string | null;
  effectiveDateTime?: string;
  saveStateCodeFkId?: string;
  activeStateCodeFkId?: string;
  recordStateCodeFkId?: string;
  createdDatetime?: string;
  lastModifiedDateTime?: string;
}

export interface AddWalletDataRequest {
  walletPkId: null;
  mineWallet: number;
  nodeWallet: number;
  capitalWallet: number;
  totalCredit: number;
  totalDebit: number;
  userFkId: number;
}

export const incomeTypeApi = {
  // Get all income types with pagination and filtering
  getAll: (page: number = 0, size: number = 25, filterBy: string = 'ACTIVE'): Promise<{ content: IncomeType[], totalElements: number }> => 
    apiCall<any>(`/api/admin/getIncomeType?page=${page}&size=${size}&filterBy=${filterBy}&inputPkId=null&inputFkId=null`).then(response => ({
      content: response.data || [],
      totalElements: response.count || 0
    })),

  // Add new income type
  add: (data: AddIncomeTypeRequest): Promise<IncomeType> => 
    apiCall<any>('/api/admin/addIncomeType', 'POST', data).then(response => response.data?.[0] || response),

  // Update existing income type
  update: (id: number, data: Partial<IncomeType>): Promise<IncomeType> => 
    apiCall<any>(`/api/admin/updateIncomeType/${id}`, 'PUT', data).then(response => response.data?.[0] || response),

  // Delete income type
  delete: (id: number): Promise<void> => 
    apiCall<void>(`/api/admin/deleteIncomeType/${id}`, 'DELETE')
};

// Wallet Data API functions
export const walletDataApi = {
  // Get all wallet data with pagination and filtering
  getAll: (page: number = 0, size: number = 25, filterBy: string = 'ACTIVE'): Promise<{ content: WalletData[], totalElements: number }> => 
    apiCall<any>(`/api/individual/getWalletData?page=${page}&size=${size}&filterBy=${filterBy}&inputPkId=null&inputFkId=null`).then(response => ({
      content: response.data || [],
      totalElements: response.count || 0
    })),

  // Add new wallet data
  add: (data: AddWalletDataRequest): Promise<WalletData> => 
    apiCall<any>('/api/individual/addWalletData', 'POST', data).then(response => response.data?.[0] || response),

  // Update existing wallet data
  update: (id: number, data: Partial<WalletData>): Promise<WalletData> => 
    apiCall<any>(`/api/individual/updateWalletData/${id}`, 'PUT', data).then(response => response.data?.[0] || response),

  // Delete wallet data
  delete: (id: number): Promise<void> => 
    apiCall<void>(`/api/individual/deleteWalletData/${id}`, 'DELETE')
};

// Individual Income Summary interfaces
export interface IndividualIncomeSummary {
  individualIncomeSummaryPkId: number;
  serviceGenerationAmount: number;
  matchingIncomeAmount: number;
  clubIncomeAmount: number;
  rewardIncomeAmount: number;
  fastTrackBonusAmount: number;
  miningProfitSharingAmount: number;
  miningGenerationIncomeAmount: number;
  nodeBusinessSharingAmount: number;
  userFkId: number;
  isGenericFlag?: boolean;
  isDeleted?: boolean;
  notesG11nBigTxt?: string | null;
  effectiveDateTime?: string;
  saveStateCodeFkId?: string;
  activeStateCodeFkId?: string;
  recordStateCodeFkId?: string;
  createdDatetime?: string;
  lastModifiedDateTime?: string;
}

export interface AddIndividualIncomeSummaryRequest {
  individualIncomeSummaryPkId: null;
  serviceGenerationAmount: number;
  matchingIncomeAmount: number;
  clubIncomeAmount: number;
  rewardIncomeAmount: number;
  fastTrackBonusAmount: number;
  miningProfitSharingAmount: number;
  miningGenerationIncomeAmount: number;
  nodeBusinessSharingAmount: number;
  userFkId: number;
}

// Individual Income Summary API functions
export const individualIncomeSummaryApi = {
  // Get all individual income summary with pagination and filtering
  getAll: (page: number = 0, size: number = 25, filterBy: string = 'ACTIVE'): Promise<{ content: IndividualIncomeSummary[], totalElements: number }> => 
    apiCall<any>(`/api/individual/getIndividualIncomeSummary?page=${page}&size=${size}&filterBy=${filterBy}&inputPkId=null&inputFkId=null`).then(response => ({
      content: response.data || [],
      totalElements: response.count || 0
    })),

  // Add new individual income summary
  add: (data: AddIndividualIncomeSummaryRequest): Promise<IndividualIncomeSummary> => 
    apiCall<any>('/api/individual/addIndividualIncomeSummary', 'POST', data).then(response => response.data?.[0] || response),

  // Update existing individual income summary
  update: (id: number, data: Partial<IndividualIncomeSummary>): Promise<IndividualIncomeSummary> => 
    apiCall<any>(`/api/individual/updateIndividualIncomeSummary/${id}`, 'PUT', data).then(response => response.data?.[0] || response),

  // Delete individual income summary
  delete: (id: number): Promise<void> => 
    apiCall<void>(`/api/individual/deleteIndividualIncomeSummary/${id}`, 'DELETE')
};

// Export default API object
export default {
  rankReward: rankRewardApi,
  incomeType: incomeTypeApi,
  walletData: walletDataApi,
  individualIncomeSummary: individualIncomeSummaryApi
};
