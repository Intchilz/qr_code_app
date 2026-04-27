import { pool } from '../config/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query(
      `SELECT * FROM users 
       WHERE email = $1 AND is_deleted = false`,
      [email]
    );

    if (!result.rows.length) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = result.rows[0];

    const valid = await bcrypt.compare(password, user.password_hash);

    if (!valid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        restaurant_id: user.restaurant_id
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        role: user.role,
        restaurant_id: user.restaurant_id
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};