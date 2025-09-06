const Product = require('../models/product');
const path = require('path');
const fs = require('fs');

const productController = {
  // Get all products with optional filtering
  getAllProducts: async (req, res) => {
    try {
      const { search, category } = req.query;
      const options = {};
      
      if (search) options.search = search;
      if (category) options.categoryId = category;
      
      const products = await Product.findAll(options);
      const categories = await Product.getAllCategories();
      
      res.render('products', {
        products,
        categories,
        search,
        selectedCategory: category || '',
        isAuthenticated: !!req.session.userId
      });
    } catch (error) {
      console.error('Error getting products:', error);
      res.status(500).send('Server error');
    }
  },

  // Get product details
  getProductDetails: async (req, res) => {
    try {
      const productId = req.params.id;
      const product = await Product.findById(productId);
      
      if (!product) {
        return res.status(404).send('Product not found');
      }
      
      res.render('product-detail', {
        product,
        isAuthenticated: !!req.session.userId,
        userId: req.session.userId || null
      });
    } catch (error) {
      console.error('Error getting product details:', error);
      res.status(500).send('Server error');
    }
  },

  // Render add product form
  getAddProductForm: async (req, res) => {
    try {
      const categories = await Product.getAllCategories();
      res.render('add-product', { categories, error: req.session.error });
      delete req.session.error;
    } catch (error) {
      console.error('Error loading add product form:', error);
      res.status(500).send('Server error');
    }
  },

  // Create new product
  createProduct: async (req, res) => {
    try {
      const { title, description, price, category_id } = req.body;
      let image_url = null;
      
      // Handle image upload if provided
      if (req.file) {
        image_url = `/uploads/${req.file.filename}`;
      }
      
      // Create product
      await Product.create({
        title,
        description,
        price,
        category_id,
        seller_id: req.session.userId,
        image_url
      });
      
      res.redirect('/dashboard');
    } catch (error) {
      console.error('Error creating product:', error);
      req.session.error = 'An error occurred while creating the product';
      res.redirect('/products/new');
    }
  },

  // Render edit product form
  getEditProductForm: async (req, res) => {
    try {
      const productId = req.params.id;
      const product = await Product.findById(productId);
      
      if (!product) {
        return res.status(404).send('Product not found');
      }
      
      // Check if user is the seller
      if (product.seller_id !== req.session.userId) {
        return res.status(403).send('Unauthorized');
      }
      
      const categories = await Product.getAllCategories();
      
      res.render('edit-product', {
        product,
        categories,
        error: req.session.error
      });
      delete req.session.error;
    } catch (error) {
      console.error('Error loading edit product form:', error);
      res.status(500).send('Server error');
    }
  },

  // Update product
  updateProduct: async (req, res) => {
    try {
      const productId = req.params.id;
      const { title, description, price, category_id } = req.body;
      
      // Get existing product
      const existingProduct = await Product.findById(productId);
      
      if (!existingProduct) {
        return res.status(404).send('Product not found');
      }
      
      // Check if user is the seller
      if (existingProduct.seller_id !== req.session.userId) {
        return res.status(403).send('Unauthorized');
      }
      
      let image_url = existingProduct.image_url;
      
      // Handle image upload if provided
      if (req.file) {
        // Delete old image if exists
        if (existingProduct.image_url) {
          const oldImagePath = path.join(__dirname, '../public', existingProduct.image_url);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }
        
        image_url = `/uploads/${req.file.filename}`;
      }
      
      // Update product
      await Product.update(productId, {
        title,
        description,
        price,
        category_id,
        image_url,
        seller_id: req.session.userId
      });
      
      res.redirect(`/products/${productId}`);
    } catch (error) {
      console.error('Error updating product:', error);
      req.session.error = 'An error occurred while updating the product';
      res.redirect(`/products/${req.params.id}/edit`);
    }
  },

  // Delete product
  deleteProduct: async (req, res) => {
    try {
      const productId = req.params.id;
      
      // Get existing product
      const existingProduct = await Product.findById(productId);
      
      if (!existingProduct) {
        return res.status(404).send('Product not found');
      }
      
      // Check if user is the seller
      if (existingProduct.seller_id !== req.session.userId) {
        return res.status(403).send('Unauthorized');
      }
      
      // Delete image if exists
      if (existingProduct.image_url) {
        const imagePath = path.join(__dirname, '../public', existingProduct.image_url);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }
      
      // Delete product
      await Product.delete(productId, req.session.userId);
      
      res.redirect('/dashboard');
    } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).send('Server error');
    }
  }
};

module.exports = productController;