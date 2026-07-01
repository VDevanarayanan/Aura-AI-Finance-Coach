"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categorizeDescription = exports.clearChatHistory = exports.getChatHistory = exports.chatWithCoach = void 0;
const db_1 = require("../db");
const ai_service_1 = require("../services/ai.service");
// 1. Interactive Chat Coach
const chatWithCoach = async (req, res) => {
    if (!req.user)
        return res.status(401).json({ error: 'Not authenticated.' });
    const { message } = req.body;
    if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'Please provide a message.' });
    }
    try {
        // 1. Fetch recent user chat history for context (up to past 20 messages)
        const chatHistoryDb = await db_1.prisma.chatHistory.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: 'asc' },
            take: 20,
        });
        const formattedHistory = chatHistoryDb.map((chat) => ({
            role: chat.role,
            message: chat.message,
        }));
        // 2. Save user message to database
        const userChat = await db_1.prisma.chatHistory.create({
            data: {
                userId: req.user.id,
                role: 'user',
                message,
            },
        });
        // 3. Request advice from AI Service (includes DB query context inside)
        const coachReply = await ai_service_1.aiService.getCoachResponse(req.user.id, message, formattedHistory);
        // 4. Save coach reply to database
        const coachChat = await db_1.prisma.chatHistory.create({
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
    }
    catch (error) {
        console.error('Error in chat controller:', error);
        return res.status(500).json({ error: 'Failed to process chat message.' });
    }
};
exports.chatWithCoach = chatWithCoach;
// 2. Retrieve Chat History
const getChatHistory = async (req, res) => {
    if (!req.user)
        return res.status(401).json({ error: 'Not authenticated.' });
    try {
        const chatHistory = await db_1.prisma.chatHistory.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: 'asc' },
        });
        return res.status(200).json(chatHistory);
    }
    catch (error) {
        console.error('Error fetching chat history:', error);
        return res.status(500).json({ error: 'Failed to retrieve chat history.' });
    }
};
exports.getChatHistory = getChatHistory;
// 3. Clear Chat History (Convenience)
const clearChatHistory = async (req, res) => {
    if (!req.user)
        return res.status(401).json({ error: 'Not authenticated.' });
    try {
        await db_1.prisma.chatHistory.deleteMany({
            where: { userId: req.user.id },
        });
        return res.status(200).json({ message: 'Chat history cleared successfully.' });
    }
    catch (error) {
        console.error('Error clearing chat history:', error);
        return res.status(500).json({ error: 'Failed to clear chat history.' });
    }
};
exports.clearChatHistory = clearChatHistory;
// 4. Categorization Dry-run Endpoint
const categorizeDescription = async (req, res) => {
    if (!req.user)
        return res.status(401).json({ error: 'Not authenticated.' });
    const { description } = req.body;
    if (!description || typeof description !== 'string') {
        return res.status(400).json({ error: 'Please provide a transaction description.' });
    }
    try {
        const currentDateStr = new Date().toISOString().split('T')[0];
        const parsed = await ai_service_1.aiService.categorizeTransaction(description, currentDateStr);
        return res.status(200).json(parsed);
    }
    catch (error) {
        console.error('Error in categorization dry-run:', error);
        return res.status(500).json({ error: 'Failed to parse description.' });
    }
};
exports.categorizeDescription = categorizeDescription;
