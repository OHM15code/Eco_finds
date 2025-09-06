const pool = require('../config/db');

class Cart {
  // Get cart items for a user
  static async getCartItems(userId) {
    try {
      const [rows] = await pool.query(
        `SELECT c.id, c.user_id, c.product_id, c.quantity, c.created_at,
                p.title, p.price, p.image_url, p.category_id, p.seller_id,
                u.username as seller_name
         FROM cart c
         JOIN products p ON c.product_id = p.id
         JOIN users u ON p.seller_id = u.id
         WHERE c.user_id = ?`,
        [userId]
      );
      return rows;
    } catch (error) {
      console.error('Error getting cart items:', error);
      throw error;
    }
  }

  // Add item to cart
  static async addToCart(userId, productId, quantity = 1) {
    try {
      // Check if product exists and is not sold by the user
      const [productCheck] = await pool.query(
        'SELECT id, seller_id FROM products WHERE id = ?',
        [productId]
      );

      if (productCheck.length === 0) {
        throw new Error('Product not found');
      }

      if (productCheck[0].seller_id === userId) {
        throw new Error('You cannot add your own product to cart');
      }

      // Check if item already in cart
      const [existingItem] = await pool.query(
        'SELECT id, quantity FROM cart WHERE user_id = ? AND product_id = ?',
        [userId, productId]
      );

      if (existingItem.length > 0) {
        // Update quantity if already in cart
        await pool.query(
          'UPDATE cart SET quantity = quantity + ? WHERE id = ?',
          [quantity, existingItem[0].id]
        );
        return { message: 'Cart updated successfully' };
      } else {
        // Add new item to cart
        await pool.query(
          'INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)',
          [userId, productId, quantity]
        );
        return { message: 'Item added to cart successfully' };
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  }

  // Update cart item quantity
  static async updateCartItem(cartId, userId, quantity) {
    try {
      if (quantity <= 0) {
        return await this.removeCartItem(cartId, userId);
      }

      const [result] = await pool.query(
        'UPDATE cart SET quantity = ? WHERE id = ? AND user_id = ?',
        [quantity, cartId, userId]
      );

      if (result.affectedRows === 0) {
        throw new Error('Cart item not found or not owned by user');
      }

      return { message: 'Cart updated successfully' };
    } catch (error) {
      console.error('Error updating cart item:', error);
      throw error;
    }
  }

  // Remove item from cart
  static async removeCartItem(cartId, userId) {
    try {
      const [result] = await pool.query(
        'DELETE FROM cart WHERE id = ? AND user_id = ?',
        [cartId, userId]
      );

      if (result.affectedRows === 0) {
        throw new Error('Cart item not found or not owned by user');
      }

      return { message: 'Item removed from cart successfully' };
    } catch (error) {
      console.error('Error removing cart item:', error);
      throw error;
    }
  }

  // Clear cart
  static async clearCart(userId) {
    try {
      await pool.query('DELETE FROM cart WHERE user_id = ?', [userId]);
      return { message: 'Cart cleared successfully' };
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  }

  // Get cart total
  static async getCartTotal(userId) {
    try {
      const [rows] = await pool.query(
        `SELECT SUM(c.quantity * p.price) as total
         FROM cart c
         JOIN products p ON c.product_id = p.id
         WHERE c.user_id = ?`,
        [userId]
      );
      return rows[0].total || 0;
    } catch (error) {
      console.error('Error calculating cart total:', error);
      throw error;
    }
  }
}

module.exports = Cart;