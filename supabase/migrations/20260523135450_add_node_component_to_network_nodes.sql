/*
  # Add node_component column to network_nodes

  Allows a node to specify a named custom React component to render
  in its drawer panel instead of (or in addition to) the standard content.

  1. Schema changes
    - `network_nodes.node_component` (text, nullable) — component identifier string

  2. Data
    - Insert "Org Structure" node into the Executive Team swimlane
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'network_nodes' AND column_name = 'node_component'
  ) THEN
    ALTER TABLE network_nodes ADD COLUMN node_component text DEFAULT NULL;
  END IF;
END $$;

-- Insert Org Structure node in Executive Team swimlane (between Decision Making @ x=481 and Executive Meetings @ x=929)
INSERT INTO network_nodes (
  swimlane_id, node_key, label, x, y, w, h,
  color_key, is_bubble, sort_order, node_component
)
SELECT
  '11111111-0001-0001-0001-000000000006',
  'exec_org_structure',
  'Org' || chr(10) || 'Structure',
  705,
  45,
  78,
  46,
  'exec',
  false,
  50,
  'org_structure'
WHERE NOT EXISTS (
  SELECT 1 FROM network_nodes WHERE node_key = 'exec_org_structure'
);
