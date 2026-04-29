import express from 'express';
import { createProduct, deleteProduct } from '../controllers/product.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';

const router = express.Router();

// ✅ ADD upload middleware here
router.post('/', authenticate, upload.single('image'), createProduct);

router.delete('/:id', authenticate, deleteProduct);

export default router;