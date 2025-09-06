const Purchase = require('../models/purchase');
const Cart = require('../models/cart');

class PurchaseController {
  // Process checkout
  static async checkout(req, res) {
    try {
      if (!req.session.userId) {
        return res.redirect('/login');
      }

      // Check if cart has items
      const cartItems = await Cart.getCartItems(req.session.userId);
      if (!cartItems || cartItems.length === 0) {
        return res.redirect('/cart');
      }

      // Create purchase from cart
      const result = await Purchase.createFromCart(req.session.userId);
      
      // Redirect to purchase confirmation
      res.redirect(`/purchases/${result.purchaseId}`);
    } catch (error) {
      console.error('Error during checkout:', error);
      res.status(500).render('error', { 
        error: 'Failed to complete checkout', 
        isAuthenticated: !!req.session.userId,
        userId: req.session.userId
      });
    }
  }

  // View purchase history
  static async viewPurchaseHistory(req, res) {
    try {
      if (!req.session.userId) {
        return res.redirect('/login');
      }

      const purchases = await Purchase.getPurchaseHistory(req.session.userId);
      
      res.render('purchases', {
        purchases,
        isAuthenticated: true,
        userId: req.session.userId
      });
    } catch (error) {
      console.error('Error viewing purchase history:', error);
      res.status(500).render('error', { 
        error: 'Failed to load purchase history',
        isAuthenticated: true,
        userId: req.session.userId
      });
    }
  }

  // View purchase details
  static async viewPurchaseDetails(req, res) {
    try {
      if (!req.session.userId) {
        return res.redirect('/login');
      }

      const purchaseId = req.params.id;
      const purchaseDetails = await Purchase.getPurchaseDetails(purchaseId, req.session.userId);
      
      res.render('purchase-detail', {
        purchase: purchaseDetails.purchase,
        items: purchaseDetails.items,
        isAuthenticated: true,
        userId: req.session.userId
      });
    } catch (error) {
      console.error('Error viewing purchase details:', error);
      res.status(500).render('error', { 
        error: 'Failed to load purchase details',
        isAuthenticated: true,
        userId: req.session.userId
      });
    }
  }

  // View seller sales
  static async viewSellerSales(req, res) {
    try {
      if (!req.session.userId) {
        return res.redirect('/login');
      }

      const sales = await Purchase.getSellerSales(req.session.userId);
      
      res.render('sales', {
        sales,
        isAuthenticated: true,
        userId: req.session.userId
      });
    } catch (error) {
      console.error('Error viewing sales:', error);
      res.status(500).render('error', { 
        error: 'Failed to load sales data',
        isAuthenticated: true,
        userId: req.session.userId
      });
    }
  }
}

module.exports = PurchaseController;