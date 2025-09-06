const User = require('../models/user');

const authController = {
  // Render login page
  getLogin: (req, res) => {
    res.render('login', { error: req.session.error });
    delete req.session.error;
  },

  // Render register page
  getRegister: (req, res) => {
    res.render('register', { error: req.session.error });
    delete req.session.error;
  },

  // Handle user login
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find user by email
      const user = await User.findByEmail(email);

      // Check if user exists
      if (!user) {
        req.session.error = 'Invalid email or password';
        return res.redirect('/login');
      }

      // Check password
      const isMatch = await User.comparePassword(password, user.password);
      if (!isMatch) {
        req.session.error = 'Invalid email or password';
        return res.redirect('/login');
      }

      // Set user session
      req.session.userId = user.id;
      req.session.username = user.username;
      
      // Redirect to dashboard
      res.redirect('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      req.session.error = 'An error occurred during login';
      res.redirect('/login');
    }
  },

  // Handle user registration
  register: async (req, res) => {
    try {
      const { username, email, password, confirm_password } = req.body;

      // Check if passwords match
      if (password !== confirm_password) {
        req.session.error = 'Passwords do not match';
        return res.redirect('/register');
      }

      // Check if email already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        req.session.error = 'Email already in use';
        return res.redirect('/register');
      }

      // Create new user
      const userId = await User.create({ username, email, password });

      // Set user session
      req.session.userId = userId;
      req.session.username = username;
      
      // Redirect to dashboard
      res.redirect('/dashboard');
    } catch (error) {
      console.error('Registration error:', error);
      req.session.error = 'An error occurred during registration';
      res.redirect('/register');
    }
  },

  // Handle user logout
  logout: (req, res) => {
    // Destroy session
    req.session.destroy(err => {
      if (err) {
        console.error('Logout error:', err);
      }
      res.redirect('/login');
    });
  },

  // Middleware to check if user is authenticated
  isAuthenticated: (req, res, next) => {
    if (req.session.userId) {
      return next();
    }
    res.redirect('/login');
  },

  // Middleware to check if user is not authenticated
  isNotAuthenticated: (req, res, next) => {
    if (!req.session.userId) {
      return next();
    }
    res.redirect('/dashboard');
  }
};

module.exports = authController;