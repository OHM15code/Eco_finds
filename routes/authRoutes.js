const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Login routes
router.get('/login', authController.isNotAuthenticated, authController.getLogin);
router.post('/auth/login', authController.login);

// Register routes
router.get('/register', authController.isNotAuthenticated, authController.getRegister);
router.post('/auth/register', authController.register);

// Logout route
router.get('/auth/logout', authController.logout);

module.exports = router;