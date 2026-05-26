/*
  # Drop foreign key constraints on network_edges node keys

  The field_catalyst virtual node is not stored in network_nodes, so the FK
  constraints on from_node_key and to_node_key must be removed to allow edges
  that reference it.
*/

ALTER TABLE network_edges DROP CONSTRAINT IF EXISTS network_edges_from_node_key_fkey;
ALTER TABLE network_edges DROP CONSTRAINT IF EXISTS network_edges_to_node_key_fkey;
