-- Migration: 003_secure_downloads_permissions.sql
-- Goal: Strengthen increment_downloads permission rules by revoking execution from anon/authenticated roles.
-- This ensures only the backend utilizing the service_role key is authorized to increment downloads.

REVOKE EXECUTE ON FUNCTION public.increment_downloads(INTEGER) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_downloads(INTEGER) TO service_role;
