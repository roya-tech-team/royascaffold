import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { initializeDatabase } from './database.js';
import { errorHandler } from './common/errors.js';
import authRoutes from './modules/auth/auth.routes.js';
import pollsRoutes from './modules/polls/polls.routes.js';

initializeDatabase();

const app = express();

app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/auth', authRoutes);
app.use('/polls', pollsRoutes);

app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`PollPulse API running on http://localhost:${config.port}`);
});
