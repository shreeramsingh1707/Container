// Add this to your browser console to mock API responses for testing
window.mockApiResponses = true;

// Mock fetch for testing
const originalFetch = window.fetch;
window.fetch = async (url, options) => {
  if (window.mockApiResponses) {
    // Mock rank API responses
    if (url.includes('/api/admin/getRankAndReward')) {
      return {
        ok: true,
        json: async () => ({
          content: [
            { rankId: 1, rankName: "Star", matching: 25, reward: 100, achieved: false },
            { rankId: 2, rankName: "Golden Star", matching: 50, reward: 300, achieved: false },
            { rankId: 3, rankName: "Executive Star", matching: 100, reward: 500, achieved: true }
          ],
          totalElements: 3
        })
      };
    }
    
    if (url.includes('/api/admin/addRankAndReward')) {
      return {
        ok: true,
        json: async () => ({
          rankId: 4,
          rankName: options.body ? JSON.parse(options.body).rankName : "New Rank",
          matching: options.body ? JSON.parse(options.body).matching : 75,
          reward: options.body ? JSON.parse(options.body).reward : 400,
          achieved: false
        })
      };
    }
    
    if (url.includes('/api/admin/updateRankAndReward')) {
      return {
        ok: true,
        json: async () => ({
          rankId: 1,
          rankName: "Updated Star",
          matching: 30,
          reward: 150,
          achieved: false
        })
      };
    }
    
    if (url.includes('/api/admin/deleteRankAndReward')) {
      return {
        ok: true,
        json: async () => ({})
      };
    }
    
    // Mock income type API responses
    if (url.includes('/api/admin/getIncomeTypes')) {
      return {
        ok: true,
        json: async () => ({
          content: [
            { incomeTypePkId: 1, incomeName: "Service Generation Income", percentage: 10 },
            { incomeTypePkId: 2, incomeName: "Matching Income", percentage: 15 },
            { incomeTypePkId: 3, incomeName: "Club Income", percentage: 5 }
          ],
          totalElements: 3
        })
      };
    }
    
    // Mock wallet data API responses
    if (url.includes('/api/individual/getWalletData')) {
      return {
        ok: true,
        json: async () => ({
          data: [
            { 
              walletPkId: 1, 
              mineWallet: 100.50, 
              nodeWallet: 250.75, 
              capitalWallet: 500.00, 
              totalCredit: 851.25, 
              totalDebit: 0, 
              userFkId: 1 
            },
            { 
              walletPkId: 2, 
              mineWallet: 200.00, 
              nodeWallet: 150.25, 
              capitalWallet: 300.00, 
              totalCredit: 650.25, 
              totalDebit: 0, 
              userFkId: 2 
            }
          ],
          count: 2
        })
      };
    }
    
    if (url.includes('/api/individual/addWalletData')) {
      return {
        ok: true,
        json: async () => ({
          data: [{
            walletPkId: Date.now(),
            mineWallet: options.body ? JSON.parse(options.body).mineWallet : 0,
            nodeWallet: options.body ? JSON.parse(options.body).nodeWallet : 0,
            capitalWallet: options.body ? JSON.parse(options.body).capitalWallet : 0,
            totalCredit: options.body ? JSON.parse(options.body).totalCredit : 0,
            totalDebit: options.body ? JSON.parse(options.body).totalDebit : 0,
            userFkId: options.body ? JSON.parse(options.body).userFkId : 1
          }]
        })
      };
    }
    
    if (url.includes('/api/individual/updateWalletData')) {
      return {
        ok: true,
        json: async () => ({
          data: [{
            walletPkId: 1,
            mineWallet: options.body ? JSON.parse(options.body).mineWallet : 100.50,
            nodeWallet: options.body ? JSON.parse(options.body).nodeWallet : 250.75,
            capitalWallet: options.body ? JSON.parse(options.body).capitalWallet : 500.00,
            totalCredit: options.body ? JSON.parse(options.body).totalCredit : 851.25,
            totalDebit: options.body ? JSON.parse(options.body).totalDebit : 0,
            userFkId: options.body ? JSON.parse(options.body).userFkId : 1
          }]
        })
      };
    }
    
    if (url.includes('/api/individual/deleteWalletData')) {
      return {
        ok: true,
        json: async () => ({})
      };
    }
    
    // Mock Individual Income Summary API responses
    if (url.includes('/api/individual/getIndividualIncomeSummary')) {
      return {
        ok: true,
        json: async () => ({
          data: [
            { 
              individualIncomeSummaryPkId: 1, 
              serviceGenerationAmount: 10.0, 
              matchingIncomeAmount: 2.0, 
              clubIncomeAmount: 3.0, 
              rewardIncomeAmount: 4.0, 
              fastTrackBonusAmount: 5.0, 
              miningProfitSharingAmount: 6.0, 
              miningGenerationIncomeAmount: 7.0, 
              nodeBusinessSharingAmount: 8.0, 
              userFkId: 1 
            },
            { 
              individualIncomeSummaryPkId: 2, 
              serviceGenerationAmount: 15.0, 
              matchingIncomeAmount: 3.0, 
              clubIncomeAmount: 4.0, 
              rewardIncomeAmount: 5.0, 
              fastTrackBonusAmount: 6.0, 
              miningProfitSharingAmount: 7.0, 
              miningGenerationIncomeAmount: 8.0, 
              nodeBusinessSharingAmount: 9.0, 
              userFkId: 2 
            }
          ],
          count: 2
        })
      };
    }
    
    if (url.includes('/api/individual/addIndividualIncomeSummary')) {
      return {
        ok: true,
        json: async () => ({
          data: [{
            individualIncomeSummaryPkId: Date.now(),
            serviceGenerationAmount: options.body ? JSON.parse(options.body).serviceGenerationAmount : 0,
            matchingIncomeAmount: options.body ? JSON.parse(options.body).matchingIncomeAmount : 0,
            clubIncomeAmount: options.body ? JSON.parse(options.body).clubIncomeAmount : 0,
            rewardIncomeAmount: options.body ? JSON.parse(options.body).rewardIncomeAmount : 0,
            fastTrackBonusAmount: options.body ? JSON.parse(options.body).fastTrackBonusAmount : 0,
            miningProfitSharingAmount: options.body ? JSON.parse(options.body).miningProfitSharingAmount : 0,
            miningGenerationIncomeAmount: options.body ? JSON.parse(options.body).miningGenerationIncomeAmount : 0,
            nodeBusinessSharingAmount: options.body ? JSON.parse(options.body).nodeBusinessSharingAmount : 0,
            userFkId: options.body ? JSON.parse(options.body).userFkId : 1
          }]
        })
      };
    }
    
    if (url.includes('/api/individual/updateIndividualIncomeSummary')) {
      return {
        ok: true,
        json: async () => ({
          data: [{
            individualIncomeSummaryPkId: 1,
            serviceGenerationAmount: options.body ? JSON.parse(options.body).serviceGenerationAmount : 10.0,
            matchingIncomeAmount: options.body ? JSON.parse(options.body).matchingIncomeAmount : 2.0,
            clubIncomeAmount: options.body ? JSON.parse(options.body).clubIncomeAmount : 3.0,
            rewardIncomeAmount: options.body ? JSON.parse(options.body).rewardIncomeAmount : 4.0,
            fastTrackBonusAmount: options.body ? JSON.parse(options.body).fastTrackBonusAmount : 5.0,
            miningProfitSharingAmount: options.body ? JSON.parse(options.body).miningProfitSharingAmount : 6.0,
            miningGenerationIncomeAmount: options.body ? JSON.parse(options.body).miningGenerationIncomeAmount : 7.0,
            nodeBusinessSharingAmount: options.body ? JSON.parse(options.body).nodeBusinessSharingAmount : 8.0,
            userFkId: options.body ? JSON.parse(options.body).userFkId : 1
          }]
        })
      };
    }
    
    if (url.includes('/api/individual/deleteIndividualIncomeSummary')) {
      return {
        ok: true,
        json: async () => ({})
      };
    }
  }
  
  return originalFetch(url, options);
};

console.log('API mocking enabled for testing!');
