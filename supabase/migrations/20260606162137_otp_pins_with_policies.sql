CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS otp_pins (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email       text NOT NULL,
  pin_hash    text NOT NULL,
  expires_at  timestamptz NOT NULL,
  used        boolean NOT NULL DEFAULT false,
  created_at  timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_otp_pins_email ON otp_pins(email);

ALTER TABLE otp_pins ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.delete_expired_otp_pins()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY INVOKER
  SET search_path = public
AS $$
BEGIN
  DELETE FROM public.otp_pins WHERE expires_at < now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trigger_delete_expired_otp_pins
  AFTER INSERT ON otp_pins
  FOR EACH STATEMENT
  EXECUTE FUNCTION delete_expired_otp_pins();

DROP POLICY IF EXISTS "otp_pins_no_select" ON otp_pins;
DROP POLICY IF EXISTS "otp_pins_no_insert" ON otp_pins;
DROP POLICY IF EXISTS "otp_pins_no_update" ON otp_pins;
DROP POLICY IF EXISTS "otp_pins_no_delete" ON otp_pins;

CREATE POLICY "otp_pins_no_select" ON otp_pins
  FOR SELECT TO anon, authenticated USING (false);

CREATE POLICY "otp_pins_no_insert" ON otp_pins
  FOR INSERT TO anon, authenticated WITH CHECK (false);

CREATE POLICY "otp_pins_no_update" ON otp_pins
  FOR UPDATE TO anon, authenticated USING (false) WITH CHECK (false);

CREATE POLICY "otp_pins_no_delete" ON otp_pins
  FOR DELETE TO anon, authenticated USING (false);
