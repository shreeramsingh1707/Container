import React, { useEffect, useState } from "react";

interface IncomeSummary {
  commissionLedgerPkId: number;
  incomeType: string;
  amount: number;
  note:string;
  isSettled:boolean,
  effectiveDateTime: string;
}

const IncomeSummary: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [incomeData, setIncomeData] = useState<IncomeSummary[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedType, setSelectedType] = useState("ALL");
  const [search, setSearch] = useState("");

  // const loggedInNodeId = localStorage.getItem("nodeId"); // Or from Redux
  const user = JSON.parse(localStorage.getItem("stylocoin_user") || "{}");
  const loggedInNodeId = user?.nodeId;

  const fetchIncomeSummary = async () => {
    try {
      setLoading(true);

      const API_URL =
        `http://MineCryptos-env.eba-nsbmtw9i.ap-south-1.elasticbeanstalk.com/api/individual/getCommissionLedger` +
        `?page=0&size=50&filterBy=ACTIVE&inputPkId=null&inputFkId=${loggedInNodeId}`;

      // const res = await axios.get(API_URL);
      const response = await fetch(API_URL);
      const res = await response.json();
      if (res.status === "SUCCESS") {
        setIncomeData(res.data || []);
    }
    } catch (error) {
      console.error("Error fetching income summary", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncomeSummary();
  }, []);

  // Filter logic for Search + Transaction Type
  const filteredData = incomeData.filter((item) => {
    const matchesSearch =
      item.incomeType.toLowerCase().includes(search.toLowerCase()) ||
      String(item.amount).includes(search);

    const matchesType =
      selectedType === "ALL" || item.incomeType === selectedType;

    return matchesSearch && matchesType;
  });

  return (
    <div className="p-5 text-white">
      <h2 className="text-xl font-bold mb-4">Income Summary</h2>

      {/* Filters Section */}
      <div className="bg-gray-900 p-4 rounded-lg mb-5">
        <div className="flex gap-4">
          {/* Start Date */}
          <input
            type="date"
            className="bg-gray-800 p-2 rounded text-white"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />

          {/* End Date */}
          <input
            type="date"
            className="bg-gray-800 p-2 rounded text-white"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />

          {/* Income Type Dropdown */}
          <select
            className="bg-gray-800 p-2 rounded text-white"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="ALL">All Income</option>
            <option value="DIRECT_INCOME">Direct Income</option>
            <option value="LEVEL_INCOME">Level Income</option>
            <option value="REWARD_INCOME">Reward Income</option>
          </select>

          <button
            className="bg-orange-500 px-4 py-2 rounded"
            onClick={fetchIncomeSummary}
          >
            Filter
          </button>
        </div>
      </div>

      {/* Search box */}
      <div className="flex justify-end mb-3">
        <input
          type="text"
          placeholder="Search..."
          className="bg-gray-800 p-2 rounded text-white"
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table Section */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-2xl overflow-hidden">
      <table className="w-full">
        <thead className="bg-gradient-to-r from-gray-800 to-gray-800 border-b border-gray-700">
            <tr className="border-b border-gray-700">
              <th className="p-2">#</th>
              <th className="p-2">Transaction Type</th>
              <th className="p-2">Bonus</th>
              <th className="p-2">Remarks</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-700">
            {loading ? (
              <tr>
                <td colSpan={4} className="text-center p-4">
                  Loading...
                </td>
              </tr>
            ) : filteredData.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center p-4">
                  No data available
                </td>
              </tr>
            ) : (
              filteredData.map((item, index) => (
                <tr key={item.commissionLedgerPkId} className="border-b border-gray-700">
                  <td  className="py-5 px-16 text-gray-300">{index + 1}</td>
                  <td className="py-5 px-16 text-gray-300">{item.incomeType}</td>
                  <td className="py-5 px-16 text-gray-300">₹ {item.amount}</td>
                  <td className="py-5 px-16 text-gray-300">{item.note}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default IncomeSummary;
