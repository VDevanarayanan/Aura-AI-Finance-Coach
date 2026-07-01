import { Router } from 'express';
import { getMonthlyReport } from '../controllers/report.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware as any);

router.get('/monthly', getMonthlyReport as any);

export default router;
