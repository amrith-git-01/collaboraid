import api from './api';
import { API_ENDPOINTS } from '../config';
import { tokenStorage } from '../utils/tokenStorage';
import { authStorage } from '../utils/authStorage';

// Cache for getCurrentUser to prevent duplicate calls
let currentUserCache = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5000; // 5 seconds cache

export const authService = {
    async login(credentials) {
        const response = await api.post(API_ENDPOINTS.LOGIN, credentials);
        // Store token in localStorage
        if (response.data?.token) {
            tokenStorage.setToken(response.data.token);
        }
        // Persist user for quick rehydration
        if (response.data?.user) {
            authStorage.setUser(response.data.user);
        }
        // Clear cache when logging in
        currentUserCache = null;
        cacheTimestamp = 0;
        return response.data; // Return response.data instead of full response
    },

    async register(userData) {
        const response = await api.post(API_ENDPOINTS.REGISTER, userData);
        // Store token in localStorage
        if (response.data?.token) {
            tokenStorage.setToken(response.data.token);
        }
        // Persist user for quick rehydration
        if (response.data?.user) {
            authStorage.setUser(response.data.user);
        }
        // Clear cache when registering
        currentUserCache = null;
        cacheTimestamp = 0;
        return response.data; // Return response.data instead of full response
    },

    async logout() {
        try {
            const response = await api.post(API_ENDPOINTS.LOGOUT);
            // Clear token from localStorage
            tokenStorage.removeToken();
            authStorage.removeUser();
            // Clear cache when logging out
            currentUserCache = null;
            cacheTimestamp = 0;
            return response.data; // Return response.data instead of full response
        } catch (error) {
            // Even if logout API fails, clear local token
            tokenStorage.removeToken();
            authStorage.removeUser();
            currentUserCache = null;
            cacheTimestamp = 0;
            throw error;
        }
    },

    async getCurrentUser() {
        // Check if we have a valid cached response
        const now = Date.now();
        if (currentUserCache && (now - cacheTimestamp) < CACHE_DURATION) {
            return currentUserCache;
        }

        try {
            const response = await api.get(API_ENDPOINTS.GET_CURRENT_USER);
            // Cache the successful response
            currentUserCache = response.data; // Cache response.data instead of full response
            cacheTimestamp = now;
            return response.data; // Return response.data instead of full response
        } catch (error) {
            // Don't cache errors
            currentUserCache = null;
            cacheTimestamp = 0;
            throw error;
        }
    },

    // Method to manually clear cache (useful for testing or manual refresh)
    clearCache() {
        currentUserCache = null;
        cacheTimestamp = 0;
    }
};