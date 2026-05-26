/*
  # Fix handle_new_user trigger to read role from metadata

  ## Problem
  When an admin creates a user via the edge function using the service role key,
  the subsequent UPDATE to set the role fails because RLS UPDATE policies require
  auth.uid() to resolve to an admin, but service role requests have auth.uid() = null.

  ## Fix
  Update the handle_new_user trigger to read the desired role from
  raw_user_meta_data->>'role' when provided, falling back to 'staff' for normal
  signups. The first-user-becomes-admin logic is preserved.

  ## Changes
  - Modified: handle_new_user() function — reads role from user metadata if present
*/

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_count integer;
  assigned_role text;
BEGIN
  SELECT COUNT(*) INTO user_count FROM user_profiles;

  IF user_count = 0 THEN
    assigned_role := 'admin';
  ELSE
    assigned_role := COALESCE(
      NULLIF(NEW.raw_user_meta_data->>'role', ''),
      'staff'
    );
  END IF;

  INSERT INTO user_profiles (id, email, role, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    assigned_role,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(COALESCE(NEW.email, ''), '@', 1))
  );

  RETURN NEW;
END;
$$;
