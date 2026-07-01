import { Router } from 'express';
import {
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
} from '../controllers/goal.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware as any);

router.get('/', getGoals as any);
router.post('/', createGoal as any);
router.put('/:id', updateGoal as any);
router.delete('/:id', deleteGoal as any);

export default router;
