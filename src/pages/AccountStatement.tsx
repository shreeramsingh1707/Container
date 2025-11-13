import React, { useEffect, useState } from "react";

const AccountDetailsCard: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // Fetch users once based on logged-in nodeId
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("stylocoin_user") || "{}");
    const nodeId = user?.nodeId;

    if (!nodeId) {
      console.warn("No nodeId found in localStorage");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const res = await fetch(
          `http://minecryptos-env.eba-nsbmtw9i.ap-south-1.elasticbeanstalk.com/api/users/getUser?page=0&size=50&filterBy=ACTIVE&inputPkId=null&inputFkId=${nodeId}`
        );
        const data = await res.json();

        if (data.status === "SUCCESS" && Array.isArray(data.data)) {
          setUsers(data.data);
          setFilteredUsers(data.data);
        }
      } catch (err) {
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter + Search logic
  useEffect(() => {
    let filtered = [...users];

    if (statusFilter !== "ALL") {
      filtered = filtered.filter(
        (u) => u.userStatus?.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    if (searchTerm.trim() !== "") {
      filtered = filtered.filter(
        (u) =>
          u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.nodeId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
    setCurrentPage(1); // Reset to page 1 when filters change
  }, [searchTerm, statusFilter, users]);

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, startIndex + rowsPerPage);

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-xl">
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
        User Details
      </h2>

      {/* 🔍 Search and Filter Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-3">
        <input
          type="text"
          placeholder="Search by name, email, or node ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-3 py-2 border rounded-md w-full md:w-1/3 dark:bg-gray-700 dark:text-white"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white"
        >
          <option value="ALL">All</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>

      {/* 🧾 Table */}
      {loading ? (
        <p className="text-gray-500 dark:text-gray-300">Loading...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-700">
            <thead className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
              <tr>
                <th className="border p-2">Name</th>
                <th className="border p-2">Email</th>
                <th className="border p-2">Node ID</th>
                <th className="border p-2">Status</th>
                <th className="border p-2">Country</th>
                <th className="border p-2">Date of Activation</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.map((u, i) => (
                <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-600">
                  <td className="border p-2">{u.name}</td>
                  <td className="border p-2">{u.email}</td>
                  <td className="border p-2 text-blue-600 dark:text-blue-400 font-semibold">
                    {u.nodeId}
                  </td>
                  <td className="border p-2">{u.userStatus}</td>
                  <td className="border p-2">{u.country}</td>
                  <td className="border p-2">
                    {u.dateOfActivation
                      ? new Date(u.dateOfActivation).toLocaleString()
                      : "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 📄 Pagination */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50"
        >
          ‹ Prev
        </button>

        <span className="text-gray-700 dark:text-gray-300">
          Page {currentPage} of {totalPages || 1}
        </span>

        <button
          onClick={() =>
            setCurrentPage((prev) =>
              Math.min(prev + 1, totalPages || prev)
            )
          }
          disabled={currentPage === totalPages || totalPages === 0}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50"
        >
          Next ›
        </button>
      </div>
    </div>
  );
};

export default AccountDetailsCard;
