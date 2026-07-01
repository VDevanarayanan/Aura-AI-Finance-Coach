import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import {
  Sparkles,
  Search,
  Edit2,
  Trash2,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';
import type { Transaction, TransactionType } from '../../../shared/types';

export const Transactions: React.FC = () => {
  const {
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  } = useFinance();

  const [description, setDescription] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  // Edit modal states
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editType, setEditType] = useState<TransactionType>('EXPENSE');
  const [editCategory, setEditCategory] = useState('');
  const [editMerchant, setEditMerchant] = useState('');
  const [editDate, setEditDate] = useState('');

  // Delete confirm states
  const [deletingTxId, setDeletingTxId] = useState<string | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Examples suggestions
  const suggestions = [
    'I spent ₹350 on pizza',
    'Salary credited ₹50,000',
    'Paid electricity bill ₹1,200',
    'Spent ₹1,500 on Uber ride',
  ];

  const standardCategories = [
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

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsProcessing(true);
    setError(null);
    try {
      await addTransaction(description);
      setDescription('');
    } catch (err: any) {
      setError(err.message || 'AI failed to process transaction. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Setup edit form
  const handleEditClick = (tx: Transaction) => {
    setEditingTx(tx);
    setEditTitle(tx.title);
    setEditAmount(tx.amount.toString());
    setEditType(tx.type);
    setEditCategory(tx.category);
    setEditMerchant(tx.merchant || '');
    setEditDate(tx.date.split('T')[0]);
    setIsEditOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTx) return;

    try {
      await updateTransaction(editingTx.id, {
        title: editTitle,
        amount: parseFloat(editAmount),
        type: editType,
        category: editCategory,
        merchant: editMerchant || null,
        date: editDate,
      });
      setIsEditOpen(false);
      setEditingTx(null);
    } catch (err) {
      console.error('Failed to update transaction:', err);
    }
  };

  // Setup delete flow
  const handleDeleteClick = (id: string) => {
    setDeletingTxId(id);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingTxId) return;
    try {
      await deleteTransaction(deletingTxId);
      setIsDeleteOpen(false);
      setDeletingTxId(null);
    } catch (err) {
      console.error('Failed to delete transaction:', err);
    }
  };

  // Compute categories list for filtering
  const categories = Array.from(new Set(transactions.map((t) => t.category)));

  // Filter transaction logic
  const filteredTxs = transactions.filter((tx) => {
    const matchesSearch =
      tx.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.merchant && tx.merchant.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = filterType === 'ALL' || tx.type === filterType;
    const matchesCategory = filterCategory === 'ALL' || tx.category === filterCategory;

    return matchesSearch && matchesType && matchesCategory;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-50">
          Transactions Ledger
        </h1>
        <p className="text-sm text-zinc-400 mt-1.5">
          Record cash flow logs by writing natural language. Let the AI parse the rest.
        </p>
      </div>

      {/* Natural Language Box */}
      <Card className="glow-purple border-zinc-800 bg-zinc-900/40">
        <Card.Header>
          <Card.Title className="text-lg flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-purple-400" />
            <span>AI Transaction Logger</span>
          </Card.Title>
          <Card.Description className="text-zinc-400">
            Enter what you spent or earned in natural language.
          </Card.Description>
        </Card.Header>
        <Card.Content>
          <form onSubmit={handleAddTransaction} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="e.g. I spent ₹450 on food at McDonald's yesterday"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isProcessing}
                className="flex-1 h-12 rounded-xl border border-zinc-800 bg-zinc-950/45 px-4 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <Button
                type="submit"
                variant="primary"
                className="h-12 px-6 bg-purple-600 hover:bg-purple-700 text-white shrink-0 font-bold"
                isLoading={isProcessing}
              >
                {!isProcessing && <Plus className="h-4.5 w-4.5 mr-1.5" />}
                Log Transaction
              </Button>
            </div>

            {error && <p className="text-xs text-red-400 font-semibold">{error}</p>}

            {/* Quick Suggestions */}
            <div>
              <p className="text-3xs uppercase tracking-widest font-black text-zinc-500 mb-2">
                Or try clicking an example suggestion:
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setDescription(s)}
                    disabled={isProcessing}
                    className="text-xs bg-zinc-900 border border-zinc-800/80 text-zinc-350 px-3 py-1.5 rounded-lg hover:border-purple-500 hover:bg-purple-950/20 hover:text-purple-300 transition-all duration-200 cursor-pointer"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </form>
        </Card.Content>
      </Card>

      {/* Filters & Listing */}
      <Card>
        <Card.Header>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <Card.Title className="text-lg">Logged Transactions</Card.Title>
              <Card.Description className="text-zinc-400">
                A record of all your parsed and manually updated transactions.
              </Card.Description>
            </div>

            {/* Filters Row */}
            <div className="flex flex-wrap items-center gap-3.5">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-10 w-48 rounded-xl border border-zinc-800 bg-zinc-950/40 text-xs text-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-700"
                />
              </div>

              {/* Type Filter */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="h-10 px-3 rounded-xl border border-zinc-800 bg-zinc-900/50 text-xs text-zinc-300 focus:outline-none"
              >
                <option value="ALL">All Types</option>
                <option value="INCOME">Income</option>
                <option value="EXPENSE">Expense</option>
              </select>

              {/* Category Filter */}
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="h-10 px-3 rounded-xl border border-zinc-800 bg-zinc-900/50 text-xs text-zinc-300 focus:outline-none"
              >
                <option value="ALL">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card.Header>
        <Card.Content>
          <div className="overflow-x-auto">
            {filteredTxs.length === 0 ? (
              <div className="text-center py-16 text-sm text-zinc-500">
                No transactions matched your filter criteria.
              </div>
            ) : (
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 text-2xs uppercase tracking-wider">
                    <th className="pb-3.5 pl-2 font-bold">Category</th>
                    <th className="pb-3.5 font-bold">Detail</th>
                    <th className="pb-3.5 font-bold hidden md:table-cell">Merchant</th>
                    <th className="pb-3.5 font-bold">Date</th>
                    <th className="pb-3.5 font-bold text-right pr-4">Amount</th>
                    <th className="pb-3.5 font-bold text-center pr-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-850">
                  {filteredTxs.map((tx) => (
                    <tr
                      key={tx.id}
                      className="group hover:bg-zinc-900/30 transition-colors duration-150"
                    >
                      <td className="py-4 pl-2">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-lg text-2xs font-bold ${
                            tx.type === 'INCOME'
                              ? 'bg-emerald-950/40 text-emerald-400'
                              : 'bg-rose-950/40 text-rose-400'
                          }`}
                        >
                          {tx.category}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="font-bold text-zinc-100">
                          {tx.title}
                        </div>
                        <div className="text-2xs text-zinc-500 mt-0.5 truncate max-w-xs md:max-w-md">
                          "{tx.description}"
                        </div>
                      </td>
                      <td className="py-4 text-zinc-400 hidden md:table-cell">
                        {tx.merchant || <span className="text-zinc-700">—</span>}
                      </td>
                      <td className="py-4 text-zinc-450 text-xs">
                        {new Date(tx.date).toLocaleDateString()}
                      </td>
                      <td className="py-4 text-right pr-4">
                        <span
                          className={`font-black flex items-center justify-end ${
                            tx.type === 'INCOME'
                              ? 'text-emerald-400'
                              : 'text-zinc-100'
                          }`}
                        >
                          {tx.type === 'INCOME' ? (
                            <ArrowUpRight className="h-3.5 w-3.5 mr-0.5 text-emerald-400" />
                          ) : (
                            <ArrowDownLeft className="h-3.5 w-3.5 mr-0.5 text-zinc-500" />
                          )}
                          ₹{tx.amount.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => handleEditClick(tx)}
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(tx.id)}
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-950/20 transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card.Content>
      </Card>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Transaction Details"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <Input
            label="Transaction Title"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Amount (₹)"
              type="number"
              step="any"
              value={editAmount}
              onChange={(e) => setEditAmount(e.target.value)}
              required
            />

            <div className="flex flex-col space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Type
              </label>
              <select
                value={editType}
                onChange={(e) => setEditType(e.target.value as TransactionType)}
                className="h-10 rounded-xl border border-zinc-800 bg-zinc-900/50 px-3.5 text-sm text-zinc-200 focus:outline-none"
              >
                <option value="EXPENSE">Expense</option>
                <option value="INCOME">Income</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Category
              </label>
              <select
                value={standardCategories.includes(editCategory) ? editCategory : 'Other'}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'Other') {
                    setEditCategory('Other');
                  } else {
                    setEditCategory(val);
                  }
                }}
                className="h-10 rounded-xl border border-zinc-800 bg-zinc-900/50 px-3.5 text-sm text-zinc-200 focus:outline-none"
              >
                {standardCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {(!standardCategories.includes(editCategory) || editCategory === 'Other') && (
                <input
                  type="text"
                  placeholder="Enter custom category..."
                  value={editCategory === 'Other' ? '' : editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="mt-1.5 h-10 rounded-xl border border-zinc-800 bg-zinc-950/45 px-3.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-700"
                  required
                />
              )}
            </div>

            <Input
              label="Merchant"
              value={editMerchant}
              onChange={(e) => setEditMerchant(e.target.value)}
            />
          </div>

          <Input
            label="Transaction Date"
            type="date"
            value={editDate}
            onChange={(e) => setEditDate(e.target.value)}
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

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Delete Transaction"
      >
        <p className="text-sm text-zinc-400">
          Are you sure you want to delete this transaction record? This action cannot
          be undone.
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
            Confirm Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
};
