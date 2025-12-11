const catchAsync = require('../utils/catchAsync');
const locationService = require('../services/locationService');

/**
 * Search for places
 * GET /api/location/search?q=searchQuery&limit=5
 */
exports.searchPlaces = catchAsync(async (req, res, next) => {
  const { q, limit = 5 } = req.query;

  if (!q || q.trim().length < 2) {
    return res.status(200).json({
      status: 'success',
      results: 0,
      data: {
        places: [],
      },
    });
  }

  const places = await locationService.searchPlaces(q, parseInt(limit));

  res.status(200).json({
    status: 'success',
    results: places.length,
    data: {
      places,
    },
  });
});

