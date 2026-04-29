import { pool } from '../config/db.js';
import QRCode from 'qrcode';
import crypto from 'crypto';

// CREATE TABLE
export const createTable = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Table name required' });
    }

    // 🔐 generate QR token
    const qr_token = crypto.randomBytes(16).toString('hex');

    const result = await pool.query(
      `INSERT INTO tables (table_name, restaurant_id, qr_token)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name, req.user.restaurant_id, qr_token]
    );

    res.json(result.rows[0]);

  } catch (err) {
    console.error('CREATE TABLE ERROR:', err);
    res.status(500).json({ error: err.message });
  }
};

// GET TABLES
export const getTables = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM tables WHERE restaurant_id = $1`,
      [req.user.restaurant_id]
    );

    res.json(result.rows);

  } catch (err) {
    console.error('GET TABLES ERROR:', err);
    res.status(500).json({ error: err.message });
  }
};

// GENERATE QR
export const generateQR = async (req, res) => {
  try {
    const { tableId } = req.params;

    const table = await pool.query(
      `SELECT * FROM tables 
       WHERE id = $1 AND restaurant_id = $2`,
      [tableId, req.user.restaurant_id]
    );

    if (!table.rows.length) {
      return res.status(404).json({ message: 'Table not found' });
    }

    const t = table.rows[0];

    // 🔐 USE TOKEN (better than exposing IDs)
    const url = `https://qr-code-app-utap.onrender.com/?token=${t.qr_token}`;

    const qr = await QRCode.toDataURL(url);

    res.json({ qr, url });

  } catch (err) {
    console.error('QR ERROR:', err);
    res.status(500).json({ error: err.message });
  }
};