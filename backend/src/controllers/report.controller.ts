import { Response } from 'express';
import { prisma } from '../db';
import { AuthenticatedRequest } from '../middleware/auth';
import { aiService } from '../services/ai.service';

export const getMonthlyReport = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated.' });

  const { month } = req.query; // Expected format: YYYY-MM

  if (!month || typeof month !== 'string' || !/^\d{4}-\d{2}$/.test(month)) {
    return res.status(400).json({ error: 'Please provide a valid month in YYYY-MM format.' });
  }

  try {
    const [yearStr, monthStr] = month.split('-');
    const year = parseInt(yearStr);
    const monthNum = parseInt(monthStr);

    // Setup start and end dates in UTC
    const startDate = new Date(Date.UTC(year, monthNum - 1, 1));
    const endDate = new Date(Date.UTC(year, monthNum, 0, 23, 59, 59, 999));

    // Fetch transactions in range
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: req.user.id,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: 'asc' },
    });

    let totalIncome = 0;
    let totalExpenses = 0;
    const categoryMap: Record<string, number> = {};
    const trendMap: Record<string, number> = {};

    transactions.forEach((t) => {
      const dateStr = t.date.toISOString().split('T')[0];

      if (t.type === 'INCOME') {
        totalIncome += t.amount;
      } else {
        totalExpenses += t.amount;
        // Category spend mapping
        categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
        // Daily spending trend mapping
        trendMap[dateStr] = (trendMap[dateStr] || 0) + t.amount;
      }
    });

    const savings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? Math.round((savings / totalIncome) * 100) : 0;

    // Convert category spending to array
    const spendingByCategory = Object.entries(categoryMap).map(([category, amount]) => ({
      category,
      amount,
      percentage: totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0,
    })).sort((a, b) => b.amount - a.amount);

    // Largest spending category
    const largestSpendingCategory = spendingByCategory.length > 0
      ? { category: spendingByCategory[0].category, amount: spendingByCategory[0].amount }
      : null;

    // Convert trends to array
    const spendingTrends = Object.entries(trendMap).map(([date, amount]) => ({
      date,
      amount,
    })).sort((a, b) => a.date.localeCompare(b.date));

    // Request AI Insights (summary and recommendations) from AI Service
    const aiInsights = await aiService.generateReportInsights(month, {
      totalIncome,
      totalExpenses,
      savings,
      largestCategory: largestSpendingCategory,
      spendingByCategory,
    });

    return res.status(200).json({
      month,
      totalIncome,
      totalExpenses,
      savings,
      savingsRate,
      largestSpendingCategory,
      spendingByCategory,
      spendingTrends,
      aiSummary: aiInsights.summary,
      aiRecommendations: aiInsights.recommendations,
    });
  } catch (error) {
    console.error('Error generating monthly report:', error);
    return res.status(500).json({ error: 'Failed to generate monthly report.' });
  }
};
