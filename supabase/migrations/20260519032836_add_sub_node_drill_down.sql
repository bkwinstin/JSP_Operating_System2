/*
  # Sub-node Drill-down Infrastructure

  ## Overview
  Enables a parent-child relationship between nodes and swimlanes so that a node
  can either:
  (A) Have documents attached directly (existing behavior), OR
  (B) Have a child swimlane whose sub-nodes carry the documents (new drill-down)

  ## Changes

  ### 1. network_nodes — new column `has_sub_nodes`
  A boolean flag. When true, clicking this node in the map expands its child
  swimlane instead of showing attached documents in the side panel.

  ### 2. network_swimlanes — new column `parent_node_key`
  When set, this swimlane is a child lane owned by the named node. It will be
  rendered indented directly below its parent node rather than in the main
  swimlane stack.

  ## Rendering contract (enforced in code, not DB)
  - A child swimlane's sort_order is ignored for the main vertical stack;
    it is always positioned immediately below its parent node.
  - The child swimlane's x and w are set by the admin but the map overrides y
    to track the parent node's bottom edge.
  - Nodes inside the child swimlane use the same reLayoutLane logic.
  - No new join tables needed — documents continue to attach via documents.node_key.
*/

ALTER TABLE network_nodes
  ADD COLUMN IF NOT EXISTS has_sub_nodes boolean NOT NULL DEFAULT false;

ALTER TABLE network_swimlanes
  ADD COLUMN IF NOT EXISTS parent_node_key text REFERENCES network_nodes(node_key) ON DELETE SET NULL;
