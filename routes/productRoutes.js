const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authController = require('../controllers/authController');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'public', 'uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Browse products
router.get('/products', productController.getAllProducts);

// Add new product (authenticated users only)
router.get('/products/new', authController.isAuthenticated, productController.getAddProductForm);
router.post('/products/create', authController.isAuthenticated, upload.single('image'), productController.createProduct);

// Product details
router.get('/products/:id', productController.getProductDetails);

// Edit product (authenticated users only)
router.get('/products/:id/edit', authController.isAuthenticated, productController.getEditProductForm);
router.post('/products/:id/update', authController.isAuthenticated, upload.single('image'), productController.updateProduct);

// Delete product (authenticated users only)
router.post('/products/:id/delete', authController.isAuthenticated, productController.deleteProduct);

module.exports = router;