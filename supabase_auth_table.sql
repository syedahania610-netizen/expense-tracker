-- ==============================================================================
-- Supabase / PostgreSQL Dedicated Auth Tables & Credentials Script
-- (Excludes `users` table as it already exists in your database)
-- ==============================================================================

-- 1. Create Dedicated Authentication Accounts Table (Email/Password, Google OAuth, Tokens)
CREATE TABLE IF NOT EXISTS public.auth_accounts (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'google', -- 'google', 'email', 'github'
  provider_account_id TEXT, -- Google sub / ID
  email TEXT NOT NULL,
  password_hash TEXT, -- For email/password authentication (bcrypt/argon2)
  salt TEXT,
  email_verified BOOLEAN DEFAULT FALSE,
  verification_token TEXT,
  reset_password_token TEXT,
  reset_password_expires TIMESTAMPTZ,
  last_sign_in_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_provider UNIQUE (user_id, provider)
);

-- 2. Create User Sessions & Refresh Tokens Table
CREATE TABLE IF NOT EXISTS public.auth_sessions (
  id TEXT PRIMARY KEY, -- Session ID or UUID
  user_id TEXT NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE, -- JWT or Refresh Token
  ip_address TEXT,
  user_agent TEXT,
  is_valid BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Performance Indexes for Fast Lookups
CREATE INDEX IF NOT EXISTS idx_auth_accounts_user_id ON public.auth_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_accounts_email ON public.auth_accounts(email);
CREATE INDEX IF NOT EXISTS idx_auth_accounts_provider ON public.auth_accounts(provider, provider_account_id);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_user_id ON public.auth_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_token ON public.auth_sessions(token);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.auth_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auth_sessions ENABLE ROW LEVEL SECURITY;

-- 5. Drop existing policies to prevent 42710 duplicate policy errors
DROP POLICY IF EXISTS "Allow anon and auth all on auth_accounts" ON public.auth_accounts;
DROP POLICY IF EXISTS "Allow anon and auth all on auth_sessions" ON public.auth_sessions;

-- 6. Create Access Policies
CREATE POLICY "Allow anon and auth all on auth_accounts" ON public.auth_accounts FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon and auth all on auth_sessions" ON public.auth_sessions FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
