/*
  # Reorder Network: Infrastructure under Executive, rename lane, remove sequential edges

  Changes:
  1. Rename "JSP Infrastructure" → "Infrastructure"
  2. Move Infrastructure swimlane to sort_order=1, y=138 (directly under Executive Team at y=28)
  3. Shift Employees down to y=248, Projects to y=368, Internal Catalyst to y=488,
     External Catalyst to y=608 (all +110 from current)
  4. Shift all nodes in Employees, Projects, Internal Catalyst, External Catalyst +110 in y
  5. Infra nodes stay at y=612 but swimlane y moves to 138, so nodes need to go to y=152 (within infra lane)
  6. Delete the 7 sequential infra→infra edges (they are not linear connections)
  7. Update v_midpoints and custom paths on cross-lane edges to reflect new node y positions
*/

-- 1. Rename JSP Infrastructure → Infrastructure
UPDATE network_swimlanes
SET label = 'Infrastructure'
WHERE id = '11111111-0001-0001-0001-000000000005';

-- 2. Move Infrastructure swimlane up under Executive (y=138, sort_order=1)
UPDATE network_swimlanes
SET y = 138, sort_order = 1
WHERE id = '11111111-0001-0001-0001-000000000005';

-- 3. Shift other swimlanes down +110
-- Employees: y=138 → 248, sort_order=2 stays
UPDATE network_swimlanes SET y = 248 WHERE id = '11111111-0001-0001-0001-000000000001';
-- Projects: y=258 → 368
UPDATE network_swimlanes SET y = 368 WHERE id = '11111111-0001-0001-0001-000000000002';
-- Internal Catalyst: y=378 → 488
UPDATE network_swimlanes SET y = 488 WHERE id = '11111111-0001-0001-0001-000000000003';
-- External Catalyst: y=498 → 608
UPDATE network_swimlanes SET y = 608 WHERE id = '11111111-0001-0001-0001-000000000004';

-- 4. Move infra nodes into new infra lane position (y=152, centred in lane y=138 h=90)
UPDATE network_nodes SET y = 152
WHERE swimlane_id = '11111111-0001-0001-0001-000000000005'
  AND h = 42;

-- 5. Shift employee nodes +110
UPDATE network_nodes SET y = y + 110
WHERE swimlane_id = '11111111-0001-0001-0001-000000000001';

-- 6. Shift project nodes +110
UPDATE network_nodes SET y = y + 110
WHERE swimlane_id = '11111111-0001-0001-0001-000000000002';

-- 7. Shift internal catalyst nodes +110
UPDATE network_nodes SET y = y + 110
WHERE swimlane_id = '11111111-0001-0001-0001-000000000003';

-- 8. Shift external catalyst nodes +110
UPDATE network_nodes SET y = y + 110
WHERE swimlane_id = '11111111-0001-0001-0001-000000000004';

-- 9. Delete sequential infra→infra edges (not linear connections)
DELETE FROM network_edges WHERE from_node_key = 'infra1' AND to_node_key = 'infra2';
DELETE FROM network_edges WHERE from_node_key = 'infra2' AND to_node_key = 'infra3';
DELETE FROM network_edges WHERE from_node_key = 'infra3' AND to_node_key = 'infra4';
DELETE FROM network_edges WHERE from_node_key = 'infra4' AND to_node_key = 'infra5';
DELETE FROM network_edges WHERE from_node_key = 'infra5' AND to_node_key = 'infra6';
DELETE FROM network_edges WHERE from_node_key = 'infra6' AND to_node_key = 'infra7';
DELETE FROM network_edges WHERE from_node_key = 'infra7' AND to_node_key = 'infra8';

-- 10. Update cross-lane v_midpoints that bridged old positions
-- infra→ic1 (infra1→ic1): infra nodes now at y≈152-194, ic1 now at y≈502. v_midpoint was 570 → midway ≈ 370
UPDATE network_edges SET v_midpoint = 370 WHERE from_node_key = 'infra1' AND to_node_key = 'ic1';
-- infra2→e9: infra at ~173, e9 now at y=255. v_midpoint was 580 → midway ≈ 230
UPDATE network_edges SET v_midpoint = 230 WHERE from_node_key = 'infra2' AND to_node_key = 'e9';
-- infra6→ic2: infra at ~173, ic2 now at y≈509. v_midpoint was 572 → midway ≈ 375
UPDATE network_edges SET v_midpoint = 375 WHERE from_node_key = 'infra6' AND to_node_key = 'ic2';
-- infra7→ec2: infra at ~173, ec2 now at y≈620. v_midpoint was 580 → midway ≈ 400
UPDATE network_edges SET v_midpoint = 400 WHERE from_node_key = 'infra7' AND to_node_key = 'ec2';
-- infra7→ec1: infra at ~173, ec1 now at y≈620. v_midpoint was 578 → midway ≈ 400
UPDATE network_edges SET v_midpoint = 400 WHERE from_node_key = 'infra7' AND to_node_key = 'ec1';

