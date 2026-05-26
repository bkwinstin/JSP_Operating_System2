/*
  # Add document_id to job_what_tools

  ## Summary
  Links each "What" tool card to an optional document in the library.
  When linked, the tool card in the How/What tile shows a direct access
  button to the document, so staff can reach it both from the tile and
  from the Document Library.

  ## Changes
  - `job_what_tools`: add nullable `document_id` (uuid FK → documents.id, SET NULL on delete)
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'job_what_tools' AND column_name = 'document_id'
  ) THEN
    ALTER TABLE job_what_tools
      ADD COLUMN document_id uuid REFERENCES documents(id) ON DELETE SET NULL;
  END IF;
END $$;
