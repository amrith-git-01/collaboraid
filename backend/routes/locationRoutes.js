const express = require('express');
const locationController = require('../controllers/locationController');
const { protect } = require('../controllers/authController');

const router = express.Router();

// Search places (protected route)
router.get('/search', protect, locationController.searchPlaces);

module.exports = router;

