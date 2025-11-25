import { useState, useMemo ,useEffect} from "react";
import { EyeIcon } from "../icons";
import { Modal } from "../components/ui/modal";
import { useModal } from "../hooks/useModal";

interface TeamMember {
  id: number;
  status: "Active" | "Inactive";
  rank: string;
  joiningDate: string;
  activationDate: string;
  level?: number; // Hierarchy level
   parentId?: string; // Parent member ID for hierarchy
  memberId: string,
  memberName: string,
  memberEmail: string,
  memberLevel: number,
  position: string
}


// Helper function to get initials from name
const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

// Helper function to get card color based on status and position
const getCardColor = (status: string, position: string): string => {
   if (status === "INACTIVE") return "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800";
    if (position.toLowerCase().includes("Left")) return "bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800";
   if (position.toLowerCase().includes("Right")) return "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800";
  // if (position.toLowerCase().includes("lead")) return "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800";
  return "bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700";
};

// Component for rendering a single team member card
const TeamMemberCard: React.FC<{ member: TeamMember; treePosition?: "left" | "right" | "root" }> = ({ member, treePosition }) => {
  const initials = getInitials(member.memberName);
  const cardColor = getCardColor(member.status, member.position);

  return (
    <div className={`relative ${cardColor} border-2 rounded-lg p-4 min-w-[200px] shadow-sm hover:shadow-md transition-shadow`}>
      {/* Tree position indicator */}
      {treePosition && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
            treePosition === "root"
              ? "bg-yellow-500 text-white"
              : treePosition === "left"
              ? "bg-blue-500 text-white"
              : "bg-orange-500 text-white"
          }`}>
            {treePosition.toUpperCase()}
          </span>
        </div>
      )}
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm ${
            member.status === "Active" 
              ? "bg-brand-500 text-white" 
              : "bg-red-500 text-white"
          }`}>
            {initials}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm text-gray-900 dark:text-white truncate">
            {member.memberName}
          </h3>
          {/* <div className="mt-1.5">
            <span className="inline-block px-2.5 py-1 text-xs font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-md uppercase tracking-wide">
              {member.position}
            </span>
          </div> */}
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
            {member.memberId} | {member.memberId.replace("USR", "")}
          </p>
          {/* <div className="flex items-center space-x-2 mt-2">
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              {member.directTeam} Direct
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              {member.totalTeam} Total
            </span>
          </div> */}
          <div className="mt-2 flex items-center space-x-1">
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              member.status === "Active"
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
            }`}>
              {member.status}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
              {member.rank}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Type for hierarchical team member
type HierarchicalMember = TeamMember & { children: HierarchicalMember[] };

// Component for rendering the organizational chart
const OrgChartModal: React.FC<{ members: TeamMember[]; onClose: () => void }> = ({ members, onClose }) => {
  // Build hierarchy tree
  const buildHierarchy = (members: TeamMember[]): HierarchicalMember[] => {
    const memberMap = new Map<string, HierarchicalMember>();
    const rootMembers: HierarchicalMember[] = [];

    // Initialize all members with children array
    members.forEach((member) => {
      memberMap.set(member.memberId, { ...member, children: [] });
    });

    // Build tree structure
    members.forEach((member) => {
      const memberWithChildren = memberMap.get(member.memberId)!;
      if (member.parentId && memberMap.has(member.parentId)) {
        const parent = memberMap.get(member.parentId)!;
        parent.children.push(memberWithChildren);
      } else {
        rootMembers.push(memberWithChildren);
      }
    });

    return rootMembers;
  };

  const hierarchy = useMemo(() => buildHierarchy(members), [members]);

  // Render a single node in binary tree structure
  const renderNode = (member: HierarchicalMember, memberLevel: number = 0, isRoot: boolean = false, position: "left" | "right" | "root" = "root"): React.ReactNode => {
    // Limit to 2 children for binary tree
    const leftChild = member.children[0] || null;
    const rightChild = member.children[1] || null;
    const hasChildren = leftChild || rightChild;
    const hasBothChildren = leftChild && rightChild;

    return (
      <div className="flex flex-col items-center relative">
        {/* Vertical connection line from parent (if not root) */}
        {!isRoot && (
          <div className="w-0.5 h-6 bg-gray-300 dark:bg-gray-600 mb-2"></div>
        )}
        
        {/* Member card */}
        <TeamMemberCard member={member} treePosition={isRoot ? "root" : position} />
        
        {/* Connection lines and children */}
        {hasChildren && (
          <div className="relative w-full mt-2">
            {/* Vertical line down from parent */}
            <div className="absolute left-1/2 top-0 transform -translate-x-1/2 w-0.5 h-6 bg-gray-300 dark:bg-gray-600"></div>
            
            {/* Horizontal connector line */}
            {hasBothChildren && (
              <div className="absolute left-0 right-0 top-6 h-0.5 bg-gray-300 dark:bg-gray-600"></div>
            )}
            
            {/* Container for children */}
            <div className="flex justify-center items-start gap-8 mt-8" style={{ minWidth: hasBothChildren ? '400px' : '200px' }}>
              {/* Left child */}
              {leftChild && (
                <div className="flex flex-col items-center relative">
                  {/* Vertical line down to left child */}
                  <div className="absolute left-1/2 top-0 transform -translate-x-1/2 w-0.5 h-6 bg-gray-300 dark:bg-gray-600"></div>
                  {/* Horizontal line from center to left */}
                  {hasBothChildren && (
                    <div className="absolute left-1/2 top-6 transform -translate-x-1/2 w-1/2 h-0.5 bg-gray-300 dark:bg-gray-600"></div>
                  )}
                  
                  {/* Render left child */}
                  <div className="mt-6">
                    {renderNode(leftChild, memberLevel + 1, false, "left")}
                  </div>
                </div>
              )}
              
              {/* Right child */}
              {rightChild && (
                <div className="flex flex-col items-center relative">
                  {/* Vertical line down to right child */}
                  <div className="absolute left-1/2 top-0 transform -translate-x-1/2 w-0.5 h-6 bg-gray-300 dark:bg-gray-600"></div>
                  {/* Horizontal line from center to right */}
                  {hasBothChildren && (
                    <div className="absolute right-1/2 top-6 w-1/2 h-0.5 bg-gray-300 dark:bg-gray-600"></div>
                  )}
                  
                  {/* Render right child */}
                  <div className="mt-6">
                    {renderNode(rightChild, memberLevel + 1, false, "right")}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render root nodes (for multiple root members)
  const renderRootNodes = () => {
    if (hierarchy.length === 0) return null;
    
    // If multiple roots, render them separately
    // Otherwise render as binary tree
    return (
      <div className="flex flex-col items-center space-y-12">
        {hierarchy.map((rootMember) => (
          <div key={rootMember.id}>
            {renderNode(rootMember, 0, true)}
          </div>
        ))}
      </div>
    );
  };

  return (
    <Modal isOpen={true} onClose={onClose} className="max-w-10xl max-h-[90vh] overflow-y-auto">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Direct Team Organizational Chart
        </h2>
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-8 overflow-x-auto">
          <div className="min-w-full flex justify-center">
            {hierarchy.length > 0 ? (
              renderRootNodes()
            ) : (
              <div className="text-center text-gray-500 dark:text-gray-400 py-12">
                No team members to display
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default function DirectTeam() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const { isOpen: showAddModal, openModal: openAddModal, closeModal: closeAddModal } = useModal();
  const [isLoading, setIsLoading] = useState(true);
  const [directTeamData, setDirectTeamData] = useState<TeamMember[]>([]);

  // API call
const fetchAllTeamData = async () => {
  const userData = localStorage.getItem("stylocoin_user");
  const parsed = userData ? JSON.parse(userData) : null;

  const nodeId = parsed?.nodeId || parsed?.userNodeId || parsed?.node_id;
  console.log("******************",nodeId)

  try {
    setIsLoading(true);

    const res = await fetch(
      `http://MineCryptos-env.eba-nsbmtw9i.ap-south-1.elasticbeanstalk.com/api/individual/getAllDirectMember?page=0&size=25&filterBy=ACTIVE&inputPkId=${nodeId}&inputFkId=null`
    );

    const json = await res.json();

    // Your API returns:  { data: [ ... ] }
    // setTeamData(json?.data || []);
    let i = 0;
    const mapped = json.data.map((item: any) => ({
      id: i++,
      parentId: item.parentId ,
      memberId: item.memberId,
      memberName: item.memberName,
      memberEmail: item.memberEmail,
      memberLevel: item.memberLevel,
      position: item.position,
      status: item.status,
      joiningDate: item.joiningDate,
      activationDate: item.activationDate,
      rank: item.rank,
    }));

    setDirectTeamData(mapped);

  } catch (error) {
    console.error("Error fetching ranks:", error);
  } finally {
    setIsLoading(false);
  }
};

