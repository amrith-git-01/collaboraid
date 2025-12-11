import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useSelector } from 'react-redux';
import Loader from '../ui/Loader';

/**
 * RootRedirect - Handles root path redirect based on authentication status
 */
const RootRedirect = () => {
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

  // Redirect based on authentication status
  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  // Not authenticated, redirect to login
  return <Navigate to="/login" replace />;
};

export default RootRedirect;

