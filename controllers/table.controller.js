// controllers/table.controller.js
import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';

export const createTable = async (req, res) => {
  const { table_name } = req.body;
  const restaurant_id = req.user.restaurant_id;

  const token = jwt.sign(
    {
      table_name,
      restaurant_id,
    },
    process.env.JWT_SECRET,
    { expiresIn: '365d' }
  );

  const result = await pool.query(
    `INSERT INTO tables (restaurant_id, table_name, qr_token)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [restaurant_id, table_name, token]
  );

  res.json(result.rows[0]);
};