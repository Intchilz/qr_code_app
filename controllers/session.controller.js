import { pool } from '../config/db.js';

export const initSession = async (req, res) => {
  const { token } = req.body;

  try {
    // 🔍 Find table using qr_token
    const tableRes = await pool.query(
      `SELECT * FROM tables WHERE qr_token = $1`,
      [token]
    );

    if (!tableRes.rows.length) {
      return res.status(404).json({ message: 'Invalid QR code' });
    }

    const table = tableRes.rows[0];

    // 🔥 Get restaurant branding
    const restaurantRes = await pool.query(
      `SELECT name, logo_url, theme_config 
       FROM restaurants 
       WHERE id = $1`,
      [table.restaurant_id]
    );

    const restaurant = restaurantRes.rows[0] || {};

    const restaurantName = restaurant.name || 'Restaurant';
    const logoUrl = restaurant.logo_url || null;
    const themeConfig = restaurant.theme_config || {};

    // 🔍 Check for active session
    const sessionRes = await pool.query(
      `SELECT * FROM table_sessions 
       WHERE table_id = $1 AND status = 'ACTIVE'`,
      [table.id]
    );

    // ✅ If session exists → return it
    if (sessionRes.rows.length) {
      const existing = sessionRes.rows[0];

      return res.json({
        ...existing,
        restaurant_id: table.restaurant_id,
        table_name: table.table_name,
        restaurant_name: restaurantName,
        logo_url: logoUrl,
        theme_config: themeConfig
      });
    }

    // 🆕 Create new session
    const newSession = await pool.query(
      `INSERT INTO table_sessions 
       (table_id, restaurant_id, session_start, status)
       VALUES ($1, $2, NOW(), 'ACTIVE')
       RETURNING *`,
      [table.id, table.restaurant_id]
    );

    res.json({
      ...newSession.rows[0],
      restaurant_id: table.restaurant_id,
      table_name: table.table_name,
      restaurant_name: restaurantName,
      logo_url: logoUrl,
      theme_config: themeConfig
    });

  } catch (err) {
    console.error('SESSION ERROR:', err);
    res.status(500).json({ error: err.message });
  }
};