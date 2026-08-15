import { Category, CategoryId } from '../types';

export const CATEGORIES: Record<CategoryId, Category> = {
  food: {
    id: 'food',
    name: 'Food & Dining',
    icon: 'Utensils',
    color: '#f97316', // orange-500
    bgLight: 'bg-orange-50 text-orange-600 border-orange-200',
    bgDark: 'dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-900/50',
    type: 'expense',
  },
  housing: {
    id: 'housing',
    name: 'Housing & Rent',
    icon: 'Home',
    color: '#3b82f6', // blue-500
    bgLight: 'bg-blue-50 text-blue-600 border-blue-200',
    bgDark: 'dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/50',
    type: 'expense',
  },
  transport: {
    id: 'transport',
    name: 'Transportation',
    icon: 'Car',
    color: '#06b6d4', // cyan-500
    bgLight: 'bg-cyan-50 text-cyan-600 border-cyan-200',
    bgDark: 'dark:bg-cyan-950/40 dark:text-cyan-400 dark:border-cyan-900/50',
    type: 'expense',
  },
  shopping: {
    id: 'shopping',
    name: 'Shopping & Retail',
    icon: 'ShoppingBag',
    color: '#ec4899', // pink-500
    bgLight: 'bg-pink-50 text-pink-600 border-pink-200',
    bgDark: 'dark:bg-pink-950/40 dark:text-pink-400 dark:border-pink-900/50',
    type: 'expense',
  },
  utilities: {
    id: 'utilities',
    name: 'Bills & Utilities',
    icon: 'Zap',
    color: '#eab308', // yellow-500
    bgLight: 'bg-amber-50 text-amber-700 border-amber-200',
    bgDark: 'dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/50',
    type: 'expense',
  },
  entertainment: {
    id: 'entertainment',
    name: 'Entertainment',
    icon: 'Film',
    color: '#8b5cf6', // violet-500
    bgLight: 'bg-purple-50 text-purple-600 border-purple-200',
    bgDark: 'dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-900/50',
    type: 'expense',
  },
  health: {
    id: 'health',
    name: 'Health & Fitness',
    icon: 'HeartPulse',
    color: '#10b981', // emerald-500
    bgLight: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    bgDark: 'dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/50',
    type: 'expense',
  },
  education: {
    id: 'education',
    name: 'Education & Learning',
    icon: 'GraduationCap',
    color: '#6366f1', // indigo-500
    bgLight: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    bgDark: 'dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-900/50',
    type: 'expense',
  },
  salary: {
    id: 'salary',
    name: 'Salary & Wages',
    icon: 'Briefcase',
    color: '#10b981', // emerald-500
    bgLight: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    bgDark: 'dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/50',
    type: 'income',
  },
  freelance: {
    id: 'freelance',
    name: 'Freelance & Contract',
    icon: 'Laptop',
    color: '#14b8a6', // teal-500
    bgLight: 'bg-teal-50 text-teal-700 border-teal-200',
    bgDark: 'dark:bg-teal-950/40 dark:text-teal-400 dark:border-teal-900/50',
    type: 'income',
  },
  investment: {
    id: 'investment',
    name: 'Investments & Dividends',
    icon: 'TrendingUp',
    color: '#059669', // emerald-600
    bgLight: 'bg-green-50 text-green-700 border-green-200',
    bgDark: 'dark:bg-green-950/40 dark:text-green-400 dark:border-green-900/50',
    type: 'income',
  },
  other: {
    id: 'other',
    name: 'Other / Misc',
    icon: 'HelpCircle',
    color: '#64748b', // slate-500
    bgLight: 'bg-slate-100 text-slate-700 border-slate-200',
    bgDark: 'dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    type: 'both',
  },
};

export const CATEGORY_LIST = Object.values(CATEGORIES);
export const EXPENSE_CATEGORIES = CATEGORY_LIST.filter(c => c.type === 'expense' || c.type === 'both');
export const INCOME_CATEGORIES = CATEGORY_LIST.filter(c => c.type === 'income' || c.type === 'both');
