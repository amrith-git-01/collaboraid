import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../contexts/ToastContext';
import EventHeader from '../EventHeader';
import Sidebar from '../Sidebar';
import EventFooter from '../EventFooter';
import Button from '../ui/Button';

function DashboardLayout() {
  const { user, logout, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Get current page from URL
  const getCurrentPage = () => {
    const path = location.pathname;
    if (path === '/home' || path === '/home/') {
      return 'dashboard';
    }
    // Extract page name from root-level paths like /events -> events
    const match = path.match(/^\/([^/]+)/);
    if (match) {
      const pageName = match[1];
      // Map route names to page identifiers
      const pageMap = {
        home: 'dashboard',
        events: 'events',
        calendar: 'calendar',
        analytics: 'analytics',
        settings: 'settings',
      };
      return pageMap[pageName] || 'dashboard';
    }
    return 'dashboard';
  };

  const currentPage = getCurrentPage();

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      // Auto-close sidebar on mobile when screen size changes
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Early return if user is not authenticated
  if (!isAuthenticated) {
    return null;
  }

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const handleConfirmLogout = () => {
    logout();
    showToast('Logged out successfully', 'success');
    navigate('/login');
    setShowLogoutConfirm(false);
  };

  const handleNavigation = page => {
    // Map page names to URL paths
    const pageMap = {
      dashboard: '/home',
      events: '/events',
      calendar: '/calendar',
      analytics: '/analytics',
      settings: '/settings',
    };

    const path = pageMap[page] || '/home';
    navigate(path);

    // Always close sidebar on mobile after navigation
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 flex flex-col">
      {/* Header Component */}
      <EventHeader user={user} onNavigate={handleNavigation} />

      {/* Main Content */}
      <div className="flex flex-1 relative">
        {/* Sidebar Component */}
        <Sidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          onLogout={handleLogout}
          onNavigate={handleNavigation}
          activeTab={currentPage}
          isMobile={isMobile}
        />

        {/* Main Content Area */}
        <div
          className={`flex-1 transition-all duration-200 ${
            isMobile ? 'ml-0' : 'lg:ml-20'
          }`}
        >
          <div className="p-4 sm:p-6 lg:p-8">
            <Outlet context={{ handleNavigation }} />
          </div>
        </div>
      </div>

      {/* Footer Component */}
      <EventFooter />

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Logout</h2>
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-600 mb-4">
                Are you sure you want to logout? This action cannot be undone.
              </p>
              <div className="flex space-x-3 justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  rounded="lg"
                  onClick={() => setShowLogoutConfirm(false)}
                  className="text-sm"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  rounded="lg"
                  onClick={handleConfirmLogout}
                  className="text-sm bg-red-600 hover:bg-red-700"
                >
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardLayout;
