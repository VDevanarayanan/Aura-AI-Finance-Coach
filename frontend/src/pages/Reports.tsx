import React, { useState } from 'react';
import { apiRequest } from '../utils/api';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Sparkles, Calendar, TrendingDown, Award, Lightbulb } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';

interface MonthlyReport {
  month: string;
  totalIncome: number;
  totalExpenses: number;
  savingsRate: number;
  spendingByCategory: Array<{ category: string; amount: number; percentage: number }>;
  aiSummary: string;
  aiRecommendations: string[];
}

export const Reports: React.FC = () => {
  const { currentMonth, setCurrentMonth } = useFinance();
  const [report, setReport] = useState<MonthlyReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiRequest<MonthlyReport>(`/reports/monthly?month=${currentMonth}`);
      setReport(response);
    } catch (err: any) {
      console.error('Failed to load report:', err);
      setError(err.message || 'Failed to generate report. Make sure you have recorded some transactions.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-50">
            Monthly Analysis & Insights
          </h1>
          <p className="text-sm text-zinc-400 mt-1.5 flex items-center gap-1">
            <Sparkles className="h-4.5 w-4.5 text-purple-400 fill-purple-950" />
            Generate automated reports and AI insights for the selected month.
          </p>
        </div>

        {/* Month Selector & Trigger */}
        <div className="flex items-center gap-3.5">
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
            onClick={fetchReport}
            disabled={loading}
            className="h-11 bg-zinc-50 text-zinc-900 hover:bg-zinc-200 font-bold"
          >
            {loading ? 'Evaluating...' : 'Generate Report'}
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-red-900/40 bg-red-950/20">
          <Card.Content className="p-4 text-sm text-red-400 font-semibold text-center">
            {error}
          </Card.Content>
        </Card>
      )}

      {!report && !loading && (
        <Card className="text-center py-20 border-zinc-850 bg-zinc-900/40">
          <Card.Content className="flex flex-col items-center">
            <div className="p-4 bg-zinc-950/40 text-zinc-500 rounded-full mb-4">
              <TrendingDown className="h-10 w-10" />
            </div>
            <h3 className="font-bold text-lg text-zinc-250">
              No Report Generated Yet
            </h3>
            <p className="text-sm text-zinc-400 mt-1 max-w-sm">
              Click the "Generate Report" button above to evaluate your category distributions, cash flows, and receive AI recommendations.
            </p>
          </Card.Content>
        </Card>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <div className="h-10 w-10 border-4 border-zinc-700 border-t-purple-500 rounded-full animate-spin" />
          <p className="text-sm text-zinc-400 font-bold animate-pulse">
            Analyzing transaction tables and computing savings ratios...
          </p>
        </div>
      )}

      {report && !loading && (
        <div className="space-y-6">
          {/* Top Row: Metrics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <Card.Content className="p-6">
                <span className="text-3xs uppercase font-black text-zinc-500 tracking-wider">Total Month Cashflow</span>
                <div className="flex justify-between items-end mt-2">
                  <div>
                    <h4 className="text-sm text-zinc-400">Total Income</h4>
                    <p className="text-2.5xl font-black text-emerald-400 mt-0.5">₹{report.totalIncome.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <h4 className="text-sm text-zinc-400">Total Expenses</h4>
                    <p className="text-2.5xl font-black text-zinc-50 mt-0.5">₹{report.totalExpenses.toLocaleString()}</p>
                  </div>
                </div>
              </Card.Content>
            </Card>

            <Card>
              <Card.Content className="p-6">
                <span className="text-3xs uppercase font-black text-zinc-500 tracking-wider">Savings Rate Ratio</span>
                <div className="flex items-center justify-between mt-2.5">
                  <div>
                    <p className="text-3xl font-black text-zinc-50">{report.savingsRate}%</p>
                    <p className="text-2xs text-zinc-400 mt-1">of income was saved</p>
                  </div>
                  <div className={`p-3 rounded-xl ${report.savingsRate >= 20 ? 'bg-emerald-950/40 text-emerald-400' : 'bg-amber-950/40 text-amber-400'}`}>
                    <Award className="h-6 w-6" />
                  </div>
                </div>
              </Card.Content>
            </Card>

            <Card>
              <Card.Content className="p-6">
                <span className="text-3xs uppercase font-black text-zinc-500 tracking-wider">Top Spending Category</span>
                <div className="mt-2.5">
                  {report.spendingByCategory.length === 0 ? (
                    <p className="text-sm text-zinc-500">No expenses recorded</p>
                  ) : (
                    <div>
                      <p className="text-xl font-black text-purple-400">{report.spendingByCategory[0].category}</p>
                      <p className="text-sm text-zinc-350 mt-1">
                        ₹{report.spendingByCategory[0].amount.toLocaleString()} ({report.spendingByCategory[0].percentage}%)
                      </p>
                    </div>
                  )}
                </div>
              </Card.Content>
            </Card>
          </div>

          {/* AI Coach Summary Card */}
          <Card className="glow-purple border-zinc-800 bg-zinc-900/40">
            <Card.Header>
              <Card.Title className="text-lg flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-purple-400 fill-purple-950" />
                <span>Coach Evaluation Summary</span>
              </Card.Title>
            </Card.Header>
            <Card.Content>
              <p className="text-sm text-zinc-200 leading-relaxed whitespace-pre-line">
                {report.aiSummary}
              </p>
            </Card.Content>
          </Card>

          {/* AI recommendations */}
          <Card>
            <Card.Header>
              <Card.Title className="text-lg flex items-center space-x-2">
                <Lightbulb className="h-5 w-5 text-amber-450" />
                <span>Wealth Action Recommendations</span>
              </Card.Title>
              <Card.Description className="text-zinc-400">
                Bulleted steps generated from your spending habits
              </Card.Description>
            </Card.Header>
            <Card.Content>
              {report.aiRecommendations.length === 0 ? (
                <p className="text-sm text-zinc-500">No recommendations required. You have solid budget health!</p>
              ) : (
                <ul className="space-y-4">
                  {report.aiRecommendations.map((rec, i) => (
                    <li
                      key={i}
                      className="p-4 bg-purple-950/20 border border-purple-900/40 rounded-xl text-sm text-zinc-300 leading-relaxed"
                    >
                      <span className="font-extrabold text-purple-300 mr-1">#{i + 1}</span> {rec}
                    </li>
                  ))}
                </ul>
              )}
            </Card.Content>
          </Card>
        </div>
      )}
    </div>
  );
};
