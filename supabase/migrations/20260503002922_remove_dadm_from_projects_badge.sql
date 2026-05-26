/*
  # Remove "Director of Admin" from Projects swimlane badge
  Changes badge from "DII + Director of Admin" to just "DII".
*/
UPDATE network_swimlanes SET badge = 'DII' WHERE id = '11111111-0001-0001-0001-000000000002';
