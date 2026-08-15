import React, { useState } from 'react';
import { 
  Repeat, 
  Plus, 
  Trash2, 
  Calendar, 
  CreditCard, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import { RecurringSubscription, CategoryId, PaymentMethod } from '../types';
import { CATEGORIES, EXPENSE_CATEGORIES } from '../data/categories';
import { formatCurrency, formatDate } from '../utils/formatters';

interface RecurringSubscriptionsProps {
  subscriptions: RecurringSubscription[];
  currency: string;
  onAddSubscription: (sub: Omit<RecurringSubscription, 'id'>) => void;
  onToggleActive: (id: string) => void;
  onDeleteSubscription: (id: string) => void;
}

export const RecurringSubscriptions: React.FC<RecurringSubscriptionsProps> = ({
  subscriptions,
  currency,
  onAddSubscription,
  onToggleActive,
  onDeleteSubscription,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<CategoryId>('entertainment');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [nextBillingDate, setNextBillingDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');

  // Compute monthly commitments
  const totalMonthlyCommitment = subscriptions
    .filter(s => s.active)
    .reduce((sum, s) => {
      return sum + (s.billingCycle === 'monthly' ? s.amount : s.amount / 12);
    }, 0);

  const totalYearlyCommitment = totalMonthlyCommitment * 12;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(amount);
    if (!name.trim() || isNaN(parsed) || parsed <= 0) return;

    onAddSubscription({
      name: name.trim(),
      amount: parsed,
      category,
      billingCycle,
      nextBillingDate,
      paymentMethod,
      active: true,
    });

    setName('');
    setAmount('');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 pb-2 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight">
            Recurring Bills & Subscriptions
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Track fixed overhead, auto-debits, software tools, and memberships.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-950 text-xs font-semibold shadow-2xs transition-all"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>{showAddForm ? 'Cancel' : 'Add Subscription'}</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 shadow-2xs">
          <div className="text-xs text-zinc-500 font-medium mb-1">Monthly Fixed Burn</div>
          <div className="text-2xl font-bold font-mono text-zinc-900 dark:text-white tabular-nums">
            {formatCurrency(totalMonthlyCommitment, currency)}
            <span className="text-xs font-normal text-zinc-400 ml-1">/mo</span>
          </div>
          <div className="text-[11px] text-zinc-400 mt-1">
            {subscriptions.filter(s => s.active).length} active recurring charges
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 shadow-2xs">
          <div className="text-xs text-zinc-500 font-medium mb-1">Annualized Cost</div>
          <div className="text-2xl font-bold font-mono text-zinc-900 dark:text-white tabular-nums">
            {formatCurrency(totalYearlyCommitment, currency)}
            <span className="text-xs font-normal text-zinc-400 ml-1">/yr</span>
          </div>
          <div className="text-[11px] text-zinc-400 mt-1">
            Projected 12-month commitment
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 shadow-2xs">
          <div className="text-xs text-zinc-500 font-medium mb-1">Upcoming Renewal</div>
          <div className="text-sm font-semibold text-zinc-900 dark:text-white mt-1">
            {subscriptions.length > 0 ? subscriptions[0].name : 'None'}
          </div>
          <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-500" />
            <span>{subscriptions.length > 0 ? formatDate(subscriptions[0].nextBillingDate) : 'No bills due'}</span>
          </div>
        </div>

      </div>

      {/* Add Subscription Form (Collapsible) */}
      {showAddForm && (
        <form onSubmit={handleAddSubmit} className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 shadow-2xs space-y-4 animate-in fade-in duration-200">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
            Add New Subscription
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">Service / Bill Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Netflix, Figma, Gym"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-800 text-xs px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">Amount</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-800 text-xs px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CategoryId)}
                className="w-full bg-zinc-50 dark:bg-zinc-800 text-xs px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
              >
                {EXPENSE_CATEGORIES.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">Billing Cycle</label>
              <select
                value={billingCycle}
                onChange={(e) => setBillingCycle(e.target.value as any)}
                className="w-full bg-zinc-50 dark:bg-zinc-800 text-xs px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
              >
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">Next Due Date</label>
              <input
                type="date"
                value={nextBillingDate}
                onChange={(e) => setNextBillingDate(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-800 text-xs px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full bg-zinc-50 dark:bg-zinc-800 text-xs px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
              >
                <option value="card">Card</option>
                <option value="apple_pay">Apple Pay</option>
                <option value="bank_transfer">Bank Transfer</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-zinc-900 text-white dark:bg-white dark:text-zinc-950"
            >
              Save Subscription
            </button>
          </div>
        </form>
      )}

      {/* Subscriptions List */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-xl overflow-hidden shadow-2xs divide-y divide-zinc-100 dark:divide-zinc-800/80">
        {subscriptions.map(sub => {
          const categoryConfig = CATEGORIES[sub.category] || CATEGORIES.other;

          return (
            <div
              key={sub.id}
              className={`p-4 flex items-center justify-between transition-colors ${
                !sub.active ? 'opacity-50 bg-zinc-50/50 dark:bg-zinc-900/50' : 'hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40'
              }`}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onToggleActive(sub.id)}
                  title={sub.active ? 'Pause subscription' : 'Activate subscription'}
                  className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                >
                  <CheckCircle2 className={`w-5 h-5 ${sub.active ? 'text-emerald-500' : 'text-zinc-300 dark:text-zinc-600'}`} />
                </button>

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-zinc-900 dark:text-white">
                      {sub.name}
                    </h4>
                    <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                      {sub.billingCycle}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                    <span className="text-[11px] font-medium" style={{ color: categoryConfig.color }}>
                      {categoryConfig.name}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-[11px]">
                      <Calendar className="w-3 h-3 text-zinc-400" />
                      Next: {formatDate(sub.nextBillingDate)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right font-mono">
                  <div className="text-sm font-bold text-zinc-900 dark:text-white">
                    {formatCurrency(sub.amount, currency)}
                  </div>
                  <div className="text-[10px] text-zinc-400">
                    {sub.billingCycle === 'monthly' ? '/month' : '/year'}
                  </div>
                </div>

                <button
                  onClick={() => onDeleteSubscription(sub.id)}
                  className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
