import React, { useState } from 'react';
import { 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Tag, 
  Calendar, 
  CreditCard, 
  Check, 
  Sparkles,
  ChevronDown,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Transaction, TransactionType, CategoryId, PaymentMethod } from '../types';
import { CATEGORY_LIST, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../data/categories';

interface QuickAddBarProps {
  onAddTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void;
  currency: string;
}

export const QuickAddBar: React.FC<QuickAddBarProps> = ({ onAddTransaction, currency }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [type, setType] = useState<TransactionType>('expense');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<CategoryId>('food');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  const currentCategoryList = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  const handleAddTag = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      const cleanTag = tagInput.trim().replace(/^#|,/g, '').toLowerCase();
      if (cleanTag && !tags.includes(cleanTag)) {
        setTags([...tags, cleanTag]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!title.trim() || isNaN(parsedAmount) || parsedAmount <= 0) return;

    onAddTransaction({
      title: title.trim(),
      amount: parsedAmount,
      type,
      category,
      date,
      paymentMethod,
      tags: tags.length > 0 ? tags : undefined,
      notes: notes.trim() ? notes.trim() : undefined,
    });

    // Fire celebration confetti if income logged
    if (type === 'income') {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#10b981', '#34d399', '#6ee7b7'],
        });
      } catch {}
    }

    // Reset form
    setTitle('');
    setAmount('');
    setNotes('');
    setTags([]);
    setTagInput('');
    setIsExpanded(false);
  };

  const setPresetAmount = (val: number) => {
    const current = parseFloat(amount) || 0;
    setAmount((current + val).toString());
  };

  return (
    <div className="mb-6 bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-xl shadow-xs transition-all">
      <form onSubmit={handleSubmit} className="p-3.5 sm:p-4">
        
        {/* Main Row: Fast inline input */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          
          {/* Type Toggle: Expense / Income */}
          <div className="flex items-center p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-lg shrink-0 border border-zinc-200/60 dark:border-zinc-700/60 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => {
                setType('expense');
                if (category === 'salary' || category === 'freelance' || category === 'investment') {
                  setCategory('food');
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                type === 'expense'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              Expense
            </button>
            <button
              type="button"
              onClick={() => {
                setType('income');
                setCategory('salary');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                type === 'income'
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
              Income
            </button>
          </div>

          {/* Title Input */}
          <div className="relative flex-1 min-w-[180px]">
            <input
              id="input-quick-title"
              type="text"
              required
              placeholder={type === 'expense' ? "What did you spend on? (e.g. Grocery run, Uber)" : "Income description (e.g. Client payment)"}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 text-sm px-3.5 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700/70 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-400 focus:bg-white dark:focus:bg-zinc-800 transition-all"
            />
          </div>

          {/* Amount Input */}
          <div className="relative w-full sm:w-36 shrink-0">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-zinc-400 dark:text-zinc-500">
              {currency}
            </span>
            <input
              id="input-quick-amount"
              type="number"
              step="0.01"
              min="0.01"
              required
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 text-sm pl-7 pr-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700/70 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-400 focus:bg-white dark:focus:bg-zinc-800 font-mono font-medium transition-all"
            />
          </div>

          {/* Category Dropdown */}
          <div className="relative w-full sm:w-44 shrink-0">
            <select
              id="select-quick-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as CategoryId)}
              className="w-full appearance-none bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-white text-xs font-medium px-3 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700/70 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-400 cursor-pointer"
            >
              {currentCategoryList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400" />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className={`p-2 rounded-lg text-xs font-medium border transition-colors ${
                isExpanded || tags.length > 0 || notes
                  ? 'bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-white'
                  : 'bg-transparent border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
              title="Add details (Date, tags, payment method, notes)"
            >
              <Tag className="w-4 h-4" />
            </button>

            <button
              id="btn-quick-submit"
              type="submit"
              disabled={!title.trim() || !amount}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 text-xs sm:text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-98"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Log Entry</span>
            </button>
          </div>

        </div>

        {/* Quick Amount Increment Pills */}
        <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] text-zinc-400 dark:text-zinc-500 mr-1">Quick Add:</span>
          {[5, 10, 25, 50, 100].map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => setPresetAmount(val)}
              className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-200/60 dark:border-zinc-700/60 transition-colors"
            >
              +{currency}{val}
            </button>
          ))}
          {amount && (
            <button
              type="button"
              onClick={() => setAmount('')}
              className="text-[11px] text-rose-500 hover:underline ml-1"
            >
              Clear
            </button>
          )}
        </div>

        {/* Expanded Details Row */}
        {isExpanded && (
          <div className="mt-3.5 pt-3.5 border-t border-zinc-100 dark:border-zinc-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in fade-in duration-200">
            
            {/* Date Picker */}
            <div>
              <label className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                Transaction Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-white text-xs px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700/70 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                />
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-white text-xs px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700/70 focus:outline-none focus:ring-1 focus:ring-zinc-400"
              >
                <option value="card">Debit / Credit Card</option>
                <option value="apple_pay">Apple Pay / Google Pay</option>
                <option value="bank_transfer">Bank Transfer / ACH</option>
                <option value="cash">Physical Cash</option>
                <option value="crypto">Crypto / Web3</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Tags & Notes */}
            <div>
              <label className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                Tags (Press Enter)
              </label>
              <input
                type="text"
                placeholder="e.g. coffee, commute, client"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                className="w-full bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-white text-xs px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700/70 focus:outline-none focus:ring-1 focus:ring-zinc-400"
              />
            </div>

            {/* Active Tags Chips */}
            {tags.length > 0 && (
              <div className="sm:col-span-3 flex flex-wrap gap-1.5 items-center">
                <span className="text-[11px] text-zinc-400">Tags:</span>
                {tags.map(t => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700"
                  >
                    #{t}
                    <button
                      type="button"
                      onClick={() => removeTag(t)}
                      className="hover:text-rose-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Notes */}
            <div className="sm:col-span-3">
              <input
                type="text"
                placeholder="Optional notes or receipt memo..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-white text-xs px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700/70 focus:outline-none focus:ring-1 focus:ring-zinc-400"
              />
            </div>

          </div>
        )}

      </form>
    </div>
  );
};
