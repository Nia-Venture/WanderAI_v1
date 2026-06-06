CREATE TABLE IF NOT EXISTS city_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  city text NOT NULL,
  visited_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE city_visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own_city_visits" ON city_visits FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "insert_own_city_visits" ON city_visits FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update_own_city_visits" ON city_visits FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "delete_own_city_visits" ON city_visits FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
