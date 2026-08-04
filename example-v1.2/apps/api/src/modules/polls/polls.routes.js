import { Router } from 'express';
import { authMiddleware } from '../auth/auth.controller.js';
import * as pollsController from './polls.controller.js';

const router = Router();

router.use(authMiddleware);

router.post('/', pollsController.createPoll);
router.get('/', pollsController.listPolls);
router.get('/:id', pollsController.getPoll);
router.post('/:id/vote', pollsController.castVote);
router.post('/:id/close', pollsController.closePoll);

export default router;
