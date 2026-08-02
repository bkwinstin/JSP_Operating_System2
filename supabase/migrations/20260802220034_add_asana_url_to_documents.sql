/*
# Add asana_url to documents

## Summary
Adds an optional Asana link to each document so admins can link
documents to an Asana project, task, or board in addition to
(or instead of) a Dropbox file or Canva design. Staff see an
"Open in Asana" button on the document card, in the preview modal,
and in the tile accordion attachments.

## Changes
- `documents`: add nullable `asana_url` (text) column
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'documents' AND column_name = 'asana_url'
  ) THEN
    ALTER TABLE documents ADD COLUMN asana_url text;
  END IF;
END $$;
