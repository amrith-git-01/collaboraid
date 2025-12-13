import api from './api';
import { API_ENDPOINTS } from '../config';

const locationService = {
  /**
   * Search for places
   * @param {string} query - Search query
   * @param {number} limit - Maximum results (default: 5)
   * @returns {Promise<Array>} Array of place results
   */
  searchPlaces: async (query, limit = 5) => {
    try {
      const response = await api.get(
        `${API_ENDPOINTS.LOCATION}/search`,
        {
          params: {
            q: query,
            limit: limit,
          },
        }
      );

      if (response.data.status === 'success') {
        return response.data.data.places || [];
      }

      console.warn('Location search returned non-success status:', response.data);
      return [];
    } catch (error) {
      console.error('Location search error:', error);
      throw error;
    }
  },
};

export default locationService;

