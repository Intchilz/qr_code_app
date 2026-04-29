import { pool } from '../config/db.js';

export const createProduct = async (req, res) => {
  try {
    const { name, price, description, category_id } = req.body;

    // 🔒 VALIDATE REQUIRED FIELDS
    if (!name || !price || !category_id) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // 🔒 ENFORCE CATEGORY OWNERSHIP
    const categoryCheck = await pool.query(
      `SELECT id FROM categories 
       WHERE id = $1 AND restaurant_id = $2 AND is_deleted = false`,
      [category_id, req.user.restaurant_id]
    );

    if (!categoryCheck.rows.length) {
      return res.status(403).json({ message: 'Invalid category' });
    }

    // 🖼️ HANDLE IMAGE
    const image_url = req.file
      ? `/uploads/${req.file.filename}`
      : null;

    // ✅ INSERT PRODUCT
    const result = await pool.query(
      `INSERT INTO products 
       (name, price, description, category_id, image_url)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, price, description, category_id, image_url]
    );

    res.json(result.rows[0]);

  } catch (err) {
    console.error('CREATE PRODUCT ERROR:', err);
    res.status(500).json({ error: err.message });
  }
};


export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // 🔒 ENSURE PRODUCT BELONGS TO USER'S RESTAURANT
    const check = await pool.query(
      `SELECT p.id FROM products p
       JOIN categories c ON p.category_id = c.id
       WHERE p.id = $1 AND c.restaurant_id = $2`,
      [id, req.user.restaurant_id]
    );

    if (!check.rows.length) {
      return res.status(403).json({ message: 'Unauthorized action' });
    }

    // ✅ SOFT DELETE
    await pool.query(
      `UPDATE products SET is_deleted = true WHERE id = $1`,
      [id]
    );

    res.json({ message: 'Deleted' });

  } catch (err) {
    console.error('DELETE PRODUCT ERROR:', err);
    res.status(500).json({ error: err.message });
  }
};