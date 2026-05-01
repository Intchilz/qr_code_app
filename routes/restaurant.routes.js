import express from 'express';
import { updateBranding } from '../controllers/restaurant.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import multer from 'multer';

const router = express.Router();

// 🔹 Upload config
const upload = multer({ dest: 'uploads/' });

// 🔹 Update branding (logo + theme)
router.patch(
  '/branding',
  authenticate,
  upload.single('logo'),
  updateBranding
);

export default router;