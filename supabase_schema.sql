-- ==============================================================================
-- Supabase / PostgreSQL Schema for Expense Tracker App
-- Run this entire script in Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)
-- ==============================================================================

-- 1. Create Users Table
CREATE TABLE IF NOT EXISTS public.users (
  id SERIAL PRIMARY KEY,
  uid TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  display_name TEXT,
  photo_url TEXT,
  currency TEXT DEFAULT '$',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Transactions Table
CREATE TABLE IF NOT EXISTS public.transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
  title TEXT NOT NULL,
  amount DOUBLE PRECISION NOT NULL,
  type TEXT NOT NULL, -- 'expense' | 'income'
  category TEXT NOT NULL,
  date TEXT NOT NULL, -- YYYY-MM-DD
  payment_method TEXT DEFAULT 'card',
  notes TEXT,
  tags JSONB DEFAULT '[]'::jsonb,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurring_frequency TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Budgets Table
CREATE TABLE IF NOT EXISTS public.budgets (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
  category_id TEXT NOT NULL, -- 'overall' or category identifier (e.g. 'food', 'housing')
  limit_amount DOUBLE PRECISION NOT NULL,
  period TEXT DEFAULT 'monthly',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_category UNIQUE (user_id, category_id)
);

-- 4. Create Subscriptions Table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount DOUBLE PRECISION NOT NULL,
  category TEXT NOT NULL,
  billing_cycle TEXT DEFAULT 'monthly', -- 'monthly' | 'yearly'
  next_billing_date TEXT NOT NULL, -- YYYY-MM-DD
  payment_method TEXT DEFAULT 'card',
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create Performance Indexes
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON public.budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);

-- 6. Enable Row Level Security (RLS) & Public / Anon Access Policies for direct Client Access
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow read/write access via Supabase anon key & authenticated roles
CREATE POLICY "Allow anon and auth all on users" ON public.users FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon and auth all on transactions" ON public.transactions FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon and auth all on budgets" ON public.budgets FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon and auth all on subscriptions" ON public.subscriptions FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
