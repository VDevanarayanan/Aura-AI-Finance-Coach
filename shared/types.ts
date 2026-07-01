export interface UserProfile {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export type TransactionType = 'INCOME' | 'EXPENSE';

export interface Transaction {
  id: string;
  userId: string;
  title: string;
  description: string;
  amount: number;
  date: string;
  type: TransactionType;
  category: string;
  merchant: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  id: string;
  userId: string;
  month: string; // Format: YYYY-MM
  category: string; // e.g. "Food", "Utilities", "All"
  limitAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface SavingsGoal {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string; // Format: YYYY-MM-DD
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  message: string;
  createdAt: string;
}

export interface MonthlyReport {
  month: string;
  totalIncome: number;
  totalExpenses: number;
  savings: number;
  largestSpendingCategory: {
    category: string;
    amount: number;
  } | null;
  spendingByCategory: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  spendingTrends: Array<{
    date: string;
    amount: number;
  }>;
  aiSummary: string;
  aiRecommendations: string[];
}
