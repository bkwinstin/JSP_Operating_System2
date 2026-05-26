/*
  # Create Core JSP Operating System Content Tables

  1. New Tables
    - `jobs` - The four Jobs to Be Done
    - `job_why` - Why layer content
    - `job_how_principles` - How principles (5-6 per job)
    - `job_how_connection` - Connection text at bottom of How tile
    - `job_what_tools` - Tools and processes in What tile

  2. Security
    - Enable RLS on all tables
    - All authenticated users can read
    - Only admins can write
*/

CREATE TABLE IF NOT EXISTS jobs (
  id text PRIMARY KEY,
  name text NOT NULL,
  color text NOT NULL,
  light text NOT NULL,
  dark text NOT NULL,
  wheel_start integer NOT NULL,
  wheel_end integer NOT NULL,
  sort_order integer NOT NULL DEFAULT 0
);

ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read jobs"
  ON jobs FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can insert jobs"
  ON jobs FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can update jobs"
  ON jobs FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'));

-- job_why
CREATE TABLE IF NOT EXISTS job_why (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id text REFERENCES jobs(id) ON DELETE CASCADE,
  statement text NOT NULL DEFAULT '',
  body text NOT NULL DEFAULT '',
  anchor text NOT NULL DEFAULT '',
  values text[] NOT NULL DEFAULT '{}',
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

ALTER TABLE job_why ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read job_why"
  ON job_why FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can insert job_why"
  ON job_why FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can update job_why"
  ON job_why FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'));

-- job_how_principles
CREATE TABLE IF NOT EXISTS job_how_principles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id text REFERENCES jobs(id) ON DELETE CASCADE,
  sort_order integer NOT NULL DEFAULT 0,
  title text NOT NULL DEFAULT '',
  body text NOT NULL DEFAULT '',
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

ALTER TABLE job_how_principles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read job_how_principles"
  ON job_how_principles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can insert job_how_principles"
  ON job_how_principles FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can update job_how_principles"
  ON job_how_principles FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'));

-- job_how_connection
CREATE TABLE IF NOT EXISTS job_how_connection (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id text UNIQUE REFERENCES jobs(id) ON DELETE CASCADE,
  body text NOT NULL DEFAULT '',
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

ALTER TABLE job_how_connection ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read job_how_connection"
  ON job_how_connection FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can insert job_how_connection"
  ON job_how_connection FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can update job_how_connection"
  ON job_how_connection FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'));

-- job_what_tools
CREATE TABLE IF NOT EXISTS job_what_tools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id text REFERENCES jobs(id) ON DELETE CASCADE,
  sort_order integer NOT NULL DEFAULT 0,
  name text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  tag text NOT NULL DEFAULT '',
  system_name text NOT NULL DEFAULT ''
);

ALTER TABLE job_what_tools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read job_what_tools"
  ON job_what_tools FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can insert job_what_tools"
  ON job_what_tools FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can update job_what_tools"
  ON job_what_tools FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'));
