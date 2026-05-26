/*
  # Rewrite network table policies to use is_admin() helper

  The inline EXISTS (SELECT 1 FROM user_profiles ...) subqueries in network
  table policies can hit the same RLS recursion. Replace them with the
  SECURITY DEFINER is_admin() function.
*/

-- network_swimlanes
DROP POLICY IF EXISTS "Admins can insert swimlanes" ON network_swimlanes;
DROP POLICY IF EXISTS "Admins can update swimlanes" ON network_swimlanes;
DROP POLICY IF EXISTS "Admins can delete swimlanes" ON network_swimlanes;

CREATE POLICY "Admins can insert swimlanes"
  ON network_swimlanes FOR INSERT TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update swimlanes"
  ON network_swimlanes FOR UPDATE TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Admins can delete swimlanes"
  ON network_swimlanes FOR DELETE TO authenticated
  USING (is_admin());

-- network_nodes
DROP POLICY IF EXISTS "Admins can insert nodes" ON network_nodes;
DROP POLICY IF EXISTS "Admins can update nodes" ON network_nodes;
DROP POLICY IF EXISTS "Admins can delete nodes" ON network_nodes;

CREATE POLICY "Admins can insert nodes"
  ON network_nodes FOR INSERT TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update nodes"
  ON network_nodes FOR UPDATE TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Admins can delete nodes"
  ON network_nodes FOR DELETE TO authenticated
  USING (is_admin());

-- network_edges
DROP POLICY IF EXISTS "Admins can insert edges" ON network_edges;
DROP POLICY IF EXISTS "Admins can update edges" ON network_edges;
DROP POLICY IF EXISTS "Admins can delete edges" ON network_edges;

CREATE POLICY "Admins can insert edges"
  ON network_edges FOR INSERT TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update edges"
  ON network_edges FOR UPDATE TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Admins can delete edges"
  ON network_edges FOR DELETE TO authenticated
  USING (is_admin());

-- documents (also rewrite to use is_admin())
DROP POLICY IF EXISTS "Admins can insert documents" ON documents;
DROP POLICY IF EXISTS "Admins can update documents" ON documents;
DROP POLICY IF EXISTS "Admins can delete documents" ON documents;

CREATE POLICY "Admins can insert documents"
  ON documents FOR INSERT TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update documents"
  ON documents FOR UPDATE TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Admins can delete documents"
  ON documents FOR DELETE TO authenticated
  USING (is_admin());
