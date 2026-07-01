"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiService = exports.GeminiAIService = void 0;
const generative_ai_1 = require("@google/generative-ai");
const db_1 = require("../db");
// Clean JSON response extractor helper
function cleanAndParseJSON(text) {
    try {
        // Strip markdown code blocks if present (e.g. ```json ... ```)
        let cleaned = text.trim();
        if (cleaned.startsWith('```')) {
            const match = cleaned.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
            if (match && match[1]) {
                cleaned = match[1].trim();
            }
        }
        return JSON.parse(cleaned);
    }
    catch (error) {
        console.error('Failed to parse JSON response from Gemini:', text, error);
        throw new Error('AI returned an invalid JSON response.');
    }
}
class GeminiAIService {
    genAI = null;
    modelName;
    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        this.modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
        if (apiKey && apiKey !== 'YOUR_GEMINI_API_KEY_HERE') {
            this.genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
        }
        else {
            console.warn('WARNING: GEMINI_API_KEY is not configured. Running in Mock/Fallback AI Mode.');
        }
    }
    // 1. Transaction Categorization
    async categorizeTransaction(description, currentDate) {
        if (!this.genAI) {
            return this.getMockCategorization(description, currentDate);
        }
        try {
            const model = this.genAI.getGenerativeModel({ model: this.modelName });
            const prompt = `You are a financial parsing assistant. Extract transaction details from the description.
Use the current date ${currentDate} as the default transaction date if none is mentioned.
Provide the response strictly as a JSON object with this exact structure:
{
  "title": "A short descriptive name (e.g. 'Pizza', 'Electricity Bill', 'Salary Credit')",
  "amount": 350.00 (a positive number, absolute value of amount),
  "type": "INCOME" or "EXPENSE" (strictly one of these strings),
  "category": "One of: Food, Utilities, Salary, Rent, Entertainment, Shopping, Travel, Savings, Healthcare, Education, Other",
  "merchant": "Merchant or source name, or null if unknown",
  "date": "YYYY-MM-DD (format as date mentioned, or default to ${currentDate} if none)"
}

Input: "${description}"

JSON output:`;
            const result = await model.generateContent(prompt);
            const text = result.response.text();
            const parsed = cleanAndParseJSON(text);
            return {
                title: parsed.title || 'Transaction',
                amount: Math.abs(Number(parsed.amount)) || 0,
                type: parsed.type === 'INCOME' ? 'INCOME' : 'EXPENSE',
                category: parsed.category || 'Other',
                merchant: parsed.merchant || null,
                date: parsed.date || currentDate,
            };
        }
        catch (error) {
            console.error('Gemini API Error in categorizeTransaction:', error);
            return this.getMockCategorization(description, currentDate);
        }
    }
    // Mock Categorizer fallback if API key is not provided
    getMockCategorization(description, currentDate) {
        const cleanDesc = description.toLowerCase();
        let amount = 0;
        const amountMatch = cleanDesc.match(/(?:rs\.?|₹|\$)\s*([\d,]+(?:\.\d+)?)|([\d,]+(?:\.\d+)?)\s*(?:rupees|rs|usd|₹)/i)
            || cleanDesc.match(/\b(\d+)\b/); // fallback to first digit
        if (amountMatch) {
            const val = amountMatch[1] || amountMatch[2];
            amount = parseFloat(val.replace(/,/g, ''));
        }
        let type = 'EXPENSE';
        let category = 'Other';
        let merchant = null;
        let title = 'Transaction';
        if (cleanDesc.includes('salary') || cleanDesc.includes('credited') || cleanDesc.includes('income') || cleanDesc.includes('refund')) {
            type = 'INCOME';
            category = 'Salary';
            title = 'Salary Credit';
        }
        else if (cleanDesc.includes('pizza') || cleanDesc.includes('burger') || cleanDesc.includes('restaurant') || cleanDesc.includes('food') || cleanDesc.includes('swiggy') || cleanDesc.includes('zomato')) {
            category = 'Food';
            merchant = cleanDesc.includes('swiggy') ? 'Swiggy' : cleanDesc.includes('zomato') ? 'Zomato' : null;
            title = 'Food & Dining';
        }
        else if (cleanDesc.includes('electricity') || cleanDesc.includes('water') || cleanDesc.includes('gas') || cleanDesc.includes('bill') || cleanDesc.includes('utility')) {
            category = 'Utilities';
            title = 'Utility Bill';
        }
        else if (cleanDesc.includes('rent') || cleanDesc.includes('pg')) {
            category = 'Rent';
            title = 'Rent Payment';
        }
        else if (cleanDesc.includes('movie') || cleanDesc.includes('netflix') || cleanDesc.includes('spotify') || cleanDesc.includes('game')) {
            category = 'Entertainment';
            merchant = cleanDesc.includes('netflix') ? 'Netflix' : cleanDesc.includes('spotify') ? 'Spotify' : null;
            title = 'Entertainment';
        }
        else if (cleanDesc.includes('amazon') || cleanDesc.includes('myntra') || cleanDesc.includes('flipkart') || cleanDesc.includes('clothes') || cleanDesc.includes('shopping')) {
            category = 'Shopping';
            merchant = cleanDesc.includes('amazon') ? 'Amazon' : cleanDesc.includes('myntra') ? 'Myntra' : cleanDesc.includes('flipkart') ? 'Flipkart' : null;
            title = 'Shopping';
        }
        else if (cleanDesc.includes('uber') || cleanDesc.includes('ola') || cleanDesc.includes('cab') || cleanDesc.includes('fuel') || cleanDesc.includes('petrol') || cleanDesc.includes('travel')) {
            category = 'Travel';
            merchant = cleanDesc.includes('uber') ? 'Uber' : cleanDesc.includes('ola') ? 'Ola' : null;
            title = 'Travel Expense';
        }
        return {
            title,
            amount,
            type,
            category,
            merchant,
            date: currentDate,
        };
    }
    // 2. AI Coach Chat
    async getCoachResponse(userId, message, history) {
        // Retrieve user financial data from the database
        const transactions = await db_1.prisma.transaction.findMany({
            where: { userId },
            orderBy: { date: 'desc' },
            take: 50,
        });
        const budgets = await db_1.prisma.budget.findMany({
            where: { userId },
        });
        const savingsGoals = await db_1.prisma.savingsGoal.findMany({
            where: { userId },
        });
        // Structure finance summaries for the prompt context
        const totalIncome = transactions
            .filter((t) => t.type === 'INCOME')
            .reduce((sum, t) => sum + t.amount, 0);
        const totalExpense = transactions
            .filter((t) => t.type === 'EXPENSE')
            .reduce((sum, t) => sum + t.amount, 0);
        const categorySpending = {};
        transactions
            .filter((t) => t.type === 'EXPENSE')
            .forEach((t) => {
            categorySpending[t.category] = (categorySpending[t.category] || 0) + t.amount;
        });
        const financialContext = {
            currentTime: new Date().toISOString().split('T')[0],
            financialSummary: {
                totalIncomePast50Transactions: totalIncome,
                totalExpensePast50Transactions: totalExpense,
                netSavingsPast50Transactions: totalIncome - totalExpense,
            },
            categorySpending,
            activeBudgets: budgets.map((b) => ({
                month: b.month,
                category: b.category,
                limitAmount: b.limitAmount,
            })),
            savingsGoals: savingsGoals.map((g) => ({
                name: g.name,
                targetAmount: g.targetAmount,
                currentAmount: g.currentAmount,
                targetDate: g.targetDate.toISOString().split('T')[0],
                progressPercent: (g.currentAmount / g.targetAmount) * 100,
            })),
            recentTransactions: transactions.slice(0, 10).map((t) => ({
                title: t.title,
                amount: t.amount,
                type: t.type,
                category: t.category,
                date: t.date.toISOString().split('T')[0],
                merchant: t.merchant,
            })),
        };
        if (!this.genAI) {
            return this.getMockCoachResponse(message, financialContext);
        }
        try {
            const model = this.genAI.getGenerativeModel({ model: this.modelName });
            // Build chat prompt with context
            const chatHistoryPrompt = history
                .map((h) => `${h.role === 'user' ? 'User' : 'Coach'}: ${h.message}`)
                .join('\n');
            const systemPrompt = `You are "Antigravity Wealth Coach", an empathetic, highly skilled, and practical AI Personal Finance Coach.
You have access to the user's authentic financial data.
Your responses MUST be based on the provided financial context and contain actual numbers from their data instead of generic financial tips.

Here is the user's financial context:
${JSON.stringify(financialContext, null, 2)}

Instructions:
1. Speak directly, confidently, and kindly.
2. If asked whether they can afford something (like a laptop), calculate it based on their net savings, budget margins, and goals.
3. Keep answers clear, structured (use bullet points where appropriate), and focused on helping them save.
4. Format currency figures nicely (e.g. ₹1,200 or $350 depending on the symbol in their description, default to ₹).

Chat History:
${chatHistoryPrompt}
User: ${message}
Coach:`;
            const result = await model.generateContent(systemPrompt);
            return result.response.text().trim();
        }
        catch (error) {
            console.error('Gemini API Error in getCoachResponse:', error);
            return this.getMockCoachResponse(message, financialContext);
        }
    }
    getMockCoachResponse(message, context) {
        const cleanMsg = message.toLowerCase();
        const activeGoals = context.savingsGoals.map((g) => `${g.name} (${g.progressPercent.toFixed(0)}% reached)`).join(', ') || 'No active goals';
        if (cleanMsg.includes('afford') && (cleanMsg.includes('laptop') || cleanMsg.includes('phone') || cleanMsg.includes('₹') || cleanMsg.includes('rs') || cleanMsg.includes('costing'))) {
            // Find amount if mentioned
            const matches = cleanMsg.match(/\d+/g);
            const amount = matches ? parseInt(matches[0]) : 60000;
            const savings = context.financialSummary.netSavingsPast50Transactions;
            if (savings > amount) {
                return `Based on your recent transactions, your net balance is around ₹${savings.toLocaleString()}. You can afford this purchase of ₹${amount.toLocaleString()} comfortably out of your savings. However, make sure it doesn't delay your active goals: ${activeGoals}.`;
            }
            else {
                const gap = amount - savings;
                return `Currently, your net balance from your recent transactions is ₹${savings.toLocaleString()}. Purchasing this item costing ₹${amount.toLocaleString()} would put you in a deficit of ₹${gap.toLocaleString()}. I suggest setting up a specific savings goal for this item and saving progressively!`;
            }
        }
        if (cleanMsg.includes('spend') || cleanMsg.includes('expense') || cleanMsg.includes('where am i spending')) {
            const topCategories = Object.entries(context.categorySpending)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3)
                .map(([cat, amt]) => `- **${cat}**: ₹${amt.toLocaleString()}`)
                .join('\n');
            return `Here is where you are spending the most based on recent records:\n${topCategories || 'No expense data recorded yet.'}\n\nTo save more, try setting a monthly budget for these categories.`;
        }
        if (cleanMsg.includes('save') || cleanMsg.includes('goal')) {
            return `You have the following savings goals active:\n${context.savingsGoals.map((g) => `- **${g.name}**: Target ₹${g.targetAmount.toLocaleString()}, Current ₹${g.currentAmount.toLocaleString()} (${g.progressPercent.toFixed(0)}% complete) by ${g.targetDate}`).join('\n') || '- No active savings goals yet.'}\n\nTo save more, consider automating savings at the start of the month right after your salary is credited.`;
        }
        return `Hello! I'm your Antigravity Wealth Coach. I can help you parse your recent transactions, check category budgets, track goals, and give advice. Try asking me:\n- "Where am I spending the most?"\n- "Can I afford a laptop costing ₹60,000?"\n- "How is my progress on my savings goals?"`;
    }
    // 3. AI Reports insights
    async generateReportInsights(month, stats) {
        if (!this.genAI) {
            return this.getMockReportInsights(stats);
        }
        try {
            const model = this.genAI.getGenerativeModel({ model: this.modelName });
            const prompt = `You are a financial analyst. Generate a summary and recommendations for a user's monthly budget report.
Month: ${month}
Metrics:
- Total Income: ₹${stats.totalIncome}
- Total Expenses: ₹${stats.totalExpenses}
- Total Savings: ₹${stats.savings}
- Largest Category: ${stats.largestCategory ? `${stats.largestCategory.category} (₹${stats.largestCategory.amount})` : 'N/A'}
- Category Breakdown: ${JSON.stringify(stats.spendingByCategory)}

Provide the response strictly as a JSON object with this exact structure:
{
  "summary": "A cohesive 2-3 sentence overview of their financial health for this month.",
  "recommendations": [
    "First specific actionable bullet point (referencing their data)",
    "Second specific actionable bullet point",
    "Third specific actionable bullet point"
  ]
}

JSON output:`;
            const result = await model.generateContent(prompt);
            const text = result.response.text();
            const parsed = cleanAndParseJSON(text);
            return {
                summary: parsed.summary || 'Monthly review summary generated successfully.',
                recommendations: parsed.recommendations || [
                    'Track your daily expenses regularly to avoid budget overruns.',
                    'Set aside a fixed savings amount at the beginning of the month.',
                    'Review your largest category and plan to cut back by 10% next month.'
                ],
            };
        }
        catch (error) {
            console.error('Gemini API Error in generateReportInsights:', error);
            return this.getMockReportInsights(stats);
        }
    }
    getMockReportInsights(stats) {
        const largestCatName = stats.largestCategory ? stats.largestCategory.category : 'N/A';
        const largestCatAmt = stats.largestCategory ? stats.largestCategory.amount : 0;
        const savingsRate = stats.totalIncome > 0 ? (stats.savings / stats.totalIncome) * 100 : 0;
        let summary = `This month, you earned ₹${stats.totalIncome.toLocaleString()} and spent ₹${stats.totalExpenses.toLocaleString()}, leaving you with ₹${stats.savings.toLocaleString()} in savings (a ${savingsRate.toFixed(0)}% savings rate). `;
        if (stats.largestCategory) {
            summary += `Your primary expense was in the **${largestCatName}** category, which accounted for ₹${largestCatAmt.toLocaleString()}.`;
        }
        const recommendations = [
            `Review your spending in **${largestCatName || 'your top category'}** and set a budget to reduce it next month.`,
            stats.savings > 0
                ? `Great job saving ₹${stats.savings.toLocaleString()}! Consider transferring this to a dedicated savings goal or investment.`
                : `You had a net zero or negative savings this month. Try tracking daily discretionary expenses.`,
            `Set up budgets for next month at the category level to stay on track.`
        ];
        return {
            summary,
            recommendations,
        };
    }
}
exports.GeminiAIService = GeminiAIService;
// Export a singleton instance of the AI Service
exports.aiService = new GeminiAIService();
