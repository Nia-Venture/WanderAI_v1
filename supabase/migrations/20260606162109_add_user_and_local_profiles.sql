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
