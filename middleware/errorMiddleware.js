/**
 * Error handling middleware
 */

const errorMiddleware = {
  /**
   * Handle 404 errors - Page not found
   */
  notFound: (req, res, next) => {
    // Skip 404 for Vite client requests in development
    if (req.originalUrl.includes('/@vite/client')) {
      return res.status(404).end();
    }
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
  },

  /**
   * Handle all other errors
   */
  errorHandler: (err, req, res, next) => {
    // Handle multer errors
    if (err.name === 'MulterError') {
      res.status(400);
      err.message = `File upload error: ${err.message}`;
    } else {
      // Set status code (use 500 if status code is not already set or is 200)
      const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
      res.status(statusCode);
    }
    
    // Log error for debugging
    console.error(`Error: ${err.message}`);
    if (process.env.NODE_ENV !== 'production') {
      console.error(err.stack);
    }

    // Render error page
    res.render('error', {
      error: err.message,
      stack: process.env.NODE_ENV !== 'production' ? err.stack : null,
      isAuthenticated: !!req.session.userId
    });
  }
};

module.exports = errorMiddleware;