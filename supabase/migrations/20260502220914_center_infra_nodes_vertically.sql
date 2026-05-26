/*
  # Center Infrastructure nodes vertically within their swimlane

  Swimlane y=138, h=90 → center=183. Nodes h=42 → centered y=162.
  Moves all infra nodes from y=152 to y=162.
*/
UPDATE network_nodes
SET y = 162
WHERE swimlane_id = (SELECT id FROM network_swimlanes WHERE label = 'Infrastructure');