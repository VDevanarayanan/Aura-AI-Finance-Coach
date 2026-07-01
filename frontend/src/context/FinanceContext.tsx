import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Transaction, Budget, SavingsGoal } from '../../../shared/types';
import { apiRequest } from '../utils/api';
import { useAuth } from './AuthContext';

interface FinanceContextType {
  transactions: Transaction[];
  budgets: Budget[];
  savingsGoals: SavingsGoal[];
  currentMonth: string; // YYYY-MM
  setCurrentMonth: (month: string) => void;
  isFinanceLoading: boolean;
  refreshFinanceData: () => Promise<void>;
  
  // Transactions
  addTransaction: (description: string) => Promise<Transaction>;
  updateTransaction: (id: string, data: Partial<Transaction>) => Promise<Transaction>;
  deleteTransaction: (id: string) => Promise<void>;
  
  // Budgets
  addBudget: (category: string, limitAmount: number) => Promise<Budget>;
  updateBudget: (id: string, limitAmount: number) => Promise<Budget>;
  deleteBudget: (id: string) => Promise<void>;
  
  // Savings Goals
  addGoal: (name: string, targetAmount: number, targetDate: string, currentAmount: number) => Promise<SavingsGoal>;
  updateGoal: (id: string, data: Partial<SavingsGoal>) => Promise<SavingsGoal>;
  deleteGoal: (id: string) => Promise<void>;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  // Initialize to current month (YYYY-MM)
  const getTodayMonthStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  };

  const [currentMonth, setCurrentMonth] = useState<string>(getTodayMonthStr());
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [isFinanceLoading, setIsFinanceLoading] = useState<boolean>(false);

  const refreshFinanceData = async () => {
    if (!isAuthenticated) return;
    setIsFinanceLoading(true);
    try {
      // Fetch concurrently to minimize page load times
      const [txs, budgs, goals] = await Promise.all([
        apiRequest<Transaction[]>('/transactions'),
        apiRequest<Budget[]>('/budgets', { params: { month: currentMonth } }),
        apiRequest<SavingsGoal[]>('/savings-goals'),
      ]);
      setTransactions(txs);
      setBudgets(budgs);
      setSavingsGoals(goals);
    } catch (error) {
      console.error('Error fetching finance details:', error);
    } finally {
      setIsFinanceLoading(false);
    }
  };

  useEffect(() => {
    refreshFinanceData();
  }, [isAuthenticated, currentMonth]);

  // 1. Transaction Handlers
  const addTransaction = async (description: string) => {
    const tx = await apiRequest<Transaction>('/transactions', {
      method: 'POST',
      body: JSON.stringify({ description }),
    });
    // Dynamically append transaction to state
    setTransactions((prev) => [tx, ...prev]);
    // Refresh budgets/goals since spending/income could impact them
    await refreshFinanceData();
    return tx;
  };

  const updateTransaction = async (id: string, data: Partial<Transaction>) => {
    const updatedTx = await apiRequest<Transaction>(`/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    setTransactions((prev) => prev.map((t) => (t.id === id ? updatedTx : t)));
    await refreshFinanceData();
    return updatedTx;
  };

  const deleteTransaction = async (id: string) => {
    await apiRequest(`/transactions/${id}`, { method: 'DELETE' });
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    await refreshFinanceData();
  };

  // 2. Budget Handlers
  const addBudget = async (category: string, limitAmount: number) => {
    const budget = await apiRequest<Budget>('/budgets', {
      method: 'POST',
      body: JSON.stringify({ category, limitAmount, month: currentMonth }),
    });
    setBudgets((prev) => [...prev, budget]);
    return budget;
  };

  const updateBudget = async (id: string, limitAmount: number) => {
    const updated = await apiRequest<Budget>(`/budgets/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ limitAmount }),
    });
    setBudgets((prev) => prev.map((b) => (b.id === id ? updated : b)));
    return updated;
  };

  const deleteBudget = async (id: string) => {
    await apiRequest(`/budgets/${id}`, { method: 'DELETE' });
    setBudgets((prev) => prev.filter((b) => b.id !== id));
  };

  // 3. Goal Handlers
  const addGoal = async (name: string, targetAmount: number, targetDate: string, currentAmount: number) => {
    const goal = await apiRequest<SavingsGoal>('/savings-goals', {
      method: 'POST',
      body: JSON.stringify({ name, targetAmount, targetDate, currentAmount }),
    });
    setSavingsGoals((prev) => [...prev, goal]);
    return goal;
  };

  const updateGoal = async (id: string, data: Partial<SavingsGoal>) => {
    const updated = await apiRequest<SavingsGoal>(`/savings-goals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    setSavingsGoals((prev) => prev.map((g) => (g.id === id ? updated : g)));
    return updated;
  };

  const deleteGoal = async (id: string) => {
    await apiRequest(`/savings-goals/${id}`, { method: 'DELETE' });
    setSavingsGoals((prev) => prev.filter((g) => g.id !== id));
  };

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        budgets,
        savingsGoals,
        currentMonth,
        setCurrentMonth,
        isFinanceLoading,
        refreshFinanceData,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addBudget,
        updateBudget,
        deleteBudget,
        addGoal,
        updateGoal,
        deleteGoal,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
