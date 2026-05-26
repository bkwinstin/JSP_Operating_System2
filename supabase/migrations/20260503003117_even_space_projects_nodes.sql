/*
  # Evenly space Projects lane nodes

  Redistributes 13 project nodes with equal 4px gaps across the swimlane (x=112 to x=1394).
  Each node is vertically centered within the lane (center y=413).
*/

UPDATE network_nodes SET x = 112,  y = 399 WHERE node_key = 'p1';  -- w=74,  h=28, y=413-14=399
UPDATE network_nodes SET x = 190,  y = 399 WHERE node_key = 'p2';  -- w=112, h=28
UPDATE network_nodes SET x = 306,  y = 399 WHERE node_key = 'p3';  -- w=96,  h=28
UPDATE network_nodes SET x = 406,  y = 399 WHERE node_key = 'p4';  -- w=96,  h=28
UPDATE network_nodes SET x = 506,  y = 399 WHERE node_key = 'p5';  -- w=96,  h=28
UPDATE network_nodes SET x = 606,  y = 399 WHERE node_key = 'p6';  -- w=80,  h=28
UPDATE network_nodes SET x = 690,  y = 392 WHERE node_key = 'p7';  -- w=120, h=42, y=413-21=392
UPDATE network_nodes SET x = 814,  y = 399 WHERE node_key = 'p8';  -- w=82,  h=28
UPDATE network_nodes SET x = 900,  y = 399 WHERE node_key = 'p9';  -- w=80,  h=28
UPDATE network_nodes SET x = 984,  y = 392 WHERE node_key = 'p10'; -- w=108, h=42
UPDATE network_nodes SET x = 1096, y = 399 WHERE node_key = 'p11'; -- w=80,  h=28
UPDATE network_nodes SET x = 1180, y = 392 WHERE node_key = 'p12'; -- w=110, h=42
UPDATE network_nodes SET x = 1294, y = 399 WHERE node_key = 'p13'; -- w=100, h=28
