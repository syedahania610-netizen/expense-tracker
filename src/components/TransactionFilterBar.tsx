import React from 'react';
import { 
  Search, 
  X, 
  Filter, 
  ArrowUpDown, 
  SlidersHorizontal,
  Calendar,
  RotateCcw
} from 'lucide-react';
import { FilterState, DateRangeFilter, CategoryId, PaymentMethod } from '../types';
import { CATEGORY_LIST } from '../data/categories';

interface TransactionFilterBarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  totalMatches: number;
  totalAmount: number;
  currency: string;
}

const DATE_RANGES: { id: DateRangeFilter; label: string }[] = [
  { id: 'all', label: 'All Time' },
  { id: 'this_month', label: 'This Month' },
  { id: 'this_week', label: 'This Week' },
  { id: 'today', label: 'Today' },
  { id: 'last_month', label: 'Last Month' },
  { id: 'this_year', label: 'This Year' },
  { id: 'custom', label: 'Custom' },
];

export const TransactionFilterBar: React.FC<TransactionFilterBarProps> = ({
  filters,
  setFilters,
  totalMatches,
  totalAmount,
  currency,
}) => {
  const isFiltered = 
    filters.searchQuery !== '' ||
    filters.dateRange !== 'this_month' ||
    filters.type !== 'all' ||
    filters.category !== 'all' ||
    filters.paymentMethod !== 'all' ||
    filters.sortBy !== 'date_desc';

  const resetFilters = () => {
    setFilters({
      searchQuery: '',
      dateRange: 'this_month',
      type: 'all',
      category: 'all',
      paymentMethod: 'all',
      sortBy: 'date_desc',
    });
  };

  return (
    <div className="mb-4 space-y-3">
      {/* Top Filter Row */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        
        {/* Search bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
          <input
            id="input-filter-search"
            type="text"
            placeholder="Search by merchant, note, tag or amount... (Press / to focus)"
            value={filters.searchQuery}
            onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
            className="w-full bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 text-xs sm:text-sm pl-9 pr-8 py-2 rounded-xl border border-zinc-200/90 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-400 transition-all shadow-2xs"
          />
          {filters.searchQuery && (
            <button
              onClick={() => setFilters(prev => ({ ...prev, searchQuery: '' }))}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Controls: Type, Category, Sort */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          
          {/* Type Selector */}
          <select
            id="filter-select-type"
            value={filters.type}
            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value as any }))}
            className="bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-xs font-medium px-2.5 py-2 rounded-xl border border-zinc-200/90 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-400 cursor-pointer shadow-2xs"
          >
            <option value="all">All Types</option>
            <option value="expense">Expenses Only</option>
            <option value="income">Income Only</option>
          </select>

          {/* Category Filter */}
          <select
            id="filter-select-category"
            value={filters.category}
            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value as any }))}
            className="bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-xs font-medium px-2.5 py-2 rounded-xl border border-zinc-200/90 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-400 cursor-pointer shadow-2xs max-w-[140px]"
          >
            <option value="all">All Categories</option>
            {CATEGORY_LIST.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Sort By */}
          <select
            id="filter-select-sort"
            value={filters.sortBy}
            onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
            className="bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-xs font-medium px-2.5 py-2 rounded-xl border border-zinc-200/90 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-400 cursor-pointer shadow-2xs"
          >
            <option value="date_desc">Newest First</option>
            <option value="date_asc">Oldest First</option>
            <option value="amount_desc">Highest Amount</option>
            <option value="amount_asc">Lowest Amount</option>
          </select>

          {/* Reset Filters */}
          {isFiltered && (
            <button
              onClick={resetFilters}
              title="Reset all filters"
              className="p-2 rounded-xl text-rose-500 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 hover:bg-rose-100 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

        </div>

      </div>

      {/* Date Range Pills Row */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none">
        <div className="flex items-center gap-1.5 shrink-0">
          {DATE_RANGES.map(range => (
            <button
              key={range.id}
              onClick={() => setFilters(prev => ({ ...prev, dateRange: range.id }))}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                filters.dateRange === range.id
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 shadow-2xs font-semibold'
                  : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>

        {/* Results count indicator */}
        <div className="shrink-0 text-xs text-zinc-500 dark:text-zinc-400 font-mono">
          <span className="font-semibold text-zinc-900 dark:text-white">{totalMatches}</span> entries
        </div>
      </div>

      {/* Custom Date Range Picker when selected */}
      {filters.dateRange === 'custom' && (
        <div className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-900/60 rounded-xl border border-zinc-200 dark:border-zinc-800 animate-in fade-in duration-150">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-zinc-500 font-medium">From:</span>
            <input
              type="date"
              value={filters.customStartDate || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, customStartDate: e.target.value }))}
              className="bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white px-2 py-1 rounded-md border border-zinc-200 dark:border-zinc-700 text-xs"
            />
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-zinc-500 font-medium">To:</span>
            <input
              type="date"
              value={filters.customEndDate || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, customEndDate: e.target.value }))}
              className="bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white px-2 py-1 rounded-md border border-zinc-200 dark:border-zinc-700 text-xs"
            />
          </div>
        </div>
      )}

    </div>
  );
};
