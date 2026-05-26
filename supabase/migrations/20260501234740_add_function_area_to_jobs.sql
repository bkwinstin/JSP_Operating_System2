/*
  # Add function_area to jobs table

  Maps each job to its corresponding document function_area so documents
  can be surfaced directly within the How tile for each job.

  Changes:
  - jobs: add `function_area` text column (default empty string)
  - Seed values:
      thriving-staff     → staff-development
      trusted-partnerships → funder-development
      system-change      → operations
      innovative-work    → project-delivery
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'jobs' AND column_name = 'function_area'
  ) THEN
    ALTER TABLE jobs ADD COLUMN function_area text NOT NULL DEFAULT '';
  END IF;
END $$;

UPDATE jobs SET function_area = 'staff-development'   WHERE id = 'thriving-staff';
UPDATE jobs SET function_area = 'funder-development'  WHERE id = 'trusted-partnerships';
UPDATE jobs SET function_area = 'operations'          WHERE id = 'system-change';
UPDATE jobs SET function_area = 'project-delivery'    WHERE id = 'innovative-work';
