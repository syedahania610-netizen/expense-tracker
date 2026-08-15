import React, { useState } from 'react';
import { 
  Target, 
  Plus, 
  Edit2, 
  Check, 
  AlertTriangle, 
  ShieldCheck, 
  Flame,
  Calendar,
  Sparkles
} from 'lucide-react';
import { Budget, CategoryId, Transaction } from '../types';
import { CATEGORIES, EXPENSE_CATEGORIES } from '../data/categories';
import { formatCurrency, getMonthProgress } from '../utils/formatters';

interface BudgetTrackerProps {
  budgets: Budget[];
  transactions: Transaction[];
  currency: string;
  onUpdateBudget: (budget: Budget) => void;
}

export const BudgetTracker: React.FC<BudgetTrackerProps> = ({
  budgets,
  transactions,
  currency,
  onUpdateBudget,
}) => {
  const [editingCategory, setEditingCategory] = useState<CategoryId | 'overall' | null>(null);
  const [inputLimit, setInputLimit] = useState<string>('');

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const monthExpenses = transactions.filter(t => {
    const [y, m] = t.date.split('-').map(Number);
    return t.type === 'expense' && y === currentYear && m === currentMonth;
  });

  const { dayOfMonth, totalDays, percent: monthTimeElapsed, daysRemaining } = getMonthProgress();

  const overallBudget = budgets.find(b => b.categoryId === 'overall')?.limit || 3000;
  const totalSpentThisMonth = monthExpenses.reduce((s, t) => s + t.amount, 0);
  const overallRemaining = overallBudget - totalSpentThisMonth;
  const overallPercent = Math.min(100, Math.round((totalSpentThisMonth / overallBudget) * 100));

  const handleStartEdit = (catId: CategoryId | 'overall', currentLimit: number) => {
    setEditingCategory(catId);
    setInputLimit(currentLimit.toString());
  };

  const handleSaveBudget = (catId: CategoryId | 'overall') => {
    const parsed = parseFloat(inputLimit);
    if (!isNaN(parsed) && parsed >= 0) {
      onUpdateBudget({
        categoryId: catId,
        limit: parsed,
        period: 'monthly',
      });
    }
    setEditingCategory(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Header info */}
      <div className="flex items-center justify-between flex-wrap gap-4 pb-2 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight">
            Monthly Budget Targets
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Keep spending in check and prevent budget creep across categories.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono bg-zinc-100 dark:bg-zinc-800/80 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300">
          <Calendar className="w-3.5 h-3.5 text-zinc-400" />
          <span>Day {dayOfMonth} of {totalDays} ({monthTimeElapsed}% of month elapsed)</span>
        </div>
      </div>

      {/* Main Overall Monthly Budget Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white">
                <Target className="w-4 h-4" />
              </span>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
                Overall Monthly Cap
              </h3>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Total monthly expenditure limit across all expense categories
            </p>
          </div>

          {editingCategory === 'overall' ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-zinc-400">{currency}</span>
              <input
                type="number"
                value={inputLimit}
                onChange={(e) => setInputLimit(e.target.value)}
                className="w-28 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm px-2.5 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 font-mono"
              />
              <button
                onClick={() => handleSaveBudget('overall')}
                className="p-1.5 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 hover:opacity-90"
              >
                <Check className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-xs text-zinc-400">Total Budget</div>
                <div className="text-lg font-bold font-mono text-zinc-900 dark:text-white">
                  {formatCurrency(overallBudget, currency)}
                </div>
              </div>
              <button
                onClick={() => handleStartEdit('overall', overallBudget)}
                className="p-2 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Big Progress bar */}
        <div className="space-y-2">
          <div className="w-full h-3 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                overallPercent > 95
                  ? 'bg-rose-500'
                  : overallPercent > 80
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, overallPercent)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-zinc-500">
              Spent: <strong className="text-zinc-900 dark:text-white">{formatCurrency(totalSpentThisMonth, currency)}</strong> ({overallPercent}%)
            </span>
            <span className={overallRemaining >= 0 ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-rose-600 font-semibold'}>
              {overallRemaining >= 0 ? `${formatCurrency(overallRemaining, currency)} remaining` : `Over by ${formatCurrency(Math.abs(overallRemaining), currency)}`}
            </span>
          </div>
        </div>

        {/* Pacing Advice */}
        <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>
              Safe daily burn rate: <strong className="font-mono text-zinc-900 dark:text-white">{formatCurrency(Math.max(0, overallRemaining / daysRemaining), currency)}/day</strong> for the remaining {daysRemaining} days.
            </span>
          </div>

          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium ${
            overallPercent <= monthTimeElapsed
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
          }`}>
            {overallPercent <= monthTimeElapsed ? (
              <>
                <ShieldCheck className="w-3 h-3" />
                Under Pacing
              </>
            ) : (
              <>
                <AlertTriangle className="w-3 h-3" />
                Accelerated Spend
              </>
            )}
          </span>
        </div>

      </div>

      {/* Category Level Budgets Grid */}
      <div>
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-3">
          Category Budgets
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {EXPENSE_CATEGORIES.map(category => {
            const catBudgetObj = budgets.find(b => b.categoryId === category.id);
            const limit = catBudgetObj ? catBudgetObj.limit : 0;
            const spent = monthExpenses
              .filter(t => t.category === category.id)
              .reduce((s, t) => s + t.amount, 0);

            const percent = limit > 0 ? Math.min(100, Math.round((spent / limit) * 100)) : 0;
            const isEditing = editingCategory === category.id;
            const remaining = limit - spent;

            return (
              <div
                key={category.id}
                className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 shadow-2xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="text-xs font-semibold text-zinc-900 dark:text-white">
                        {category.name}
                      </span>
                    </div>

                    {isEditing ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={inputLimit}
                          onChange={(e) => setInputLimit(e.target.value)}
                          className="w-20 bg-zinc-50 dark:bg-zinc-800 text-xs px-2 py-1 rounded border border-zinc-300 dark:border-zinc-700 font-mono"
                        />
                        <button
                          onClick={() => handleSaveBudget(category.id)}
                          className="p-1 rounded bg-zinc-900 dark:bg-white text-white dark:text-zinc-950"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleStartEdit(category.id, limit)}
                        className="text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Amounts */}
                  <div className="flex items-baseline justify-between font-mono my-2">
                    <span className="text-base font-bold text-zinc-900 dark:text-white">
                      {formatCurrency(spent, currency)}
                    </span>
                    <span className="text-xs text-zinc-400">
                      / {limit > 0 ? formatCurrency(limit, currency) : 'No Limit'}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  {limit > 0 ? (
                    <div className="space-y-1">
                      <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${percent}%`,
                            backgroundColor: percent > 90 ? '#ef4444' : category.color,
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-[11px] text-zinc-400 font-mono">
                        <span>{percent}% used</span>
                        <span className={remaining < 0 ? 'text-rose-500 font-medium' : ''}>
                          {remaining >= 0 ? `${formatCurrency(remaining, currency)} left` : `+${formatCurrency(Math.abs(remaining), currency)} over`}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-[11px] text-zinc-400 italic">
                      Click edit icon to assign a monthly limit.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
