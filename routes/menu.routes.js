import express from 'express';
import {
  getMenu,
  getCategories,
  getProductsByCategory
} from '../controllers/menu.controller.js';

const router = express.Router();

router.get('/', getMenu);
router.get('/categories', getCategories);
router.get('/category/:categoryId', getProductsByCategory);

export default router;