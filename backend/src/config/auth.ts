// src/config/auth.ts
import { SignOptions } from 'jsonwebtoken';

export const authConfig = {
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  jwtExpiresIn: (process.env.JWT_EXPIRES_IN || '1h') as SignOptions['expiresIn'],
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET || 'your-refresh-secret-key',
  refreshTokenExpiresIn: (process.env.REFRESH_TOKEN_EXPIRES_IN || '7d') as SignOptions['expiresIn'],
};