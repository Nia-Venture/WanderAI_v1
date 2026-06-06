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

CREATE OR REPLACE FUNCTION delete_expired_otp_pins() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  DELETE FROM otp_pins WHERE expires_at < now() - interval '1 hour';
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trigger_delete_expired_otp_pins
  AFTER INSERT ON otp_pins
  FOR EACH STATEMENT
  EXECUTE FUNCTION delete_expired_otp_pins();

ALTER TABLE otp_pins ENABLE ROW LEVEL SECURITY;
