import React from 'react';

interface DashboardMetricCardProps {
  title: string;
  amount: string;
  colorClass?: string;
  isWallet?: boolean;
  walletIcon?: 'mine' | 'node' | 'capital' | 'credit'; // Specific icon types
}

const DashboardMetricCard: React.FC<DashboardMetricCardProps> = ({ title, amount, colorClass, isWallet = false }) => {
  
  const getWalletIcon = () => {
    // Icon for Wallets (Mine, Node, Capital)
    if (isWallet && title.includes('Wallet')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      );
    }
    // Icon for Total Credit / Debit
    if (isWallet && title.includes('Credit')) {
        return (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1M7 10h1M3 15h18M10 19l2-2h4a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2h4l2 2z" />
            </svg>
        );
    }
    // Icon for Income/Bonus (hashtag)
    return <span className="text-sm font-bold text-gray-400">#</span>;
  };
  
  const getIncomeIcon = () => {
      // Icon for Income cards (small folder/document icon)
      return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
      );
  };

  return (
    <div className={`flex flex-col p-6 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 ${isWallet ? colorClass : 'bg-white dark:bg-gradient-to-br dark:from-gray-800 dark:to-gray-700 border border-gray-200 dark:border-gray-600'}`}>
      
      {/* Top line of Wallets is different from Income */}
      {isWallet ? (
          <div className="flex justify-between items-center h-12">
              <div className="text-3xl font-bold text-white">
                  ${amount}
              </div>
              <div className="flex items-center">
                  {getWalletIcon()}
              </div>
          </div>
      ) : (
          <div className="flex justify-between items-start h-12">
              <div className="text-2xl font-bold text-gray-800 dark:text-white">
                  ${amount}
              </div>
              <div className="flex items-center">
                  {getIncomeIcon()}
              </div>
          </div>
      )}
      
      {/* Title / Description */}
      <div className={`text-sm font-medium ${isWallet ? 'text-white/90' : 'text-gray-600 dark:text-gray-300'} mt-2`}>
        {title}
      </div>
      
      {/* View All button for Income cards */}
      {!isWallet && (
          <a href="#" className="text-blue-500 dark:text-blue-400 text-xs mt-4 font-medium hover:text-blue-600 dark:hover:text-blue-300 hover:underline transition-colors">
              View All →
          </a>
      )}
    </div>
  );
};

export default DashboardMetricCard;