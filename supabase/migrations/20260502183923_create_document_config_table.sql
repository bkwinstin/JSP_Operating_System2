/*
  # Create document_config table

  Stores admin-configurable dropdown lists used in the Document Library:
  - function_areas: the function area filter/tags (e.g. "Staff Dev", "Operations")
  - doc_types: the document type selector (e.g. "Policy", "SOP", "Reference")
  - access_levels: the access level options (e.g. "All Staff", "Executive Only")

  Each row has a `config_key` (unique name) and a `items` JSONB array of
  { value: string, label: string, color?: string, light?: string } objects.

  1. New Tables
    - `document_config`
      - `id` (uuid, primary key)
      - `config_key` (text, unique) — e.g. "function_areas", "doc_types", "access_levels"
      - `items` (jsonb) — array of option objects
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - All authenticated users can SELECT (needed to populate dropdowns)
    - Only admins can INSERT, UPDATE, DELETE (via is_admin() function)

  3. Seeds default values matching the current hardcoded lists
*/

CREATE TABLE IF NOT EXISTS document_config (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key text UNIQUE NOT NULL,
  items      jsonb NOT NULL DEFAULT '[]',
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE document_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read document config"
  ON document_config FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert document config"
  ON document_config FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update document config"
  ON document_config FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete document config"
  ON document_config FOR DELETE
  TO authenticated
  USING (is_admin());

-- Seed default function areas
INSERT INTO document_config (config_key, items) VALUES
  ('function_areas', '[
    {"value": "staff-development",  "label": "Staff Dev",   "color": "#90226C", "light": "#F0D9E8"},
    {"value": "operations",         "label": "Operations",  "color": "#1F1D1C", "light": "#ECEAE5"},
    {"value": "project-delivery",   "label": "Delivery",    "color": "#F3755E", "light": "#FDE8E2"},
    {"value": "funder-development", "label": "Funder Dev",  "color": "#FABE3D", "light": "#FEF3CC"},
    {"value": "communications",     "label": "Comms",       "color": "#6A453A", "light": "#EDE0DC"}
  ]')
ON CONFLICT (config_key) DO NOTHING;

-- Seed default document types
INSERT INTO document_config (config_key, items) VALUES
  ('doc_types', '[
    {"value": "Reference",  "label": "Reference"},
    {"value": "Policy",     "label": "Policy"},
    {"value": "SOP",        "label": "SOP"},
    {"value": "Framework",  "label": "Framework"},
    {"value": "Strategy",   "label": "Strategy"},
    {"value": "Data",       "label": "Data"},
    {"value": "Document",   "label": "Document"}
  ]')
ON CONFLICT (config_key) DO NOTHING;

-- Seed default access levels
INSERT INTO document_config (config_key, items) VALUES
  ('access_levels', '[
    {"value": "all",       "label": "All Staff"},
    {"value": "executive", "label": "Executive Only"}
  ]')
ON CONFLICT (config_key) DO NOTHING;
