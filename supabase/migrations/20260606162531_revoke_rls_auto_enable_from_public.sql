-- rls_auto_enable is called by the database event trigger engine, not API clients.
-- Revoke the PUBLIC grant so anon/authenticated cannot call it via /rpc/.
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC;
