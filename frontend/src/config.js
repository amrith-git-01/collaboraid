// Backend API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5151';

// API Endpoints
export const API_ENDPOINTS = {
    CONTACT: `${API_BASE_URL}/collaboraid/api/contact/send`,

    LOGIN: `${API_BASE_URL}/collaboraid/api/users/login`,

    REGISTER: `${API_BASE_URL}/collaboraid/api/users/register`,

    LOGOUT: `${API_BASE_URL}/collaboraid/api/users/logout`,

    GET_CURRENT_USER: `${API_BASE_URL}/collaboraid/api/users/me`,

    UPDATE_ME: `${API_BASE_URL}/collaboraid/api/users/updateMe`,

    UPDATE_PASSWORD: `${API_BASE_URL}/collaboraid/api/users/updatePassword`,

    FORGOT_PASSWORD: `${API_BASE_URL}/collaboraid/api/users/forgotPassword`,

    RESET_PASSWORD: `${API_BASE_URL}/collaboraid/api/users/resetPassword`,

    EVENTS: `${API_BASE_URL}/collaboraid/api/events`,
};
