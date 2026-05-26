/*
  # Add Dropbox URL to documents

  Adds a `dropbox_url` column to the `documents` table to store Dropbox shared links.
  Documents can now be linked from Dropbox instead of (or in addition to) uploaded to Supabase storage.
  The Dropbox embedder will use this URL for inline preview.

  1. Modified Tables
    - `documents`: new `dropbox_url text` column (nullable)
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'documents' AND column_name = 'dropbox_url'
  ) THEN
    ALTER TABLE documents ADD COLUMN dropbox_url text;
  END IF;
END $$;
