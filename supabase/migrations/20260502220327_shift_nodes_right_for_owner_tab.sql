/*
  # Shift all network nodes right by 36px

  Moves every node's x position +36 to clear the 26px owner tab
  inside each swimlane's left edge, eliminating overlap with labels/names.
*/
UPDATE network_nodes SET x = x + 36;