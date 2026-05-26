/*
  # Add JSP Administration Role

  ## Summary
  Adds a new `jsp_admin` role that sits between `executive` and `admin`.
  JSP Admins can see all executive-level content (swimlanes and documents)
  but cannot access the system admin panel or edit content.

  ## Changes

  ### 1. user_profiles
  - Expands the `role` CHECK constraint to allow 'jsp_admin'
  - Admins can now assign the new role via user management

  ### 2. documents
  - Adds 'jsp_admin' as a valid security_level option
  - Documents at this level are visible to jsp_admin, executive, and admin roles

  ### 3. network_swimlanes
  - Adds 'jsp_admin' as a valid min_role value
  - Swimlanes set to min_role='jsp_admin' are visible to jsp_admin, executive, and admin

  ## Security
  - No changes to existing RLS policy logic (policies use role comparisons in application layer)
  - The CHECK constraint update enforces valid role values at the DB level
*/

-- 1. Expand role check on user_profiles
ALTER TABLE user_profiles
  DROP CONSTRAINT IF EXISTS user_profiles_role_check;

ALTER TABLE user_profiles
  ADD CONSTRAINT user_profiles_role_check
  CHECK (role IN ('staff', 'executive', 'jsp_admin', 'admin'));

-- 2. Expand security_level check on documents
ALTER TABLE documents
  DROP CONSTRAINT IF EXISTS documents_security_level_check;

ALTER TABLE documents
  ADD CONSTRAINT documents_security_level_check
  CHECK (security_level IN ('all', 'jsp_admin', 'executive'));

-- 3. No constraint change needed for network_swimlanes.min_role (it's a free-form text field with no CHECK)
-- Verify by checking existing constraint (safe no-op if none exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'network_swimlanes'
    AND constraint_name = 'network_swimlanes_min_role_check'
  ) THEN
    ALTER TABLE network_swimlanes DROP CONSTRAINT network_swimlanes_min_role_check;
    ALTER TABLE network_swimlanes ADD CONSTRAINT network_swimlanes_min_role_check
      CHECK (min_role IN ('all', 'jsp_admin', 'executive'));
  END IF;
END $$;
