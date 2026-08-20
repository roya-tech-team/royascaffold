import { v4 as uuid } from 'uuid';
import { getDb } from '../../database.js';

export function create({ name, email, passwordHash }) {
  const id = uuid();
  const db = getDb();
  db.prepare(
    `INSERT INTO users (id, name, email, password_hash) VALUES (?, ?, ?, ?)`
  ).run(id, name, email.toLowerCase(), passwordHash);
  return findById(id);
}

export function findByEmail(email) {
  const db = getDb();
  return db.prepare(`SELECT * FROM users WHERE email = ?`).get(email.toLowerCase()) || null;
}

export function findById(id) {
  const db = getDb();
  return db.prepare(`SELECT * FROM users WHERE id = ?`).get(id) || null;
}

export function toUserDto(user) {
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.created_at,
  };
}
