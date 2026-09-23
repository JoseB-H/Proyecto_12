const { pool } = require('../config/database');

const movementRepository = {
  async findAll() {
    const [rows] = await pool.query(`
      SELECT m.*, p.name AS product_name, u.name AS user_name
      FROM inventory_movements m
      LEFT JOIN products p ON m.product_id = p.id
      LEFT JOIN users u ON m.user_id = u.id
      ORDER BY m.created_at DESC
      LIMIT 50
    `);
    return rows;
  },

  async create({ product_id, user_id, type, quantity, reason }) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [result] = await connection.query(
        'INSERT INTO inventory_movements (product_id, user_id, type, quantity, reason) VALUES (?, ?, ?, ?, ?)',
        [product_id, user_id, type, quantity, reason]
      );

      // Actualizar stock del producto
      const quantityChange = (type === 'entrada' || type === 'devolucion') ? quantity : -quantity;
      await connection.query(
        'UPDATE products SET quantity = quantity + ? WHERE id = ?',
        [quantityChange, product_id]
      );

      await connection.commit();
      return { id: result.insertId, product_id, user_id, type, quantity, reason };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
};

module.exports = movementRepository;
