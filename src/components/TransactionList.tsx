import React, { useState } from 'react';
import { 
  Trash2, 
  Edit3, 
  Copy, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CreditCard, 
  Smartphone, 
  Building2, 
  Banknote, 
  Coins, 
  Tag, 
  FileText,
  Utensils,
  Home,
  Car,
  ShoppingBag,
  Zap,
  Film,
  HeartPulse,
  GraduationCap,
  Briefcase,
  Laptop,
  TrendingUp,
  HelpCircle,
  CheckSquare,
  Square,
  AlertCircle
} from 'lucide-react';
import { Transaction, CategoryId, PaymentMethod } from '../types';
import { CATEGORIES } from '../data/categories';
import { formatCurrency, formatDate } from '../utils/formatters';

interface TransactionListProps {
  transactions: Transaction[];
  currency: string;
  onEdit: (tx: Transaction) => void;
  onDelete: (id: string) => void;
  onDuplicate: (tx: Transaction) => void;
  onBulkDelete: (ids: string[]) => void;
}

const getCategoryIcon = (categoryId: CategoryId) => {
  switch (categoryId) {
    case 'food': return <Utensils className="w-4 h-4" />;
    case 'housing': return <Home className="w-4 h-4" />;
    case 'transport': return <Car className="w-4 h-4" />;
    case 'shopping': return <ShoppingBag className="w-4 h-4" />;
    case 'utilities': return <Zap className="w-4 h-4" />;
    case 'entertainment': return <Film className="w-4 h-4" />;
    case 'health': return <HeartPulse className="w-4 h-4" />;
    case 'education': return <GraduationCap className="w-4 h-4" />;
    case 'salary': return <Briefcase className="w-4 h-4" />;
    case 'freelance': return <Laptop className="w-4 h-4" />;
    case 'investment': return <TrendingUp className="w-4 h-4" />;
    default: return <HelpCircle className="w-4 h-4" />;
  }
};

const getPaymentMethodIcon = (method: PaymentMethod) => {
  switch (method) {
    case 'apple_pay': return <Smartphone className="w-3 h-3" />;
    case 'bank_transfer': return <Building2 className="w-3 h-3" />;
    case 'cash': return <Banknote className="w-3 h-3" />;
    case 'crypto': return <Coins className="w-3 h-3" />;
    default: return <CreditCard className="w-3 h-3" />;
  }
};

