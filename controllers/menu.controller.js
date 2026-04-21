import { pool } from '../config/db.js';

export const getMenu = async (req, res) => {
  const { restaurantId } = req.query;

  try {
    const categoriesRes = await pool.query(
      `SELECT * FROM categories
       WHERE restaurant_id = $1 AND is_deleted = false
       ORDER BY display_order ASC`,
      [restaurantId]
    );

    const categories = categoriesRes.rows;

    const productsRes = await pool.query(
      `SELECT * FROM products
       WHERE category_id IN (
         SELECT id FROM categories WHERE restaurant_id = $1
       )
       AND availability_status = 'available'
       AND is_deleted = false`,
      [restaurantId]
    );

    const products = productsRes.rows;

    const menu = categories.map(category => ({
      ...category,
      products: products.filter(p => p.category_id === category.id)
    }));

    res.json(menu);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getCategories = async (req, res) => {
  const { restaurantId } = req.query;

  try {
    const result = await pool.query(
      `SELECT * FROM categories
       WHERE restaurant_id = $1 AND is_deleted = false
       ORDER BY display_order ASC`,
      [restaurantId]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getProductsByCategory = async (req, res) => {
  const { categoryId } = req.params;

  try {
    const result = await pool.query(
      `SELECT * FROM products
       WHERE category_id = $1
       AND availability_status = 'available'
       AND is_deleted = false`,
      [categoryId]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};