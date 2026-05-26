/*
  # Add Executive Role Helper and User Management Support

  ## Summary
  This migration adds support for the executive role in RLS policies and enables
  admins to manage user roles through the application.

  ## Changes

  ### 1. New Helper Function: is_executive()
  - Creates a SECURITY DEFINER function that checks if the current user has the 'executive' role
  - Runs with owner permissions to bypass RLS (same pattern as is_admin())
  - Used in RLS policies to avoid recursive queries

  ### 2. New Helper Function: is_executive_or_admin()
  - Combines both executive and admin checks in one function
  - Used for document access policies

  ### 3. Updated Documents RLS
  - Drops old SELECT policy for documents
  - Adds new SELECT policy using the helper function
  - Ensures executives can see 'executive' level documents
  - Ensures staff can only see 'all' level documents

  ### 4. Admin User Management Policy
  - Adds a DELETE policy on user_profiles so admins can remove users
  - Admins can already insert/update profiles via existing policies

  ## Security Notes
  - SECURITY DEFINER functions prevent recursive RLS queries
  - All policies still require authentication
  - Executives can read but not modify executive documents unless admin
*/

-- Create is_executive() helper function
CREATE OR REPLACE FUNCTION is_executive()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role = 'executive'
  )
$$;

-- Create is_executive_or_admin() helper function  
CREATE OR REPLACE FUNCTION is_executive_or_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role IN ('executive', 'admin')
  )
$$;

-- Drop old documents SELECT policy and replace with updated one
DROP POLICY IF EXISTS "Authenticated users can view accessible documents" ON documents;
DROP POLICY IF EXISTS "Users can view documents based on security level" ON documents;

CREATE POLICY "Users can view documents based on security level"
  ON documents
  FOR SELECT
  TO authenticated
  USING (
    security_level = 'all' OR is_executive_or_admin()
  );

-- Add admin delete policy on user_profiles (for user removal)
DROP POLICY IF EXISTS "Admins can delete any profile" ON user_profiles;

CREATE POLICY "Admins can delete any profile"
  ON user_profiles
  FOR DELETE
  TO authenticated
  USING (is_admin() AND auth.uid() != id);
