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
import { AuthProvider, useAuth } from './context/AuthContext';

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

function MainApp() {
  const { user, idToken, getIdToken } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);

  // 1. Theme State & Storage
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('app_theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

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

  const handleSetCurrency = async (newCurr: string) => {
    setCurrency(newCurr);
    localStorage.setItem('app_currency', newCurr);
    if (user) {
      const token = await getIdToken();
      if (token) {
        fetch('/api/user/currency', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ currency: newCurr }),
        }).catch(console.error);
      }
    }
  };

  // 3. Navigation Tab State
  const [activeTab, setActiveTab] = useState<ActiveTab>('transactions');

  // 4. Data State
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

  // Fetch data from PostgreSQL whenever user signs in
  useEffect(() => {
    async function loadServerData() {
      if (!user) return;
      try {
        setIsSyncing(true);
        const token = await getIdToken();
        if (!token) return;

        // Fetch transactions, budgets, subscriptions concurrently
        const [txRes, bRes, sRes] = await Promise.all([
          fetch('/api/transactions', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/budgets', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/subscriptions', { headers: { 'Authorization': `Bearer ${token}` } }),
        ]);

        if (txRes.ok) {
          const txData = await txRes.json();
          if (txData.transactions && txData.transactions.length > 0) {
            setTransactions(txData.transactions);
            localStorage.setItem('app_transactions', JSON.stringify(txData.transactions));
          } else {
            // First time user: seed initial local data to PostgreSQL
            await fetch('/api/transactions/bulk-import', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify({ transactions }),
            });
          }
        }

        if (bRes.ok) {
          const bData = await bRes.json();
          if (bData.budgets && bData.budgets.length > 0) {
            setBudgets(bData.budgets);
            localStorage.setItem('app_budgets', JSON.stringify(bData.budgets));
          } else {
            for (const b of budgets) {
              await fetch('/api/budgets', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(b),
              });
            }
          }
        }

        if (sRes.ok) {
          const sData = await sRes.json();
          if (sData.subscriptions && sData.subscriptions.length > 0) {
            setSubscriptions(sData.subscriptions);
            localStorage.setItem('app_subscriptions', JSON.stringify(sData.subscriptions));
          } else {
            for (const s of subscriptions) {
              await fetch('/api/subscriptions', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(s),
              });
            }
          }
        }
      } catch (err) {
        console.error('Error fetching PostgreSQL data:', err);
      } finally {
        setIsSyncing(false);
      }
    }

    loadServerData();
  }, [user]);

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

  const displayedTransactions = filterTransactions(transactions, filters);
  const totalFilteredAmount = displayedTransactions.reduce((sum, t) => {
    return t.type === 'expense' ? sum + t.amount : sum;
  }, 0);

  // 6. Modals State
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [isKeyboardModalOpen, setIsKeyboardModalOpen] = useState(false);

  // 7. Transaction Actions with PostgreSQL Persistence
  const handleAddTransaction = async (txData: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTx: Transaction = {
      ...txData,
      id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: Date.now(),
    };
    setTransactions(prev => [newTx, ...prev]);

    if (user) {
      try {
        const token = await getIdToken();
        if (token) {
          fetch('/api/transactions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(newTx),
          }).catch(console.error);
        }
      } catch (e) {
        console.error('Failed to sync new transaction:', e);
      }
    }
  };

  const handleUpdateTransaction = async (updated: Transaction) => {
    setTransactions(prev => prev.map(t => t.id === updated.id ? updated : t));

    if (user) {
      try {
        const token = await getIdToken();
        if (token) {
          fetch('/api/transactions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(updated),
          }).catch(console.error);
        }
      } catch (e) {
        console.error('Failed to update transaction on server:', e);
      }
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));

    if (user) {
      try {
        const token = await getIdToken();
        if (token) {
          fetch(`/api/transactions/${id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }).catch(console.error);
        }
      } catch (e) {
        console.error('Failed to delete transaction on server:', e);
      }
    }
  };

  const handleDuplicateTransaction = (tx: Transaction) => {
    const dup: Transaction = {
      ...tx,
      id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: `${tx.title} (Copy)`,
      date: new Date().toISOString().split('T')[0],
      createdAt: Date.now(),
    };
    handleAddTransaction(dup);
  };

  const handleBulkDelete = async (ids: string[]) => {
    setTransactions(prev => prev.filter(t => !ids.includes(t.id)));

    if (user) {
      try {
        const token = await getIdToken();
        if (token) {
          fetch('/api/transactions/bulk-delete', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ ids }),
          }).catch(console.error);
        }
      } catch (e) {
        console.error('Failed to bulk delete on server:', e);
      }
    }
  };

  // Budget Actions
  const handleUpdateBudget = async (budgetToUpdate: Budget) => {
    setBudgets(prev => {
      const exists = prev.some(b => b.categoryId === budgetToUpdate.categoryId);
      if (exists) {
        return prev.map(b => b.categoryId === budgetToUpdate.categoryId ? budgetToUpdate : b);
      }
      return [...prev, budgetToUpdate];
    });

    if (user) {
      try {
        const token = await getIdToken();
        if (token) {
          fetch('/api/budgets', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(budgetToUpdate),
          }).catch(console.error);
        }
      } catch (e) {
        console.error('Failed to update budget on server:', e);
      }
    }
  };

  // Subscription Actions
  const handleAddSubscription = async (subData: Omit<RecurringSubscription, 'id'>) => {
    const newSub: RecurringSubscription = {
      ...subData,
      id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };
    setSubscriptions(prev => [newSub, ...prev]);

    if (user) {
      try {
        const token = await getIdToken();
        if (token) {
          fetch('/api/subscriptions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(newSub),
          }).catch(console.error);
        }
      } catch (e) {
        console.error('Failed to save subscription to server:', e);
      }
    }
  };

  const handleToggleSubscriptionActive = async (id: string) => {
    const sub = subscriptions.find(s => s.id === id);
    if (!sub) return;
    const updated = { ...sub, active: !sub.active };
    setSubscriptions(prev => prev.map(s => s.id === id ? updated : s));

    if (user) {
      try {
        const token = await getIdToken();
        if (token) {
          fetch('/api/subscriptions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(updated),
          }).catch(console.error);
        }
      } catch (e) {
        console.error('Failed to toggle subscription on server:', e);
      }
    }
  };

  const handleDeleteSubscription = async (id: string) => {
    setSubscriptions(prev => prev.filter(s => s.id !== id));

    if (user) {
      try {
        const token = await getIdToken();
        if (token) {
          fetch(`/api/subscriptions/${id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }).catch(console.error);
        }
      } catch (e) {
        console.error('Failed to delete subscription on server:', e);
      }
    }
  };

  // Data import / reset
  const handleImportTransactions = async (imported: Transaction[]) => {
    setTransactions(prev => [...imported, ...prev]);

    if (user) {
      try {
        const token = await getIdToken();
        if (token) {
          fetch('/api/transactions/bulk-import', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ transactions: imported }),
          }).catch(console.error);
        }
      } catch (e) {
        console.error('Failed to import on server:', e);
      }
    }
  };

  const handleResetData = () => {
    setTransactions(INITIAL_TRANSACTIONS);
    setBudgets(INITIAL_BUDGETS);
    setSubscriptions(INITIAL_SUBSCRIPTIONS);
  };

  // 8. Global Keyboard Shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
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
        setCurrency={handleSetCurrency}
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
        isSyncing={isSyncing}
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

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
