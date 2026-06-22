-- Migration: 002_secure_mods_rls.sql
-- Goal: Secure the mods table with Row Level Security (RLS) and secure the download counter function.

-- 1. Enable Row Level Security on the 'mods' table
ALTER TABLE public.mods ENABLE ROW LEVEL SECURITY;

-- 2. Create interactive policies for select queries
-- Allow any user (both anonymous visitors and authenticated users) to view approved or default (status IS NULL) mods.
-- Unapproved, pending, or rejected mods remain completely invisible to regular select queries.
DROP POLICY IF EXISTS "Allow public read-only of approved mods" ON public.mods;
CREATE POLICY "Allow public read-only of approved mods" ON public.mods
  FOR SELECT
  TO public
  USING (status = 'approved' OR status IS NULL);

-- Note: Because Row Level Security is enabled and no policies exist for INSERT, UPDATE, or DELETE
-- for standard roles, any such attempt by 'anon' or 'authenticated' keys will be denied by default.
-- All mod creation, updates, and deletions are proxied securely through our backend server
-- using the Supabase "service_role" client, which inherently bypasses Row Level Security.
-- This ensures total backend control over administrative actions.

-- 3. Redefine download count incrementation function securely
-- - Restrict incrementation to mods that are approved or have NULL status.
-- - Apply "SECURITY DEFINER" to allow safe table modifications under a controlled schema search path.
-- - Set "search_path = public" to secure execution against search_path hijack attacks.
CREATE OR REPLACE FUNCTION public.increment_downloads(mod_id INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_count INTEGER;
BEGIN
  -- We only update and count standard approved mods (status is 'approved' or NULL)
  UPDATE public.mods
  SET downloads_count = COALESCE(downloads_count, 0) + 1
  WHERE id = mod_id
    AND (status = 'approved' OR status IS NULL)
  RETURNING downloads_count INTO new_count;
  
  RETURN COALESCE(new_count, 0);
END;
$$;

-- Revoke execution privileges from public, anon, and authenticated roles for safety.
-- Only the backend server using the Supabase "service_role" should have permission to call this.
REVOKE ALL ON FUNCTION public.increment_downloads(INTEGER) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_downloads(INTEGER) TO service_role;

-- Document safe policies configuration
COMMENT ON TABLE public.mods IS 'Table of vehicle modifications secured via RLS policies.';
COMMENT ON FUNCTION public.increment_downloads(INTEGER) IS 'Secure atomic counter increments restricted to verified approved mods.';
