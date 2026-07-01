import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import path from 'path';

const envPath = path.resolve(__dirname, '../../.env');
console.log('[DEBUG] __dirname is:', __dirname);
console.log('[DEBUG] Resolved envPath is:', envPath);

// Load environment variables relative to this source file
const envResult = dotenv.config({ path: envPath, override: true });
if (envResult.error) {
  console.error('[DEBUG] dotenv load error:', envResult.error);
} else {
  console.log('[DEBUG] dotenv loaded successfully. keys:', Object.keys(envResult.parsed || {}));
  // Force manual override copy to process.env
  if (envResult.parsed) {
    for (const key of Object.keys(envResult.parsed)) {
      process.env[key] = envResult.parsed[key];
    }
  }
}

console.log('[DEBUG] process.env.PORT is:', process.env.PORT);

import authRouter from './routes/auth.routes';
import transactionRouter from './routes/transaction.routes';
import budgetRouter from './routes/budget.routes';
import goalRouter from './routes/goal.routes';
import reportRouter from './routes/report.routes';
import aiRouter from './routes/ai.routes';

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS with support for frontend clients
app.use(
  cors({
    origin: '*', // In production, refine to specific domains if needed
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body Parser Middleware
app.use(express.json());

// Routes Mount
app.use('/api/auth', authRouter);
app.use('/api/transactions', transactionRouter);
app.use('/api/budgets', budgetRouter);
app.use('/api/savings-goals', goalRouter);
app.use('/api/reports', reportRouter);
app.use('/api/ai', aiRouter);

// Health Check Endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
  });
});

// Serve frontend static assets in production
if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.resolve(process.cwd(), '../frontend/dist');
  app.use(express.static(frontendPath));
  
  // Wildcard redirect to index.html for React Router
  app.get('*', (req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

// 404 Route Catch-all
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Endpoint not found.' });
});

// Global Error Handler Middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled Server Error:', err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'An internal server error occurred.',
  });
});

// Boot Server
app.listen(PORT, () => {
  console.log(`[Finance Assistant Backend] Server running on port ${PORT}`);
});

export default app;
