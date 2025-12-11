const express = require('express');
const authController = require('../controllers/authController');
const profilePhotoController = require('../controllers/profilePhotoController');

const router = express.Router();

router.post('/upload', authController.protect, profilePhotoController.uploadProfilePhoto);
router.delete('/remove', authController.protect, profilePhotoController.removeProfilePhoto);

module.exports = router;