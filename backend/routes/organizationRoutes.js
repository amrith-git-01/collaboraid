const express = require('express');
const organizationController = require('../controllers/organizationController');
const authController = require('../controllers/authController');

const router = express.Router();

// All routes require authentication
router.use(authController.protect);

router.post('/create', organizationController.createOrganization);
router.get('/myOrganization', organizationController.getMyOrganization);
router.get('/:id', organizationController.getOrganizationById);
router.patch('/:id', organizationController.updateOrganization);
router.delete('/:id', organizationController.deleteOrganization);

module.exports = router;
