import api from './api';
import { API_ENDPOINTS } from '../config';

export const userService = {
    async updateProfile(profileData) {
        try {
            const response = await api.patch(API_ENDPOINTS.UPDATE_ME, profileData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    async updatePassword(passwordData) {
        try {
            const response = await api.patch(API_ENDPOINTS.UPDATE_PASSWORD, passwordData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    async forgotPassword(email) {
        try {
            const response = await api.post(API_ENDPOINTS.FORGOT_PASSWORD, { email });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    async resetPassword(token, passwordData) {
        try {
            const response = await api.patch(`${API_ENDPOINTS.RESET_PASSWORD}/${token}`, passwordData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    async getCurrentUser() {
        try {
            const response = await api.get(API_ENDPOINTS.GET_CURRENT_USER);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};
