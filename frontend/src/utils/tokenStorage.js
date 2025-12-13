/**
 * Token Storage Utility
 * Handles JWT token storage in localStorage with proper error handling
 */

const TOKEN_KEY = 'unite_auth_token';

export const tokenStorage = {
  /**
   * Store token in localStorage
   * @param {string} token - JWT token to store
   */
  setToken(token) {
    try {
      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
      } else {
        localStorage.removeItem(TOKEN_KEY);
      }
    } catch (error) {
      console.error('Error storing token:', error);
      // Handle quota exceeded or other storage errors
      throw new Error('Failed to store authentication token');
    }
  },

  /**
   * Get token from localStorage
   * @returns {string|null} - JWT token or null if not found
   */
  getToken() {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error('Error retrieving token:', error);
      return null;
    }
  },

  /**
   * Remove token from localStorage
   */
  removeToken() {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch (error) {
      console.error('Error removing token:', error);
    }
  },

  /**
   * Check if token exists
   * @returns {boolean} - True if token exists
   */
  hasToken() {
    return !!this.getToken();
  },

  /**
   * Clear all authentication data
   */
  clear() {
    this.removeToken();
  }
};

