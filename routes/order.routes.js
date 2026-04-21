import express from 'express';
import { createOrder, updateOrderStatus } from '../controllers/order.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';

const router = express.Router();

// Create order (customer)
router.post('/', createOrder);

// Update status (staff)
router.patch(
  '/:id/status',
  authenticate,
  authorize('waiter', 'manager', 'admin'),
  updateOrderStatus
);

export default router;