-- 11. Update cross-lane v_midpoints that used old y for employee/project/ic/ec nodes (+110 offset)
-- e10→p9: v_midpoint was 243 → 353
UPDATE network_edges SET v_midpoint = 353 WHERE from_node_key = 'e10' AND to_node_key = 'p9';
-- e2→p1: v_midpoint was 243 → 353
UPDATE network_edges SET v_midpoint = 353 WHERE from_node_key = 'e2' AND to_node_key = 'p1';
-- e5→p3: v_midpoint was 243 → 353
UPDATE network_edges SET v_midpoint = 353 WHERE from_node_key = 'e5' AND to_node_key = 'p3';
-- e6→p3: v_midpoint was 247 → 357
UPDATE network_edges SET v_midpoint = 357 WHERE from_node_key = 'e6' AND to_node_key = 'p3';
-- e7→p3: v_midpoint was 251 → 361
UPDATE network_edges SET v_midpoint = 361 WHERE from_node_key = 'e7' AND to_node_key = 'p3';
-- e8→p7: v_midpoint was 243 → 353
UPDATE network_edges SET v_midpoint = 353 WHERE from_node_key = 'e8' AND to_node_key = 'p7';
-- e8→p8: v_midpoint was 247 → 357
UPDATE network_edges SET v_midpoint = 357 WHERE from_node_key = 'e8' AND to_node_key = 'p8';
-- p10→e9: v_midpoint was 243 → 353
UPDATE network_edges SET v_midpoint = 353 WHERE from_node_key = 'p10' AND to_node_key = 'e9';
-- p10→ic3: v_midpoint was 365 → 475
UPDATE network_edges SET v_midpoint = 475 WHERE from_node_key = 'p10' AND to_node_key = 'ic3';
-- p7→ic2: v_midpoint was 363 → 473
UPDATE network_edges SET v_midpoint = 473 WHERE from_node_key = 'p7' AND to_node_key = 'ic2';
-- p4→ic1: v_midpoint was 364 → 474
UPDATE network_edges SET v_midpoint = 474 WHERE from_node_key = 'p4' AND to_node_key = 'ic1';
-- p12→ic4: v_midpoint was 363 → 473
UPDATE network_edges SET v_midpoint = 473 WHERE from_node_key = 'p12' AND to_node_key = 'ic4';

-- 12. Update custom_path edges — all y-coords in employee/project/ic/ec paths need +110
-- ec1→p13: M882,510 → M882,620; 364→474; 1336,315→1336,425
UPDATE network_edges SET custom_path = 'M882,620 C882,474 1336,474 1336,425'
WHERE from_node_key = 'ec1' AND to_node_key = 'p13';

-- ec1→e8: M882,510 → M882,620; 130→240; 762,195→762,305
UPDATE network_edges SET custom_path = 'M882,620 C882,240 762,240 762,305'
WHERE from_node_key = 'ec1' AND to_node_key = 'e8';

-- ec1→p12: M882,510 → M882,620; 362→472; 1243,322→1243,432
UPDATE network_edges SET custom_path = 'M882,620 C882,472 1243,472 1243,432'
WHERE from_node_key = 'ec1' AND to_node_key = 'p12';

-- ec2→p12: M977,510 → M977,620; 362→472; 1243,322→1243,432
UPDATE network_edges SET custom_path = 'M977,620 C977,472 1243,472 1243,432'
WHERE from_node_key = 'ec2' AND to_node_key = 'p12';

-- ec2→e8: M977,510 → M977,620; 130→240; 762,195→762,305
UPDATE network_edges SET custom_path = 'M977,620 C977,240 762,240 762,305'
WHERE from_node_key = 'ec2' AND to_node_key = 'e8';

