import axios from "axios";
import { tokenStorage } from "../utils/tokenStorage";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Request interceptor - Add token to Authorization header
api.interceptors.request.use(
    (config) => {
        const token = tokenStorage.getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle 401 errors and token expiration
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle 401 Unauthorized errors
        if (error.response?.status === 401) {
            // Clear token on authentication failure
            tokenStorage.removeToken();
            
            // Dispatch event for AuthCheck component to handle logout
            // This prevents immediate redirect and lets the app handle it gracefully
            window.dispatchEvent(new CustomEvent('auth:logout', { 
                detail: { reason: 'unauthorized' } 
            }));
        }
        
        return Promise.reject(error);
    }
);

export default api;