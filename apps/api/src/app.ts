import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { authenticate } from './middleware/auth.js';
import { errorHandler } from './middleware/errorHandler.js';
import { authRoutes } from './routes/authRoutes.js';
import { areaRoutes } from './routes/areaRoutes.js';
import { rideRoutes } from './routes/rideRoutes.js';
import { driverRoutes } from './routes/driverRoutes.js';

export const app = express();

app.use(helmet());
app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', async (_req, res) => {
  res.json({ status: 'ok', database: 'connected' });
});

app.use('/api/auth', authRoutes);
app.use('/api/areas', areaRoutes);
app.use('/api/rides', authenticate, rideRoutes);
app.use('/api/driver', authenticate, driverRoutes);

app.use(errorHandler);

export default app;
