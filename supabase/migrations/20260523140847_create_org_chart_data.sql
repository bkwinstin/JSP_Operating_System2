/*
  # Create org_chart_data table

  Stores the roles and connections for the JSP Organizational Structure chart.
  A single row holds the full chart state as JSONB so the shape can evolve
  without schema changes, while still being RLS-protected.

  1. New Tables
    - `org_chart_data`
      - `id` (uuid, primary key)
      - `roles` (jsonb) — map of roleKey → { label, fullLabel, desc, color, textColor, r, x, y }
      - `connections` (jsonb) — array of { from, to, type, label? }
      - `footer_text` (text) — caption beneath the SVG
      - `updated_at` (timestamptz)
      - `updated_by` (uuid, FK to auth.users)

  2. Security
    - RLS enabled
    - All authenticated users can SELECT
    - Only admins (role in app_metadata) can INSERT/UPDATE
      (enforced via is_admin() helper that already exists)
*/

CREATE TABLE IF NOT EXISTS org_chart_data (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  roles        jsonb NOT NULL DEFAULT '{}',
  connections  jsonb NOT NULL DEFAULT '[]',
  footer_text  text NOT NULL DEFAULT '',
  updated_at   timestamptz DEFAULT now(),
  updated_by   uuid REFERENCES auth.users(id)
);

ALTER TABLE org_chart_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read org chart"
  ON org_chart_data FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert org chart"
  ON org_chart_data FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update org chart"
  ON org_chart_data FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Seed with the default data from the JSP_Org_Structure component
INSERT INTO org_chart_data (roles, connections, footer_text)
VALUES (
  '{
    "president":   { "x": 400, "y": 68,  "label": "President",     "fullLabel": null,                                    "color": "#0B0909", "textColor": "#ffffff", "r": 44, "desc": "Final administrative authority over all Directors and the organization" },
    "evp":         { "x": 400, "y": 180, "label": "EVP",           "fullLabel": null,                                    "color": "#E0944A", "textColor": "#0B0909", "r": 38, "desc": "Oversees day-to-day organizational operations; Directors work functionally with the EVP" },
    "dii":         { "x": 215, "y": 340, "label": "DII",           "fullLabel": "Director of\nImpact &\nInnovation",     "color": "#F3755E", "textColor": "#ffffff", "r": 48, "desc": "Administrative & functional oversight of program staff; resolves cross-project conflicts" },
    "dsic":        { "x": 585, "y": 260, "label": "DSIC",          "fullLabel": "Director of\nStaff Investment\n& Curiosity", "color": "#FABE3D", "textColor": "#0B0909", "r": 48, "desc": "Coaches all staff across the organization; owns EIP process and professional development" },
    "dis":         { "x": 585, "y": 440, "label": "DIS",           "fullLabel": "Director of\nInfluence &\nStorytelling","color": "#90226C", "textColor": "#ffffff", "r": 48, "desc": "Administrative & functional oversight of communications staff" },
    "dfa":         { "x": 215, "y": 500, "label": "DFA",           "fullLabel": "Director of\nFinance &\nAdministration","color": "#6A453A", "textColor": "#ffffff", "r": 48, "desc": "Administrative & functional oversight of admin team staff" },
    "projectLead": { "x": 400, "y": 510, "label": "Project\nLeads","fullLabel": null,                                    "color": "#5A2051", "textColor": "#ffffff", "r": 36, "desc": "Oversee work and day-to-day function within their project; handle project-level conflicts" }
  }',
  '[
    { "from": "president",   "to": "evp",         "type": "administrative" },
    { "from": "president",   "to": "dii",         "type": "administrative" },
    { "from": "president",   "to": "dsic",        "type": "administrative" },
    { "from": "president",   "to": "dis",         "type": "administrative" },
    { "from": "president",   "to": "dfa",         "type": "administrative" },
    { "from": "evp",         "to": "dii",         "type": "functional" },
    { "from": "evp",         "to": "dsic",        "type": "functional" },
    { "from": "evp",         "to": "dis",         "type": "functional" },
    { "from": "evp",         "to": "dfa",         "type": "functional" },
    { "from": "dsic",        "to": "dii",         "type": "coaching",        "label": "coaches staff" },
    { "from": "dsic",        "to": "dis",         "type": "coaching",        "label": "coaches staff" },
    { "from": "dsic",        "to": "dfa",         "type": "coaching",        "label": "coaches staff" },
    { "from": "dii",         "to": "projectLead", "type": "functional" },
    { "from": "projectLead", "to": "dii",         "type": "project",         "label": "escalates" }
  ]',
  'All staff ultimately work for the President and the Executive Vice President'
);
