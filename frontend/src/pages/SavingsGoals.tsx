import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { Progress } from '../components/Progress';
import { Plus, Edit2, Trash2, Target, Calendar, Award } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { SavingsGoal } from '../../../shared/types';

export const SavingsGoals: React.FC = () => {
  const { savingsGoals, addGoal, updateGoal, deleteGoal } = useFinance();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Edit states
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editTargetAmount, setEditTargetAmount] = useState('');
  const [editCurrentAmount, setEditCurrentAmount] = useState('');
  const [editTargetDate, setEditTargetDate] = useState('');

  // Delete states
  const [deletingGoalId, setDeletingGoalId] = useState<string | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const triggerConfetti = () => {
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'],
    });
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !targetAmount || !targetDate) return;

    setError(null);
    const target = parseFloat(targetAmount);
    const current = currentAmount ? parseFloat(currentAmount) : 0;

    try {
      await addGoal(name, target, targetDate, current);
      setIsAddOpen(false);

      // Trigger confetti if goal is immediately reached
      if (current >= target) {
        triggerConfetti();
      }

      setName('');
      setTargetAmount('');
      setCurrentAmount('');
      setTargetDate('');
    } catch (err: any) {
      setError(err.message || 'Failed to create savings goal.');
    }
  };

  const handleEditClick = (g: SavingsGoal) => {
    setEditingGoal(g);
    setEditName(g.name);
    setEditTargetAmount(g.targetAmount.toString());
    setEditCurrentAmount(g.currentAmount.toString());
    setEditTargetDate(g.targetDate.split('T')[0]);
    setIsEditOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGoal) return;

    const target = parseFloat(editTargetAmount);
    const current = parseFloat(editCurrentAmount);

    try {
      await updateGoal(editingGoal.id, {
        name: editName,
        targetAmount: target,
        currentAmount: current,
        targetDate: editTargetDate,
      });

      setIsEditOpen(false);

      // Trigger confetti celebration if goal is newly completed
      if (current >= target && editingGoal.currentAmount < editingGoal.targetAmount) {
        triggerConfetti();
      }

      setEditingGoal(null);
    } catch (err) {
      console.error('Failed to update savings goal:', err);
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeletingGoalId(id);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingGoalId) return;
    try {
      await deleteGoal(deletingGoalId);
      setIsDeleteOpen(false);
      setDeletingGoalId(null);
    } catch (err) {
      console.error('Failed to delete goal:', err);
    }
  };

  const getDaysRemaining = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr);
    target.setHours(0, 0, 0, 0);

    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-50">
            Savings Goals
          </h1>
          <p className="text-sm text-zinc-400 mt-1.5">
            Plan, fund, and conquer your financial milestones.
          </p>
        </div>

        <Button
          onClick={() => setIsAddOpen(true)}
          variant="primary"
          className="h-11 bg-zinc-50 text-zinc-900 hover:bg-zinc-200 font-bold shadow-sm"
        >
          <Plus className="h-4.5 w-4.5 mr-1.5" />
          Create Goal
        </Button>
      </div>

      {/* Goals Grid */}
      {savingsGoals.length === 0 ? (
        <Card className="text-center py-20 border-zinc-850 bg-zinc-900/40">
          <Card.Content className="flex flex-col items-center">
            <div className="p-4 bg-zinc-950/40 text-zinc-500 rounded-full mb-4">
              <Target className="h-10 w-10" />
            </div>
            <h3 className="font-bold text-lg text-zinc-250">
              No Savings Goals Established
            </h3>
            <p className="text-sm text-zinc-400 mt-1 max-w-sm">
              Break down your major purchases or emergencies funds into trackable milestones and watch your balances grow.
            </p>
            <Button
              onClick={() => setIsAddOpen(true)}
              variant="secondary"
              className="mt-5 font-bold"
            >
              Define Your First Goal
            </Button>
          </Card.Content>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savingsGoals.map((g) => {
            const isCompleted = g.currentAmount >= g.targetAmount;
            const daysLeft = getDaysRemaining(g.targetDate);

            return (
              <Card key={g.id} className={`glow-blue ${isCompleted ? 'border-emerald-500/20 bg-emerald-950/10' : ''}`}>
                <Card.Header className="flex flex-row items-center justify-between pb-2">
                  <div className="flex items-center space-x-2.5">
                    <div className={`p-2 rounded-lg ${isCompleted ? 'bg-emerald-950/40 text-emerald-400' : 'bg-blue-950/40 text-blue-400'}`}>
                      {isCompleted ? <Award className="h-5 w-5" /> : <Target className="h-5 w-5" />}
                    </div>
                    <Card.Title className="text-lg">{g.name}</Card.Title>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => handleEditClick(g)}
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-150 hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(g.id)}
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-950/20 transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </Card.Header>
                <Card.Content className="space-y-4">
                  {/* Progress Meter */}
                  <Progress value={g.currentAmount} max={g.targetAmount} variant="goal" />

                  {/* Financial Status Summary */}
                  <div className="flex items-center justify-between text-xs mt-3">
                    <span className="text-zinc-400 flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-zinc-500" />
                      {isCompleted ? (
                        <span className="text-emerald-400 font-bold">Goal Completed!</span>
                      ) : daysLeft > 0 ? (
                        <span>{daysLeft} days left</span>
                      ) : (
                        <span className="text-red-400 font-semibold">Overdue</span>
                      )}
                    </span>

                    <span className="font-bold text-zinc-200">
                      ₹{g.currentAmount.toLocaleString()} saved
                    </span>
                  </div>
                </Card.Content>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Goal Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Establish Savings Goal"
      >
        <form onSubmit={handleCreateGoal} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-950/30 text-red-400 border border-red-900/50 text-xs font-semibold rounded-xl">
              {error}
            </div>
          )}

          <Input
            label="Goal Name"
            placeholder="e.g. MacBook Pro, Emergency Fund"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Target Amount (₹)"
              type="number"
              placeholder="e.g. 120000"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              required
            />

            <Input
              label="Starting Balance (₹)"
              type="number"
              placeholder="e.g. 0"
              value={currentAmount}
              onChange={(e) => setCurrentAmount(e.target.value)}
            />
          </div>

          <Input
            label="Target Date"
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
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
              Create Goal
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Goal Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title={`Edit ${editingGoal?.name}`}
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <Input
            label="Goal Name"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Target Amount (₹)"
              type="number"
              value={editTargetAmount}
              onChange={(e) => setEditTargetAmount(e.target.value)}
              required
            />

            <Input
              label="Current Saved Balance (₹)"
              type="number"
              value={editCurrentAmount}
              onChange={(e) => setEditCurrentAmount(e.target.value)}
              required
            />
          </div>

          <Input
            label="Target Completion Date"
            type="date"
            value={editTargetDate}
            onChange={(e) => setEditTargetDate(e.target.value)}
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
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Delete Savings Goal"
      >
        <p className="text-sm text-zinc-400">
          Are you sure you want to delete this savings goal? This will permanently
          delete the progress logs for this goal.
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
            Delete Goal
          </Button>
        </div>
      </Modal>
    </div>
  );
};
