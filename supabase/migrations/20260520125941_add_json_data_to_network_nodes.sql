/*
  # Add json_data to network_nodes

  Adds an optional `json_data` (jsonb) column to `network_nodes`.
  When populated, the node drawer in NetworkMap will render the JSON
  as a formatted, readable viewer instead of (or alongside) linked documents.
  Nodes without json_data are unaffected.

  1. Changes
    - `network_nodes.json_data` (jsonb, nullable, default null)
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'network_nodes' AND column_name = 'json_data'
  ) THEN
    ALTER TABLE network_nodes ADD COLUMN json_data jsonb DEFAULT NULL;
  END IF;
END $$;
