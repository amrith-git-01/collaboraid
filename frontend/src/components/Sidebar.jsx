import { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Home,
} from 'lucide-react';

function Sidebar({
  sidebarOpen,
  setSidebarOpen,
  onLogout,
  onNavigate,
  activeTab,
  isMobile = false,
}) {
  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = event => {
      const sidebar = document.querySelector('[data-sidebar]');
      const sidebarToggle = document.querySelector('[data-sidebar-toggle]');

      if (
        sidebar &&
        !sidebar.contains(event.target) &&
        sidebarToggle &&
        !sidebarToggle.contains(event.target) &&
        sidebarOpen
      ) {
        setSidebarOpen(false);
      }
    };

    // Close sidebar when scrolling (only on mobile)
    const handleScroll = () => {
      if (sidebarOpen && isMobile) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('scroll', handleScroll);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('scroll', handleScroll);
    };
  }, [sidebarOpen, setSidebarOpen, isMobile]);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  const handleNavigation = page => {
    if (onNavigate) {
      onNavigate(page);
    }
  };

  return (
    <>
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 bg-white shadow-lg overflow-hidden ${
          isMobile ? 'block' : 'hidden lg:block'
        }`}
        style={{
          top: '80px',
          width: sidebarOpen ? '256px' : isMobile ? '0px' : '80px',
          left: isMobile && !sidebarOpen ? '-100%' : '0',
          transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          transform:
            isMobile && !sidebarOpen ? 'translateX(-100%)' : 'translateX(0)',
        }}
        data-sidebar
      >
        <div
          className={`h-full flex flex-col transition-all duration-500 ease-out ${
            isMobile && !sidebarOpen
              ? 'opacity-0 scale-95'
              : 'opacity-100 scale-100'
          }`}
        >
          {/* Menu Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              {sidebarOpen ? (
                <>
                  <h3 className="text-lg font-semibold text-gray-900 transition-opacity duration-200 ml-3">
                    Menu
                  </h3>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-1 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                    data-sidebar-toggle
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                  </button>
                </>
              ) : (
                <div className="w-full flex justify-center">
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="p-1 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                    data-sidebar-toggle
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex-1 p-4">
            <div
              className={`space-y-2 transition-all duration-500 ease-out ${
                isMobile && !sidebarOpen
                  ? 'opacity-0 translate-y-4'
                  : 'opacity-100 translate-y-0'
              }`}
            >
              <div
                className={`rounded-lg transition-colors duration-200 flex items-center cursor-pointer relative ${
                  sidebarOpen ? 'p-3 space-x-3' : 'p-3 justify-center'
                } ${
                  activeTab === 'dashboard'
                    ? 'bg-purple-50 text-purple-700 border border-purple-200'
                    : 'text-gray-600 hover:bg-gray-50'
                } ${!sidebarOpen ? 'hover:scale-105 transition-all duration-200' : ''}`}
                onClick={() => handleNavigation('dashboard')}
              >
                <Home
                  className={`w-5 h-5 flex-shrink-0 ${
                    activeTab === 'dashboard'
                      ? 'text-purple-700'
                      : 'text-gray-600'
                  }`}
                />
                <span
                  className={`transition-all duration-200 ease-out ${
                    sidebarOpen
                      ? 'opacity-100 ml-0'
                      : 'opacity-0 absolute left-0 w-0 overflow-hidden'
                  }`}
                >
                  Dashboard
                </span>
              </div>
              <div
                className={`rounded-lg transition-colors duration-200 flex items-center cursor-pointer relative ${
                  sidebarOpen ? 'p-3 space-x-3' : 'p-3 justify-center'
                } ${
                  activeTab === 'events'
                    ? 'bg-purple-50 text-purple-700 border border-purple-200'
                    : 'text-gray-600 hover:bg-gray-50'
                } ${!sidebarOpen ? 'hover:scale-105 transition-all duration-200' : ''}`}
                onClick={() => handleNavigation('events')}
              >
                <Calendar
                  className={`w-5 h-5 flex-shrink-0 ${
                    activeTab === 'events' ? 'text-purple-700' : 'text-gray-600'
                  }`}
                />
                <span
                  className={`transition-all duration-200 ease-out ${
                    sidebarOpen
                      ? 'opacity-100 ml-0'
                      : 'opacity-0 absolute left-0 w-0 overflow-hidden'
                  }`}
                >
                  Events
                </span>
              </div>
              <div
                className={`rounded-lg transition-colors duration-200 flex items-center cursor-pointer relative ${
                  sidebarOpen ? 'p-3 space-x-3' : 'p-3 justify-center'
                } ${
                  activeTab === 'calendar'
                    ? 'bg-purple-50 text-purple-700 border border-purple-200'
                    : 'text-gray-600 hover:bg-gray-50'
                } ${!sidebarOpen ? 'hover:scale-105 transition-all duration-200' : ''}`}
                onClick={() => handleNavigation('calendar')}
              >
                <Clock
                  className={`w-5 h-5 flex-shrink-0 ${
                    activeTab === 'calendar'
                      ? 'text-purple-700'
                      : 'text-gray-600'
                  }`}
                />
                <span
                  className={`transition-all duration-200 ease-out ${
                    sidebarOpen
                      ? 'opacity-100 ml-0'
                      : 'opacity-0 absolute left-0 w-0 overflow-hidden'
                  }`}
                >
                  Calendar
                </span>
              </div>
              <div
                className={`rounded-lg transition-colors duration-200 flex items-center cursor-pointer relative ${
                  sidebarOpen ? 'p-3 space-x-3' : 'p-3 justify-center'
                } ${
                  activeTab === 'analytics'
                    ? 'bg-purple-50 text-purple-700 border border-purple-200'
                    : 'text-gray-600 hover:bg-gray-50'
                } ${!sidebarOpen ? 'hover:scale-105 transition-all duration-200' : ''}`}
                onClick={() => handleNavigation('analytics')}
              >
                <BarChart3
                  className={`w-5 h-5 flex-shrink-0 ${
                    activeTab === 'analytics'
                      ? 'text-purple-700'
                      : 'text-gray-600'
                  }`}
                />
                <span
                  className={`transition-all duration-200 ease-out ${
                    sidebarOpen
                      ? 'opacity-100 ml-0'
                      : 'opacity-0 absolute left-0 w-0 overflow-hidden'
                  }`}
                >
                  Analytics
                </span>
              </div>
              <div
                className={`rounded-lg transition-colors duration-200 flex items-center cursor-pointer relative ${
                  sidebarOpen ? 'p-3 space-x-3' : 'p-3 justify-center'
                } ${
                  activeTab === 'settings'
                    ? 'bg-purple-50 text-purple-700 border border-purple-200'
                    : 'text-gray-600 hover:bg-gray-50'
                } ${!sidebarOpen ? 'hover:scale-105 transition-all duration-200' : ''}`}
                onClick={() => handleNavigation('settings')}
              >
                <Settings
                  className={`w-5 h-5 flex-shrink-0 ${
                    activeTab === 'settings'
                      ? 'text-purple-700'
                      : 'text-gray-600'
                  }`}
                />
                <span
                  className={`transition-all duration-200 ease-out ${
                    sidebarOpen
                      ? 'opacity-100 ml-0'
                      : 'opacity-0 absolute left-0 w-0 overflow-hidden'
                  }`}
                >
                  Settings
                </span>
              </div>
            </div>
          </div>

          {/* Logout Section */}
          <div
            className={`p-4 border-t border-gray-200 transition-all duration-500 ease-out ${
              isMobile && !sidebarOpen
                ? 'opacity-0 translate-y-4'
                : 'opacity-100 translate-y-0'
            }`}
          >
            <button
              onClick={handleLogout}
              className={`flex items-center w-full rounded-lg text-red-600 hover:bg-red-50 transition-colors duration-200 relative ${
                sidebarOpen ? 'p-3 space-x-2' : 'p-3 justify-center'
              } ${!sidebarOpen ? 'hover:scale-105 transition-all duration-200' : ''}`}
            >
              <LogOut className="w-5 h-5 flex-shrink-0 text-red-600" />
              <span
                className={`text-red-600 transition-all duration-200 ease-out ${
                  sidebarOpen
                    ? 'opacity-100 ml-0'
                    : 'opacity-0 absolute left-0 w-0 overflow-hidden'
                }`}
              >
                Logout
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Toggle Button - Only show when sidebar is closed */}
      {isMobile && (
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={`fixed top-24 left-4 z-50 lg:hidden p-2 bg-white rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50 transition-all duration-500 ease-out ${
            sidebarOpen
              ? 'opacity-0 scale-75 pointer-events-none'
              : 'opacity-100 scale-100'
          }`}
          data-sidebar-toggle
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      )}

      {/* Overlay for sidebar */}
      {isMobile && (
        <div
          className={`fixed inset-0 bg-black z-30 lg:hidden transition-all duration-300 ease-out ${
            sidebarOpen
              ? 'bg-opacity-50 pointer-events-auto'
              : 'bg-opacity-0 pointer-events-none'
          }`}
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
}

export default Sidebar;
