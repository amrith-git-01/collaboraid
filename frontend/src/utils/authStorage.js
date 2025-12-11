/**
 * Auth Storage Utility
 * Handles persisting user object in localStorage
 */

const USER_KEY = 'collaboraid_auth_user';

export const authStorage = {
  setUser(user) {
    try {
      if (user) {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(USER_KEY);
      }
    } catch (error) {
      console.error('Error storing user:', error);
    }
  },

  getUser() {
    try {
      const value = localStorage.getItem(USER_KEY);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Error retrieving user:', error);
      return null;
    }
  },

  removeUser() {
    try {
      localStorage.removeItem(USER_KEY);
    } catch (error) {
      console.error('Error removing user:', error);
    }
  },

  clear() {
    this.removeUser();
  },
};

