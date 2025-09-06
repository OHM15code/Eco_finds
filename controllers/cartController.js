const Cart = require('../models/cart');
const Product = require('../models/product');

class CartController {
  // Display cart page
  static async viewCart(req, res) {
    try {
      if (!req.session.userId) {
        return res.redirect('/login');
      }

      const cartItems = await Cart.getCartItems(req.session.userId);
      const cartTotal = await Cart.getCartTotal(req.session.userId);

      res.render('cart', {
        cartItems,
        cartTotal,
        isAuthenticated: !!req.session.userId,
        userId: req.session.userId
      });
    } catch (error) {
      console.error('Error viewing cart:', error);
      res.status(500).render('error', { error: 'Failed to load cart' });
    }
  }

  // Add item to cart
  static async addToCart(req, res) {
    try {
      if (!req.session.userId) {
        return res.redirect('/login');
      }

      const { productId, quantity = 1 } = req.body;
      
      if (!productId) {
        return res.status(400).send('Product ID is required');
      }

      await Cart.addToCart(req.session.userId, productId, parseInt(quantity));
      
      // Redirect back to the product page or to cart
      const referer = req.header('Referer');
      if (referer && referer.includes('/products/')) {
        res.redirect(referer);
      } else {
        res.redirect('/cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      res.status(400).send(error.message);
    }
  }

  // Update cart item quantity
  static async updateCartItem(req, res) {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { cartId, quantity } = req.body;
      
      if (!cartId || quantity === undefined) {
        return res.status(400).json({ error: 'Cart ID and quantity are required' });
      }

      const result = await Cart.updateCartItem(
        cartId,
        req.session.userId,
        parseInt(quantity)
      );
      
      res.redirect('/cart');
    } catch (error) {
      console.error('Error updating cart:', error);
      res.status(400).send(error.message);
    }
  }

  // Remove item from cart
  static async removeCartItem(req, res) {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { cartId } = req.body;
      
      if (!cartId) {
        return res.status(400).json({ error: 'Cart ID is required' });
      }

      await Cart.removeCartItem(cartId, req.session.userId);
      
      res.redirect('/cart');
    } catch (error) {
      console.error('Error removing cart item:', error);
      res.status(400).send(error.message);
    }
  }

  // Clear cart
  static async clearCart(req, res) {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      await Cart.clearCart(req.session.userId);
      
      res.redirect('/cart');
    } catch (error) {
      console.error('Error clearing cart:', error);
      res.status(400).send(error.message);
    }
  }
}

module.exports = CartController;