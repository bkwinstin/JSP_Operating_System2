/*
  # Clean up orphaned edges and enforce cascade delete

  1. Cleanup
     - Deletes any existing network_edges rows where from_node_key or to_node_key
       no longer references a valid node_key in network_nodes.

  2. Cascade enforcement
     - Drops and recreates both foreign key constraints on network_edges
       with ON DELETE CASCADE to guarantee edges are removed whenever a
       referenced node is deleted.

  3. Utility function
     - Adds a helper function `cleanup_orphaned_edges()` that can be called
       manually to purge any orphaned edges at any time.
*/

-- Step 1: Remove any currently orphaned edges
DELETE FROM network_edges
WHERE from_node_key NOT IN (SELECT node_key FROM network_nodes)
   OR to_node_key NOT IN (SELECT node_key FROM network_nodes);

-- Step 2: Recreate FK constraints with ON DELETE CASCADE (drop first if they exist)
DO $$
BEGIN
  -- from_node_key cascade
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'network_edges' AND constraint_name = 'network_edges_from_node_key_fkey'
  ) THEN
    ALTER TABLE network_edges DROP CONSTRAINT network_edges_from_node_key_fkey;
  END IF;

  -- to_node_key cascade
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'network_edges' AND constraint_name = 'network_edges_to_node_key_fkey'
  ) THEN
    ALTER TABLE network_edges DROP CONSTRAINT network_edges_to_node_key_fkey;
  END IF;
END $$;

ALTER TABLE network_edges
  ADD CONSTRAINT network_edges_from_node_key_fkey
  FOREIGN KEY (from_node_key) REFERENCES network_nodes(node_key) ON DELETE CASCADE;

ALTER TABLE network_edges
  ADD CONSTRAINT network_edges_to_node_key_fkey
  FOREIGN KEY (to_node_key) REFERENCES network_nodes(node_key) ON DELETE CASCADE;

-- Step 3: Utility function for manual cleanup
CREATE OR REPLACE FUNCTION cleanup_orphaned_edges()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM network_edges
  WHERE from_node_key NOT IN (SELECT node_key FROM network_nodes)
     OR to_node_key NOT IN (SELECT node_key FROM network_nodes);
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;
