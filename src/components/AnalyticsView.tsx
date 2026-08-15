import React, { useState } from 'react';
import { 
  PieChart, 
  BarChart, 
  TrendingDown, 
  TrendingUp, 
  CreditCard, 
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft,
  Filter
} from 'lucide-react';
import { Transaction, CategoryId } from '../types';
import { CATEGORIES } from '../data/categories';
import { formatCurrency } from '../utils/formatters';

interface AnalyticsViewProps {
  transactions: Transaction[];
  currency: string;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ transactions, currency }) => {
  const [timeRange, setTimeRange] = useState<'30days' | 'this_month' | 'year' | 'all'>('this_month');
  const [activeCategoryHover, setActiveCategoryHover] = useState<CategoryId | null>(null);

  const now = new Date();

  // Filter transactions based on selected analytics time range
  const filteredTxs = transactions.filter(tx => {
    const txDate = new Date(tx.date);
    if (timeRange === 'this_month') {
      const [y, m] = tx.date.split('-').map(Number);
      return y === now.getFullYear() && m === now.getMonth() + 1;
    }
    if (timeRange === '30days') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return txDate >= thirtyDaysAgo;
    }
    if (timeRange === 'year') {
      const [y] = tx.date.split('-').map(Number);
      return y === now.getFullYear();
    }
    return true;
  });

  const expenseTxs = filteredTxs.filter(t => t.type === 'expense');
  const incomeTxs = filteredTxs.filter(t => t.type === 'income');

  const totalExpense = expenseTxs.reduce((sum, t) => sum + t.amount, 0);
  const totalIncome = incomeTxs.reduce((sum, t) => sum + t.amount, 0);
  const netSavings = totalIncome - totalExpense;

  // Category aggregations for expenses
  const categoryTotals: Record<string, number> = {};
  expenseTxs.forEach(tx => {
    categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + tx.amount;
  });

  const categoryEntries = Object.entries(categoryTotals)
    .map(([catId, amount]) => ({
      category: catId as CategoryId,
      amount,
      percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0,
      config: CATEGORIES[catId as CategoryId] || CATEGORIES.other,
    }))
    .sort((a, b) => b.amount - a.amount);

  // SVG Donut Chart Calculation
  let cumulativePercent = 0;
  const donutSlices = categoryEntries.map((entry) => {
    const startAngle = (cumulativePercent / 100) * 360;
    cumulativePercent += entry.percentage;
    const endAngle = (cumulativePercent / 100) * 360;

    // SVG path math for arc
    const startRad = (startAngle - 90) * (Math.PI / 180);
    const endRad = (endAngle - 90) * (Math.PI / 180);

    const radius = 80;
    const innerRadius = 55;
    const cx = 100;
    const cy = 100;

    const x1 = cx + radius * Math.cos(startRad);
    const y1 = cy + radius * Math.sin(startRad);
    const x2 = cx + radius * Math.cos(endRad);
    const y2 = cy + radius * Math.sin(endRad);

    const ix1 = cx + innerRadius * Math.cos(endRad);
    const iy1 = cy + innerRadius * Math.sin(endRad);
    const ix2 = cx + innerRadius * Math.cos(startRad);
    const iy2 = cy + innerRadius * Math.sin(startRad);

    const largeArc = endAngle - startAngle > 180 ? 1 : 0;

    const pathData = `
      M ${x1} ${y1}
      A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}
      L ${ix1} ${iy1}
      A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${ix2} ${iy2}
      Z
    `;

    return {
      ...entry,
      pathData,
      startAngle,
      endAngle,
    };
  });

  // Daily Spending Chart (Last 14 days)
  const last14Days: { dateStr: string; label: string; amount: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const label = d.toLocaleDateString('en-US', { weekday: 'narrow', month: 'numeric', day: 'numeric' });
    const dayAmount = transactions
      .filter(t => t.type === 'expense' && t.date === dateStr)
      .reduce((sum, t) => sum + t.amount, 0);
    last14Days.push({ dateStr, label, amount: dayAmount });
  }

  const maxDailySpend = Math.max(...last14Days.map(d => d.amount), 50);

  // Top Merchants / Titles
  const merchantTotals: Record<string, number> = {};
  expenseTxs.forEach(tx => {
    merchantTotals[tx.title] = (merchantTotals[tx.title] || 0) + tx.amount;
  });
  const topMerchants = Object.entries(merchantTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="space-y-6">
      
      {/* Time range switcher bar */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight">
            Financial Insights & Analytics
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Real-time distribution, spending velocity, and categorical allocation.
          </p>
        </div>

        <div className="flex items-center p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-xl border border-zinc-200/80 dark:border-zinc-700">
          {(['this_month', '30days', 'year', 'all'] as const).map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                timeRange === range
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-2xs font-semibold'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              {range === 'this_month' ? 'This Month' : range === '30days' ? 'Last 30 Days' : range === 'year' ? 'This Year' : 'All Time'}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Inflow vs Outflow cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-zinc-500 font-medium mb-1">
            <span>Total Income</span>
            <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
            +{formatCurrency(totalIncome, currency)}
          </div>
          <div className="text-[11px] text-zinc-400 mt-1">
            {incomeTxs.length} income transactions
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-zinc-500 font-medium mb-1">
            <span>Total Expenses</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <div className="text-xl font-bold font-mono text-zinc-900 dark:text-white tabular-nums">
            {formatCurrency(totalExpense, currency)}
          </div>
          <div className="text-[11px] text-zinc-400 mt-1">
            {expenseTxs.length} expense items recorded
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-zinc-500 font-medium mb-1">
            <span>Net Period Savings</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className={`text-xl font-bold font-mono tabular-nums ${netSavings >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {netSavings >= 0 ? '+' : ''}{formatCurrency(netSavings, currency)}
          </div>
          <div className="text-[11px] text-zinc-400 mt-1">
            {totalIncome > 0 ? `${Math.round((netSavings / totalIncome) * 100)}% savings rate` : '0%'}
          </div>
        </div>

      </div>

      {/* Main Visuals Grid: Category Donut Chart + Daily Spend Velocity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Category Breakdown (7 cols) */}
        <div className="lg:col-span-7 p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
              Category Allocation
            </h3>
            <span className="text-xs text-zinc-500 font-mono">
              {categoryEntries.length} active categories
            </span>
          </div>

          {totalExpense === 0 ? (
            <div className="py-12 text-center text-xs text-zinc-400">
              No expenses recorded in this period.
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-6">
              
              {/* Donut SVG */}
              <div className="relative w-48 h-48 shrink-0 flex items-center justify-center">
                <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
                  {donutSlices.map((slice) => (
                    <path
                      key={slice.category}
                      d={slice.pathData}
                      fill={slice.config.color}
                      className="transition-all duration-300 cursor-pointer hover:opacity-80"
                      style={{
                        transform: activeCategoryHover === slice.category ? 'scale(1.04)' : 'scale(1)',
                        transformOrigin: '100px 100px',
                      }}
                      onMouseEnter={() => setActiveCategoryHover(slice.category)}
                      onMouseLeave={() => setActiveCategoryHover(null)}
                    />
                  ))}
                </svg>
                {/* Donut Center Label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                  <span className="text-[11px] font-medium text-zinc-400">Total Spend</span>
                  <span className="text-sm font-bold font-mono text-zinc-900 dark:text-white">
                    {formatCurrency(totalExpense, currency)}
                  </span>
                </div>
              </div>

              {/* Category Legend & Progress Bars */}
              <div className="flex-1 w-full space-y-2.5">
                {categoryEntries.slice(0, 5).map((entry) => (
                  <div
                    key={entry.category}
                    onMouseEnter={() => setActiveCategoryHover(entry.category)}
                    onMouseLeave={() => setActiveCategoryHover(null)}
                    className={`p-2 rounded-lg transition-colors ${
                      activeCategoryHover === entry.category ? 'bg-zinc-100 dark:bg-zinc-800/80' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: entry.config.color }}
                        />
                        <span className="font-medium text-zinc-800 dark:text-zinc-200">
                          {entry.config.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-zinc-900 dark:text-white font-semibold">
                          {formatCurrency(entry.amount, currency)}
                        </span>
                        <span className="text-zinc-400 text-[11px] w-9 text-right">
                          {entry.percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${entry.percentage}%`,
                          backgroundColor: entry.config.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}
        </div>

        {/* 14-Day Velocity Bar Chart (5 cols) */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
                Daily Velocity (Last 14 Days)
              </h3>
              <span className="text-xs text-zinc-400 font-mono">
                Max {formatCurrency(maxDailySpend, currency)}/day
              </span>
            </div>

            {/* Custom Bar Chart */}
            <div className="h-40 flex items-end justify-between gap-1.5 pt-6 pb-2">
              {last14Days.map((item, idx) => {
                const heightPct = Math.max(4, Math.round((item.amount / maxDailySpend) * 100));
                const isToday = idx === last14Days.length - 1;

                return (
                  <div
                    key={item.dateStr}
                    className="flex-1 flex flex-col items-center h-full justify-end group relative"
                  >
                    {/* Tooltip */}
                    <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 text-[10px] font-mono px-1.5 py-0.5 rounded shadow pointer-events-none whitespace-nowrap z-10">
                      {formatCurrency(item.amount, currency)}
                    </div>

                    {/* Bar */}
                    <div
                      className={`w-full rounded-t-sm transition-all duration-300 group-hover:brightness-110 ${
                        isToday
                          ? 'bg-emerald-500'
                          : item.amount > 0
                          ? 'bg-zinc-700 dark:bg-zinc-400'
                          : 'bg-zinc-200 dark:bg-zinc-800'
                      }`}
                      style={{ height: `${heightPct}%` }}
                    />
                    
                    {/* Day label */}
                    <span className="text-[9px] text-zinc-400 mt-1 font-mono">
                      {item.dateStr.split('-')[2]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
            <span>Avg Daily Outflow</span>
            <span className="font-mono font-semibold text-zinc-900 dark:text-white">
              {formatCurrency(last14Days.reduce((s, i) => s + i.amount, 0) / 14, currency)}/day
            </span>
          </div>
        </div>

      </div>

      {/* Top Merchants List */}
      <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 shadow-2xs">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-3">
          Highest Single Outflows
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {topMerchants.map(([name, amount], index) => (
            <div
              key={name}
              className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/70 dark:border-zinc-700/60"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-5 h-5 rounded-md bg-zinc-200 dark:bg-zinc-700 text-[11px] font-mono font-semibold flex items-center justify-center text-zinc-700 dark:text-zinc-300">
                  {index + 1}
                </span>
                <span className="text-xs font-medium text-zinc-900 dark:text-white truncate">
                  {name}
                </span>
              </div>
              <span className="text-xs font-bold font-mono text-zinc-900 dark:text-white shrink-0 ml-2">
                {formatCurrency(amount, currency)}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
