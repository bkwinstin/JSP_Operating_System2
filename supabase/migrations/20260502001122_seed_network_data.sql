/*
  # Seed network map data

  Populates the network tables with:
  1. Original five swimlanes (Employees, Projects, Internal Catalyst, External Catalyst + Executive)
  2. All original nodes migrated from hardcoded arrays
  3. New infrastructure swimlane with Learning Teams and Staff Meetings nodes
  4. Executive-only swimlane (min_role = 'executive')
  5. All original edges
  6. New edges connecting infrastructure nodes

  Uses INSERT ... ON CONFLICT DO NOTHING to be safe on re-runs.
*/

-- ============================================================
-- SWIMLANES
-- ============================================================
INSERT INTO network_swimlanes (id, label, badge, color_key, x, y, w, h, sort_order, min_role) VALUES
  ('11111111-0001-0001-0001-000000000001', 'Employees',          'DSIC + Director of Admin',   'emp',   68, 28,  1326, 90, 1, 'all'),
  ('11111111-0001-0001-0001-000000000002', 'Projects',           'DII + Director of Admin',    'proj',  68, 148, 1326, 90, 2, 'all'),
  ('11111111-0001-0001-0001-000000000003', 'Internal Catalyst',  'DSI',                        'ic',    68, 268, 1326, 90, 3, 'all'),
  ('11111111-0001-0001-0001-000000000004', 'External Catalyst',  'DSI',                        'ec',    68, 388, 1326, 80, 4, 'all'),
  ('11111111-0001-0001-0001-000000000005', 'JSP Infrastructure', 'President + EVP',            'infra', 68, 488, 1326, 90, 5, 'all'),
  ('11111111-0001-0001-0001-000000000006', 'Executive Team',     'President + EVP',            'exec',  68, 598, 1326, 80, 6, 'executive')
ON CONFLICT DO NOTHING;

-- ============================================================
-- NODES — Employees
-- ============================================================
INSERT INTO network_nodes (swimlane_id, node_key, label, description, x, y, w, h, color_key, is_bubble, sort_order) VALUES
  ('11111111-0001-0001-0001-000000000001', 'e1',  'Onboarding',                   'The JSP onboarding experience',                             76,  57,  82,  28, 'emp',  false, 1),
  ('11111111-0001-0001-0001-000000000001', 'e2',  'JSP Why',                      'Understanding the mission and purpose of JSP',              166, 57,  68,  28, 'emp',  false, 2),
  ('11111111-0001-0001-0001-000000000001', 'e3',  'How we do it',                 'JSP practices, culture, and ways of working',               242, 57,  82,  28, 'emp',  false, 3),
  ('11111111-0001-0001-0001-000000000001', 'e4',  'What we do',                   'JSP services, pillars, and work portfolio',                 334, 57,  76,  28, 'emp',  false, 4),
  ('11111111-0001-0001-0001-000000000001', 'e5',  'North Star\nLevels & Tiers',   'Directional vision for mastery',                           418, 50,  110, 42, 'emp',  false, 5),
  ('11111111-0001-0001-0001-000000000001', 'e6',  'Practice Profile',             'Individualized growth plan',                               536, 57,  96,  28, 'emp',  false, 6),
  ('11111111-0001-0001-0001-000000000001', 'e7',  'Skills Inventory',             '82-skill inventory',                                       640, 57,  96,  28, 'emp',  false, 7),
  ('11111111-0001-0001-0001-000000000001', 'e8',  'EIP',                          'Employee Investment Plan',                                 744, 57,  44,  28, 'emp',  false, 8),
  ('11111111-0001-0001-0001-000000000001', 'e9',  'Prof Dev\nCoaching\nLearning', 'Non-linear learning supports',                             796, 35,  138, 72, 'bub',  true,  9),
  ('11111111-0001-0001-0001-000000000001', 'e10', 'Growing Towards\nAutonomy',    'The arc from structured support to autonomy',              942, 50,  128, 42, 'emp',  false, 10)
ON CONFLICT (node_key) DO NOTHING;

