import { useAuth } from "../context/AuthContext";

export default function AuthTest() {
  const { user, isAuthenticated, isLoading, isAdmin } = useAuth();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10 bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading authentication status...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10 bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-white mb-2">Not Authenticated</h2>
          <p className="text-gray-400 mb-4">Please log in to view this page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10 bg-gray-900 min-h-screen">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-md2 font-semibold text-white">
          Authentication Test
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Information */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <h3 className="text-white font-bold text-xl mb-4">User Information</h3>
          <div className="space-y-3">
            <div>
              <span className="text-gray-400">Name:</span>
              <span className="text-white ml-2">{user?.name || 'N/A'}</span>
            </div>
            <div>
              <span className="text-gray-400">Email:</span>
              <span className="text-white ml-2">{user?.email || 'N/A'}</span>
            </div>
            <div>
              <span className="text-gray-400">Username:</span>
              <span className="text-white ml-2">{user?.username || 'N/A'}</span>
            </div>
            <div>
              <span className="text-gray-400">User ID:</span>
              <span className="text-white ml-2">{user?.userPkId || 'N/A'}</span>
            </div>
            <div>
              <span className="text-gray-400">Country:</span>
              <span className="text-white ml-2">{user?.country || 'N/A'}</span>
            </div>
            <div>
              <span className="text-gray-400">Mobile:</span>
              <span className="text-white ml-2">{user?.mobile || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Admin Status */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <h3 className="text-white font-bold text-xl mb-4">Admin Status</h3>
          <div className="space-y-3">
            <div className="flex items-center">
              <span className="text-gray-400">Is Admin:</span>
              <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${
                isAdmin 
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}>
                {isAdmin ? 'YES' : 'NO'}
              </span>
            </div>
            <div>
              <span className="text-gray-400">Roles:</span>
              <div className="ml-2 mt-1">
                {user?.roles && user.roles.length > 0 ? (
                  user.roles.map((role, index) => (
                    <span key={index} className="inline-block bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-sm mr-1 mb-1">
                      {role.name}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400 text-sm">No roles assigned</span>
                )}
              </div>
            </div>
            <div>
              <span className="text-gray-400">Authorities:</span>
              <div className="ml-2 mt-1">
                {user?.authorities && user.authorities.length > 0 ? (
                  user.authorities.map((auth, index) => (
                    <span key={index} className="inline-block bg-purple-500/20 text-purple-400 px-2 py-1 rounded text-sm mr-1 mb-1">
                      {auth.authority}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400 text-sm">No authorities assigned</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Access Information */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 md:col-span-2">
          <h3 className="text-white font-bold text-xl mb-4">Access Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-gray-300 font-medium mb-2">Regular User Access:</h4>
              <ul className="text-gray-400 text-sm space-y-1">
                <li className={!isAdmin ? 'text-green-400' : 'text-gray-500'}>
                  {!isAdmin ? '✅' : '❌'} Dashboard
                </li>
                <li className={!isAdmin ? 'text-green-400' : 'text-gray-500'}>
                  {!isAdmin ? '✅' : '❌'} Profile Settings
                </li>
                <li className={!isAdmin ? 'text-green-400' : 'text-gray-500'}>
                  {!isAdmin ? '✅' : '❌'} Wallet Management
                </li>
                <li className={!isAdmin ? 'text-green-400' : 'text-gray-500'}>
                  {!isAdmin ? '✅' : '❌'} Service Packages
                </li>
                <li className={!isAdmin ? 'text-green-400' : 'text-gray-500'}>
                  {!isAdmin ? '✅' : '❌'} Mining Packages
                </li>
                <li className={!isAdmin ? 'text-green-400' : 'text-gray-500'}>
                  {!isAdmin ? '✅' : '❌'} Network Management
                </li>
                <li className={!isAdmin ? 'text-green-400' : 'text-gray-500'}>
                  {!isAdmin ? '✅' : '❌'} Income Tracking
                </li>
                <li className={!isAdmin ? 'text-green-400' : 'text-gray-500'}>
                  {!isAdmin ? '✅' : '❌'} Financial Reports
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-gray-300 font-medium mb-2">Admin Access:</h4>
              <ul className="text-gray-400 text-sm space-y-1">
                <li className={isAdmin ? 'text-green-400' : 'text-gray-500'}>
                  {isAdmin ? '✅' : '❌'} Admin Dashboard
                </li>
                <li className={isAdmin ? 'text-green-400' : 'text-gray-500'}>
                  {isAdmin ? '✅' : '❌'} System Management
                </li>
                <li className={isAdmin ? 'text-green-400' : 'text-gray-500'}>
                  {isAdmin ? '✅' : '❌'} User Management
                </li>
                <li className={isAdmin ? 'text-green-400' : 'text-gray-500'}>
                  {isAdmin ? '✅' : '❌'} Analytics & Reports
                </li>
                <li className={isAdmin ? 'text-green-400' : 'text-gray-500'}>
                  {isAdmin ? '✅' : '❌'} Manage Ranks
                </li>
                <li className={isAdmin ? 'text-green-400' : 'text-gray-500'}>
                  {isAdmin ? '✅' : '❌'} Manage Income Types
                </li>
                <li className={isAdmin ? 'text-green-400' : 'text-gray-500'}>
                  {isAdmin ? '✅' : '❌'} All Users
                </li>
                <li className={isAdmin ? 'text-green-400' : 'text-gray-500'}>
                  {isAdmin ? '✅' : '❌'} System Configuration
                </li>
              </ul>
            </div>
          </div>
          
          {/* Current User Type */}
          <div className="mt-6 p-4 bg-gray-900 rounded-lg">
            <h5 className="text-gray-300 font-medium mb-2">Current User Type:</h5>
            <div className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
              isAdmin 
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' 
                : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
            }`}>
              {isAdmin ? '🔑 ADMIN USER' : '👤 REGULAR USER'}
            </div>
            <p className="text-gray-400 text-sm mt-2">
              {isAdmin 
                ? 'You have administrative privileges and can access admin-only features.'
                : 'You have regular user privileges and can access standard features.'
              }
            </p>
          </div>
        </div>

        {/* Raw User Data */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 md:col-span-2">
          <h3 className="text-white font-bold text-xl mb-4">Raw User Data</h3>
          <pre className="bg-gray-900 p-4 rounded-lg text-gray-300 text-sm overflow-x-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
