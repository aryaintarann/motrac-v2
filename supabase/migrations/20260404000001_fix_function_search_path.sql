-- SECURITY FIX: Set immutable search_path for all functions
-- This prevents search_path injection attacks
-- Reference: https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable

-- Fix delete_my_account function
CREATE OR REPLACE FUNCTION public.delete_my_account()
RETURNS void AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Delete the authenticated user from the auth.users table
  -- Because auth.users delete will cascade to public tables via foreign key definitions
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

-- Revoke from public, grant strictly to authenticated
REVOKE EXECUTE ON FUNCTION public.delete_my_account() FROM public;
GRANT EXECUTE ON FUNCTION public.delete_my_account() TO authenticated;


-- Fix update_notifications_updated_at function
CREATE OR REPLACE FUNCTION public.update_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Note: Trigger functions don't need explicit GRANT as they run in context of the trigger
