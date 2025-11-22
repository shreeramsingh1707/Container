import React from 'react';
import { businessApiType } from '../../services/api';

// Define the props interface
interface BusinessDetailsCardProps {
  businessDatas: businessApiType[]; // Change to any[] since the structure is different
}

const BusinessDetailsCard: React.FC<BusinessDetailsCardProps> = ({ businessDatas }) => {
  // Extract the business data from the response structure
  const getBusinessData = () => {
    if (!businessDatas || businessDatas.length === 0) {
      return [
        { label: 'Direct Team', value: '0' },
        { label: 'Total Team', value: '0' },
        { label: 'Team Business', value: '0' },
        { label: 'Total Active Team(Left/Right)', value: '0/0' },
        { label: 'Strong Weaker Leg Team', value: '0/0' },
        { label: 'Team Carry Forward(Left/Right)', value: '0/0' },
        { label: 'Current Mining Business(Left/Right)', value: '0/0' },
        { label: 'Total Mining Business(Left/Right)', value: '0/0' },
      ];
    }

    // Get the first item from businessDatas array and extract response
    const businessResponse = businessDatas[0]?.response;
    
    if (!businessResponse) {
      return [
        { label: 'Direct Team', value: '0' },
        { label: 'Total Team', value: '0' },
        { label: 'Team Business', value: '0' },
        { label: 'Total Active Team(Left/Right)', value: '0/0' },
        { label: 'Strong Weaker Leg Team', value: '0/0' },
        { label: 'Team Carry Forward(Left/Right)', value: '0/0' },
        { label: 'Current Mining Business(Left/Right)', value: '0/0' },
        { label: 'Total Mining Business(Left/Right)', value: '0/0' },
      ];
    }

    return [
      { 
        label: 'Direct Team', 
        value: businessResponse.directTeam?.toString() || '0' 
      },
      { 
        label: 'Total Team', 
        value: businessResponse.totalTeam?.toString() || '0' 
      },
      { 
        label: 'Team Business', 
        value: businessResponse.teamBusiness?.toString() || '0' 
      },
      { 
        label: 'Total Active Team(Left/Right)', 
        value: `${businessResponse.totalActiveTeamLeft || 0}/${businessResponse.totalActiveTeamRight || 0}` 
      },
      { 
        label: 'Strong Weaker Leg Team', 
        value: `${businessResponse.strongLegTeam || 0}/${businessResponse.weakerLegTeam || 0}` 
      },
      { 
        label: 'Team Carry Forward(Left/Right)', 
        value: `${businessResponse.carryForwardLeft || 0}/${businessResponse.carryForwardRight || 0}` 
      },
      { 
        label: 'Current Mining Business(Left/Right)', 
        value: `${businessResponse.currentMiningBusinessLeft || 0}/${businessResponse.currentMiningBusinessRight || 0}` 
      },
      { 
        label: 'Total Mining Business(Left/Right)', 
        value: `${businessResponse.totalMiningBusinessLeft || 0}/${businessResponse.totalMiningBusinessRight || 0}` 
      },
    ];
  };

  const businessData = getBusinessData();

  return (
    <div className="p-6 bg-white dark:bg-gradient-to-br dark:from-gray-800 dark:to-gray-700 rounded-xl shadow-xl h-full border border-gray-200 dark:border-gray-600">
      <h3 className="text-gray-800 dark:text-white font-bold text-lg mb-6 border-b border-gray-200 dark:border-gray-600 pb-3 flex items-center">
        <svg className="w-5 h-5 mr-2 text-green-500 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
        </svg>
        Business Details
      </h3>
      <div className="space-y-3 text-sm">
        {businessData.map((item, index) => (
          <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600 last:border-b-0">
            <span className="text-gray-600 dark:text-gray-300 font-medium">{item.label}</span>
            <span className="text-gray-800 dark:text-white font-semibold bg-gray-100 dark:bg-gray-600 px-3 py-1 rounded-full text-xs">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BusinessDetailsCard;