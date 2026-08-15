import React, { useState, useEffect, useCallback } from 'react';
import { 
  Transaction, 
  Budget, 
  RecurringSubscription, 
  ActiveTab, 
  ThemeMode, 
  FilterState 
} from './types';
import { 
  INITIAL_TRANSACTIONS, 
  INITIAL_BUDGETS, 
  INITIAL_SUBSCRIPTIONS 
} from './data/defaultData';
import { filterTransactions } from './utils/formatters';

import { Header } from './components/Header';
import { MetricCards } from './components/MetricCards';
import { QuickAddBar } from './components/QuickAddBar';
import { TransactionFilterBar } from './components/TransactionFilterBar';
import { TransactionList } from './components/TransactionList';
import { AnalyticsView } from './components/AnalyticsView';
import { BudgetTracker } from './components/BudgetTracker';
import { RecurringSubscriptions } from './components/RecurringSubscriptions';
import { EditTransactionModal } from './components/EditTransactionModal';
import { ExportImportModal } from './components/ExportImportModal';
import { DeployModal } from './components/DeployModal';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';

export default function App() {
  // 1. Theme State & Storage
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('app_theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // Apply dark mode class to document
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('app_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // 2. Currency State
  const [currency, setCurrency] = useState<string>(() => {
    return localStorage.getItem('app_currency') || '$';
  });

  useEffect(() => {
    localStorage.setItem('app_currency', currency);
  }, [currency]);

  // 3. Navigation Tab State
  const [activeTab, setActiveTab] = useState<ActiveTab>('transactions');

  // 4. Data State (Persistent)
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('app_transactions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return INITIAL_TRANSACTIONS;
  });

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const saved = localStorage.getItem('app_budgets');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return INITIAL_BUDGETS;
  });

  const [subscriptions, setSubscriptions] = useState<RecurringSubscription[]>(() => {
    const saved = localStorage.getItem('app_subscriptions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return INITIAL_SUBSCRIPTIONS;
  });

  // Sync data to localStorage
  useEffect(() => {
    localStorage.setItem('app_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('app_budgets', JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem('app_subscriptions', JSON.stringify(subscriptions));
  }, [subscriptions]);

  // 5. Filter State
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    dateRange: 'this_month',
    type: 'all',
    category: 'all',
    paymentMethod: 'all',
    sortBy: 'date_desc',
  });

  // Filtered transactions computed
  const displayedTransactions = filterTransactions(transactions, filters);
  const totalFilteredAmount = displayedTransactions.reduce((sum, t) => {
    return t.type === 'expense' ? sum + t.amount : sum;
  }, 0);

  // 6. Modals State
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [isKeyboardModalOpen, setIsKeyboardModalOpen] = useState(false);

  // 7. Transaction Actions
  const handleAddTransaction = (txData: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTx: Transaction = {
      ...txData,
      id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: Date.now(),
    };
    setTransactions(prev => [newTx, ...prev]);
  };

  const handleUpdateTransaction = (updated: Transaction) => {
    setTransactions(prev => prev.map(t => t.id === updated.id ? updated : t));
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const handleDuplicateTransaction = (tx: Transaction) => {
    const dup: Transaction = {
      ...tx,
      id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: `${tx.title} (Copy)`,
      date: new Date().toISOString().split('T')[0],
      createdAt: Date.now(),
    };
    setTransactions(prev => [dup, ...prev]);
  };

  const handleBulkDelete = (ids: string[]) => {
    setTransactions(prev => prev.filter(t => !ids.includes(t.id)));
  };

  // Budget Actions
  const handleUpdateBudget = (budgetToUpdate: Budget) => {
    setBudgets(prev => {
      const exists = prev.some(b => b.categoryId === budgetToUpdate.categoryId);
      if (exists) {
        return prev.map(b => b.categoryId === budgetToUpdate.categoryId ? budgetToUpdate : b);
      }
      return [...prev, budgetToUpdate];
    });
  };

  // Subscription Actions
  const handleAddSubscription = (subData: Omit<RecurringSubscription, 'id'>) => {
    const newSub: RecurringSubscription = {
      ...subData,
      id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };
    setSubscriptions(prev => [newSub, ...prev]);
  };

  const handleToggleSubscriptionActive = (id: string) => {
    setSubscriptions(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s));
  };

  const handleDeleteSubscription = (id: string) => {
    setSubscriptions(prev => prev.filter(s => s.id !== id));
  };

  // Data import / reset
  const handleImportTransactions = (imported: Transaction[]) => {
    setTransactions(prev => [...imported, ...prev]);
  };

  const handleResetData = () => {
    setTransactions(INITIAL_TRANSACTIONS);
    setBudgets(INITIAL_BUDGETS);
    setSubscriptions(INITIAL_SUBSCRIPTIONS);
  };

  // 8. Global Keyboard Shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Ignore hotkeys when typing in input, textarea or select
    const target = e.target as HTMLElement;
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) {
      if (e.key === 'Escape') {
        target.blur();
      }
      return;
    }

    if (e.key === 'Escape') {
      setEditingTransaction(null);
      setIsExportModalOpen(false);
      setIsDeployModalOpen(false);
      setIsKeyboardModalOpen(false);
    } else if (e.key.toLowerCase() === 'n') {
      e.preventDefault();
      setActiveTab('transactions');
      const input = document.getElementById('input-quick-title');
      if (input) input.focus();
    } else if (e.key === '/') {
      e.preventDefault();
      setActiveTab('transactions');
      const search = document.getElementById('input-filter-search');
      if (search) search.focus();
    } else if (e.key.toLowerCase() === 't') {
      e.preventDefault();
      toggleTheme();
    } else if (e.key === '1') {
      setActiveTab('transactions');
    } else if (e.key === '2') {
      setActiveTab('analytics');
    } else if (e.key === '3') {
      setActiveTab('budgets');
    } else if (e.key === '4') {
      setActiveTab('subscriptions');
    } else if (e.key.toLowerCase() === 'e') {
      e.preventDefault();
      setIsExportModalOpen(true);
    } else if (e.key === '?') {
      e.preventDefault();
      setIsKeyboardModalOpen(true);
    }
  }, [toggleTheme]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-200 selection:bg-emerald-500 selection:text-white">
      
      {/* Top Sticky Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        theme={theme}
        toggleTheme={toggleTheme}
        currency={currency}
        setCurrency={setCurrency}
        onOpenNewTx={() => {
          setActiveTab('transactions');
          setTimeout(() => {
            const input = document.getElementById('input-quick-title');
            if (input) input.focus();
          }, 50);
        }}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onOpenKeyboardModal={() => setIsKeyboardModalOpen(true)}
        onOpenDeployModal={() => setIsDeployModalOpen(true)}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Metric Summary Cards Bar */}
        <MetricCards
          transactions={transactions}
          budgets={budgets}
          currency={currency}
          onOpenBudgetModal={() => setActiveTab('budgets')}
        />

        {/* Tab 1: Transactions Feed */}
        {activeTab === 'transactions' && (
          <div className="animate-in fade-in duration-200">
            {/* Quick Add Bar */}
            <QuickAddBar
              onAddTransaction={handleAddTransaction}
              currency={currency}
            />

            {/* Filter & Search Bar */}
            <TransactionFilterBar
              filters={filters}
              setFilters={setFilters}
              totalMatches={displayedTransactions.length}
              totalAmount={totalFilteredAmount}
              currency={currency}
            />

            {/* Transaction Feed */}
            <TransactionList
              transactions={displayedTransactions}
              currency={currency}
              onEdit={(tx) => setEditingTransaction(tx)}
              onDelete={handleDeleteTransaction}
              onDuplicate={handleDuplicateTransaction}
              onBulkDelete={handleBulkDelete}
            />
          </div>
        )}

        {/* Tab 2: Analytics & Visualizations */}
        {activeTab === 'analytics' && (
          <div className="animate-in fade-in duration-200">
            <AnalyticsView
              transactions={transactions}
              currency={currency}
            />
          </div>
        )}

        {/* Tab 3: Budgets & Caps */}
        {activeTab === 'budgets' && (
          <div className="animate-in fade-in duration-200">
            <BudgetTracker
              budgets={budgets}
              transactions={transactions}
              currency={currency}
              onUpdateBudget={handleUpdateBudget}
            />
          </div>
        )}

        {/* Tab 4: Recurring Subscriptions */}
        {activeTab === 'subscriptions' && (
          <div className="animate-in fade-in duration-200">
            <RecurringSubscriptions
              subscriptions={subscriptions}
              currency={currency}
              onAddSubscription={handleAddSubscription}
              onToggleActive={handleToggleSubscriptionActive}
              onDeleteSubscription={handleDeleteSubscription}
            />
          </div>
        )}

      </main>

      {/* Modals & Drawers */}
      <EditTransactionModal
        isOpen={!!editingTransaction}
        transaction={editingTransaction}
        currency={currency}
        onClose={() => setEditingTransaction(null)}
        onSave={handleUpdateTransaction}
        onDelete={handleDeleteTransaction}
      />

      <ExportImportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        transactions={transactions}
        budgets={budgets}
        subscriptions={subscriptions}
        onImportTransactions={handleImportTransactions}
        onResetData={handleResetData}
      />

      <DeployModal
        isOpen={isDeployModalOpen}
        onClose={() => setIsDeployModalOpen(false)}
      />

      <KeyboardShortcutsModal
        isOpen={isKeyboardModalOpen}
        onClose={() => setIsKeyboardModalOpen(false)}
      />

    </div>
  );
}
