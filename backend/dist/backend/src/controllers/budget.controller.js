"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBudget = exports.updateBudget = exports.createBudget = exports.getBudgets = void 0;
const db_1 = require("../db");
const getBudgets = async (req, res) => {
    if (!req.user)
        return res.status(401).json({ error: 'Not authenticated.' });
    const { month } = req.query;
    try {
        const filter = { userId: req.user.id };
        if (month && typeof month === 'string') {
            filter.month = month;
        }
        const budgets = await db_1.prisma.budget.findMany({
            where: filter,
            orderBy: { category: 'asc' },
        });
        return res.status(200).json(budgets);
    }
    catch (error) {
        console.error('Error fetching budgets:', error);
        return res.status(500).json({ error: 'Failed to fetch budgets.' });
    }
};
exports.getBudgets = getBudgets;
const createBudget = async (req, res) => {
    if (!req.user)
        return res.status(401).json({ error: 'Not authenticated.' });
    const { month, category, limitAmount } = req.body;
    if (!month || !category || limitAmount === undefined) {
        return res
            .status(400)
            .json({ error: 'Please provide month (YYYY-MM), category, and limitAmount.' });
    }
    try {
        // Check if user already has a budget for this category and month
        const existing = await db_1.prisma.budget.findUnique({
            where: {
                userId_month_category: {
                    userId: req.user.id,
                    month,
                    category,
                },
            },
        });
        if (existing) {
            return res
                .status(400)
                .json({ error: `A budget for category '${category}' in month '${month}' already exists.` });
        }
        const budget = await db_1.prisma.budget.create({
            data: {
                userId: req.user.id,
                month,
                category,
                limitAmount: Number(limitAmount),
            },
        });
        return res.status(201).json(budget);
    }
    catch (error) {
        console.error('Error creating budget:', error);
        return res.status(500).json({ error: 'Failed to create budget.' });
    }
};
exports.createBudget = createBudget;
const updateBudget = async (req, res) => {
    if (!req.user)
        return res.status(401).json({ error: 'Not authenticated.' });
    const { id } = req.params;
    const { limitAmount, category, month } = req.body;
    try {
        const existing = await db_1.prisma.budget.findUnique({
            where: { id },
        });
        if (!existing || existing.userId !== req.user.id) {
            return res.status(404).json({ error: 'Budget not found.' });
        }
        // Check if renaming to an existing month + category combination
        if ((category && category !== existing.category) || (month && month !== existing.month)) {
            const checkCombination = await db_1.prisma.budget.findUnique({
                where: {
                    userId_month_category: {
                        userId: req.user.id,
                        month: month || existing.month,
                        category: category || existing.category,
                    },
                },
            });
            if (checkCombination && checkCombination.id !== id) {
                return res.status(400).json({
                    error: 'A budget with the new category and month configuration already exists.',
                });
            }
        }
        const updated = await db_1.prisma.budget.update({
            where: { id },
            data: {
                limitAmount: limitAmount !== undefined ? Number(limitAmount) : existing.limitAmount,
                category: category !== undefined ? category : existing.category,
                month: month !== undefined ? month : existing.month,
            },
        });
        return res.status(200).json(updated);
    }
    catch (error) {
        console.error('Error updating budget:', error);
        return res.status(500).json({ error: 'Failed to update budget.' });
    }
};
exports.updateBudget = updateBudget;
const deleteBudget = async (req, res) => {
    if (!req.user)
        return res.status(401).json({ error: 'Not authenticated.' });
    const { id } = req.params;
    try {
        const existing = await db_1.prisma.budget.findUnique({
            where: { id },
        });
        if (!existing || existing.userId !== req.user.id) {
            return res.status(404).json({ error: 'Budget not found.' });
        }
        await db_1.prisma.budget.delete({
            where: { id },
        });
        return res.status(200).json({ message: 'Budget deleted successfully.' });
    }
    catch (error) {
        console.error('Error deleting budget:', error);
        return res.status(500).json({ error: 'Failed to delete budget.' });
    }
};
exports.deleteBudget = deleteBudget;
