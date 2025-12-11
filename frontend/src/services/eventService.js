import api from './api';
import { API_ENDPOINTS } from '../config';

export const eventService = {
    // Create a new event
    createEvent: async (eventData) => {
        try {
            // Clean the event data
            const cleanedData = { ...eventData };

            // Clean the event data (no internal fields to remove for preset images)

            // Validate that we have both image fields
            if (!cleanedData.eventImage || !cleanedData.eventImageName) {
                throw new Error('Event image is required');
            }

            // Send JSON data since we're not uploading files
            console.log('Sending event data to backend:', cleanedData);
            const response = await api.post(
                `${API_ENDPOINTS.EVENTS}/create`,
                cleanedData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            return response.data;
        } catch (error) {
            console.error('Error creating event:', error);
            throw error;
        }
    },

    // Get all events (with optional filters)
    getAllEvents: async (filters = {}) => {
        const params = new URLSearchParams();
        Object.keys(filters).forEach(key => {
            if (filters[key] !== undefined && filters[key] !== '') {
                params.append(key, filters[key]);
            }
        });

        const response = await api.get(`${API_ENDPOINTS.EVENTS}/getAllEvents?${params.toString()}`);
        return response.data;
    },

    // Get a specific event by ID
    getEvent: async (eventId) => {
        const response = await api.get(`${API_ENDPOINTS.EVENTS}/${eventId}`);
        return response.data;
    },

    // Get events created by the current user
    getMyEvents: async () => {
        const response = await api.get(`${API_ENDPOINTS.EVENTS}/getMyEvents`);
        return response.data;
    },

    // Get events the user has joined
    getJoinedEvents: async () => {
        const response = await api.get(`${API_ENDPOINTS.EVENTS}/getJoinedEvents`);
        return response.data;
    },

    // Get deleted events created by the current user
    getDeletedEvents: async () => {
        const response = await api.get(`${API_ENDPOINTS.EVENTS}/getDeletedEvents`);
        return response.data;
    },

    // Join an event
    joinEvent: async (eventId, joinCode = null) => {
        const data = {};
        if (joinCode) {
            data.joinCode = joinCode;
        }
        const response = await api.post(`${API_ENDPOINTS.EVENTS}/${eventId}/join`, data);
        return response.data;
    },

    // Leave an event
    leaveEvent: async (eventId) => {
        const response = await api.post(`${API_ENDPOINTS.EVENTS}/${eventId}/leave`);
        return response.data;
    },

    // Update an event
    updateEvent: async (eventId, eventData) => {
        const response = await api.patch(`${API_ENDPOINTS.EVENTS}/${eventId}`, eventData);
        return response.data;
    },

    // Delete an event
    deleteEvent: async (eventId, reason) => {
        const response = await api.delete(`${API_ENDPOINTS.EVENTS}/${eventId}`, {
            data: { reason }
        });
        return response.data;
    }
};
