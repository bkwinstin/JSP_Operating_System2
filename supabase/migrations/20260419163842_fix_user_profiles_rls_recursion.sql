/*
  # Fix infinite recursion in user_profiles RLS policies

  ## Problem
  The "Admins can read all profiles" and "Admins can update any profile" policies
  both query the user_profiles table from within a user_profiles RLS policy,
  causing infinite recursion (error code 42P17).

  ## Fix
  1. Create a SECURITY DEFINER function `is_admin()` that checks the current
     user's role by bypassing RLS (security definer functions run as the
     function owner, not the caller, so RLS is not applied).
  2. Drop the recursive policies and recreate them using this function.
*/

-- Helper function that bypasses RLS to check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Drop the recursive policies
DROP POLICY IF EXISTS "Admins can read all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON user_profiles;

-- Recreate admin read policy using the safe helper function
CREATE POLICY "Admins can read all profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (is_admin());

-- Recreate admin update policy using the safe helper function
CREATE POLICY "Admins can update any profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());