const getPaymentMethodLabel = (method: PaymentMethod) => {
  switch (method) {
    case 'apple_pay': return 'Digital Wallet';
    case 'bank_transfer': return 'Bank Transfer';
    case 'cash': return 'Cash';
    case 'crypto': return 'Crypto';
    default: return 'Card';
  }
};

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  currency,
  onEdit,
  onDelete,
  onDuplicate,
  onBulkDelete,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Group by Date
  const groupedTransactions: Record<string, Transaction[]> = {};
  transactions.forEach((tx) => {
    if (!groupedTransactions[tx.date]) {
      groupedTransactions[tx.date] = [];
    }
    groupedTransactions[tx.date].push(tx);
  });

  const sortedDates = Object.keys(groupedTransactions).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllInView = () => {
    if (selectedIds.length === transactions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(transactions.map(t => t.id));
    }
  };

  const executeBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (confirm(`Delete ${selectedIds.length} selected transaction(s)?`)) {
      onBulkDelete(selectedIds);
      setSelectedIds([]);
    }
  };

  if (transactions.length === 0) {
    return (
      <div className="py-16 text-center bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-2xs p-8">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-zinc-900 dark:text-white">No transactions found</h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto mt-1">
          No records match your active filters. Try searching for something else or log a new transaction above.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      
      {/* Bulk actions banner if items selected */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between p-3 bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 rounded-xl shadow-sm animate-in fade-in duration-150">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="px-2 py-0.5 rounded bg-zinc-800 dark:bg-zinc-200 text-xs font-mono">
              {selectedIds.length}
            </span>
            <span>selected</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedIds([])}
              className="text-xs px-2.5 py-1 rounded hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors"
            >
              Deselect All
            </button>
            <button
              onClick={executeBulkDelete}
              className="flex items-center gap-1 text-xs px-3 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white font-medium transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* Grouped lists */}
      {sortedDates.map((dateStr) => {
        const dayTxs = groupedTransactions[dateStr];
        const dayExpenseTotal = dayTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
        const dayIncomeTotal = dayTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);

        return (
          <div key={dateStr} className="space-y-2">
            
            {/* Date Section Header */}
            <div className="flex items-center justify-between px-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                {formatDate(dateStr)}
              </span>
              <div className="flex items-center gap-3 font-mono text-[11px]">
                {dayIncomeTotal > 0 && (
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                    +{formatCurrency(dayIncomeTotal, currency)}
                  </span>
                )}
                {dayExpenseTotal > 0 && (
                  <span className="text-zinc-600 dark:text-zinc-400">
                    -{formatCurrency(dayExpenseTotal, currency)}
                  </span>
                )}
              </div>
            </div>

            {/* List card */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-xl overflow-hidden shadow-2xs divide-y divide-zinc-100 dark:divide-zinc-800/80">
              {dayTxs.map((tx) => {
                const categoryConfig = CATEGORIES[tx.category] || CATEGORIES.other;
                const isSelected = selectedIds.includes(tx.id);

                return (
                  <div
                    key={tx.id}
                    className={`group flex items-center justify-between p-3.5 sm:p-4 hover:bg-zinc-50/80 dark:hover:bg-zinc-800/50 transition-colors ${
                      isSelected ? 'bg-zinc-50 dark:bg-zinc-800/70' : ''
                    }`}
                  >
                    {/* Left details */}
                    <div className="flex items-center gap-3 min-w-0">
                      
                      {/* Selection Checkbox */}
                      <button
                        type="button"
                        onClick={() => handleToggleSelect(tx.id)}
                        className="text-zinc-300 dark:text-zinc-600 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors shrink-0"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-zinc-900 dark:text-white" />
                        ) : (
                          <Square className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                        )}
                      </button>

                      {/* Category Icon Badge */}
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-transform group-hover:scale-105"
                        style={{
                          backgroundColor: `${categoryConfig.color}15`,
                          borderColor: `${categoryConfig.color}30`,
                          color: categoryConfig.color,
                        }}
                      >
                        {getCategoryIcon(tx.category)}
                      </div>

                      {/* Title, tags, notes */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold text-zinc-900 dark:text-white truncate">
                            {tx.title}
                          </h4>
                          {tx.isRecurring && (
                            <span className="hidden sm:inline-block px-1.5 py-0.2 rounded text-[10px] font-medium bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                              Recurring
                            </span>
                          )}
                        </div>

                        {/* Metadata row: Category, Payment, Tags */}
                        <div className="flex items-center gap-2 mt-1 text-xs text-zinc-500 dark:text-zinc-400 flex-wrap">
                          <span className="text-[11px] font-medium text-zinc-600 dark:text-zinc-300">
                            {categoryConfig.name}
                          </span>
                          <span className="text-zinc-300 dark:text-zinc-700">•</span>
                          <span className="flex items-center gap-1 text-[11px]">
                            {getPaymentMethodIcon(tx.paymentMethod)}
                            <span className="hidden sm:inline">{getPaymentMethodLabel(tx.paymentMethod)}</span>
                          </span>
                          {tx.tags && tx.tags.length > 0 && (
                            <>
                              <span className="text-zinc-300 dark:text-zinc-700 hidden sm:inline">•</span>
                              <div className="hidden sm:flex items-center gap-1">
                                {tx.tags.slice(0, 2).map((t) => (
                                  <span key={t} className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500">
                                    #{t}
                                  </span>
                                ))}
                                {tx.tags.length > 2 && (
                                  <span className="text-[10px] text-zinc-400">+{tx.tags.length - 2}</span>
                                )}
                              </div>
                            </>
                          )}
                        </div>

                        {/* Notes if available */}
                        {tx.notes && (
                          <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1 truncate max-w-md italic">
                            "{tx.notes}"
                          </p>
                        )}
                      </div>

                    </div>

                    {/* Right: Amount & Quick Actions */}
                    <div className="flex items-center gap-3 shrink-0 ml-3">
                      
                      {/* Amount Display */}
                      <div className="text-right">
                        <div
                          className={`text-sm sm:text-base font-bold font-mono tabular-nums ${
                            tx.type === 'income'
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-zinc-900 dark:text-white'
                          }`}
                        >
                          {tx.type === 'income' ? '+' : '-'}
                          {formatCurrency(tx.amount, currency)}
                        </div>
                      </div>

                      {/* Action buttons (Visible on hover on desktop, always visible on mobile) */}
                      <div className="flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => onDuplicate(tx)}
                          title="Duplicate transaction"
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onEdit(tx)}
                          title="Edit transaction"
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(tx.id)}
                          title="Delete transaction"
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                    </div>

                  </div>
                );
              })}
            </div>

          </div>
        );
      })}

    </div>
  );
};
