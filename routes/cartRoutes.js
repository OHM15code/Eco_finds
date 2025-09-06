const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const authController = require('../controllers/authController');

// View cart (authenticated users only)
router.get('/cart', authController.isAuthenticated, cartController.viewCart);

// Add item to cart (authenticated users only)
router.post('/cart/add', authController.isAuthenticated, cartController.addToCart);

// Update cart item quantity (authenticated users only)
router.post('/cart/update', authController.isAuthenticated, cartController.updateCartItem);

// Remove item from cart (authenticated users only)
router.post('/cart/remove', authController.isAuthenticated, cartController.removeCartItem);

// Clear cart (authenticated users only)
router.post('/cart/clear', authController.isAuthenticated, cartController.clearCart);

module.exports = router;