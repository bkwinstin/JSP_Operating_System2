/*
  # Add Field Catalyst info and document linking

  1. New Tables
    - `catalyst_info`
      - `id` (uuid, primary key)
      - `why_title` (text) - section heading for Why content
      - `why_content` (text) - body text for Why section
      - `how_title` (text) - section heading for How content
      - `how_content` (text) - body text for How section
      - `created_at` / `updated_at` timestamps

  2. Modified Tables
    - `documents` — adds `catalyst_key` (text, nullable) so documents can be linked to the Field Catalyst entity

  3. Security
    - RLS enabled on `catalyst_info`
    - Authenticated users can read
    - Only admins can insert/update/delete (via is_admin())

  4. Seed
    - Insert one default row so there is always a catalyst_info record to edit
*/

-- Catalyst info table
CREATE TABLE IF NOT EXISTS catalyst_info (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  why_title text NOT NULL DEFAULT 'Why it matters',
  why_content text NOT NULL DEFAULT '',
  how_title text NOT NULL DEFAULT 'How it works',
  how_content text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE catalyst_info ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read catalyst info"
  ON catalyst_info FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert catalyst info"
  ON catalyst_info FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update catalyst info"
  ON catalyst_info FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete catalyst info"
  ON catalyst_info FOR DELETE
  TO authenticated
  USING (is_admin());

-- Insert default row
INSERT INTO catalyst_info (why_title, why_content, how_title, how_content)
SELECT 'Why it matters', '', 'How it works', ''
WHERE NOT EXISTS (SELECT 1 FROM catalyst_info);

-- Add catalyst_key to documents table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'documents' AND column_name = 'catalyst_key'
  ) THEN
    ALTER TABLE documents ADD COLUMN catalyst_key text DEFAULT NULL;
  END IF;
END $$;
