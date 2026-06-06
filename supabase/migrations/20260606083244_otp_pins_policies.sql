-- Block all direct access via anon/authenticated keys (service-role only)
CREATE POLICY "otp_pins_no_select" ON otp_pins FOR SELECT USING (false);
CREATE POLICY "otp_pins_no_insert" ON otp_pins FOR INSERT WITH CHECK (false);
CREATE POLICY "otp_pins_no_update" ON otp_pins FOR UPDATE USING (false);
CREATE POLICY "otp_pins_no_delete" ON otp_pins FOR DELETE USING (false);

-- Fix cleanup trigger: delete rows as soon as they expire (not 1h after)
CREATE OR REPLACE FUNCTION delete_expired_otp_pins() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  DELETE FROM otp_pins WHERE expires_at < now();
  RETURN NEW;
END;
$$;
