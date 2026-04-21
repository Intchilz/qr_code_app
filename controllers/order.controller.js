import { pool } from '../config/db.js';

export const createOrder = async (req, res) => {
  const client = await pool.connect();

  try {
    const { table_id, session_id, items, idempotency_key } = req.body;

    await client.query('BEGIN');

    // ✅ Validate session (WITH restaurant isolation)
    const sessionCheck = await client.query(
      `SELECT * FROM table_sessions 
       WHERE id = $1 AND status = 'ACTIVE' AND restaurant_id = $2`,
      [session_id, req.user.restaurant_id]
    );

    if (!sessionCheck.rows.length) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Invalid or expired session' });
    }

    // ✅ Idempotency check
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
        `SELECT price FROM products 
         WHERE id = $1 AND is_deleted = false`,
        [item.product_id]
      );

      if (!product.rows.length) {
        await client.query('ROLLBACK');
        return res.status(400).json({ message: 'Invalid product' });
      }

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

    // 🔥 WebSocket event
    req.io.emit('ORDER_CREATED', order);

    res.status(201).json(order);

  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};


export const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const allowedTransitions = {
    PENDING: ['IN_PREPARATION', 'CANCELLED'],
    IN_PREPARATION: ['COOKING'],
    COOKING: ['READY'],
    READY: ['SERVED'],
    SERVED: [],
    CANCELLED: []
  };

  try {
    // ✅ WITH restaurant isolation
    const orderRes = await pool.query(
      `SELECT * FROM orders 
       WHERE id = $1 AND restaurant_id = $2`,
      [id, req.user.restaurant_id]
    );

    if (!orderRes.rows.length) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const order = orderRes.rows[0];

    const validNext = allowedTransitions[order.status] || [];

    if (!validNext.includes(status)) {
      return res.status(400).json({
        message: `Invalid transition from ${order.status} to ${status}`
      });
    }

    const updated = await pool.query(
      `UPDATE orders
       SET status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );

    // 🔥 WebSocket events
    req.io.emit('ORDER_UPDATED', {
      orderId: id,
      status
    });

    if (status === 'CANCELLED') {
      req.io.emit('ORDER_CANCELLED', { orderId: id });
    }

    res.json(updated.rows[0]);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};