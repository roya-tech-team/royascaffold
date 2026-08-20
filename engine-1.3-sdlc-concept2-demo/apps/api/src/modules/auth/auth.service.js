import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../../config.js';
import { AppError } from '../../common/errors.js';
import * as usersRepo from './auth.repository.js';

function signToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
}

function authResponse(user) {
  return {
    token: signToken(user),
    user: usersRepo.toUserDto(user),
  };
}

export async function register({ name, email, password }) {
  if (!name?.trim()) throw new AppError('Name is required');
  if (!email?.trim()) throw new AppError('Email is required');
  if (!password || password.length < 8) {
    throw new AppError('Password must be at least 8 characters');
  }

  const existing = usersRepo.findByEmail(email);
  if (existing) throw new AppError('Email already registered', 409);

  const passwordHash = await bcrypt.hash(password, 10);
  const user = usersRepo.create({ name: name.trim(), email, passwordHash });
  return authResponse(user);
}

export async function login({ email, password }) {
  if (!email || !password) throw new AppError('Email and password are required');

  const user = usersRepo.findByEmail(email);
  if (!user) throw new AppError('Invalid credentials', 401);

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) throw new AppError('Invalid credentials', 401);

  return authResponse(user);
}

export function getMe(userId) {
  const user = usersRepo.findById(userId);
  if (!user) throw new AppError('User not found', 404);
  return usersRepo.toUserDto(user);
}
