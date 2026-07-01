import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { Card } from '../components/Card';
import { Progress } from '../components/Progress';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  ArrowRightLeft,
  Calendar,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  CartesianGrid,
  Legend,
} from 'recharts';

export const Dashboard: React.FC = () => {
  const { transactions, budgets, savingsGoals, currentMonth, setCurrentMonth } =
    useFinance();

  // Filter transactions for the selected month (format in db is YYYY-MM-DD...)
  const monthlyTxs = transactions.filter((t) => t.date.startsWith(currentMonth));

  // Compute metrics
  const totalIncome = monthlyTxs
    .filter((t) => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = monthlyTxs
    .filter((t) => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalSavings = totalIncome - totalExpenses;

  const totalBudgetLimit = budgets.reduce((sum, b) => sum + b.limitAmount, 0);
  const budgetRemaining = Math.max(totalBudgetLimit - totalExpenses, 0);
  const budgetSpentPercentage =
    totalBudgetLimit > 0
      ? Math.min(Math.round((totalExpenses / totalBudgetLimit) * 100), 100)
      : 0;

  // Chart 1: Income vs Expenses
  const barData = [
    {
      name: 'Cash Flow',
      Income: totalIncome,
      Expenses: totalExpenses,
    },
  ];

  // Chart 2: Spending by Category
  const categoryMap: Record<string, number> = {};
  monthlyTxs
    .filter((t) => t.type === 'EXPENSE')
    .forEach((t) => {
      categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
    });

  const pieData = Object.entries(categoryMap).map(([name, value]) => ({
    name,
    value,
  }));

  const COLORS = [
    '#10b981', // emerald
    '#3b82f6', // blue
    '#f59e0b', // amber
    '#ec4899', // pink
    '#8b5cf6', // violet
    '#ef4444', // red
    '#06b6d4', // cyan
    '#a855f7', // purple
  ];

  // Chart 3: Spending Trends (Daily)
  const dailySpendMap: Record<string, number> = {};
  monthlyTxs
    .filter((t) => t.type === 'EXPENSE')
    .forEach((t) => {
      const dateObj = new Date(t.date);
      const day = dateObj.getDate();
      dailySpendMap[day] = (dailySpendMap[day] || 0) + t.amount;
    });

  const trendData = Object.entries(dailySpendMap)
    .map(([day, amount]) => ({
      day: `Day ${day}`,
      amount,
      dayNum: Number(day),
    }))
    .sort((a, b) => a.dayNum - b.dayNum);

  // Month selector handler
  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentMonth(e.target.value);
  };

  const getPercentageColor = (pct: number) => {
    if (pct < 75) return 'text-emerald-400';
    if (pct < 95) return 'text-amber-450';
    return 'text-red-400';
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-50">
            Financial Dashboard
          </h1>
          <p className="text-sm text-zinc-400 mt-1.5 flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-amber-500" />
            AI-powered personal wealth coaching at your fingertips.
          </p>
        </div>

        {/* Month Picker */}
        <div className="flex items-center space-x-2.5 bg-zinc-900/60 border border-zinc-800/80 px-4 py-2.5 rounded-xl backdrop-blur-md shadow-sm">
          <Calendar className="h-4.5 w-4.5 text-zinc-400" />
          <span className="text-sm font-semibold text-zinc-300">
            Selected Month:
          </span>
          <input
            type="month"
            value={currentMonth}
            onChange={handleMonthChange}
            className="text-sm font-bold bg-transparent text-zinc-50 focus:outline-none border-0 p-0 cursor-pointer"
          />
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Income */}
        <Card className="glow-emerald border-zinc-850">
          <Card.Content className="p-6 flex items-center space-x-4">
            <div className="p-3.5 bg-emerald-950/40 text-emerald-400 rounded-xl">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Total Income
              </p>
              <h3 className="text-2.5xl font-black text-zinc-50 mt-0.5">
                ₹{totalIncome.toLocaleString()}
              </h3>
            </div>
          </Card.Content>
        </Card>

        {/* Total Expenses */}
        <Card className="glow-rose border-zinc-850">
          <Card.Content className="p-6 flex items-center space-x-4">
            <div className="p-3.5 bg-rose-950/40 text-rose-400 rounded-xl">
              <TrendingDown className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Total Expenses
              </p>
              <h3 className="text-2.5xl font-black text-zinc-50 mt-0.5">
                ₹{totalExpenses.toLocaleString()}
              </h3>
            </div>
          </Card.Content>
        </Card>

        {/* Total Savings */}
        <Card className="glow-blue border-zinc-850">
          <Card.Content className="p-6 flex items-center space-x-4">
            <div className="p-3.5 bg-blue-950/40 text-blue-400 rounded-xl">
              <PiggyBank className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Total Savings
              </p>
              <h3 className={`text-2.5xl font-black mt-0.5 ${totalSavings >= 0 ? 'text-emerald-400' : 'text-rose-450'}`}>
                ₹{totalSavings.toLocaleString()}
              </h3>
            </div>
          </Card.Content>
        </Card>

        {/* Budget Remaining */}
        <Card className="glow-purple border-zinc-850">
          <Card.Content className="p-6 flex items-center space-x-4">
            <div className="p-3.5 bg-purple-950/40 text-purple-400 rounded-xl">
              <Wallet className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Budget Remaining
              </p>
              <h3 className="text-2.5xl font-black text-zinc-50 mt-0.5 truncate">
                ₹{budgetRemaining.toLocaleString()}
              </h3>
              <p className="text-3xs text-zinc-500 mt-0.5">
                Limit: ₹{totalBudgetLimit.toLocaleString()}
              </p>
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Progress Bars Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Budget Summary */}
        <Card>
          <Card.Header>
            <Card.Title className="text-lg">Monthly Budget Usage</Card.Title>
            <Card.Description className="text-zinc-400">
              Overall tracking across all category limits
            </Card.Description>
          </Card.Header>
          <Card.Content className="space-y-4">
            <Progress value={totalExpenses} max={totalBudgetLimit} variant="budget" />
            <div className="flex items-center justify-between text-sm font-semibold mt-2">
              <span className="text-zinc-400">Spent Status:</span>
              <span className={getPercentageColor(budgetSpentPercentage)}>
                {budgetSpentPercentage}% of budget spent
              </span>
            </div>
          </Card.Content>
        </Card>

        {/* Savings Goals Summary */}
        <Card>
          <Card.Header>
            <Card.Title className="text-lg">Active Savings Goals</Card.Title>
            <Card.Description className="text-zinc-400">Track your goals funding progress</Card.Description>
          </Card.Header>
          <Card.Content className="space-y-4">
            {savingsGoals.length === 0 ? (
              <p className="text-sm text-zinc-500 text-center py-4">No active savings goals. Create one in the Savings Goals tab!</p>
            ) : (
              savingsGoals.slice(0, 2).map((goal) => (
                <div key={goal.id} className="space-y-1.5">
                  <div className="flex justify-between text-sm font-bold text-zinc-200">
                    <span>{goal.name}</span>
                    <span className="text-xs text-zinc-450">Target: {new Date(goal.targetDate).toLocaleDateString()}</span>
                  </div>
                  <Progress value={goal.currentAmount} max={goal.targetAmount} variant="goal" />
                </div>
              ))
            )}
          </Card.Content>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Spending Trends */}
        <Card className="lg:col-span-2">
          <Card.Header>
            <Card.Title className="text-lg">Spending Trends This Month</Card.Title>
            <Card.Description className="text-zinc-400">Visual representation of expense dates</Card.Description>
          </Card.Header>
          <Card.Content>
            <div className="h-80 w-full">
              {trendData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-sm text-zinc-500">No expenses recorded this month</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ec4899" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                    <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} stroke="#a1a1aa" />
                    <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="#a1a1aa" />
                    <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px' }} formatter={(value: any) => [`₹${value.toLocaleString()}`, 'Amount']} />
                    <Area type="monotone" dataKey="amount" stroke="#ec4899" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSpend)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card.Content>
        </Card>

        {/* Spending By Category */}
        <Card>
          <Card.Header>
            <Card.Title className="text-lg">Category Distribution</Card.Title>
            <Card.Description className="text-zinc-400">Breakdown of expenses by category</Card.Description>
          </Card.Header>
          <Card.Content>
            <div className="h-80 w-full flex flex-col items-center justify-center">
              {pieData.length === 0 ? (
                <div className="text-sm text-zinc-500">No expenses recorded</div>
              ) : (
                <>
                  <div className="h-60 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {pieData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px' }} formatter={(value: any) => `₹${value.toLocaleString()}`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap gap-2.5 justify-center mt-2.5">
                    {pieData.map((entry, index) => (
                      <div key={entry.name} className="flex items-center space-x-1.5 text-xs font-semibold text-zinc-300">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span>{entry.name}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Cash Flow Comparison & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cash Flow Bar Chart */}
        <Card>
          <Card.Header>
            <Card.Title className="text-lg">Income vs Expenses</Card.Title>
            <Card.Description className="text-zinc-400">Net savings cash flow comparison</Card.Description>
          </Card.Header>
          <Card.Content>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} barGap={8}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} stroke="#a1a1aa" />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="#a1a1aa" />
                  <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px' }} formatter={(value: any) => `₹${value.toLocaleString()}`} />
                  <Legend />
                  <Bar dataKey="Income" fill="#10b981" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="Expenses" fill="#f43f5e" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card.Content>
        </Card>

        {/* Recent Transactions List */}
        <Card className="lg:col-span-2">
          <Card.Header className="flex flex-row items-center justify-between">
            <div>
              <Card.Title className="text-lg">Recent Transactions</Card.Title>
              <Card.Description className="text-zinc-400">
                Last 5 transactions recorded by user
              </Card.Description>
            </div>
            <ArrowRightLeft className="h-5 w-5 text-zinc-500" />
          </Card.Header>
          <Card.Content>
            <div className="space-y-4">
              {monthlyTxs.length === 0 ? (
                <p className="text-sm text-zinc-500 text-center py-10">No transactions recorded this month. Go to the Transactions tab to add one!</p>
              ) : (
                monthlyTxs.slice(0, 5).map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/30 transition-all duration-200"
                  >
                    <div className="flex items-center space-x-3.5 min-w-0">
                      <div className={`p-2 rounded-lg font-bold text-xs ${tx.type === 'INCOME' ? 'bg-emerald-950/40 text-emerald-400' : 'bg-rose-950/40 text-rose-400'}`}>
                        {tx.category}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-zinc-100 truncate">
                          {tx.title}
                        </p>
                        <p className="text-2xs text-zinc-500 truncate mt-0.5">
                          {tx.description}
                        </p>
                      </div>
                    </div>

                    <div className="text-right ml-4">
                      <p className={`text-sm font-black ${tx.type === 'INCOME' ? 'text-emerald-400' : 'text-zinc-100'}`}>
                        {tx.type === 'INCOME' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                      </p>
                      <p className="text-3xs text-zinc-500 mt-0.5">
                        {new Date(tx.date).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card.Content>
        </Card>
      </div>
    </div>
  );
};
