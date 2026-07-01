import { Router } from 'express';
import {
  chatWithCoach,
  getChatHistory,
  clearChatHistory,
  categorizeDescription,
} from '../controllers/ai.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware as any);

router.post('/chat', chatWithCoach as any);
router.get('/chat/history', getChatHistory as any);
router.delete('/chat/history', clearChatHistory as any);
router.post('/categorize', categorizeDescription as any);

export default router;
