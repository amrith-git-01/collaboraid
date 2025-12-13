import api from './api';
import { API_ENDPOINTS } from '../config';

export const organizationService = {
    // Create a new organization
    createOrganization: async (organizationData) => {
        try {
            const response = await api.post(
                `${API_ENDPOINTS.ORGANIZATIONS}/create`,
                organizationData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error creating organization:', error);
            throw error;
        }
    },

    // Get user's organization (where user is creator)
    getMyOrganization: async () => {
        try {
            const response = await api.get(`${API_ENDPOINTS.ORGANIZATIONS}/myOrganization`);
            return response.data;
        } catch (error) {
            console.error('Error fetching organization:', error);
            throw error;
        }
    },

    // Get organization by ID (if user is a member)
    getOrganizationById: async (id) => {
        try {
            const response = await api.get(`${API_ENDPOINTS.ORGANIZATIONS}/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching organization:', error);
            throw error;
        }
    },

    // Update organization
    updateOrganization: async (id, organizationData) => {
        try {
            const response = await api.patch(
                `${API_ENDPOINTS.ORGANIZATIONS}/${id}`,
                organizationData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error updating organization:', error);
            throw error;
        }
    },

    // Delete organization
    deleteOrganization: async (id) => {
        try {
            const response = await api.delete(`${API_ENDPOINTS.ORGANIZATIONS}/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting organization:', error);
            throw error;
        }
    },
};
