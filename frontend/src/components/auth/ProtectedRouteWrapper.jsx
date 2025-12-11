import { useAuth } from '../../hooks/useAuth';
import { useSelector } from 'react-redux';
import Loader from '../ui/Loader';
import NotAuthenticated from './NotAuthenticated';

const ProtectedRouteWrapper = ({ children, showLoading = true }) => {
  const { isAuthenticated } = useAuth();
  const authChecked = useSelector(state => state.auth.authChecked);

  // Wait for AuthCheck to complete before making decisions
  if (!authChecked) {
    if (!showLoading) {
      return null;
    }
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader size="lg" />
        <span className="ml-3 text-gray-600">Checking authentication...</span>
      </div>
    );
  }

  // Now make authentication decision after AuthCheck has run
  if (!isAuthenticated) {
    // Show the NotAuthenticated page instead of redirecting
    return <NotAuthenticated />;
  }

  // Only render children if we're absolutely sure the user is authenticated
  return children;
};

export default ProtectedRouteWrapper;
