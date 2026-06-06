-- ── 1. Fix mutable search_path on delete_expired_otp_pins ─────────────────
-- Adding SET search_path = public prevents search_path injection attacks
-- where a malicious role could shadow pg_catalog or public functions.
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

-- ── 2. Fix anonymous access on otp_pins policies ───────────────────────────
-- The existing policies used no TO clause, which resolved to {public} —
-- meaning they applied to every role including anon. Re-create them with
-- explicit TO anon, authenticated so the advisor sees intentional denial.
DROP POLICY IF EXISTS "otp_pins_no_select" ON public.otp_pins;
DROP POLICY IF EXISTS "otp_pins_no_insert" ON public.otp_pins;
DROP POLICY IF EXISTS "otp_pins_no_update" ON public.otp_pins;
DROP POLICY IF EXISTS "otp_pins_no_delete" ON public.otp_pins;

CREATE POLICY "otp_pins_no_select" ON public.otp_pins
  FOR SELECT TO anon, authenticated USING (false);

CREATE POLICY "otp_pins_no_insert" ON public.otp_pins
  FOR INSERT TO anon, authenticated WITH CHECK (false);

CREATE POLICY "otp_pins_no_update" ON public.otp_pins
  FOR UPDATE TO anon, authenticated USING (false) WITH CHECK (false);

CREATE POLICY "otp_pins_no_delete" ON public.otp_pins
  FOR DELETE TO anon, authenticated USING (false);
