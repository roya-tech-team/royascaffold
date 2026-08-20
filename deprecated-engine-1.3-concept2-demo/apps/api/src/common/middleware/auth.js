import jwt from 'jsonwebtoken';
import { config } from '../../config.js';
import { AppError } from '../errors.js';
import { findById } from '../../modules/auth/auth.repository.js';

export function authMiddleware(req, _res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next(new AppError('Authentication required', 401));
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, config.jwtSecret);
    const user = findById(payload.sub);
    if (!user) {
      return next(new AppError('Invalid token', 401));
    }
    req.user = { id: user.id, email: user.email, name: user.name };
    next();
  } catch {
    next(new AppError('Invalid token', 401));
  }
}
