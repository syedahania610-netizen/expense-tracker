export type TransactionType = 'expense' | 'income';

export type CategoryId = 
  | 'food'
  | 'housing'
  | 'transport'
  | 'entertainment'
  | 'utilities'
  | 'shopping'
  | 'health'
  | 'salary'
  | 'freelance'
  | 'investment'
  | 'education'
  | 'other';

export interface Category {
  id: CategoryId;
  name: string;
  icon: string;
  color: string;
  bgLight: string;
  bgDark: string;
  type: 'expense' | 'income' | 'both';
}

export type PaymentMethod = 'card' | 'cash' | 'bank_transfer' | 'apple_pay' | 'crypto' | 'other';

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: CategoryId;
  date: string; // ISO format YYYY-MM-DD
  paymentMethod: PaymentMethod;
  notes?: string;
  tags?: string[];
  isRecurring?: boolean;
  recurringFrequency?: 'weekly' | 'monthly' | 'yearly';
  createdAt: number;
}

export interface Budget {
  categoryId?: CategoryId | 'overall';
  limit: number;
  period: 'monthly';
}

export interface RecurringSubscription {
  id: string;
  name: string;
  amount: number;
  category: CategoryId;
  billingCycle: 'monthly' | 'yearly';
  nextBillingDate: string; // YYYY-MM-DD
  paymentMethod: PaymentMethod;
  active: boolean;
}

export type DateRangeFilter = 'today' | 'this_week' | 'this_month' | 'last_month' | 'this_year' | 'all' | 'custom';

export interface FilterState {
  searchQuery: string;
  dateRange: DateRangeFilter;
  customStartDate?: string;
  customEndDate?: string;
  type: 'all' | TransactionType;
  category: 'all' | CategoryId;
  paymentMethod: 'all' | PaymentMethod;
  sortBy: 'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc';
}

export type ActiveTab = 'transactions' | 'analytics' | 'budgets' | 'subscriptions';

export type ThemeMode = 'light' | 'dark' | 'system';