-- ============================================================
-- NODES — Projects
-- ============================================================
INSERT INTO network_nodes (swimlane_id, node_key, label, description, x, y, w, h, color_key, is_bubble, sort_order) VALUES
  ('11111111-0001-0001-0001-000000000002', 'p1',  'Proposal',              'Scoping and submitting funded work',    76,   177, 74,  28, 'proj', false, 1),
  ('11111111-0001-0001-0001-000000000002', 'p2',  'Executed Contract',     'Contracted and resourced',             158,  177, 112, 28, 'proj', false, 2),
  ('11111111-0001-0001-0001-000000000002', 'p3',  'Assigned Staff',        'Staff matched to project',             278,  177, 96,  28, 'proj', false, 3),
  ('11111111-0001-0001-0001-000000000002', 'p4',  'Internal Kickoff',      'Internal team alignment',              382,  177, 96,  28, 'proj', false, 4),
  ('11111111-0001-0001-0001-000000000002', 'p5',  'External Kickoff',      'Partner kickoff',                      486,  177, 96,  28, 'proj', false, 5),
  ('11111111-0001-0001-0001-000000000002', 'p6',  'Project Plan',          'Detailed workplan',                    590,  177, 80,  28, 'proj', false, 6),
  ('11111111-0001-0001-0001-000000000002', 'p7',  'Assign Roles\n& Activities', 'Staff roles assigned',           678,  170, 120, 42, 'proj', false, 7),
  ('11111111-0001-0001-0001-000000000002', 'p8',  'Level Setting',         'Aligning expectations',               806,  177, 82,  28, 'proj', false, 8),
  ('11111111-0001-0001-0001-000000000002', 'p9',  'Execute Plan',          'Active project delivery',             896,  177, 80,  28, 'proj', false, 9),
  ('11111111-0001-0001-0001-000000000002', 'p10', 'Milestone\nCheck-in',   'Mid-project calibration',             984,  170, 108, 42, 'proj', false, 10),
  ('11111111-0001-0001-0001-000000000002', 'p11', 'Deliverables',          'Work products produced',              1100, 177, 80,  28, 'proj', false, 11),
  ('11111111-0001-0001-0001-000000000002', 'p12', 'Products &\nLearning',  'Packaged products and learning',      1188, 170, 110, 42, 'proj', false, 12),
  ('11111111-0001-0001-0001-000000000002', 'p13', 'Project Closeout',      'Formal project close',                1286, 177, 100, 28, 'proj', false, 13)
ON CONFLICT (node_key) DO NOTHING;

-- ============================================================
-- NODES — Internal Catalyst
-- ============================================================
INSERT INTO network_nodes (swimlane_id, node_key, label, description, x, y, w, h, color_key, is_bubble, sort_order) VALUES
  ('11111111-0001-0001-0001-000000000003', 'ic1', 'Connecting\nThrough Work', 'Making work visible internally',      400,  282, 120, 42, 'ic', false, 1),
  ('11111111-0001-0001-0001-000000000003', 'ic2', 'Staff Spotlights',         'Highlighting staff contributions',    640,  289, 108, 28, 'ic', false, 2),
  ('11111111-0001-0001-0001-000000000003', 'ic3', 'Milestone Moments',        'Recognizing key moments',             964,  289, 118, 28, 'ic', false, 3),
  ('11111111-0001-0001-0001-000000000003', 'ic4', 'Project Spotlights',       'Sharing project wins',                1188, 289, 110, 28, 'ic', false, 4)
ON CONFLICT (node_key) DO NOTHING;

-- ============================================================
-- NODES — External Catalyst
-- ============================================================
INSERT INTO network_nodes (swimlane_id, node_key, label, description, x, y, w, h, color_key, is_bubble, sort_order) VALUES
  ('11111111-0001-0001-0001-000000000004', 'ec1', 'Publications',  'Research shared with the field',        840,  400, 84, 28, 'ec', false, 1),
  ('11111111-0001-0001-0001-000000000004', 'ec2', 'Presentations', 'Conference talks and convenings',       932,  400, 90, 28, 'ec', false, 2),
  ('11111111-0001-0001-0001-000000000004', 'ec3', 'Social Media',  'Amplifying JSP work digitally',        1030, 400, 80, 28, 'ec', false, 3)
ON CONFLICT (node_key) DO NOTHING;

