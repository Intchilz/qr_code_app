import express from 'express';
import cors from 'cors';

import authRoutes from './routes/auth.routes.js';
import orderRoutes from './routes/order.routes.js';
import sessionRoutes from './routes/session.routes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/session', sessionRoutes);

export default app;