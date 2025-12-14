import api from './api';
import { API_ENDPOINTS } from '../config';

export const notificationService = {
    // Get all notifications for the current user
    getMyNotifications: async () => {
        const response = await api.get(API_ENDPOINTS.MY_NOTIFICATIONS);
        return response.data;
    },

    // Create a new notification
    createNotification: async (notificationData) => {
        const response = await api.post(`${API_ENDPOINTS.NOTIFICATIONS}/create`, notificationData);
        return response.data;
    },

    // Mark notification as read
    markAsRead: async (notificationId) => {
        const response = await api.patch(`${API_ENDPOINTS.MARK_NOTIFICATION_READ}/${notificationId}/read`);
        return response.data;
    },

    // Mark all notifications as read
    markAllAsRead: async () => {
        const response = await api.patch(API_ENDPOINTS.MARK_ALL_READ);
        return response.data;
    },

    // Delete a notification
    deleteNotification: async (notificationId) => {
        const response = await api.delete(`${API_ENDPOINTS.NOTIFICATIONS}/${notificationId}`);
        return response.data;
    },

    // Delete all notifications
    deleteAllNotifications: async () => {
        const response = await api.delete(API_ENDPOINTS.NOTIFICATIONS);
        return response.data;
    },
};
