/*
  # Add storage RLS policies for the documents bucket

  The documents storage bucket exists but has no policies, blocking all
  uploads and downloads. Add policies so:
  - Admins can upload (INSERT) files
  - Admins can delete files
  - All authenticated users can download (SELECT) files
  - Admins can update file metadata
*/

CREATE POLICY "Admins can upload documents"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'documents' AND is_admin()
  );

CREATE POLICY "Admins can delete documents"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'documents' AND is_admin()
  );

CREATE POLICY "Admins can update documents"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'documents' AND is_admin())
  WITH CHECK (bucket_id = 'documents' AND is_admin());

CREATE POLICY "Authenticated users can read documents"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'documents');
