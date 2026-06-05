/*
# Add User Profiles and Local Guide Profiles

## What This Does
Adds two tables to support the WanderAI authentication system — one for all
registered users (travellers and locals alike) and one for the extended local
guide profile data submitted during the local registration flow.

## New Tables

### 1. profiles
A 1-to-1 extension of Supabase's built-in auth.users table. Every registered
user (traveller or local guide) gets exactly one profile row.

Columns:
- `id` (uuid, PK) — mirrors auth.users.id exactly; links auth identity to profile data
- `name` (text, not null) — the user's display name as entered at registration
- `account_type` (text, not null) — 'traveller' for regular users, 'local' for guide applicants
- `created_at` (timestamptz) — when the profile was created

### 2. local_profiles
Extended profile data for users who have applied to become a WanderAI local guide.
Each row belongs to one profile with account_type = 'local'.

Columns:
- `id` (uuid, PK, generated) — internal record ID
- `user_id` (uuid, FK → profiles.id, not null) — the owning profile; also equals auth.uid()
- `city` (text, not null) — the city the guide lives in
- `years_local` (integer, not null) — number of years the applicant has lived there
- `languages` (text, not null) — languages they can help travellers in
- `bio` (text, not null) — their answer to "why should travellers trust you?"
- `verification_status` (text, not null, default 'pending') — one of: pending, verified, rejected
- `tagline` (text, nullable) — short display tagline shown on the local card
- `topics` (text[], nullable) — topic chips like #Payments, #Safety
- `created_at` (timestamptz)

## Security

### profiles RLS
- Enabled. Each authenticated user can SELECT/INSERT/UPDATE/DELETE only their own row
  (WHERE id = auth.uid()).

### local_profiles RLS
- Enabled. Each authenticated user can SELECT/INSERT/UPDATE/DELETE only their own row
  (WHERE user_id = auth.uid()).

## Important Notes
1. Email confirmation is OFF — users are signed in immediately after signUp().
2. The profile INSERT happens in app code right after signUp() returns, while the
   session is already active, so the RLS check (auth.uid() = id) passes.
3. local_profiles.user_id equals profiles.id which equals auth.uid() — so the
   ownership check propagates correctly through the FK chain.
*/

-- ─────────────────────────────────────────────
-- profiles
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id           uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name         text NOT NULL,
  account_type text NOT NULL DEFAULT 'traveller'
                 CHECK (account_type IN ('traveller', 'local')),
  created_at   timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile"   ON profiles;
DROP POLICY IF EXISTS "insert_own_profile"   ON profiles;
DROP POLICY IF EXISTS "update_own_profile"   ON profiles;
DROP POLICY IF EXISTS "delete_own_profile"   ON profiles;

CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "delete_own_profile" ON profiles FOR DELETE
  TO authenticated USING (auth.uid() = id);

-- ─────────────────────────────────────────────
-- local_profiles
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS local_profiles (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  city                text NOT NULL,
  years_local         integer NOT NULL CHECK (years_local >= 0),
  languages           text NOT NULL,
  bio                 text NOT NULL,
  verification_status text NOT NULL DEFAULT 'pending'
                        CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  tagline             text,
  topics              text[],
  created_at          timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_local_profiles_user_id ON local_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_local_profiles_city    ON local_profiles(city);

ALTER TABLE local_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_local_profile" ON local_profiles;
DROP POLICY IF EXISTS "insert_own_local_profile" ON local_profiles;
DROP POLICY IF EXISTS "update_own_local_profile" ON local_profiles;
DROP POLICY IF EXISTS "delete_own_local_profile" ON local_profiles;

CREATE POLICY "select_own_local_profile" ON local_profiles FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "insert_own_local_profile" ON local_profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update_own_local_profile" ON local_profiles FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "delete_own_local_profile" ON local_profiles FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
