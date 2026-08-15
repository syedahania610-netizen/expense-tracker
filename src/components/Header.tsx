import React from 'react';
import { 
  Sun, 
  Moon, 
  Plus, 
  Sparkles, 
  Download, 
  Upload, 
  Keyboard, 
  Wallet, 
  BarChart3, 
  Target, 
  Repeat, 
  Github, 
  ExternalLink,
  DollarSign
} from 'lucide-react';
import { ActiveTab, ThemeMode } from '../types';

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
}) => {
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
                <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                  Minimal v2.0
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
            
            {/* Deploy / GitHub guide button */}
            <button
              id="btn-open-deploy"
              onClick={onOpenDeployModal}
              title="Deploy to GitHub & Vercel Guide"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 transition-colors"
            >
              <Github className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Deploy to Vercel</span>
              <span className="lg:hidden text-xs">Deploy</span>
            </button>

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

            {/* Quick Add Button */}
            <button
              id="btn-header-quick-add"
              onClick={onOpenNewTx}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:text-zinc-950 font-medium text-xs sm:text-sm shadow-xs transition-all active:scale-98"
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
