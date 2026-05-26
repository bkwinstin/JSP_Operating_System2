/*
  # Add Board of Directors swimlane

  Inserts a new top-level swimlane for the Board of Directors above all existing
  swimlanes (sort_order = -1). Also adds an `is_collapsible` boolean column to
  network_swimlanes so that specific lanes can be toggled collapsed/expanded by
  users without affecting the layout permanently.

  1. Schema changes
    - `network_swimlanes.is_collapsible` (boolean, default false)

  2. New data
    - "Board of Directors" swimlane at sort_order = -1, visible to all staff,
      collapsible = true, using exec color theme
*/

-- Add is_collapsible column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'network_swimlanes' AND column_name = 'is_collapsible'
  ) THEN
    ALTER TABLE network_swimlanes ADD COLUMN is_collapsible boolean DEFAULT false;
  END IF;
END $$;

-- Insert Board of Directors swimlane
INSERT INTO network_swimlanes (
  label, badge, color_key, x, y, w, h, sort_order, min_role,
  why_title, why_content, how_title, how_content,
  parent_node_key, is_collapsible
)
SELECT
  'Board of Directors',
  'Board of Directors',
  'ic',
  68,
  28,
  1326,
  80,
  -1,
  'all',
  '',
  '',
  '',
  '',
  NULL,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM network_swimlanes WHERE label = 'Board of Directors' AND parent_node_key IS NULL
);
