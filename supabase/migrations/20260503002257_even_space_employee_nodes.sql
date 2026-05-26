/*
  # Evenly space Employee lane nodes

  Redistributes the 9 employee nodes with equal gaps across the swimlane width,
  and centers each node vertically within the lane (y=248, h=90, center=293).
*/

UPDATE network_nodes SET x = 112,  y = 279, w = 82  WHERE node_key = 'e1';
UPDATE network_nodes SET x = 247,  y = 279, w = 68  WHERE node_key = 'e2';
UPDATE network_nodes SET x = 368,  y = 279, w = 82  WHERE node_key = 'e3';
UPDATE network_nodes SET x = 503,  y = 272, w = 110 WHERE node_key = 'e5';
UPDATE network_nodes SET x = 666,  y = 279, w = 96  WHERE node_key = 'e6';
UPDATE network_nodes SET x = 815,  y = 279, w = 96  WHERE node_key = 'e7';
UPDATE network_nodes SET x = 964,  y = 279, w = 44  WHERE node_key = 'e8';
UPDATE network_nodes SET x = 1061, y = 257, w = 138 WHERE node_key = 'e9';
UPDATE network_nodes SET x = 1252, y = 272, w = 128 WHERE node_key = 'e10';
