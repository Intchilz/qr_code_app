import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';

export const initSession = async (req, res) => {
  const { token } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { restaurant_id, table_name } = decoded;

    // Get table
    const tableRes = await pool.query(
      `SELECT * FROM tables 
       WHERE restaurant_id = $1 AND table_name = $2`,
      [restaurant_id, table_name]
    );

    if (!tableRes.rows.length) {
      return res.status(404).json({ message: 'Table not found' });
    }

    const table = tableRes.rows[0];

    // Check active session
    const sessionRes = await pool.query(
      `SELECT * FROM table_sessions 
       WHERE table_id = $1 AND status = 'ACTIVE'`,
      [table.id]
    );

    if (sessionRes.rows.length) {
      return res.json(sessionRes.rows[0]);
    }

    // Create new session
    const newSession = await pool.query(
      `INSERT INTO table_sessions 
       (table_id, restaurant_id, session_start, status)
       VALUES ($1, $2, NOW(), 'ACTIVE')
       RETURNING *`,
      [table.id, restaurant_id]
    );

    res.json(newSession.rows[0]);

  } catch (err) {
    return res.status(401).json({ message: 'Invalid QR token' });
  }
};