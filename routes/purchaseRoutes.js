const express = require('express');
const router = express.Router();
const purchaseController = require('../controllers/purchaseController');
const authController = require('../controllers/authController');

// Checkout (authenticated users only)
router.post('/checkout', authController.isAuthenticated, purchaseController.checkout);

// View purchase history (authenticated users only)
router.get('/purchases', authController.isAuthenticated, purchaseController.viewPurchaseHistory);

// View purchase details (authenticated users only)
router.get('/purchases/:id', authController.isAuthenticated, purchaseController.viewPurchaseDetails);

// View seller sales (authenticated users only)
router.get('/sales', authController.isAuthenticated, purchaseController.viewSellerSales);

module.exports = router;