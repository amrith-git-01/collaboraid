import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useSelector } from 'react-redux';
import Loader from '../ui/Loader';

/**
 * PublicRoute - Redirects authenticated users away from public routes (like login)
 * Only allows access if user is NOT authenticated
 */
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const authChecked = useSelector(state => state.auth.authChecked);

  // Wait for auth check to complete
  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader size="lg" />
        <span className="ml-3 text-gray-600">Checking authentication...</span>
      </div>
    );
  }

  // If authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  // User is not authenticated, allow access to public route
  return children;
};

export default PublicRoute;

