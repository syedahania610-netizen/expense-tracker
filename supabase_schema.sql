-- ==============================================================================
-- Supabase / PostgreSQL Comprehensive Schema for Expense Tracker App
-- Safe to re-run multiple times (Idempotent)
-- ==============================================================================

-- 1. Core Users Table (Google OAuth, Supabase Auth, Profile & Currency)
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

-- 2. User Credentials Table (Optional: For native Email/Password Auth)
CREATE TABLE IF NOT EXISTS public.user_credentials (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE UNIQUE,
  password_hash TEXT NOT NULL,
  salt TEXT,
  reset_token TEXT,
  reset_token_expires TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PostgreSQL Session Table (For persistent Express/Passport sessions)
CREATE TABLE IF NOT EXISTS public.session (
  sid VARCHAR NOT NULL COLLATE "default" PRIMARY KEY,
  sess JSON NOT NULL,
  expire TIMESTAMP(6) NOT NULL
);
CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON public.session ("expire");

-- 4. Transactions Table
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

-- 5. Budgets Table
CREATE TABLE IF NOT EXISTS public.budgets (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
  category_id TEXT NOT NULL, -- 'overall' or category identifier (e.g. 'food', 'housing')
  limit_amount DOUBLE PRECISION NOT NULL,
  period TEXT DEFAULT 'monthly',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_category UNIQUE (user_id, category_id)
);

-- 6. Recurring Subscriptions Table
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

-- 7. Savings Goals Table (Future Feature)
CREATE TABLE IF NOT EXISTS public.savings_goals (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
  name TEXT NOT NULL,
  target_amount DOUBLE PRECISION NOT NULL,
  current_amount DOUBLE PRECISION DEFAULT 0,
  target_date TEXT,
  color TEXT DEFAULT '#10b981',
  icon TEXT DEFAULT 'target',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Custom Categories Table (Future Feature)
CREATE TABLE IF NOT EXISTS public.custom_categories (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'tag',
  color TEXT NOT NULL DEFAULT '#6366f1',
  type TEXT NOT NULL DEFAULT 'expense', -- 'expense' | 'income' | 'both'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON public.budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_savings_goals_user_id ON public.savings_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_categories_user_id ON public.custom_categories(user_id);

-- 10. Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_categories ENABLE ROW LEVEL SECURITY;

-- 11. Drop existing policies to prevent duplicate errors
DROP POLICY IF EXISTS "Allow anon and auth all on users" ON public.users;
DROP POLICY IF EXISTS "Allow anon and auth all on user_credentials" ON public.user_credentials;
DROP POLICY IF EXISTS "Allow anon and auth all on transactions" ON public.transactions;
DROP POLICY IF EXISTS "Allow anon and auth all on budgets" ON public.budgets;
DROP POLICY IF EXISTS "Allow anon and auth all on subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Allow anon and auth all on savings_goals" ON public.savings_goals;
DROP POLICY IF EXISTS "Allow anon and auth all on custom_categories" ON public.custom_categories;

-- 12. Create Permissive Client/Server Access Policies
CREATE POLICY "Allow anon and auth all on users" ON public.users FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon and auth all on user_credentials" ON public.user_credentials FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon and auth all on transactions" ON public.transactions FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon and auth all on budgets" ON public.budgets FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon and auth all on subscriptions" ON public.subscriptions FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon and auth all on savings_goals" ON public.savings_goals FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon and auth all on custom_categories" ON public.custom_categories FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 13. Supabase Auth Automatic Sync Trigger (Syncs auth.users -> public.users automatically)
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (uid, email, display_name, photo_url, currency)
  VALUES (
    NEW.id::text,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'User'),
    NEW.raw_user_meta_data->>'avatar_url',
    '$'
  )
  ON CONFLICT (uid) DO UPDATE
  SET
    email = EXCLUDED.email,
    display_name = COALESCE(EXCLUDED.display_name, public.users.display_name),
    photo_url = COALESCE(EXCLUDED.photo_url, public.users.photo_url),
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();
