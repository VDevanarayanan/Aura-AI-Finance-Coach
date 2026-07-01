import { Router } from 'express';
import {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
} from '../controllers/budget.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware as any);

router.get('/', getBudgets as any);
router.post('/', createBudget as any);
router.put('/:id', updateBudget as any);
router.delete('/:id', deleteBudget as any);

export default router;
