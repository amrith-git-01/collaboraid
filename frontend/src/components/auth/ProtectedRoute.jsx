import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import ProtectedRouteWrapper from './ProtectedRouteWrapper';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();

  // List of protected dashboard routes
  const protectedRoutes = [
    '/home',
    '/events',
    '/calendar',
    '/analytics',
    '/settings',
  ];

  // If we're not on a protected route, don't render this component
  if (!protectedRoutes.includes(location.pathname)) {
    return null;
  }

  // Use the generic ProtectedRouteWrapper for authentication
  return <ProtectedRouteWrapper>{children}</ProtectedRouteWrapper>;
};

export default ProtectedRoute;
