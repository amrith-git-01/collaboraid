import { API_BASE_URL } from '../config';

const locationService = {
  /**
   * Search for places
   * @param {string} query - Search query
   * @param {number} limit - Maximum results (default: 5)
   * @returns {Promise<Array>} Array of place results
   */
  searchPlaces: async (query, limit = 5) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/collaboraid/api/location/search?q=${encodeURIComponent(query)}&limit=${limit}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // This sends cookies automatically
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to search locations');
      }

      const data = await response.json();

      if (data.status === 'success') {
        return data.data.places || [];
      }

      return [];
    } catch (error) {
      throw error;
    }
  },
};

export default locationService;

