import { pgTable, text, serial, timestamp, doublePrecision, boolean, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table authenticated via Google / Firebase
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  displayName: text('display_name'),
  photoURL: text('photo_url'),
  currency: text('currency').default('$'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Transactions table linked to users
export const transactions = pgTable('transactions', {
  id: text('id').primaryKey(), // unique client/server id (e.g. tx-...)
  userId: text('user_id')
    .references(() => users.uid, { onDelete: 'cascade' })
    .notNull(),
  title: text('title').notNull(),
  amount: doublePrecision('amount').notNull(),
  type: text('type').notNull(), // 'expense' | 'income'
  category: text('category').notNull(),
  date: text('date').notNull(), // YYYY-MM-DD
  paymentMethod: text('payment_method').default('card'),
  notes: text('notes'),
  tags: jsonb('tags').$type<string[]>().default([]),
  isRecurring: boolean('is_recurring').default(false),
  recurringFrequency: text('recurring_frequency'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Budgets table
export const budgets = pgTable('budgets', {
  id: serial('id').primaryKey(),
  userId: text('user_id')
    .references(() => users.uid, { onDelete: 'cascade' })
    .notNull(),
  categoryId: text('category_id').notNull(), // 'overall' or category identifier
  limitAmount: doublePrecision('limit_amount').notNull(),
  period: text('period').default('monthly'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Recurring subscriptions table
export const subscriptions = pgTable('subscriptions', {
  id: text('id').primaryKey(), // sub-...
  userId: text('user_id')
    .references(() => users.uid, { onDelete: 'cascade' })
    .notNull(),
  name: text('name').notNull(),
  amount: doublePrecision('amount').notNull(),
  category: text('category').notNull(),
  billingCycle: text('billing_cycle').default('monthly'), // 'monthly' | 'yearly'
  nextBillingDate: text('next_billing_date').notNull(), // YYYY-MM-DD
  paymentMethod: text('payment_method').default('card'),
  active: boolean('active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  transactions: many(transactions),
  budgets: many(budgets),
  subscriptions: many(subscriptions),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.uid],
  }),
}));

export const budgetsRelations = relations(budgets, ({ one }) => ({
  user: one(users, {
    fields: [budgets.userId],
    references: [users.uid],
  }),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.uid],
  }),
}));
