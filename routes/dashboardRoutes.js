const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authController = require('../controllers/authController');

// Dashboard route
router.get('/dashboard', authController.isAuthenticated, dashboardController.getDashboard);

// Profile routes
router.get('/profile/edit', authController.isAuthenticated, dashboardController.getEditProfile);
router.post('/profile/update', authController.isAuthenticated, dashboardController.updateProfile);

module.exports = router;