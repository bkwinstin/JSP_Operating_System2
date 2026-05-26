/*
  # Add canva_url to documents

  ## Summary
  Adds an optional Canva link to each document so admins can link
  documents to a Canva presentation, design, or doc in addition to
  (or instead of) a Dropbox file. Staff see an "Open in Canva" button
  on the document card and in the preview modal.

  ## Changes
  - `documents`: add nullable `canva_url` (text) column
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'documents' AND column_name = 'canva_url'
  ) THEN
    ALTER TABLE documents ADD COLUMN canva_url text;
  END IF;
END $$;
