-- Revoke direct REST API execution rights from rls_auto_enable.
-- It is an event trigger function called by the database engine itself,
-- not something that should be callable by API clients.
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM anon, authenticated;
