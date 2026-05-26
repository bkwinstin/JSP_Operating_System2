/*
  # Fix edge custom paths and v_midpoints after swimlane y-shift

  All lanes shifted down by 110px. Update:
  - v_midpoint values (add 110)
  - custom_path SVG coordinates (update y values by +110)
*/

-- Update v_midpoints
UPDATE network_edges SET v_midpoint = v_midpoint + 110 WHERE v_midpoint IS NOT NULL;

-- Update custom paths: each hardcoded y value needs +110
-- Original paths referenced y coords like 205, 212, 177, 289, etc.
UPDATE network_edges SET custom_path =
  CASE from_node_key
    WHEN 'p10' THEN
      CASE to_node_key
        WHEN 'ic1' THEN 'M1038,322 C1038,359 460,359 460,392'
        WHEN 'ic3' THEN NULL -- uses v_midpoint, no custom path
        ELSE custom_path
      END
    WHEN 'p13' THEN
      CASE to_node_key
        WHEN 'ic1' THEN 'M1336,315 C1336,354 460,354 460,392'
        WHEN 'ec3' THEN 'M1336,315 C1336,484 1070,484 1070,510'
        ELSE custom_path
      END
    WHEN 'p4' THEN
      CASE to_node_key
        WHEN 'ic2' THEN 'M430,315 C430,363 694,363 694,399'
        WHEN 'ic4' THEN 'M430,315 C430,357 1241,357 1241,399'
        ELSE custom_path
      END
    WHEN 'p7' THEN custom_path -- uses v_midpoint
    WHEN 'p11' THEN
      CASE to_node_key
        WHEN 'ic2' THEN 'M1140,315 C1140,359 694,359 694,399'
        WHEN 'ic4' THEN 'M1140,315 C1140,360 1241,360 1241,399'
        WHEN 'ec1' THEN 'M1140,315 C1140,480 882,480 882,510'
        WHEN 'ec2' THEN 'M1140,315 C1140,482 977,482 977,510'
        WHEN 'ec3' THEN 'M1140,315 C1140,484 1070,484 1070,510'
        ELSE custom_path
      END
    WHEN 'p4' THEN
      CASE to_node_key
        WHEN 'ic4' THEN 'M430,315 C430,357 1241,357 1241,399'
        ELSE custom_path
      END
    WHEN 'ec1' THEN
      CASE to_node_key
        WHEN 'p12' THEN 'M882,510 C882,362 1243,362 1243,322'
        WHEN 'p13' THEN 'M882,510 C882,364 1336,364 1336,315'
        WHEN 'e8'  THEN 'M882,510 C882,130 762,130 762,195'
        ELSE custom_path
      END
    WHEN 'ec2' THEN
      CASE to_node_key
        WHEN 'p12' THEN 'M977,510 C977,362 1243,362 1243,322'
        WHEN 'e8'  THEN 'M977,510 C977,130 762,130 762,195'
        ELSE custom_path
      END
    WHEN 'ec3' THEN
      CASE to_node_key
        WHEN 'p2'  THEN 'M1070,510 C1070,243 214,243 214,287'
        WHEN 'p6'  THEN 'M1070,510 C1070,243 630,243 630,287'
        WHEN 'p9'  THEN 'M1070,510 C1070,363 936,363 936,315'
        WHEN 'p11' THEN 'M1070,510 C1070,365 1140,365 1140,315'
        WHEN 'ic3' THEN 'M1070,510 C1070,483 1022,483 1022,427'
        WHEN 'ic4' THEN 'M1070,510 C1070,483 1241,483 1241,427'
        ELSE custom_path
      END
    ELSE custom_path
  END
WHERE custom_path IS NOT NULL;
