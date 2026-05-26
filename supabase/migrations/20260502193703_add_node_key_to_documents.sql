/*
  # Add node_key to documents

  Links a document directly to a specific network node so it appears in that
  node's hover panel on the Network Map. When null the document is only
  discoverable through the Document Library by function_area.

  1. Modified Tables
    - `documents`: new `node_key text` column (nullable, no FK — node keys are
      stored in network_nodes.node_key which is a plain text unique, not uuid)
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'documents' AND column_name = 'node_key'
  ) THEN
    ALTER TABLE documents ADD COLUMN node_key text;
  END IF;
END $$;
