import { Response } from 'express';
import { prisma } from '../db';
import { AuthenticatedRequest } from '../middleware/auth';
import { aiService } from '../services/ai.service';

// 1. Interactive Chat Coach
export const chatWithCoach = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated.' });

  const { message } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Please provide a message.' });
  }

  try {
    // 1. Fetch recent user chat history for context (up to past 20 messages)
    const chatHistoryDb = await prisma.chatHistory.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'asc' },
      take: 20,
    });

    const formattedHistory = chatHistoryDb.map((chat) => ({
      role: chat.role as 'user' | 'assistant',
      message: chat.message,
    }));

    // 2. Save user message to database
    const userChat = await prisma.chatHistory.create({
      data: {
        userId: req.user.id,
        role: 'user',
        message,
      },
    });

    // 3. Request advice from AI Service (includes DB query context inside)
    const coachReply = await aiService.getCoachResponse(
      req.user.id,
      message,
      formattedHistory
    );

    // 4. Save coach reply to database
    const coachChat = await prisma.chatHistory.create({
      data: {
        userId: req.user.id,
        role: 'assistant',
        message: coachReply,
      },
    });

    return res.status(200).json({
      userMessage: userChat,
      coachMessage: coachChat,
    });
  } catch (error) {
    console.error('Error in chat controller:', error);
    return res.status(500).json({ error: 'Failed to process chat message.' });
  }
};

// 2. Retrieve Chat History
export const getChatHistory = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated.' });

  try {
    const chatHistory = await prisma.chatHistory.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'asc' },
    });
    return res.status(200).json(chatHistory);
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return res.status(500).json({ error: 'Failed to retrieve chat history.' });
  }
};

// 3. Clear Chat History (Convenience)
export const clearChatHistory = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated.' });

  try {
    await prisma.chatHistory.deleteMany({
      where: { userId: req.user.id },
    });
    return res.status(200).json({ message: 'Chat history cleared successfully.' });
  } catch (error) {
    console.error('Error clearing chat history:', error);
    return res.status(500).json({ error: 'Failed to clear chat history.' });
  }
};

// 4. Categorization Dry-run Endpoint
export const categorizeDescription = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated.' });

  const { description } = req.body;

  if (!description || typeof description !== 'string') {
    return res.status(400).json({ error: 'Please provide a transaction description.' });
  }

  try {
    const currentDateStr = new Date().toISOString().split('T')[0];
    const parsed = await aiService.categorizeTransaction(description, currentDateStr);
    return res.status(200).json(parsed);
  } catch (error) {
    console.error('Error in categorization dry-run:', error);
    return res.status(500).json({ error: 'Failed to parse description.' });
  }
};
