const { LocationClient, SearchPlaceIndexForTextCommand } = require('@aws-sdk/client-location');
const AppError = require('../utils/appError');

// Initialize Location Client
const locationClient = new LocationClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

/**
 * Search for places using AWS Location Service
 * @param {string} text - Search query
 * @param {number} maxResults - Maximum number of results (default: 5)
 * @returns {Promise<Array>} Array of place results
 */
const searchPlaces = async (text, maxResults = 5) => {
    try {
        if (!text || text.trim().length < 2) {
            return [];
        }

        // Verify environment variables
        if (!process.env.AWS_LOCATION_PLACE_INDEX_NAME) {
            throw new AppError('Location service not configured', 500);
        }

        const command = new SearchPlaceIndexForTextCommand({
            IndexName: process.env.AWS_LOCATION_PLACE_INDEX_NAME,
            Text: text,
            MaxResults: maxResults,
            Language: 'en',
        });

        const response = await locationClient.send(command);

        if (!response.Results || response.Results.length === 0) {
            return [];
        }

        // Format results - AWS returns coordinates as [longitude, latitude]
        const formattedResults = response.Results.map((result, index) => ({
            id: result.PlaceId || `place-${index}-${Date.now()}`,
            displayName: result.Text,
            address: result.Place?.Label || result.Text,
            lat: result.Place?.Geometry?.Point?.[1] || null, // Latitude
            lon: result.Place?.Geometry?.Point?.[0] || null, // Longitude
            country: result.Place?.Country || null,
            region: result.Place?.Region || null,
            municipality: result.Place?.Municipality || null,
            postalCode: result.Place?.PostalCode || null,
            fullAddress: result.Place?.Label || result.Text,
            relevance: result.Relevance || 0,
        }));

        return formattedResults;
    } catch (error) {
        console.error('AWS Location Service Error:', error.message);
        throw new AppError(`Failed to search locations: ${error.message}`, 500);
    }
};

module.exports = {
    searchPlaces,
};

