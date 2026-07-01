import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { Progress } from '../components/Progress';
import { Plus, Edit2, Trash2, PiggyBank, Calendar, AlertTriangle } from 'lucide-react';
import type { Budget } from '../../../shared/types';

export const Budgets: React.FC = () => {
  const {
    transactions,
    budgets,
    currentMonth,
    setCurrentMonth,
    addBudget,
    updateBudget,
    deleteBudget,
  } = useFinance();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [newLimit, setNewLimit] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isCustomCategory, setIsCustomCategory] = useState(false);

  // Edit states
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editLimit, setEditLimit] = useState('');

  // Delete states
  const [deletingBudgetId, setDeletingBudgetId] = useState<string | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Standard category suggestions
  const categories = [
    'Food',
    'Utilities',
    'Entertainment',
    'Shopping',
    'Travel',
    'Savings',
    'Healthcare',
    'Education',
    'Other',
  ];

  const openAddModal = () => {
    setNewCategory('');
    setNewLimit('');
    setIsCustomCategory(false);
    setError(null);
    setIsAddOpen(true);
  };

  const handleCreateBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory || !newLimit) return;

    setError(null);
    try {
      await addBudget(newCategory, parseFloat(newLimit));
      setIsAddOpen(false);
      setNewCategory('');
      setNewLimit('');
      setIsCustomCategory(false);
    } catch (err: any) {
      setError(err.message || 'Failed to create budget.');
    }
  };

  const handleEditClick = (b: Budget) => {
    setEditingBudget(b);
    setEditLimit(b.limitAmount.toString());
    setIsEditOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBudget) return;

    try {
      await updateBudget(editingBudget.id, parseFloat(editLimit));
      setIsEditOpen(false);
      setEditingBudget(null);
    } catch (err) {
      console.error('Failed to update budget limit:', err);
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeletingBudgetId(id);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingBudgetId) return;
    try {
      await deleteBudget(deletingBudgetId);
      setIsDeleteOpen(false);
      setDeletingBudgetId(null);
    } catch (err) {
      console.error('Failed to delete budget:', err);
    }
  };

  // Find overall monthly budget (category: 'Overall')
  const overallBudget = budgets.find((b) => b.category.toLowerCase() === 'overall');
  // Filter out overall budget for the category sub-budgets grid
  const categoryBudgets = budgets.filter((b) => b.category.toLowerCase() !== 'overall');

  // Compute total expenses for current selected month to show in overall budget card
  const totalExpenses = transactions
    .filter((t) => t.date.startsWith(currentMonth) && t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0);

  // Helper to compute actual spending in a budget category for current selected month
  const getCategorySpending = (category: string) => {
    return transactions
      .filter(
        (t) =>
          t.date.startsWith(currentMonth) &&
          t.type === 'EXPENSE' &&
          t.category.toLowerCase() === category.toLowerCase()
      )
      .reduce((sum, t) => sum + t.amount, 0);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-50">
            Category Budgets
          </h1>
          <p className="text-sm text-zinc-400 mt-1.5">
            Define strict category limits for the selected month and monitor your spending thresholds.
          </p>
        </div>

        <div className="flex items-center gap-3.5">
          {/* Month Selector */}
          <div className="flex items-center space-x-2.5 bg-zinc-900/60 border border-zinc-800/80 px-4 py-2.5 rounded-xl backdrop-blur-md shadow-sm">
            <Calendar className="h-4.5 w-4.5 text-zinc-400" />
            <input
              type="month"
              value={currentMonth}
              onChange={(e) => setCurrentMonth(e.target.value)}
              className="text-sm font-bold bg-transparent text-zinc-50 focus:outline-none border-0 p-0 cursor-pointer"
            />
          </div>

          <Button
            onClick={openAddModal}
            variant="primary"
            className="h-11 bg-zinc-50 text-zinc-900 hover:bg-zinc-200 font-bold"
          >
            <Plus className="h-4.5 w-4.5 mr-1.5" />
            Set Budget
          </Button>
        </div>
      </div>

      {/* Overall Monthly Budget Card */}
      {overallBudget ? (
        <Card className="border-zinc-800 bg-zinc-900/40 glow-purple">
          <Card.Header className="flex flex-row items-center justify-between pb-3">
            <div>
              <span className="text-3xs uppercase tracking-widest font-black text-purple-400">
                Primary Budget Target
              </span>
              <Card.Title className="text-xl mt-0.5">Overall Monthly Spend Limit</Card.Title>
            </div>
            <Button
              onClick={() => handleEditClick(overallBudget)}
              variant="outline"
              className="h-9 px-3.5 text-xs font-semibold flex items-center space-x-1.5"
            >
              <Edit2 className="h-3.5 w-3.5" />
              <span>Modify Limit</span>
            </Button>
          </Card.Header>
          <Card.Content className="space-y-4">
            <Progress value={totalExpenses} max={overallBudget.limitAmount} variant="budget" />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-sm gap-2">
              <span className="text-zinc-400 font-semibold">
                {totalExpenses > overallBudget.limitAmount ? (
                  <span className="text-red-400 font-bold flex items-center gap-1">
                    <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
                    Overspent overall budget by ₹{(totalExpenses - overallBudget.limitAmount).toLocaleString()}
                  </span>
                ) : (
                  <span>₹{(overallBudget.limitAmount - totalExpenses).toLocaleString()} Remaining of ₹{overallBudget.limitAmount.toLocaleString()} Limit</span>
                )}
              </span>
              <span className="font-black text-zinc-50">
                ₹{totalExpenses.toLocaleString()} Total Spent (All Categories)
              </span>
            </div>
          </Card.Content>
        </Card>
      ) : (
        <Card className="border-dashed border-zinc-800 bg-zinc-900/10">
          <Card.Content className="py-6 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-950/40 text-purple-400 rounded-lg animate-pulse">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-zinc-200">No Overall Monthly Budget Set</h4>
                <p className="text-xs text-zinc-500 mt-0.5">Initialize your monthly spending limit to unlock full dashboard tracking.</p>
              </div>
            </div>
            <Button
              onClick={() => {
                setIsCustomCategory(false);
                setNewCategory('Overall');
                setIsAddOpen(true);
              }}
              variant="secondary"
              className="text-xs h-9 px-4 font-bold"
            >
              Set Limit
            </Button>
          </Card.Content>
        </Card>
      )}

      {/* Category Sub-budgets Grid Section */}
      <div className="space-y-4 pt-2">
        <h2 className="text-lg font-bold text-zinc-300">Category Sub-Budgets</h2>
        {categoryBudgets.length === 0 ? (
          <Card className="text-center py-12 border-zinc-850 bg-zinc-900/40">
            <Card.Content className="flex flex-col items-center">
              <div className="p-4 bg-zinc-950/40 text-zinc-500 rounded-full mb-4">
                <PiggyBank className="h-8 w-8" />
              </div>
              <h3 className="font-bold text-base text-zinc-200">
                No Category Budgets Set
              </h3>
              <p className="text-xs text-zinc-400 mt-1 max-w-sm">
                Establish budgets for specific categories like Food, Travel, or Entertainment to track sub-allocations.
              </p>
              <Button
                onClick={openAddModal}
                variant="secondary"
                className="mt-4 text-xs h-9 px-4 font-bold"
              >
                Set Category Budget
              </Button>
            </Card.Content>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categoryBudgets.map((b) => {
            const spent = getCategorySpending(b.category);
            const remaining = b.limitAmount - spent;
            const isOverspent = spent > b.limitAmount;

            return (
              <Card key={b.id} className={isOverspent ? 'border-red-950/30' : ''}>
                <Card.Header className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <span className="text-2xs uppercase tracking-widest font-black text-zinc-500">
                      Budget Category
                    </span>
                    <Card.Title className="text-xl mt-0.5">{b.category}</Card.Title>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => handleEditClick(b)}
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-150 hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(b.id)}
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-950/20 transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </Card.Header>
                <Card.Content className="space-y-4">
                  {/* Progress Meter */}
                  <Progress value={spent} max={b.limitAmount} variant="budget" />

                  {/* Financial Status Summary */}
                  <div className="flex items-center justify-between text-sm">
                    {isOverspent ? (
                      <span className="flex items-center text-red-400 font-bold gap-1 animate-pulse">
                        <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
                        Overspent by ₹{(spent - b.limitAmount).toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-zinc-400 font-semibold">
                        ₹{remaining.toLocaleString()} Remaining
                      </span>
                    )}

                    <span className="font-black text-zinc-50">
                      ₹{spent.toLocaleString()} spent
                    </span>
                  </div>
                </Card.Content>
              </Card>
            );
          })}
        </div>
      )}
      </div>

      {/* Set Budget Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Set Budget Limit"
      >
        <form onSubmit={handleCreateBudget} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-950/30 text-red-400 border border-red-900/50 text-xs font-semibold rounded-xl">
              {error}
            </div>
          )}

          <div className="flex flex-col space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Budget Category
            </label>
            <select
              value={isCustomCategory ? 'Other' : newCategory}
              onChange={(e) => {
                const val = e.target.value;
                if (val === 'Other') {
                  setIsCustomCategory(true);
                  setNewCategory('');
                } else {
                  setIsCustomCategory(false);
                  setNewCategory(val);
                }
              }}
              required
              className="h-10 rounded-xl border border-zinc-800 bg-zinc-900/50 px-3.5 text-sm text-zinc-200 focus:outline-none"
            >
              <option value="">Select a category...</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {isCustomCategory && (
              <div className="mt-2">
                <Input
                  placeholder="Enter custom category name"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  required
                />
              </div>
            )}
          </div>

          <Input
            label="Limit Amount (₹)"
            type="number"
            placeholder="e.g. 10000"
            value={newLimit}
            onChange={(e) => setNewLimit(e.target.value)}
            required
          />

          <div className="flex justify-end space-x-3.5 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Set Limit
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Limit Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title={`Edit Budget for ${editingBudget?.category}`}
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <Input
            label="Budget Limit Amount (₹)"
            type="number"
            value={editLimit}
            onChange={(e) => setEditLimit(e.target.value)}
            required
          />

          <div className="flex justify-end space-x-3.5 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Limit
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Limit Confirmation */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Remove Budget Limit"
      >
        <p className="text-sm text-zinc-400">
          Are you sure you want to remove this category budget? This will delete the
          monthly spending cap, but your transactions history remains unchanged.
        </p>
        <div className="flex justify-end space-x-3.5 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsDeleteOpen(false)}
          >
            Cancel
          </Button>
          <Button type="button" variant="danger" onClick={handleConfirmDelete}>
            Remove Limit
          </Button>
        </div>
      </Modal>
    </div>
  );
};