-- ec3→p2: M1070,510 → M1070,620; 243→353; 214,287→214,397
UPDATE network_edges SET custom_path = 'M1070,620 C1070,353 214,353 214,397'
WHERE from_node_key = 'ec3' AND to_node_key = 'p2';

-- ec3→p6: M1070,510 → M1070,620; 243→353; 630,287→630,397
UPDATE network_edges SET custom_path = 'M1070,620 C1070,353 630,353 630,397'
WHERE from_node_key = 'ec3' AND to_node_key = 'p6';

-- ec3→p9: M1070,510 → M1070,620; 363→473; 936,315→936,425
UPDATE network_edges SET custom_path = 'M1070,620 C1070,473 936,473 936,425'
WHERE from_node_key = 'ec3' AND to_node_key = 'p9';

-- ec3→p11: M1070,510 → M1070,620; 365→475; 1140,315→1140,425
UPDATE network_edges SET custom_path = 'M1070,620 C1070,475 1140,475 1140,425'
WHERE from_node_key = 'ec3' AND to_node_key = 'p11';

-- ec3→ic3: M1070,510 → M1070,620; 483→593; 1022,427→1022,537
UPDATE network_edges SET custom_path = 'M1070,620 C1070,593 1022,593 1022,537'
WHERE from_node_key = 'ec3' AND to_node_key = 'ic3';

-- ec3→ic4: M1070,510 → M1070,620; 483→593; 1241,427→1241,537
UPDATE network_edges SET custom_path = 'M1070,620 C1070,593 1241,593 1241,537'
WHERE from_node_key = 'ec3' AND to_node_key = 'ic4';

-- p10→ic1: M1038,322 → M1038,432; 359→469; 460,392→460,502
UPDATE network_edges SET custom_path = 'M1038,432 C1038,469 460,469 460,502'
WHERE from_node_key = 'p10' AND to_node_key = 'ic1';

-- p11→ic2: M1140,315 → M1140,425; 359→469; 694,399→694,509
UPDATE network_edges SET custom_path = 'M1140,425 C1140,469 694,469 694,509'
WHERE from_node_key = 'p11' AND to_node_key = 'ic2';

-- p11→ic4: M1140,315 → M1140,425; 360→470; 1241,399→1241,509
UPDATE network_edges SET custom_path = 'M1140,425 C1140,470 1241,470 1241,509'
WHERE from_node_key = 'p11' AND to_node_key = 'ic4';

-- p11→ec1: M1140,315 → M1140,425; 480→590; 882,510→882,620
UPDATE network_edges SET custom_path = 'M1140,425 C1140,590 882,590 882,620'
WHERE from_node_key = 'p11' AND to_node_key = 'ec1';

-- p11→ec2: M1140,315 → M1140,425; 482→592; 977,510→977,620
UPDATE network_edges SET custom_path = 'M1140,425 C1140,592 977,592 977,620'
WHERE from_node_key = 'p11' AND to_node_key = 'ec2';

-- p11→ec3: M1140,315 → M1140,425; 484→594; 1070,510→1070,620
UPDATE network_edges SET custom_path = 'M1140,425 C1140,594 1070,594 1070,620'
WHERE from_node_key = 'p11' AND to_node_key = 'ec3';

-- p4→ic4: M430,315 → M430,425; 357→467; 1241,399→1241,509
UPDATE network_edges SET custom_path = 'M430,425 C430,467 1241,467 1241,509'
WHERE from_node_key = 'p4' AND to_node_key = 'ic4';

-- p4→ic2: M430,315 → M430,425; 363→473; 694,399→694,509
UPDATE network_edges SET custom_path = 'M430,425 C430,473 694,473 694,509'
WHERE from_node_key = 'p4' AND to_node_key = 'ic2';

-- p13→ic1: M1336,315 → M1336,425; 354→464; 460,392→460,502
UPDATE network_edges SET custom_path = 'M1336,425 C1336,464 460,464 460,502'
WHERE from_node_key = 'p13' AND to_node_key = 'ic1';

-- p13→ec3: M1336,315 → M1336,425; 484→594; 1070,510→1070,620
UPDATE network_edges SET custom_path = 'M1336,425 C1336,594 1070,594 1070,620'
WHERE from_node_key = 'p13' AND to_node_key = 'ec3';
