import React from 'react';

const BusinessDetailsCard: React.FC = () => {
    // Mock data to match the screenshot
    const businessData = [
        { label: 'Direct Team', value: '0' },
        { label: 'Total Team', value: '0' },
        { label: 'Team Business', value: '0' },
        { label: 'Total Active Team(Left/Right)', value: '0/0' },
        { label: 'Strong Weaker Leg Team', value: '0/0' },
        { label: 'Team Carry Forward(Left/Right)', value: '0/0' },
        { label: 'Current Mining Business(Left/Right)', value: '0/0' },
        { label: 'Total Mining Business(Left/Right)', value: '0/0' },
    ];

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
                        <span className="text-gray-800 dark:text-white font-semibold bg-gray-100 dark:bg-gray-600 px-3 py-1 rounded-full text-xs">{item.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BusinessDetailsCard;