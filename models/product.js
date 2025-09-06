const db = require('../config/db');

class Product {
  static async findAll(options = {}) {
    try {
      let query = `
        SELECT p.*, c.name as category_name, u.username as seller_name
        FROM products p
        JOIN categories c ON p.category_id = c.id
        JOIN users u ON p.seller_id = u.id
      `;
      
      const queryParams = [];
      const conditions = [];
      
      // Add search condition if provided
      if (options.search) {
        conditions.push('(p.title LIKE ? OR p.description LIKE ?)');
        const searchTerm = `%${options.search}%`;
        queryParams.push(searchTerm, searchTerm);
      }
      
      // Add category filter if provided
      if (options.categoryId) {
        conditions.push('p.category_id = ?');
        queryParams.push(options.categoryId);
      }
      
      // Add seller filter if provided
      if (options.sellerId) {
        conditions.push('p.seller_id = ?');
        queryParams.push(options.sellerId);
      }
      
      // Add WHERE clause if conditions exist
      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }
      
      // Add order by
      query += ' ORDER BY p.created_at DESC';
      
      const [products] = await db.query(query, queryParams);
      return products;
    } catch (error) {
      console.error('Error finding products:', error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const [rows] = await db.query(
        `SELECT p.*, c.name as category_name, u.username as seller_name
         FROM products p
         JOIN categories c ON p.category_id = c.id
         JOIN users u ON p.seller_id = u.id
         WHERE p.id = ?`,
        [id]
      );
      return rows[0];
    } catch (error) {
      console.error('Error finding product by id:', error);
      throw error;
    }
  }

  static async create(productData) {
    try {
      const [result] = await db.query(
        'INSERT INTO products (title, description, price, category_id, seller_id, image_url) VALUES (?, ?, ?, ?, ?, ?)',
        [
          productData.title,
          productData.description,
          productData.price,
          productData.category_id,
          productData.seller_id,
          productData.image_url
        ]
      );
      
      return result.insertId;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  static async update(id, productData) {
    try {
      const [result] = await db.query(
        'UPDATE products SET title = ?, description = ?, price = ?, category_id = ?, image_url = ? WHERE id = ? AND seller_id = ?',
        [
          productData.title,
          productData.description,
          productData.price,
          productData.category_id,
          productData.image_url,
          id,
          productData.seller_id
        ]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  static async delete(id, sellerId) {
    try {
      const [result] = await db.query(
        'DELETE FROM products WHERE id = ? AND seller_id = ?',
        [id, sellerId]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  static async getAllCategories() {
    try {
      const [categories] = await db.query('SELECT * FROM categories ORDER BY name');
      return categories;
    } catch (error) {
      console.error('Error getting categories:', error);
      throw error;
    }
  }
}

module.exports = Product;