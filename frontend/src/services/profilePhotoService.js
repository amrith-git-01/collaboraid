import { authService } from './authService';

const API_BASE_URL = 'http://localhost:5151/collaboraid/api';

export const profilePhotoService = {
    async uploadProfilePhoto(file) {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch(`${API_BASE_URL}/profile-photo/upload`, {
                method: 'POST',
                credentials: 'include', // Include cookies for authentication
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Upload failed');
            }

            const result = await response.json();
            return result.data;
        } catch (error) {
            console.error('Profile photo upload error:', error);
            throw error;
        }
    },

    async removeProfilePhoto() {
        try {
            const response = await fetch(`${API_BASE_URL}/profile-photo/remove`, {
                method: 'DELETE',
                credentials: 'include', // Include cookies for authentication
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Remove failed');
            }

            const result = await response.json();
            return result.data;
        } catch (error) {
            console.error('Profile photo remove error:', error);
            throw error;
        }
    }
};
