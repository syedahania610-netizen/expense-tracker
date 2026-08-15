import { getDb } from './index.ts';
import { transactions, budgets, subscriptions, users } from './schema.ts';
import { eq, desc, and } from 'drizzle-orm';
import { Transaction, Budget, RecurringSubscription } from '../types.ts';

// TRANSACTIONS
export async function getUserTransactions(userUid: string): Promise<Transaction[]> {
  const db = getDb();
  if (!db) return [];

  try {
    const rows = await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userUid))
      .orderBy(desc(transactions.date), desc(transactions.createdAt));

    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      amount: Number(r.amount),
      type: r.type as any,
      category: r.category as any,
      date: r.date,
      paymentMethod: (r.paymentMethod || 'card') as any,
      notes: r.notes || undefined,
      tags: Array.isArray(r.tags) ? r.tags : [],
      isRecurring: Boolean(r.isRecurring),
      recurringFrequency: (r.recurringFrequency as any) || undefined,
      createdAt: r.createdAt ? new Date(r.createdAt).getTime() : Date.now(),
    }));
  } catch (error) {
    console.error('Failed to query user transactions:', error);
    return [];
  }
}

export async function upsertUserTransaction(userUid: string, tx: Transaction): Promise<void> {
  const db = getDb();
  if (!db) return;

  try {
    const existing = await db.select().from(transactions).where(and(eq(transactions.id, tx.id), eq(transactions.userId, userUid))).limit(1);
    if (existing.length > 0) {
      await db.update(transactions)
        .set({
          title: tx.title,
          amount: tx.amount,
          type: tx.type,
          category: tx.category,
          date: tx.date,
          paymentMethod: tx.paymentMethod,
          notes: tx.notes || null,
          tags: tx.tags || [],
          isRecurring: tx.isRecurring || false,
          recurringFrequency: tx.recurringFrequency || null,
        })
        .where(and(eq(transactions.id, tx.id), eq(transactions.userId, userUid)));
    } else {
      await db.insert(transactions).values({
        id: tx.id,
        userId: userUid,
        title: tx.title,
        amount: tx.amount,
        type: tx.type,
        category: tx.category,
        date: tx.date,
        paymentMethod: tx.paymentMethod,
        notes: tx.notes || null,
        tags: tx.tags || [],
        isRecurring: tx.isRecurring || false,
        recurringFrequency: tx.recurringFrequency || null,
      });
    }
  } catch (error) {
    console.error('Failed to upsert transaction:', error);
  }
}

export async function deleteUserTransaction(userUid: string, txId: string): Promise<void> {
  const db = getDb();
  if (!db) return;

  try {
    await db.delete(transactions).where(and(eq(transactions.id, txId), eq(transactions.userId, userUid)));
  } catch (error) {
    console.error('Failed to delete transaction:', error);
  }
}

export async function bulkDeleteUserTransactions(userUid: string, txIds: string[]): Promise<void> {
  const db = getDb();
  if (!db) return;

  try {
    for (const id of txIds) {
      await db.delete(transactions).where(and(eq(transactions.id, id), eq(transactions.userId, userUid)));
    }
  } catch (error) {
    console.error('Failed to bulk delete transactions:', error);
  }
}

export async function bulkInsertTransactions(userUid: string, txList: Transaction[]): Promise<void> {
  const db = getDb();
  if (!db) return;

  try {
    for (const tx of txList) {
      await upsertUserTransaction(userUid, tx);
    }
  } catch (error) {
    console.error('Failed to bulk insert transactions:', error);
  }
}

// BUDGETS
export async function getUserBudgets(userUid: string): Promise<Budget[]> {
  const db = getDb();
  if (!db) return [];

  try {
    const rows = await db.select().from(budgets).where(eq(budgets.userId, userUid));
    return rows.map((r) => ({
      categoryId: (r.categoryId as any) || 'overall',
      limit: Number(r.limitAmount),
      period: 'monthly',
    }));
  } catch (error) {
    console.error('Failed to get budgets:', error);
    return [];
  }
}

export async function upsertUserBudget(userUid: string, budget: Budget): Promise<void> {
  const db = getDb();
  if (!db) return;

  try {
    const categoryKey = budget.categoryId || 'overall';
    const existing = await db
      .select()
      .from(budgets)
      .where(and(eq(budgets.userId, userUid), eq(budgets.categoryId, categoryKey)))
      .limit(1);

    if (existing.length > 0) {
      await db.update(budgets)
        .set({
          limitAmount: budget.limit,
          updatedAt: new Date(),
        })
        .where(and(eq(budgets.userId, userUid), eq(budgets.categoryId, categoryKey)));
    } else {
      await db.insert(budgets).values({
        userId: userUid,
        categoryId: categoryKey,
        limitAmount: budget.limit,
        period: budget.period || 'monthly',
      });
    }
  } catch (error) {
    console.error('Failed to update budget:', error);
  }
}

// SUBSCRIPTIONS
export async function getUserSubscriptions(userUid: string): Promise<RecurringSubscription[]> {
  const db = getDb();
  if (!db) return [];

  try {
    const rows = await db.select().from(subscriptions).where(eq(subscriptions.userId, userUid));
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      amount: Number(r.amount),
      category: r.category as any,
      billingCycle: (r.billingCycle || 'monthly') as any,
      nextBillingDate: r.nextBillingDate,
      paymentMethod: (r.paymentMethod || 'card') as any,
      active: Boolean(r.active),
    }));
  } catch (error) {
    console.error('Failed to get subscriptions:', error);
    return [];
  }
}

export async function upsertUserSubscription(userUid: string, sub: RecurringSubscription): Promise<void> {
  const db = getDb();
  if (!db) return;

  try {
    const existing = await db
      .select()
      .from(subscriptions)
      .where(and(eq(subscriptions.id, sub.id), eq(subscriptions.userId, userUid)))
      .limit(1);

    if (existing.length > 0) {
      await db.update(subscriptions)
        .set({
          name: sub.name,
          amount: sub.amount,
          category: sub.category,
          billingCycle: sub.billingCycle,
          nextBillingDate: sub.nextBillingDate,
          paymentMethod: sub.paymentMethod,
          active: sub.active,
        })
        .where(and(eq(subscriptions.id, sub.id), eq(subscriptions.userId, userUid)));
    } else {
      await db.insert(subscriptions).values({
        id: sub.id,
        userId: userUid,
        name: sub.name,
        amount: sub.amount,
        category: sub.category,
        billingCycle: sub.billingCycle,
        nextBillingDate: sub.nextBillingDate,
        paymentMethod: sub.paymentMethod,
        active: sub.active,
      });
    }
  } catch (error) {
    console.error('Failed to update subscription:', error);
  }
}

export async function deleteUserSubscription(userUid: string, subId: string): Promise<void> {
  const db = getDb();
  if (!db) return;

  try {
    await db.delete(subscriptions).where(and(eq(subscriptions.id, subId), eq(subscriptions.userId, userUid)));
  } catch (error) {
    console.error('Failed to delete subscription:', error);
  }
}

// USER SETTINGS
export async function updateUserCurrency(userUid: string, currency: string): Promise<void> {
  const db = getDb();
  if (!db) return;

  try {
    await db.update(users).set({ currency, updatedAt: new Date() }).where(eq(users.uid, userUid));
  } catch (error) {
    console.error('Failed to update currency:', error);
  }
}
