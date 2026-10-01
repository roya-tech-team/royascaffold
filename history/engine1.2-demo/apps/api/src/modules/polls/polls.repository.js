import { v4 as uuid } from 'uuid';
import { getDb } from '../../database.js';

export function createPollWithOptions({ title, description, createdBy }, options) {
  const db = getDb();
  const pollId = uuid();

  db.exec('BEGIN IMMEDIATE');
  try {
    db.prepare(
      `INSERT INTO polls (id, title, description, created_by) VALUES (?, ?, ?, ?)`
    ).run(pollId, title, description || null, createdBy);

    const insertOption = db.prepare(
      `INSERT INTO poll_options (id, poll_id, label, sort_order) VALUES (?, ?, ?, ?)`
    );

    options.forEach((label, index) => {
      insertOption.run(uuid(), pollId, label, index);
    });

    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }

  return pollId;
}

export function findAll({ page = 1, limit = 10 }) {
  const db = getDb();
  const offset = (page - 1) * limit;

  const total = db.prepare(`SELECT COUNT(*) as count FROM polls`).get().count;

  const rows = db.prepare(`
    SELECT p.*, u.name as creator_name,
      (SELECT COUNT(*) FROM votes v WHERE v.poll_id = p.id) as total_votes
    FROM polls p
    JOIN users u ON u.id = p.created_by
    ORDER BY p.created_at DESC
    LIMIT ? OFFSET ?
  `).all(limit, offset);

  return {
    data: rows.map(mapPollSummary),
    total,
    page,
    limit,
  };
}

export function findById(id) {
  const db = getDb();
  const poll = db.prepare(`
    SELECT p.*, u.name as creator_name
    FROM polls p
    JOIN users u ON u.id = p.created_by
    WHERE p.id = ?
  `).get(id);

  if (!poll) return null;

  const options = db.prepare(`
    SELECT po.*,
      (SELECT COUNT(*) FROM votes v WHERE v.option_id = po.id) as vote_count
    FROM poll_options po
    WHERE po.poll_id = ?
    ORDER BY po.sort_order
  `).all(id);

  return { poll, options };
}

export function updateStatus(id, status, closedAt = null) {
  const db = getDb();
  db.prepare(`UPDATE polls SET status = ?, closed_at = ? WHERE id = ?`).run(
    status,
    closedAt,
    id
  );
}

function mapPollSummary(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status,
    createdBy: row.created_by,
    creatorName: row.creator_name,
    createdAt: row.created_at,
    closedAt: row.closed_at,
    totalVotes: row.total_votes,
  };
}

export function mapPollDetail({ poll, options }, userId, userVote) {
  const totalVotes = options.reduce((sum, o) => sum + o.vote_count, 0);

  return {
    id: poll.id,
    title: poll.title,
    description: poll.description,
    status: poll.status,
    createdBy: poll.created_by,
    creatorName: poll.creator_name,
    createdAt: poll.created_at,
    closedAt: poll.closed_at,
    totalVotes,
    userVote: userVote ? { optionId: userVote.option_id } : null,
    isOwner: poll.created_by === userId,
    options: options.map((o) => ({
      id: o.id,
      label: o.label,
      sortOrder: o.sort_order,
      voteCount: o.vote_count,
      percentage: totalVotes > 0
        ? Math.round((o.vote_count / totalVotes) * 1000) / 10
        : 0,
    })),
  };
}
