import express from 'express';
import { initSession } from '../controllers/session.controller.js';

const router = express.Router();

router.post('/init', initSession);

export default router;