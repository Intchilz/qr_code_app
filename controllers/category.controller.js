import { pool } from '../config/db.js';

export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    const result = await pool.query(
      `INSERT INTO categories (name, restaurant_id)
       VALUES ($1, $2)
       RETURNING *`,
      [name, req.user.restaurant_id]
    );

    res.json(result.rows[0]);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getCategories = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM categories 
       WHERE restaurant_id = $1`,
      [req.user.restaurant_id]
    );

    res.json(result.rows);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};