-- ============================================================
-- NODES — JSP Infrastructure (new)
-- ============================================================
INSERT INTO network_nodes (swimlane_id, node_key, label, description, x, y, w, h, color_key, is_bubble, sort_order) VALUES
  ('11111111-0001-0001-0001-000000000005', 'infra1', 'All-Staff\nMeeting',     'Monthly full-team meeting — updates, culture moments, and cross-project visibility', 76,  502, 96,  42, 'infra', false, 1),
  ('11111111-0001-0001-0001-000000000005', 'infra2', 'Learning\nTeams',        'Standing cross-functional teams building skill and connection across the org',        200, 502, 96,  42, 'infra', false, 2),
  ('11111111-0001-0001-0001-000000000005', 'infra3', 'Project\nCheck-ins',     'Regular project-level syncs between staff and directors',                             324, 502, 96,  42, 'infra', false, 3),
  ('11111111-0001-0001-0001-000000000005', 'infra4', 'Director\nMeetings',     'Weekly director alignment on staffing, quality, and pipeline',                        448, 502, 96,  42, 'infra', false, 4),
  ('11111111-0001-0001-0001-000000000005', 'infra5', 'Onboarding\nCohorts',    'Structured peer onboarding cohorts for new hires',                                   572, 502, 102, 42, 'infra', false, 5),
  ('11111111-0001-0001-0001-000000000005', 'infra6', 'Staff\nSpotlight Calls', 'Bi-weekly celebrations of staff and project milestones',                             700, 502, 120, 42, 'infra', false, 6),
  ('11111111-0001-0001-0001-000000000005', 'infra7', 'Substack /\nWriting',    'JSP thought leadership writing and Substack publication process',                    848, 502, 100, 42, 'infra', false, 7),
  ('11111111-0001-0001-0001-000000000005', 'infra8', 'Annual\nRetreat',        'Yearly full-team off-site for vision-setting, culture, and planning',               976, 502, 90,  42, 'infra', false, 8)
ON CONFLICT (node_key) DO NOTHING;

-- ============================================================
-- NODES — Executive Team (executive-only)
-- ============================================================
INSERT INTO network_nodes (swimlane_id, node_key, label, description, x, y, w, h, color_key, is_bubble, sort_order) VALUES
  ('11111111-0001-0001-0001-000000000006', 'exec1', 'Strategic\nPlanning',      'Annual and quarterly strategic planning cycle — priorities, metrics, and resource allocation', 76,  612, 110, 42, 'exec', false, 1),
  ('11111111-0001-0001-0001-000000000006', 'exec2', 'Budget &\nForecasting',    'Revenue forecasting, budget allocation, and financial health monitoring',                       210, 612, 110, 42, 'exec', false, 2),
  ('11111111-0001-0001-0001-000000000006', 'exec3', 'Funder\nStrategy',         'High-level funder relationship strategy and board-level development decisions',                 344, 612, 96,  42, 'exec', false, 3),
  ('11111111-0001-0001-0001-000000000006', 'exec4', 'Talent &\nGrowth Plan',    'Long-range hiring, succession, and organizational design decisions',                           464, 612, 110, 42, 'exec', false, 4),
  ('11111111-0001-0001-0001-000000000006', 'exec5', 'Board\nRelations',         'Board meeting cadence, reporting, and governance stewardship',                                  598, 612, 96,  42, 'exec', false, 5),
  ('11111111-0001-0001-0001-000000000006', 'exec6', 'Culture &\nValues Review', 'Annual review of how JSP is living its values — staff survey, practices audit',               718, 612, 120, 42, 'exec', false, 6)
ON CONFLICT (node_key) DO NOTHING;

-- ============================================================
-- EDGES — original Employee lane (sequential)
-- ============================================================
INSERT INTO network_edges (from_node_key, to_node_key, is_cross, is_feedback, is_upward, v_midpoint, custom_path, sort_order) VALUES
  ('e1','e2',false,false,false,null,null,1),
  ('e2','e3',false,false,false,null,null,2),
  ('e3','e4',false,false,false,null,null,3),
  ('e4','e5',false,false,false,null,null,4),
  ('e5','e6',false,false,false,null,null,5),
  ('e6','e7',false,false,false,null,null,6),
  ('e7','e8',false,false,false,null,null,7),
  ('e8','e9',false,false,false,null,null,8),
  ('e9','e10',false,false,false,null,null,9)
ON CONFLICT DO NOTHING;

-- ============================================================
-- EDGES — original Project lane (sequential)
-- ============================================================
INSERT INTO network_edges (from_node_key, to_node_key, is_cross, is_feedback, is_upward, v_midpoint, custom_path, sort_order) VALUES
  ('p1','p2',false,false,false,null,null,10),
  ('p2','p3',false,false,false,null,null,11),
  ('p3','p4',false,false,false,null,null,12),
  ('p4','p5',false,false,false,null,null,13),
  ('p5','p6',false,false,false,null,null,14),
  ('p6','p7',false,false,false,null,null,15),
  ('p7','p8',false,false,false,null,null,16),
  ('p8','p9',false,false,false,null,null,17),
  ('p9','p10',false,false,false,null,null,18),
  ('p10','p11',false,false,false,null,null,19),
  ('p11','p12',false,false,false,null,null,20),
  ('p12','p13',false,false,false,null,null,21)
