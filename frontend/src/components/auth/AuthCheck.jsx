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
import { fetchNotifications } from '../../store/notificationsSlice';
import { tokenStorage } from '../../utils/tokenStorage';
import { authStorage } from '../../utils/authStorage';

const AuthCheck = () => {
  const { setUser, isAuthenticated, authChecked } = useAuth();
  const dispatch = useDispatch();
  const hasCheckedRef = useRef(false);
  const hasFetchedOnRefreshRef = useRef(false);

  useEffect(() => {
    // Only run auth validation once and skip if already checked
    if (hasCheckedRef.current || authChecked) {
      // Even if auth is already checked, we still need to fetch data on refresh
      // This ensures organization, events, and members are always up-to-date
      const token = tokenStorage.getToken();
      if (token && isAuthenticated && !hasFetchedOnRefreshRef.current) {
        // Fetch data on refresh even if auth was already checked (only once per mount)
        hasFetchedOnRefreshRef.current = true;
        const fetchDataOnRefresh = async () => {
          try {
            // Fetch organization with members
            await dispatch(fetchMyOrganization()).unwrap();
            // Fetch events
            await Promise.all([
              dispatch(fetchAllEvents()).unwrap(),
              dispatch(fetchUserEvents()).unwrap(),
              dispatch(fetchNotifications()).unwrap(),
            ]);
          } catch (error) {
            console.log('Data fetch on refresh failed:', error);
          }
        };
        fetchDataOnRefresh();
      }
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

          // Always fetch organization during auth check to ensure it's available before navigation
          // This improves UX by having organization data ready when user navigates to Events page
          // If organization is in response, set it immediately, but still fetch to ensure latest data
          if (response.organization) {
            // Set organization from response immediately for quick UI update
            dispatch(setOrganization(response.organization));
          }

          // Always fetch organization to ensure we have the latest data
          // This runs even if organization was in response to get latest members, etc.
          try {
            const orgResult = await dispatch(fetchMyOrganization()).unwrap();
            // If organization is null, explicitly clear it
            if (!orgResult?.data?.organization) {
              dispatch(clearOrganization());
            }
          } catch (orgError) {
            // Organization fetch failed, but don't block auth check
            console.log('Organization fetch failed:', orgError);
            dispatch(clearOrganization());
          }

          // Fetch events when user logs in
          try {
            await Promise.all([
              dispatch(fetchAllEvents()).unwrap(),
              dispatch(fetchUserEvents()).unwrap(),
              dispatch(fetchNotifications()).unwrap(),
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
  }, [dispatch, authChecked, setUser, isAuthenticated]);

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
