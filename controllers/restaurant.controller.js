import { pool } from '../config/db.js';

export const updateBranding = async (req, res) => {
  const { primary_color } = req.body;

  const logo_url = req.file
    ? `/uploads/${req.file.filename}`
    : null;

  const theme_config = {
    primary_color
  };

  const result = await pool.query(
    `UPDATE restaurants
     SET 
       logo_url = COALESCE($1, logo_url),
       theme_config = COALESCE($2, theme_config)
     WHERE id = $3
     RETURNING *`,
    [logo_url, theme_config, req.user.restaurant_id]
  );

  res.json(result.rows[0]);
};