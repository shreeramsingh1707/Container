import React, { useEffect, useState } from "react";

interface AccountStatementRecord {
  accountStatementPkId: number;
  effectiveDateTime: string;
  particular: string;
  credit: number;
  debit: number;
}

export default function AccountStatement() {
  const [statementRecords, setStatementRecords] = useState<AccountStatementRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("stylocoin_user") || "{}");
    const nodeId = user?.nodeId;

    if (nodeId) {
      fetchAccountStatement(nodeId);
    } else {
      console.warn("No nodeId found in localStorage");
      setLoading(false);
    }
  }, []);

  const fetchAccountStatement = async (nodeId: string) => {
    try {
      const url = `http://minecryptos-env.eba-nsbmtw9i.ap-south-1.elasticbeanstalk.com/api/individual/getAccountStatement?page=0&size=50&filterBy=ACTIVE&inputPkId=null&inputFkId=${nodeId}`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.status === "SUCCESS" && Array.isArray(data.data)) {
        setStatementRecords(data.data);
      } else {
        setStatementRecords([]);
      }
    } catch (err) {
      console.error("Error fetching account statement:", err);
      setStatementRecords([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter records by search term
  const filteredRecords = statementRecords.filter((record) =>
    record.particular?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredRecords.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentRecords = filteredRecords.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => setCurrentPage(page);

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10 bg-gray-900 min-h-screen">
      {/* Breadcrumb */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-md2 font-semibold text-white">A/c Statement</h2>
        <nav>
          <ol className="flex items-center gap-2">
            <li><a className="font-medium text-gray-300 hover:text-white" href="/">Home /</a></li>
            <li><a className="font-medium text-gray-300 hover:text-white" href="/">Financial /</a></li>
            <li className="font-medium text-orange-500">A/c Statement</li>
          </ol>
        </nav>
      </div>

      {/* Search + Filter Section */}
      <div className="mb-6 bg-gray-800 rounded-xl border border-gray-700 p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative">
            <input
              type="text"
              placeholder="Search Particular"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64 rounded-lg border-2 border-gray-600 bg-gray-700 py-3 pl-10 pr-4 text-white placeholder-gray-400 outline-none transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
            />
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-gray-700">
          <h3 className="text-white font-bold text-xl">Account Statement</h3>
        </div>

        {loading ? (
          <div className="py-12 text-center text-gray-400">Loading account statement...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-800 to-gray-750 border-b border-gray-700">
                <tr>
                  <th className="text-left py-4 px-6 font-bold text-white text-sm uppercase tracking-wider">#</th>
                  <th className="text-left py-4 px-6 font-bold text-white text-sm uppercase tracking-wider">Date</th>
                  <th className="text-left py-4 px-6 font-bold text-white text-sm uppercase tracking-wider">Particular</th>
                  <th className="text-left py-4 px-6 font-bold text-white text-sm uppercase tracking-wider">Cr.</th>
                  <th className="text-left py-4 px-6 font-bold text-white text-sm uppercase tracking-wider">Db.</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-700">
                {currentRecords.length > 0 ? (
                  currentRecords.map((record, index) => (
                    <tr key={record.accountStatementPkId} className="hover:bg-gray-700/50 transition-colors">
                      <td className="py-4 px-6 text-white font-medium">{startIndex + index + 1}</td>
                      <td className="py-4 px-6 text-gray-300">{formatDate(record.effectiveDateTime)}</td>
                      <td className="py-4 px-6 text-white font-medium">{record.particular}</td>
                      <td className="py-4 px-6">
                        {record.credit > 0 ? (
                          <span className="text-green-400 font-bold">
                            ₹{record.credit.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        {record.debit > 0 ? (
                          <span className="text-red-400 font-bold">
                            ₹{record.debit.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-400">
                      No records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 text-gray-400">
              <span>Rows per page</span>
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
                className="p-2 rounded-lg border border-gray-600 bg-gray-700 text-gray-400 hover:text-white hover:bg-gray-600 disabled:opacity-50"
              >
                ‹
              </button>
              <span className="px-3 py-2 text-white font-medium">
                {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-600 bg-gray-700 text-gray-400 hover:text-white hover:bg-gray-600 disabled:opacity-50"
              >
                ›
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
