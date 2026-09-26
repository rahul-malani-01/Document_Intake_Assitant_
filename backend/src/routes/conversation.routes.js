import { Router } from 'express';
import { ConversationController } from '../controllers/conversation.controller.js';

const router = Router();

router.post('/sessions', ConversationController.createSession);
router.post('/sessions/:sessionId/messages', ConversationController.postMessage);
router.get('/sessions/:sessionId', ConversationController.getSession);
router.patch('/sessions/:sessionId/state', ConversationController.patchState);

export default router;