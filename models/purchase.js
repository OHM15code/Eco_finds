const pool = require('../config/db');

class Purchase {
  // Create a new purchase from cart items
  static async createFromCart(userId) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Get cart items
      const [cartItems] = await connection.query(
        `SELECT c.product_id, c.quantity, p.price, p.seller_id
         FROM cart c
         JOIN products p ON c.product_id = p.id
         WHERE c.user_id = ?`,
        [userId]
      );
      
      if (cartItems.length === 0) {
        throw new Error('Cart is empty');
      }
      
      // Create purchase record
      const [purchaseResult] = await connection.query(
        'INSERT INTO purchases (user_id, total_amount) VALUES (?, ?)',
        [userId, cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)]
      );
      
      const purchaseId = purchaseResult.insertId;
      
      // Create purchase items
      for (const item of cartItems) {
        await connection.query(
          `INSERT INTO purchase_items 
           (purchase_id, product_id, quantity, price, seller_id) 
           VALUES (?, ?, ?, ?, ?)`,
          [purchaseId, item.product_id, item.quantity, item.price, item.seller_id]
        );
      }
      
      // Clear the cart
      await connection.query('DELETE FROM cart WHERE user_id = ?', [userId]);
      
      await connection.commit();
      
      return { purchaseId, message: 'Purchase completed successfully' };
    } catch (error) {
      await connection.rollback();
      console.error('Error creating purchase:', error);
      throw error;
    } finally {
      connection.release();
    }
  }
  
  // Get purchase history for a user
  static async getPurchaseHistory(userId) {
    try {
      const [purchases] = await pool.query(
        `SELECT p.id, p.total_amount, p.created_at,
                COUNT(pi.id) as item_count
         FROM purchases p
         JOIN purchase_items pi ON p.id = pi.purchase_id
         WHERE p.user_id = ?
         GROUP BY p.id
         ORDER BY p.created_at DESC`,
        [userId]
      );
      
      return purchases;
    } catch (error) {
      console.error('Error getting purchase history:', error);
      throw error;
    }
  }
  
  // Get purchase details
  static async getPurchaseDetails(purchaseId, userId) {
    try {
      // Get purchase info
      const [purchases] = await pool.query(
        `SELECT p.* FROM purchases p
         WHERE p.id = ? AND p.user_id = ?`,
        [purchaseId, userId]
      );
      
      if (purchases.length === 0) {
        throw new Error('Purchase not found or not owned by user');
      }
      
      const purchase = purchases[0];
      
      // Get purchase items
      const [items] = await pool.query(
        `SELECT pi.*, pr.title, pr.image_url, u.username as seller_name
         FROM purchase_items pi
         JOIN products pr ON pi.product_id = pr.id
         JOIN users u ON pi.seller_id = u.id
         WHERE pi.purchase_id = ?`,
        [purchaseId]
      );
      
      return { purchase, items };
    } catch (error) {
      console.error('Error getting purchase details:', error);
      throw error;
    }
  }
  
  // Get sales for a seller
  static async getSellerSales(sellerId) {
    try {
      const [sales] = await pool.query(
        `SELECT pi.purchase_id, pi.product_id, pi.quantity, pi.price,
                pi.created_at, pr.title, u.username as buyer_name
         FROM purchase_items pi
         JOIN products pr ON pi.product_id = pr.id
         JOIN purchases p ON pi.purchase_id = p.id
         JOIN users u ON p.user_id = u.id
         WHERE pi.seller_id = ?
         ORDER BY pi.created_at DESC`,
        [sellerId]
      );
      
      return sales;
    } catch (error) {
      console.error('Error getting seller sales:', error);
      throw error;
    }
  }
}

module.exports = Purchase;