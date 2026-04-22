import express from 'express';
import cors from 'cors';

import authRoutes from './routes/auth.routes.js';
import orderRoutes from './routes/order.routes.js';
import sessionRoutes from './routes/session.routes.js';
import menuRoutes from './routes/menu.routes.js';

const app = express();
app.use(express.static('public'));
app.use(cors());
app.use(express.json());


app.get('/product', (req, res) => {
  res.send('Product route works');
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/session', sessionRoutes);
app.use('/api/v1/menu', menuRoutes);

export default app;