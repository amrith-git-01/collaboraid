import { useAuth } from '../hooks/useAuth';
import { useState, useEffect } from 'react';
import { useToastNavigation } from '../hooks/useToastNavigation';

function Dashboard() {
  const { user, logout, isAuthenticated } = useAuth();
  const { navigateIfNoToast, canNavigate } = useToastNavigation();

  // Early return if user is not authenticated - this prevents the component from rendering
  if (!isAuthenticated) {
    return null;
  }

  const handleLogout = () => {
    // Remove the popstate event listener before navigating
    window.removeEventListener('popstate', () => {});

    // Clear the navigation isolation
    window.history.pushState(null, '', '/');

    // Logout and navigate to home
    logout();
    navigateIfNoToast('/');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1.5">
          Events Dashboard
        </h1>
        <p className="text-base text-gray-600">
          Welcome to your events management center
        </p>
      </div>

      {/* Dashboard Content */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg
              className="w-10 h-10 text-purple-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Welcome to Events
          </h3>
          <p className="text-base text-gray-600 mb-6 max-w-md mx-auto">
            This is your events dashboard. You can navigate to different
            sections using the sidebar menu.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
