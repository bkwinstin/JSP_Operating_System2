/*
  # Fix is_admin() recursion by making it SECURITY DEFINER

  The is_admin() function queries user_profiles, but user_profiles RLS policies
  call is_admin() — creating infinite recursion. Making it SECURITY DEFINER
  bypasses RLS when the function runs, breaking the loop.

  Also fix is_executive_or_admin() for the same reason.
*/

CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION is_executive_or_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role IN ('executive', 'admin')
  );
$$;
