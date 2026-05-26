/*
  # Create Documents and Support Tables

  1. New Tables
    - `documents` - Document library with role-based access
    - `external_links` - Configurable HubSpot/Asana links per job
    - `content_overrides` - Audit trail for admin content edits

  2. Security
    - Enable RLS on all tables
    - Documents filtered by security_level and user role
    - Executive/Admin can see all documents
    - Staff can only see 'all' level documents
*/

-- documents table
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  function_area text NOT NULL DEFAULT '',
  doc_type text NOT NULL DEFAULT 'Reference' CHECK (doc_type IN ('Reference', 'Policy', 'SOP', 'Framework', 'Strategy', 'Data', 'Document')),
  security_level text NOT NULL DEFAULT 'all' CHECK (security_level IN ('all', 'executive')),
  storage_url text,
  file_name text,
  doc_date text NOT NULL DEFAULT '',
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can read all-level documents"
  ON documents FOR SELECT
  TO authenticated
  USING (
    security_level = 'all'
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('executive', 'admin')
    )
  );

CREATE POLICY "Admins can insert documents"
  ON documents FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can update documents"
  ON documents FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can delete documents"
  ON documents FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'));

-- external_links table
CREATE TABLE IF NOT EXISTS external_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id text REFERENCES jobs(id) ON DELETE CASCADE,
  key text NOT NULL DEFAULT '',
  label text NOT NULL DEFAULT '',
  url text NOT NULL DEFAULT '',
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

ALTER TABLE external_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read external_links"
  ON external_links FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can insert external_links"
  ON external_links FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can update external_links"
  ON external_links FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'));

-- content_overrides audit trail
CREATE TABLE IF NOT EXISTS content_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_key text NOT NULL,
  value text NOT NULL DEFAULT '',
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

ALTER TABLE content_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read content_overrides"
  ON content_overrides FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can insert content_overrides"
  ON content_overrides FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'));

-- chat_messages table for AI chat history
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own chat messages"
  ON chat_messages FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chat messages"
  ON chat_messages FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own chat messages"
  ON chat_messages FOR DELETE TO authenticated
  USING (auth.uid() = user_id);