ON CONFLICT DO NOTHING;

-- ============================================================
-- EDGES — cross-lane (employee → project, project → catalyst, etc.)
-- ============================================================
INSERT INTO network_edges (from_node_key, to_node_key, is_cross, is_feedback, is_upward, v_midpoint, custom_path, sort_order) VALUES
  ('e2','p1',true,false,false,133,null,30),
  ('e5','p3',true,false,false,133,null,31),
  ('e6','p3',true,false,false,137,null,32),
  ('e7','p3',true,false,false,141,null,33),
  ('e8','p7',true,false,false,133,null,34),
  ('e8','p8',true,false,false,137,null,35),
  ('p10','e9',true,false,true, 133,null,36),
  ('e10','p9',true,false,false,133,null,37),
  -- project → internal catalyst
  ('p4','ic1',true,false,false,254,null,40),
  ('p10','ic1',true,false,false,null,'M1038,212 C1038,249 460,249 460,282',41),
  ('p13','ic1',true,false,false,null,'M1336,205 C1336,244 460,244 460,282',42),
  ('p4','ic2',true,false,false,null,'M430,205 C430,253 694,253 694,289',43),
  ('p7','ic2',true,false,false,253,null,44),
  ('p11','ic2',true,false,false,null,'M1140,205 C1140,249 694,249 694,289',45),
  ('p10','ic3',true,false,false,255,null,46),
  ('p12','ic4',true,false,false,253,null,47),
  ('p11','ic4',true,false,false,null,'M1140,205 C1140,250 1241,250 1241,289',48),
  ('p4','ic4',true,false,false,null,'M430,205 C430,247 1241,247 1241,289',49),
  -- project → external catalyst
  ('p11','ec1',true,false,false,null,'M1140,205 C1140,370 882,370 882,400',50),
  ('p11','ec2',true,false,false,null,'M1140,205 C1140,372 977,372 977,400',51),
  ('p11','ec3',true,false,false,null,'M1140,205 C1140,374 1070,374 1070,400',52),
  ('p13','ec3',true,false,false,null,'M1336,205 C1336,374 1070,374 1070,400',53),
  -- feedback (external → internal)
  ('ec1','p12',true,true,false,null,'M882,400 C882,252 1243,252 1243,212',60),
  ('ec1','p13',true,true,false,null,'M882,400 C882,254 1336,254 1336,205',61),
  ('ec1','e8', true,true,false,null,'M882,400 C882,20  762,20  762,85', 62),
  ('ec2','p12',true,true,false,null,'M977,400 C977,252 1243,252 1243,212',63),
  ('ec2','e8', true,true,false,null,'M977,400 C977,20  762,20  762,85', 64),
  ('ec3','p2', true,true,false,null,'M1070,400 C1070,133 214,133 214,177',65),
  ('ec3','p6', true,true,false,null,'M1070,400 C1070,133 630,133 630,177',66),
  ('ec3','p9', true,true,false,null,'M1070,400 C1070,253 936,253 936,205',67),
  ('ec3','p11',true,true,false,null,'M1070,400 C1070,255 1140,255 1140,205',68),
  ('ec3','ic3',true,true,false,null,'M1070,400 C1070,373 1022,373 1022,317',69),
  ('ec3','ic4',true,true,false,null,'M1070,400 C1070,373 1241,373 1241,317',70)
ON CONFLICT DO NOTHING;

-- ============================================================
-- EDGES — infrastructure connections
-- ============================================================
INSERT INTO network_edges (from_node_key, to_node_key, is_cross, is_feedback, is_upward, v_midpoint, custom_path, sort_order) VALUES
  -- infrastructure sequential
  ('infra1','infra2',false,false,false,null,null,80),
  ('infra2','infra3',false,false,false,null,null,81),
  ('infra3','infra4',false,false,false,null,null,82),
  ('infra4','infra5',false,false,false,null,null,83),
  ('infra5','infra6',false,false,false,null,null,84),
  ('infra6','infra7',false,false,false,null,null,85),
  ('infra7','infra8',false,false,false,null,null,86),
  -- infrastructure ↔ employees
  ('infra2','e9',true,false,true, 470,null,90),
  ('infra1','ic1',true,false,true,460,null,91),
  ('infra6','ic2',true,false,true,462,null,92),
  ('infra7','ec1',true,false,true,468,null,93),
  ('infra7','ec2',true,false,true,470,null,94)
ON CONFLICT DO NOTHING;
