import express from 'express';
import { createTable, getTables, generateQR } from '../controllers/table.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/', authenticate, createTable);
router.get('/', authenticate, getTables);
router.get('/:tableId/qr', authenticate, generateQR);

export default router;