/*
  # Create dynamic network map tables

  Replaces the hardcoded SVG data in NetworkMap.tsx with database-driven
  swimlanes, nodes, and edges so admins can add, edit, and connect elements.

  1. New Tables
    - `network_swimlanes` — horizontal lanes (Employees, Projects, etc.)
      - id, label, badge, color_key, x, y, w, h, sort_order
      - min_role: 'all' | 'executive' — controls visibility by role
    - `network_nodes` — individual boxes in the diagram
      - id, swimlane_id, node_key (stable identifier for edges), label,
        description, x, y, w, h, color_key, is_bubble, sort_order
    - `network_edges` — connections between nodes
      - id, from_node_key, to_node_key, is_cross (dashed), is_feedback,
        custom_path (SVG path override), v_midpoint

  2. Security
    - RLS enabled on all three tables
    - Authenticated users can SELECT all rows where swimlane min_role allows
    - Only admins can INSERT / UPDATE / DELETE

  3. Notes
    - color_key references CL map: 'emp', 'proj', 'ic', 'ec', 'bub', 'exec'
    - min_role on swimlane is enforced in the UI (not via RLS) since RLS
      would need to know the app role, which is in user_profiles not auth.jwt
*/

-- Swimlanes
CREATE TABLE IF NOT EXISTS network_swimlanes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label       text NOT NULL DEFAULT '',
  badge       text NOT NULL DEFAULT '',
  color_key   text NOT NULL DEFAULT 'emp',
  x           integer NOT NULL DEFAULT 68,
  y           integer NOT NULL DEFAULT 28,
  w           integer NOT NULL DEFAULT 1326,
  h           integer NOT NULL DEFAULT 90,
  sort_order  integer NOT NULL DEFAULT 0,
  min_role    text NOT NULL DEFAULT 'all', -- 'all' | 'executive'
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE network_swimlanes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read swimlanes"
  ON network_swimlanes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert swimlanes"
  ON network_swimlanes FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update swimlanes"
  ON network_swimlanes FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can delete swimlanes"
  ON network_swimlanes FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'));

-- Nodes
CREATE TABLE IF NOT EXISTS network_nodes (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  swimlane_id  uuid REFERENCES network_swimlanes(id) ON DELETE CASCADE,
  node_key     text UNIQUE NOT NULL,
  label        text NOT NULL DEFAULT '',
  description  text NOT NULL DEFAULT '',
  x            integer NOT NULL DEFAULT 100,
  y            integer NOT NULL DEFAULT 60,
  w            integer NOT NULL DEFAULT 80,
  h            integer NOT NULL DEFAULT 28,
  color_key    text NOT NULL DEFAULT 'emp',
  is_bubble    boolean NOT NULL DEFAULT false,
  sort_order   integer NOT NULL DEFAULT 0,
  created_at   timestamptz DEFAULT now()
);

ALTER TABLE network_nodes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read nodes"
  ON network_nodes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert nodes"
  ON network_nodes FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update nodes"
  ON network_nodes FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can delete nodes"
  ON network_nodes FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'));

-- Edges
CREATE TABLE IF NOT EXISTS network_edges (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_node_key   text NOT NULL REFERENCES network_nodes(node_key) ON DELETE CASCADE,
  to_node_key     text NOT NULL REFERENCES network_nodes(node_key) ON DELETE CASCADE,
  is_cross        boolean NOT NULL DEFAULT false,
  is_feedback     boolean NOT NULL DEFAULT false,
  is_upward       boolean NOT NULL DEFAULT false,
  v_midpoint      integer,
  custom_path     text,
  sort_order      integer NOT NULL DEFAULT 0,
  created_at      timestamptz DEFAULT now()
);

ALTER TABLE network_edges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read edges"
  ON network_edges FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert edges"
  ON network_edges FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update edges"
  ON network_edges FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can delete edges"
  ON network_edges FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'));
