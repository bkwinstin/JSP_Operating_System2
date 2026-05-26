/*
  # Fix network node labels and executive lane position

  1. Replace literal \n strings in node labels with real newline characters
  2. Move Executive Team swimlane to the top (sort_order=0, y=28)
  3. Shift all other swimlanes and their nodes down by 110px to make room
  4. Shift exec nodes down to match new exec lane y position
*/

-- Fix literal \n in node labels (replace backslash-n with real newline)
UPDATE network_nodes SET label = replace(label, '\n', E'\n') WHERE label LIKE '%\n%';

-- Reposition Executive Team lane to the top
UPDATE network_swimlanes
SET sort_order = 0, y = 28
WHERE id = '11111111-0001-0001-0001-000000000006';

-- Shift exec nodes to y = 612 + 110 offset from old position... 
-- exec nodes were at y=612, new exec lane is at y=28, so shift them up by -584 + 28 = new y = old_y - 584
-- Old exec lane y=598, nodes at y=612 (14px padding). New lane y=28, so nodes should be at y=42.
UPDATE network_nodes
SET y = y - 570
WHERE swimlane_id = '11111111-0001-0001-0001-000000000006';

-- Shift all non-exec swimlanes down by 110px (to make room for exec at top)
UPDATE network_swimlanes
SET y = y + 110, sort_order = sort_order + 1
WHERE id != '11111111-0001-0001-0001-000000000006';

-- Shift nodes in those lanes down by 110px
UPDATE network_nodes
SET y = y + 110
WHERE swimlane_id != '11111111-0001-0001-0001-000000000006';
