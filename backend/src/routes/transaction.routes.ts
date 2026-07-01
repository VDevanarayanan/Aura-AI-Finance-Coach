import { Router } from 'express';
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from '../controllers/transaction.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Apply auth middleware to all transaction routes
router.use(authMiddleware as any);

router.get('/', getTransactions as any);
router.post('/', createTransaction as any);
router.put('/:id', updateTransaction as any);
router.delete('/:id', deleteTransaction as any);

export default router;
