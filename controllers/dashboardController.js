const User = require('../models/user');
const db = require('../config/db');

const dashboardController = {
  // Render dashboard page
  getDashboard: async (req, res) => {
    try {
      // Get user information
      const user = await User.findById(req.session.userId);
      
      // Get user's product listings
      const [products] = await db.query(
        `SELECT p.*, c.name as category_name 
         FROM products p 
         JOIN categories c ON p.category_id = c.id 
         WHERE p.seller_id = ? 
         ORDER BY p.created_at DESC`,
        [req.session.userId]
      );
      
      res.render('dashboard', { user, products });
    } catch (error) {
      console.error('Dashboard error:', error);
      res.status(500).send('Server error');
    }
  },

  // Render edit profile page
  getEditProfile: async (req, res) => {
    try {
      const user = await User.findById(req.session.userId);
      res.render('edit-profile', { user, error: req.session.error });
      delete req.session.error;
    } catch (error) {
      console.error('Edit profile error:', error);
      res.status(500).send('Server error');
    }
  },

  // Handle profile update
  updateProfile: async (req, res) => {
    try {
      const { username } = req.body;
      const profile_image = req.file ? `/uploads/${req.file.filename}` : null;
      
      await User.updateProfile(req.session.userId, { username, profile_image });
      
      // Update session username
      req.session.username = username;
      
      res.redirect('/dashboard');
    } catch (error) {
      console.error('Update profile error:', error);
      req.session.error = 'An error occurred while updating your profile';
      res.redirect('/profile/edit');
    }
  }
};

module.exports = dashboardController;