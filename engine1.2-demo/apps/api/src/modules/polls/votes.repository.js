import { v4 as uuid } from 'uuid';
import { getDb } from '../../database.js';

export function create({ pollId, optionId, userId }) {
  const db = getDb();
  const id = uuid();
  db.prepare(
    `INSERT INTO votes (id, poll_id, option_id, user_id) VALUES (?, ?, ?, ?)`
  ).run(id, pollId, optionId, userId);
  return { id, poll_id: pollId, option_id: optionId, user_id: userId };
}

export function findByPollAndUser(pollId, userId) {
  const db = getDb();
  return db.prepare(
    `SELECT * FROM votes WHERE poll_id = ? AND user_id = ?`
  ).get(pollId, userId) || null;
}
