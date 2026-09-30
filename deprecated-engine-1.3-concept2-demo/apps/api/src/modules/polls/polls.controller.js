import * as pollsService from './polls.service.js';

export function createPoll(req, res, next) {
  try {
    const poll = pollsService.createPoll(req.user.id, req.body);
    res.status(201).json(poll);
  } catch (err) {
    next(err);
  }
}

export function listPolls(req, res, next) {
  try {
    const result = pollsService.listPolls(req.query);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export function getPoll(req, res, next) {
  try {
    const poll = pollsService.getPoll(req.params.id, req.user.id);
    res.json(poll);
  } catch (err) {
    next(err);
  }
}

export function castVote(req, res, next) {
  try {
    const poll = pollsService.castVote(req.user.id, req.params.id, req.body);
    res.json(poll);
  } catch (err) {
    next(err);
  }
}

export function closePoll(req, res, next) {
  try {
    const poll = pollsService.closePoll(req.user.id, req.params.id);
    res.json(poll);
  } catch (err) {
    next(err);
  }
}
