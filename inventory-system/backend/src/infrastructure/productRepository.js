const { pool } = require('../config/database');

const productRepository = {
  async findAll() {
    const [rows] = await pool.query(`
      SELECT p.*, c.name AS category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      ORDER BY p.id
    `);
    return rows;
  },

  async findById(id) {
    const [rows] = await pool.query(`
      SELECT p.*, c.name AS category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE p.id = ?
    `, [id]);
    return rows[0] || null;
  },

  async create({ sku, name, description, category_id, price, cost, quantity, min_stock, max_stock }) {
    const [result] = await pool.query(
      `INSERT INTO products (sku, name, description, category_id, price, cost, quantity, min_stock, max_stock) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [sku, name, description, category_id, price, cost || null, quantity || 0, min_stock || 5, max_stock || 100]
    );
    return { id: result.insertId, sku, name, description, category_id, price, cost, quantity };
  },

  async update(id, fields) {
    const keys = Object.keys(fields);
    const values = Object.values(fields);
    const setClause = keys.map(k => `${k} = ?`).join(', ');
    await pool.query(`UPDATE products SET ${setClause} WHERE id = ?`, [...values, id]);
    return this.findById(id);
  },

  async delete(id) {
    const [result] = await pool.query('DELETE FROM products WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },

  async getStats() {
    const [totalProducts] = await pool.query('SELECT COUNT(*) AS count FROM products WHERE active = 1');
    const [totalCategories] = await pool.query('SELECT COUNT(*) AS count FROM categories');
    const [lowStock] = await pool.query('SELECT COUNT(*) AS count FROM products WHERE quantity <= min_stock AND active = 1');
    const [totalValue] = await pool.query('SELECT COALESCE(SUM(price * quantity), 0) AS value FROM products WHERE active = 1');
    return {
      totalProducts: totalProducts[0].count,
      totalCategories: totalCategories[0].count,
      lowStock: lowStock[0].count,
      totalValue: totalValue[0].value
    };
  }
};

module.exports = productRepository;