useEffect(() => {
  fetchAllTeamData();
}, []);

const filteredData = directTeamData.filter(member =>
  member.memberId.toLowerCase().includes(searchTerm.toLowerCase()) ||
  member.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
  member.memberEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
  member.position.toLowerCase().includes(searchTerm.toLowerCase())
);

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <div className="mb-6">
        <nav className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          <span>Home</span> / <span>Network</span> / <span className="text-gray-900 dark:text-white">Direct Team</span>
        </nav>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Direct Team</h1>
      </div>

      {/* Main Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Direct Team</h2>
            <div className="relative">
              <svg 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </div>
          </div>

          <button 
            onClick={openAddModal} 
            className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            <span>View Organizational Chart</span>
          </button>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">#</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">User ID</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Mining Package</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Position</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Status</th>
                  {/* <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Direct Team</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Total Team</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Direct Business</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Team Business</th> */}
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Rank</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Joining Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Activation Date</th>
                  {/* <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Action</th> */}
                </tr>
              </thead>
              <tbody>
                {currentData.length > 0 ? (
                  currentData.map((member, index) => (
                    <tr key={member.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{startIndex + index + 1}</td>
                      <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">{member.memberId}</td>
                      <td className="py-3 px-4 text-gray-900 dark:text-white">{member.memberName}</td>
                      {/* <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          member.miningPackage === 'Premium' 
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                            : member.miningPackage === 'Standard'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                        }`}>
                          {member.miningPackage}
                        </span>
                      </td> */}
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{member.position}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          member.status === 'Active'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {member.position}
                        </span>
                      </td>
                      {/* <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">{member.directTeam}</td>
                      <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">{member.totalTeam}</td>
                      <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">{member.directBusiness}</td>
                      <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">{member.teamBusiness}</td> */}
                      <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">{member.status}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{member.rank}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{(member.joiningDate).split('T')[0]}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{(member.activationDate).split('T')[0]}</td>
                      <td className="py-3 px-4">
                        <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                          <EyeIcon className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={14} className="py-8 text-center text-gray-500 dark:text-gray-400">
                      No data available in table
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>


          {/* Pagination */}
          <div className="flex justify-between items-center mt-6">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700 dark:text-gray-300">Row Per Page</span>
              <select
                value={rowsPerPage}
                onChange={(e) => setRowsPerPage(Number(e.target.value))}
                className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span className="text-sm text-gray-700 dark:text-gray-300">Entries</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-1 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-1 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-orange-500 h-2 rounded-full" 
                style={{ width: `${(currentPage / totalPages) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Organizational Chart Modal */}
      {showAddModal && (
        <OrgChartModal members={directTeamData} onClose={closeAddModal} />
      )}
    </div>
  );
}
