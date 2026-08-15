import React from 'react';
import { 
  Sun, 
  Moon, 
  Plus, 
  Download, 
  Keyboard, 
  Wallet, 
  BarChart3, 
  Target, 
  Repeat, 
  Github, 
  LogOut,
  Database,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { ActiveTab, ThemeMode } from '../types';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  theme: ThemeMode;
  toggleTheme: () => void;
  currency: string;
  setCurrency: (c: string) => void;
  onOpenNewTx: () => void;
  onOpenExportModal: () => void;
  onOpenKeyboardModal: () => void;
  onOpenDeployModal: () => void;
  isSyncing?: boolean;
}

const CURRENCIES = [
  { symbol: '$', code: 'USD' },
  { symbol: '€', code: 'EUR' },
  { symbol: '£', code: 'GBP' },
  { symbol: '¥', code: 'JPY' },
  { symbol: '₹', code: 'INR' },
  { symbol: 'C$', code: 'CAD' },
  { symbol: 'A$', code: 'AUD' },
];

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  theme,
  toggleTheme,
  currency,
  setCurrency,
  onOpenNewTx,
  onOpenExportModal,
  onOpenKeyboardModal,
  onOpenDeployModal,
  isSyncing,
}) => {
  const { user, signInWithGoogle, signOut, loading } = useAuth();

  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-md bg-white/90 dark:bg-zinc-950/90 border-b border-zinc-200/80 dark:border-zinc-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 shadow-sm">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-zinc-900 dark:text-white tracking-tight text-base sm:text-lg">
                  Ledger<span className="text-emerald-600 dark:text-emerald-400 font-bold">.</span>
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  <Database className="w-2.5 h-2.5" />
                  PostgreSQL
                </span>
              </div>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="hidden md:flex items-center p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200/70 dark:border-zinc-800">
            <button
              id="nav-tab-transactions"
              onClick={() => setActiveTab('transactions')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'transactions'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs font-semibold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <Wallet className="w-3.5 h-3.5" />
              Transactions
            </button>
            <button
              id="nav-tab-analytics"
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'analytics'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs font-semibold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Analytics
            </button>
            <button
              id="nav-tab-budgets"
              onClick={() => setActiveTab('budgets')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'budgets'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs font-semibold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              Budgets
            </button>
            <button
              id="nav-tab-subscriptions"
              onClick={() => setActiveTab('subscriptions')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'subscriptions'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs font-semibold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <Repeat className="w-3.5 h-3.5" />
              Recurring
            </button>
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2">
            
            {/* Sync status indicator */}
            {user && (
              <div 
                className="hidden xl:flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-mono text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
                title="PostgreSQL Cloud SQL synchronization status"
              >
                {isSyncing ? (
                  <>
                    <RefreshCw className="w-3 h-3 text-emerald-500 animate-spin" />
                    <span>Syncing...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    <span>Postgres Synced</span>
                  </>
                )}
              </div>
            )}

            {/* Currency selector */}
            <div className="relative">
              <select
                id="select-currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="appearance-none bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-xs font-medium pl-2.5 pr-6 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 cursor-pointer focus:outline-none focus:ring-1 focus:ring-zinc-400"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.symbol}>
                    {c.symbol} ({c.code})
                  </option>
                ))}
              </select>
              <span className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[10px] text-zinc-400">
                ▼
              </span>
            </div>

            {/* Export / Backup */}
            <button
              id="btn-export-backup"
              onClick={onOpenExportModal}
              title="Export / Import Data (CSV & JSON)"
              className="p-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Keyboard shortcuts */}
            <button
              id="btn-keyboard-shortcuts"
              onClick={onOpenKeyboardModal}
              title="Keyboard Shortcuts (?)"
              className="hidden sm:inline-flex p-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
            >
              <Keyboard className="w-4 h-4" />
            </button>

            {/* Theme Toggle */}
            <button
              id="btn-toggle-theme"
              onClick={toggleTheme}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode (T)`}
              className="p-2 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-zinc-700" />
              )}
            </button>

            {/* Google Authentication Button / User Profile */}
            {loading ? (
              <div className="w-8 h-8 rounded-lg bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
            ) : user ? (
              <div className="flex items-center gap-2 pl-1">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-7 h-7 rounded-full border border-zinc-200 dark:border-zinc-700 object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-emerald-500 text-white text-xs font-bold flex items-center justify-center">
                    {(user.displayName || user.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <button
                  id="btn-sign-out"
                  onClick={signOut}
                  title="Sign out of account"
                  className="p-1.5 rounded-lg text-zinc-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                id="btn-google-sign-in"
                onClick={signInWithGoogle}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all shadow-2xs active:scale-98"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Sign in</span>
              </button>
            )}

            {/* Quick Add Button */}
            <button
              id="btn-header-quick-add"
              onClick={onOpenNewTx}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:text-zinc-950 font-medium text-xs sm:text-sm shadow-xs transition-all active:scale-98"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">Add Entry</span>
              <span className="sm:hidden">Add</span>
            </button>

          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-zinc-200/50 dark:border-zinc-800/50">
          <button
            onClick={() => setActiveTab('transactions')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium ${
              activeTab === 'transactions'
                ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-950'
                : 'text-zinc-600 dark:text-zinc-400'
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            Feed
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium ${
              activeTab === 'analytics'
                ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-950'
                : 'text-zinc-600 dark:text-zinc-400'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('budgets')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium ${
              activeTab === 'budgets'
                ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-950'
                : 'text-zinc-600 dark:text-zinc-400'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            Budgets
          </button>
          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium ${
              activeTab === 'subscriptions'
                ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-950'
                : 'text-zinc-600 dark:text-zinc-400'
            }`}
          >
            <Repeat className="w-3.5 h-3.5" />
            Recurring
          </button>
        </div>

      </div>
    </header>
  );
};
