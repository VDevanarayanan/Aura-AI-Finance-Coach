import React from 'react';

interface ProgressProps {
  value: number;
  max: number;
  className?: string;
  variant?: 'default' | 'budget' | 'goal';
}

export const Progress: React.FC<ProgressProps> = ({
  value,
  max,
  className = '',
  variant = 'default',
}) => {
  const percentage = max > 0 ? Math.min(Math.round((value / max) * 100), 100) : 0;

  // Dynamic colors for budgets
  const getBudgetColor = (pct: number) => {
    if (pct < 75) return 'bg-emerald-500 dark:bg-emerald-400';
    if (pct < 95) return 'bg-amber-500 dark:bg-amber-400';
    return 'bg-red-500 dark:bg-red-400';
  };

  const colors = {
    default: 'bg-zinc-900 dark:bg-zinc-50',
    goal: 'bg-blue-600 dark:bg-blue-500',
    budget: getBudgetColor(percentage),
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between items-center mb-1 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
        <span>{percentage}%</span>
        <span>
          {value.toLocaleString()} / {max.toLocaleString()}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${colors[variant]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
