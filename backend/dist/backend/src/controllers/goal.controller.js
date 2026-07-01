"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteGoal = exports.updateGoal = exports.createGoal = exports.getGoals = void 0;
const db_1 = require("../db");
const getGoals = async (req, res) => {
    if (!req.user)
        return res.status(401).json({ error: 'Not authenticated.' });
    try {
        const goals = await db_1.prisma.savingsGoal.findMany({
            where: { userId: req.user.id },
            orderBy: { targetDate: 'asc' },
        });
        return res.status(200).json(goals);
    }
    catch (error) {
        console.error('Error fetching savings goals:', error);
        return res.status(500).json({ error: 'Failed to fetch savings goals.' });
    }
};
exports.getGoals = getGoals;
const createGoal = async (req, res) => {
    if (!req.user)
        return res.status(401).json({ error: 'Not authenticated.' });
    const { name, targetAmount, currentAmount, targetDate } = req.body;
    if (!name || targetAmount === undefined || !targetDate) {
        return res
            .status(400)
            .json({ error: 'Please provide goal name, targetAmount, and targetDate.' });
    }
    try {
        const goal = await db_1.prisma.savingsGoal.create({
            data: {
                userId: req.user.id,
                name,
                targetAmount: Number(targetAmount),
                currentAmount: currentAmount !== undefined ? Number(currentAmount) : 0,
                targetDate: new Date(targetDate),
            },
        });
        return res.status(201).json(goal);
    }
    catch (error) {
        console.error('Error creating savings goal:', error);
        return res.status(500).json({ error: 'Failed to create savings goal.' });
    }
};
exports.createGoal = createGoal;
const updateGoal = async (req, res) => {
    if (!req.user)
        return res.status(401).json({ error: 'Not authenticated.' });
    const { id } = req.params;
    const { name, targetAmount, currentAmount, targetDate } = req.body;
    try {
        const existing = await db_1.prisma.savingsGoal.findUnique({
            where: { id },
        });
        if (!existing || existing.userId !== req.user.id) {
            return res.status(404).json({ error: 'Savings goal not found.' });
        }
        const updated = await db_1.prisma.savingsGoal.update({
            where: { id },
            data: {
                name: name !== undefined ? name : existing.name,
                targetAmount: targetAmount !== undefined ? Number(targetAmount) : existing.targetAmount,
                currentAmount: currentAmount !== undefined ? Number(currentAmount) : existing.currentAmount,
                targetDate: targetDate !== undefined ? new Date(targetDate) : existing.targetDate,
            },
        });
        return res.status(200).json(updated);
    }
    catch (error) {
        console.error('Error updating savings goal:', error);
        return res.status(500).json({ error: 'Failed to update savings goal.' });
    }
};
exports.updateGoal = updateGoal;
const deleteGoal = async (req, res) => {
    if (!req.user)
        return res.status(401).json({ error: 'Not authenticated.' });
    const { id } = req.params;
    try {
        const existing = await db_1.prisma.savingsGoal.findUnique({
            where: { id },
        });
        if (!existing || existing.userId !== req.user.id) {
            return res.status(404).json({ error: 'Savings goal not found.' });
        }
        await db_1.prisma.savingsGoal.delete({
            where: { id },
        });
        return res.status(200).json({ message: 'Savings goal deleted successfully.' });
    }
    catch (error) {
        console.error('Error deleting savings goal:', error);
        return res.status(500).json({ error: 'Failed to delete savings goal.' });
    }
};
exports.deleteGoal = deleteGoal;
