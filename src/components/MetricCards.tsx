import React from 'react';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Wallet, 
  TrendingUp, 
  Sparkles,
  Calendar,
  Flame
} from 'lucide-react';
import { Transaction, Budget } from '../types';
import { formatCurrency, getMonthProgress } from '../utils/formatters';

interface MetricCardsProps {
  transactions: Transaction[];
  budgets: Budget[];
  currency: string;
  onOpenBudgetModal: () => void;
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  transactions,
  budgets,
  currency,
  onOpenBudgetModal,
}) => {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  // Filter current month transactions
  const monthTransactions = transactions.filter(t => {
    const [y, m] = t.date.split('-').map(Number);
    return y === currentYear && m === currentMonth;
  });

  const monthExpenses = monthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const monthIncome = monthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalAllTimeBalance = transactions.reduce((sum, t) => {
    return t.type === 'income' ? sum + t.amount : sum - t.amount;
  }, 0);

  const monthNetSavings = monthIncome - monthExpenses;
  const savingsRate = monthIncome > 0 ? Math.max(0, Math.round((monthNetSavings / monthIncome) * 100)) : 0;

  // Overall budget tracking
  const overallBudget = budgets.find(b => b.categoryId === 'overall')?.limit || 3000;
  const budgetSpentPercent = Math.min(100, Math.round((monthExpenses / overallBudget) * 100));
  const budgetRemaining = overallBudget - monthExpenses;

  const { daysRemaining, percent: monthTimePercent } = getMonthProgress();
  const dailyAllowance = budgetRemaining > 0 ? budgetRemaining / daysRemaining : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 mb-6">
      
      {/* 1. Net Balance */}
      <div 
        id="metric-net-balance"
        className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 transition-all hover:border-zinc-300 dark:hover:border-zinc-700"
      >
        <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 font-medium mb-1.5">
          <span>Net Total Balance</span>
          <span className="p-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
            <Wallet className="w-3.5 h-3.5" />
          </span>
        </div>
        <div className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white font-mono tabular-nums">
          {formatCurrency(totalAllTimeBalance, currency)}
        </div>
        <div className="mt-2.5 flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
          <span className={`inline-flex items-center gap-0.5 font-medium ${monthNetSavings >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {monthNetSavings >= 0 ? '+' : ''}{formatCurrency(monthNetSavings, currency)}
          </span>
          <span>this month net</span>
        </div>
      </div>

      {/* 2. Monthly Income */}
      <div 
        id="metric-monthly-income"
        className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 transition-all hover:border-zinc-300 dark:hover:border-zinc-700"
      >
        <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 font-medium mb-1.5">
          <span>Monthly Inflow</span>
          <span className="p-1 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
            <ArrowDownLeft className="w-3.5 h-3.5" />
          </span>
        </div>
        <div className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
          +{formatCurrency(monthIncome, currency)}
        </div>
        <div className="mt-2.5 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
          <span>Savings Rate</span>
          <span className="font-semibold text-zinc-900 dark:text-white font-mono">
            {savingsRate}%
          </span>
        </div>
      </div>

      {/* 3. Monthly Outflow */}
      <div 
        id="metric-monthly-expenses"
        className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 transition-all hover:border-zinc-300 dark:hover:border-zinc-700"
      >
        <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 font-medium mb-1.5">
          <span>Monthly Expenses</span>
          <span className="p-1 rounded-md bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
            <ArrowUpRight className="w-3.5 h-3.5" />
          </span>
        </div>
        <div className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white font-mono tabular-nums">
          {formatCurrency(monthExpenses, currency)}
        </div>
        <div className="mt-2.5 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
          <span>Target: {formatCurrency(overallBudget, currency)}</span>
          <span className={`font-medium ${budgetSpentPercent > 90 ? 'text-rose-500' : 'text-zinc-700 dark:text-zinc-300'}`}>
            {budgetSpentPercent}% used
          </span>
        </div>
      </div>

      {/* 4. Burn Rate & Budget Runway */}
      <div 
        id="metric-daily-allowance"
        onClick={onOpenBudgetModal}
        className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 transition-all hover:border-zinc-300 dark:hover:border-zinc-700 cursor-pointer group"
      >
        <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 font-medium mb-1.5">
          <span className="flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            Daily Allowance
          </span>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium group-hover:underline">
            Manage
          </span>
        </div>
        <div className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white font-mono tabular-nums">
          {budgetRemaining > 0 ? formatCurrency(dailyAllowance, currency) : '$0.00'}
          <span className="text-xs font-normal text-zinc-400 dark:text-zinc-500 ml-1">/day</span>
        </div>
        
        {/* Visual progress bar */}
        <div className="mt-2.5 space-y-1">
          <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 rounded-full ${
                budgetSpentPercent > 90 
                  ? 'bg-rose-500' 
                  : budgetSpentPercent > 70 
                  ? 'bg-amber-500' 
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, budgetSpentPercent)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-zinc-400 dark:text-zinc-500">
            <span>{daysRemaining} days left</span>
            <span>{budgetRemaining > 0 ? `${formatCurrency(budgetRemaining, currency)} left` : 'Over budget'}</span>
          </div>
        </div>
      </div>

    </div>
  );
};
