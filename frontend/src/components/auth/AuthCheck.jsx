import { useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/authService';
import { useDispatch } from 'react-redux';
import { markAuthChecked, clearAuthState } from '../../store/authSlice';
import {
  fetchMyOrganization,
  setOrganization,
  clearOrganization,
} from '../../store/organizationSlice';
import { fetchAllEvents, fetchUserEvents } from '../../store/eventsSlice';
import { tokenStorage } from '../../utils/tokenStorage';
import { authStorage } from '../../utils/authStorage';

const AuthCheck = () => {
  const { setUser, isAuthenticated, authChecked } = useAuth();
  const dispatch = useDispatch();
  const hasCheckedRef = useRef(false);

  useEffect(() => {
    // Only run once and skip if already checked
    if (hasCheckedRef.current || authChecked) {
      return;
    }

    const checkAuth = async () => {
      // Check if token exists in localStorage
      const token = tokenStorage.getToken();
      const storedUser = authStorage.getUser();
      
      if (!token) {
        // No token, mark as checked and return
        dispatch(markAuthChecked());
        hasCheckedRef.current = true;
        return;
      }

      // Optimistically set user from storage to avoid flash of unauthenticated
      if (storedUser) {
        dispatch(setUser(storedUser));
      }

      // Token exists, validate it with the server
      try {
        // Set a timeout to prevent hanging requests
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Request timeout')), 10000)
        );

        const response = await Promise.race([
          authService.getCurrentUser(),
          timeoutPromise,
        ]);

        if (response && response.user) {
          // User is authenticated, update Redux store
          dispatch(setUser(response.user));
          authStorage.setUser(response.user);

          // Fetch organization if available in response, otherwise fetch separately
          if (response.organization) {
            dispatch(setOrganization(response.organization));
          } else {
            // Fetch organization separately
            try {
              await dispatch(fetchMyOrganization()).unwrap();
            } catch (orgError) {
              // Organization fetch failed, but don't block auth check
              console.log('Organization fetch failed:', orgError);
              dispatch(clearOrganization());
            }
          }

          // Fetch events when user logs in
          try {
            await Promise.all([
              dispatch(fetchAllEvents()),
              dispatch(fetchUserEvents()),
            ]);
          } catch (eventError) {
            // Events fetch failed, but don't block auth check
            console.log('Events fetch failed:', eventError);
          }
        } else {
          // No user found, clear token and mark auth check as complete
          tokenStorage.removeToken();
          authStorage.removeUser();
          dispatch(clearOrganization());
          dispatch(markAuthChecked());
        }
      } catch (error) {
        // User is not authenticated or request failed
        // Clear invalid/expired token
        if (
          error.response?.status === 401 ||
          error.message === 'Request timeout'
        ) {
          tokenStorage.removeToken();
          authStorage.removeUser();
          dispatch(clearOrganization());
        }
        console.log('Auth check completed:', error.message || 'Unknown error');
        // Mark auth check as complete even on error
        dispatch(markAuthChecked());
      } finally {
        hasCheckedRef.current = true;
      }
    };

    // Run auth check immediately
    checkAuth();
  }, [dispatch, authChecked, setUser]);

  // Listen for logout events from API interceptor
  useEffect(() => {
    const handleLogout = () => {
      dispatch(clearAuthState());
      dispatch(clearOrganization());
      // Optionally redirect to login page
      if (
        window.location.pathname !== '/login' &&
        window.location.pathname !== '/register'
      ) {
        window.location.href = '/login';
      }
    };

    window.addEventListener('auth:logout', handleLogout);
    return () => {
      window.removeEventListener('auth:logout', handleLogout);
    };
  }, [dispatch]);

  // This component doesn't render anything
  return null;
};

export default AuthCheck;
