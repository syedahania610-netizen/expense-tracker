import { getSupabase } from '../lib/supabase';
import { Transaction, Budget, RecurringSubscription } from '../types';

export const supabaseDb = {
  // Sync user profile to Supabase Postgres
  async syncUser(user: { uid: string; email: string; displayName?: string | null; photoURL?: string | null; currency?: string }) {
    const supabase = getSupabase();
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from('users')
        .upsert(
          {
            uid: user.uid,
            email: user.email,
            display_name: user.displayName || null,
            photo_url: user.photoURL || null,
            currency: user.currency || '$',
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'uid' }
        )
        .select()
        .single();

      if (error) {
        console.warn('Supabase syncUser warning:', error.message);
      }
      return data;
    } catch (err) {
      console.warn('Supabase user sync skipped:', err);
      return null;
    }
  },

  // Fetch transactions for user
  async getTransactions(userId: string): Promise<Transaction[] | null> {
    const supabase = getSupabase();
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error) {
        console.warn('Supabase getTransactions warning:', error.message);
        return null;
      }

      if (!data) return [];

      return data.map((r: any) => ({
        id: r.id,
        title: r.title,
        amount: Number(r.amount),
        type: r.type,
        category: r.category,
        date: r.date,
        paymentMethod: r.payment_method || 'card',
        notes: r.notes || undefined,
        tags: Array.isArray(r.tags) ? r.tags : [],
        isRecurring: Boolean(r.is_recurring),
        recurringFrequency: r.recurring_frequency || undefined,
        createdAt: r.created_at ? new Date(r.created_at).getTime() : Date.now(),
      }));
    } catch (err) {
      console.warn('Supabase getTransactions error:', err);
      return null;
    }
  },

  // Save / Update transaction
  async upsertTransaction(userId: string, tx: Transaction) {
    const supabase = getSupabase();
    if (!supabase) return;

    try {
      const { error } = await supabase
        .from('transactions')
        .upsert({
          id: tx.id,
          user_id: userId,
          title: tx.title,
          amount: tx.amount,
          type: tx.type,
          category: tx.category,
          date: tx.date,
          payment_method: tx.paymentMethod,
          notes: tx.notes || null,
          tags: tx.tags || [],
          is_recurring: tx.isRecurring || false,
          recurring_frequency: tx.recurringFrequency || null,
        }, { onConflict: 'id' });

      if (error) {
        console.warn('Supabase upsertTransaction warning:', error.message);
      }
    } catch (err) {
      console.warn('Supabase upsertTransaction error:', err);
    }
  },

  // Delete transaction
  async deleteTransaction(userId: string, txId: string) {
    const supabase = getSupabase();
    if (!supabase) return;

    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', txId)
        .eq('user_id', userId);

      if (error) {
        console.warn('Supabase deleteTransaction warning:', error.message);
      }
    } catch (err) {
      console.warn('Supabase deleteTransaction error:', err);
    }
  },

  // Bulk delete
  async bulkDeleteTransactions(userId: string, ids: string[]) {
    const supabase = getSupabase();
    if (!supabase || ids.length === 0) return;

    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .in('id', ids)
        .eq('user_id', userId);

      if (error) {
        console.warn('Supabase bulkDeleteTransactions warning:', error.message);
      }
    } catch (err) {
      console.warn('Supabase bulkDeleteTransactions error:', err);
    }
  },

  // Bulk import
  async bulkImportTransactions(userId: string, transactions: Transaction[]) {
    const supabase = getSupabase();
    if (!supabase || transactions.length === 0) return;

    try {
      const payload = transactions.map(tx => ({
        id: tx.id,
        user_id: userId,
        title: tx.title,
        amount: tx.amount,
        type: tx.type,
        category: tx.category,
        date: tx.date,
        payment_method: tx.paymentMethod,
        notes: tx.notes || null,
        tags: tx.tags || [],
        is_recurring: tx.isRecurring || false,
        recurring_frequency: tx.recurringFrequency || null,
      }));

      const { error } = await supabase
        .from('transactions')
        .upsert(payload, { onConflict: 'id' });

      if (error) {
        console.warn('Supabase bulkImportTransactions warning:', error.message);
      }
    } catch (err) {
      console.warn('Supabase bulkImportTransactions error:', err);
    }
  },

  // Budgets
  async getBudgets(userId: string): Promise<Budget[] | null> {
    const supabase = getSupabase();
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.warn('Supabase getBudgets warning:', error.message);
        return null;
      }

      if (!data) return [];

      return data.map((r: any) => ({
        categoryId: r.category_id,
        limit: Number(r.limit_amount),
        period: r.period || 'monthly',
      }));
    } catch (err) {
      console.warn('Supabase getBudgets error:', err);
      return null;
    }
  },

  async upsertBudget(userId: string, budget: Budget) {
    const supabase = getSupabase();
    if (!supabase) return;

    try {
      const { error } = await supabase
        .from('budgets')
        .upsert({
          user_id: userId,
          category_id: budget.categoryId || 'overall',
          limit_amount: budget.limit,
          period: budget.period || 'monthly',
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id,category_id' });

      if (error) {
        console.warn('Supabase upsertBudget warning:', error.message);
      }
    } catch (err) {
      console.warn('Supabase upsertBudget error:', err);
    }
  },

  // Subscriptions
  async getSubscriptions(userId: string): Promise<RecurringSubscription[] | null> {
    const supabase = getSupabase();
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.warn('Supabase getSubscriptions warning:', error.message);
        return null;
      }

      if (!data) return [];

      return data.map((r: any) => ({
        id: r.id,
        name: r.name,
        amount: Number(r.amount),
        category: r.category,
        billingCycle: r.billing_cycle || 'monthly',
        nextBillingDate: r.next_billing_date,
        paymentMethod: r.payment_method || 'card',
        active: Boolean(r.active),
      }));
    } catch (err) {
      console.warn('Supabase getSubscriptions error:', err);
      return null;
    }
  },

  async upsertSubscription(userId: string, sub: RecurringSubscription) {
    const supabase = getSupabase();
    if (!supabase) return;

    try {
      const { error } = await supabase
        .from('subscriptions')
        .upsert({
          id: sub.id,
          user_id: userId,
          name: sub.name,
          amount: sub.amount,
          category: sub.category,
          billing_cycle: sub.billingCycle,
          next_billing_date: sub.nextBillingDate,
          payment_method: sub.paymentMethod,
          active: sub.active,
        }, { onConflict: 'id' });

      if (error) {
        console.warn('Supabase upsertSubscription warning:', error.message);
      }
    } catch (err) {
      console.warn('Supabase upsertSubscription error:', err);
    }
  },

  async deleteSubscription(userId: string, subId: string) {
    const supabase = getSupabase();
    if (!supabase) return;

    try {
      const { error } = await supabase
        .from('subscriptions')
        .delete()
        .eq('id', subId)
        .eq('user_id', userId);

      if (error) {
        console.warn('Supabase deleteSubscription warning:', error.message);
      }
    } catch (err) {
      console.warn('Supabase deleteSubscription error:', err);
    }
  },
};
