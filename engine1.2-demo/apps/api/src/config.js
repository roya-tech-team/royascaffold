import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  jwtSecret: process.env.JWT_SECRET || 'dev-secret',
  jwtExpiresIn: '7d',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
};
