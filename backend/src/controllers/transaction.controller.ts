import { Response } from 'express';
import { prisma } from '../db';
import { AuthenticatedRequest } from '../middleware/auth';
import { aiService } from '../services/ai.service';

export const getTransactions = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated.' });

  try {
    const transactions = await prisma.transaction.findMany({
      where: { userId: req.user.id },
      orderBy: { date: 'desc' },
    });
    return res.status(200).json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return res.status(500).json({ error: 'Failed to fetch transactions.' });
  }
};

export const createTransaction = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated.' });

  const { description } = req.body;

  if (!description || typeof description !== 'string') {
    return res.status(400).json({ error: 'Please provide a valid description.' });
  }

  try {
    // Determine the current local date format YYYY-MM-DD
    const currentDateStr = new Date().toISOString().split('T')[0];

    // Call the AI Service to categorize and parse details
    const parsedData = await aiService.categorizeTransaction(description, currentDateStr);

    // Save transaction in database
    const transaction = await prisma.transaction.create({
      data: {
        userId: req.user.id,
        description,
        title: parsedData.title,
        amount: parsedData.amount,
        type: parsedData.type,
        category: parsedData.category,
        merchant: parsedData.merchant,
        date: new Date(parsedData.date),
      },
    });

    return res.status(201).json(transaction);
  } catch (error) {
    console.error('Error creating transaction:', error);
    return res.status(500).json({ error: 'Failed to process transaction.' });
  }
};

export const updateTransaction = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated.' });

  const { id } = req.params;
  const { title, amount, type, category, merchant, date } = req.body;

  try {
    const existing = await prisma.transaction.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== req.user.id) {
      return res.status(404).json({ error: 'Transaction not found.' });
    }

    const updated = await prisma.transaction.update({
      where: { id },
      data: {
        title: title !== undefined ? title : existing.title,
        amount: amount !== undefined ? Number(amount) : existing.amount,
        type: type !== undefined ? type : existing.type,
        category: category !== undefined ? category : existing.category,
        merchant: merchant !== undefined ? merchant : existing.merchant,
        date: date !== undefined ? new Date(date) : existing.date,
      },
    });

    return res.status(200).json(updated);
  } catch (error) {
    console.error('Error updating transaction:', error);
    return res.status(500).json({ error: 'Failed to update transaction.' });
  }
};

export const deleteTransaction = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated.' });

  const { id } = req.params;

  try {
    const existing = await prisma.transaction.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== req.user.id) {
      return res.status(404).json({ error: 'Transaction not found.' });
    }

    await prisma.transaction.delete({
      where: { id },
    });

    return res.status(200).json({ message: 'Transaction deleted successfully.' });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return res.status(500).json({ error: 'Failed to delete transaction.' });
  }
};
