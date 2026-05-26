/*
  # Link network swimlanes to jobs

  ## Changes
  - Adds `job_id` column to `network_swimlanes` (nullable FK to jobs.id)
  - Seeds the three mappings specified: Employees → thriving-staff,
    Projects → innovative-work, External Catalyst → system-change

  ## Notes
  - Column is nullable — swimlanes without a linked job show their
    why_content/how_content text instead
  - No ON DELETE CASCADE; job deletion leaves job_id as null
*/

ALTER TABLE network_swimlanes
  ADD COLUMN IF NOT EXISTS job_id text REFERENCES jobs(id) ON DELETE SET NULL;

UPDATE network_swimlanes SET job_id = 'thriving-staff'  WHERE label = 'Employees';
UPDATE network_swimlanes SET job_id = 'innovative-work' WHERE label = 'Projects';
UPDATE network_swimlanes SET job_id = 'system-change'   WHERE label = 'External Catalyst';
