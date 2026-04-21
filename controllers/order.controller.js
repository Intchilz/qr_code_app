import { pool } from '../config/db.js';

export const createOrder = async (req, res) => {
  const client = await pool.connect();

  try {
    const { table_id, session_id, items, idempotency_key } = req.body;

    // Validate session
    const sessionCheck = await client.query(
      `SELECT * FROM table_sessions 
      WHERE id = $1 AND status = 'ACTIVE'`,
      [session_id]
    );

    if (!sessionCheck.rows.length) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Invalid or expired session' });
    }

    await client.query('BEGIN');

    // Idempotency check
    const existing = await client.query(
      'SELECT * FROM orders WHERE idempotency_key = $1',
      [idempotency_key]
    );

    if (existing.rows.length) {
      await client.query('ROLLBACK');
      return res.json(existing.rows[0]);
    }

    let total = 0;

    const orderResult = await client.query(
      `INSERT INTO orders (restaurant_id, table_id, session_id, idempotency_key)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [req.user.restaurant_id, table_id, session_id, idempotency_key]
    );

    const order = orderResult.rows[0];

    for (const item of items) {
      const product = await client.query(
        'SELECT price FROM products WHERE id = $1',
        [item.product_id]
      );

      const price = product.rows[0].price;
      total += price * item.quantity;

      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price_snapshot)
         VALUES ($1, $2, $3, $4)`,
        [order.id, item.product_id, item.quantity, price]
      );
    }

    await client.query(
      'UPDATE orders SET total_amount = $1 WHERE id = $2',
      [total, order.id]
    );

    await client.query('COMMIT');

    req.io.emit('ORDER_CREATED', order);

    res.status(201).json(order);

  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};