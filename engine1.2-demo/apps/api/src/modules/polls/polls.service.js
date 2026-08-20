import { AppError } from '../../common/errors.js';
import * as pollsRepo from './polls.repository.js';
import * as votesRepo from './votes.repository.js';

export function createPoll(userId, { title, description, options }) {
  if (!title?.trim()) throw new AppError('Title is required');
  if (title.length > 200) throw new AppError('Title must be 200 characters or less');
  if (description && description.length > 1000) {
    throw new AppError('Description must be 1000 characters or less');
  }

  const cleanOptions = (options || [])
    .map((o) => (typeof o === 'string' ? o : o?.label)?.trim())
    .filter(Boolean);

  if (cleanOptions.length < 2) throw new AppError('At least 2 options are required');
  if (cleanOptions.length > 5) throw new AppError('Maximum 5 options allowed');

  const pollId = pollsRepo.createPollWithOptions(
    { title: title.trim(), description: description?.trim(), createdBy: userId },
    cleanOptions
  );

  return getPoll(pollId, userId);
}

export function listPolls(query) {
  const page = Math.max(1, parseInt(query.page || '1', 10));
  const limit = Math.min(50, Math.max(1, parseInt(query.limit || '10', 10)));
  return pollsRepo.findAll({ page, limit });
}

export function getPoll(id, userId) {
  const result = pollsRepo.findById(id);
  if (!result) throw new AppError('Poll not found', 404);

  const userVote = userId ? votesRepo.findByPollAndUser(id, userId) : null;
  return pollsRepo.mapPollDetail(result, userId, userVote);
}

export function castVote(userId, pollId, { optionId }) {
  if (!optionId) throw new AppError('Option is required');

  const result = pollsRepo.findById(pollId);
  if (!result) throw new AppError('Poll not found', 404);
  if (result.poll.status !== 'open') throw new AppError('Poll is closed', 400);

  const existing = votesRepo.findByPollAndUser(pollId, userId);
  if (existing) throw new AppError('You have already voted on this poll', 409);

  const validOption = result.options.find((o) => o.id === optionId);
  if (!validOption) throw new AppError('Invalid option for this poll', 400);

  try {
    votesRepo.create({ pollId, optionId, userId });
  } catch (err) {
    if (err.message?.includes('UNIQUE')) {
      throw new AppError('You have already voted on this poll', 409);
    }
    throw err;
  }

  return getPoll(pollId, userId);
}

export function closePoll(userId, pollId) {
  const result = pollsRepo.findById(pollId);
  if (!result) throw new AppError('Poll not found', 404);
  if (result.poll.created_by !== userId) {
    throw new AppError('Only the poll creator can close it', 403);
  }

  if (result.poll.status !== 'closed') {
    pollsRepo.updateStatus(pollId, 'closed', new Date().toISOString());
  }

  return getPoll(pollId, userId);
}
