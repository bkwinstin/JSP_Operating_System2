/*
  # Add why field to network_nodes

  1. Changes
    - `network_nodes`: new nullable text column `why`
      Stores the "Why" explanation for direct-document nodes, shown in the
      node side panel below the node identity card.

  2. Notes
    - Only surfaced in the UI for nodes in "Direct documents" mode (has_sub_nodes = false)
    - NULL means no why text has been authored yet
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'network_nodes' AND column_name = 'why'
  ) THEN
    ALTER TABLE network_nodes ADD COLUMN why text DEFAULT NULL;
  END IF;
END $$;
