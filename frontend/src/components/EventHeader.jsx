import { Bell, User } from 'lucide-react';

function EventHeader({ user, onNavigate }) {

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Left Side - Logo & Brand */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg sm:text-xl">
                  C
                </span>
              </div>
              <span className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">
                Collaboraid
              </span>
            </div>
          </div>

          {/* Right Side - User & Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Notifications */}
            <button className="p-1.5 sm:p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-all duration-200 hover:scale-105 relative">
              <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full animate-pulse"></span>
            </button>

            {/* User Menu */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm sm:text-base font-medium text-gray-900">
                  Hello, {user?.name || 'User'}
                </p>
              </div>
              <div className="relative">
                {user?.profilePhoto ? (
                  <img
                    src={user.profilePhoto}
                    alt="Profile"
                    onClick={() => onNavigate && onNavigate('settings')}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-gray-200 shadow-md hover:shadow-xl hover:scale-110 transition-all duration-300 cursor-pointer"
                  />
                ) : (
                  <div
                    onClick={() => onNavigate && onNavigate('settings')}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 border-2 border-gray-200 shadow-md hover:shadow-xl hover:scale-110 transition-all duration-300 cursor-pointer flex items-center justify-center"
                  >
                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default EventHeader;
