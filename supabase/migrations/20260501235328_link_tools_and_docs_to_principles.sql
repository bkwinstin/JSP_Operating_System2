/*
  # Link tools and documents to how principles

  Adds principle_id FK to both job_what_tools and documents so each item
  can be attached to a specific how principle and displayed inline beneath it.

  Changes:
  - job_what_tools: add nullable principle_id FK → job_how_principles.id
  - documents: add nullable principle_id FK → job_how_principles.id
  - Seed tool linkages (1:1 sort_order match per job)
  - Seed document linkages based on content relevance
*/

-- 1. Add principle_id to job_what_tools
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'job_what_tools' AND column_name = 'principle_id'
  ) THEN
    ALTER TABLE job_what_tools ADD COLUMN principle_id uuid REFERENCES job_how_principles(id);
  END IF;
END $$;

-- 2. Add principle_id to documents
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'documents' AND column_name = 'principle_id'
  ) THEN
    ALTER TABLE documents ADD COLUMN principle_id uuid REFERENCES job_how_principles(id);
  END IF;
END $$;

-- 3. Link tools to principles by matching sort_order within each job
UPDATE job_what_tools t
SET principle_id = p.id
FROM job_how_principles p
WHERE t.job_id = p.job_id
  AND t.sort_order = p.sort_order;

-- 4. Link documents to principles

-- thriving-staff
UPDATE documents SET principle_id = 'f2f450c4-155b-4231-ba51-e09d647d3b36' WHERE name = 'Staff Skills Inventory';
UPDATE documents SET principle_id = '65240686-2703-48cf-beaf-80d622dc41e3' WHERE name = 'Practice Profile — Project Staff';
UPDATE documents SET principle_id = '5e7b8ca4-5228-43ff-998d-f6d7c9912052' WHERE name = 'Employee Investment Plan Framework';
UPDATE documents SET principle_id = '5e7b8ca4-5228-43ff-998d-f6d7c9912052' WHERE name = 'Disciplinary Process';
UPDATE documents SET principle_id = '5e7b8ca4-5228-43ff-998d-f6d7c9912052' WHERE name = 'Short-Term Coaching Plan Policy';
UPDATE documents SET principle_id = '3b6400a3-a10b-4ef1-ae48-c2053140e7bd' WHERE name = 'Professional Development Policy';
UPDATE documents SET principle_id = '3b6400a3-a10b-4ef1-ae48-c2053140e7bd' WHERE name = 'Learning Environment Policy';

-- system-change (operations)
UPDATE documents SET principle_id = '6c720e93-3003-4269-8121-638424230960' WHERE name = 'Strategic Plan 2026–2030';
UPDATE documents SET principle_id = '6c720e93-3003-4269-8121-638424230960' WHERE name = 'Decision Matrix';
UPDATE documents SET principle_id = '62a1c3d6-6932-4d5c-925f-da7e3741cca2' WHERE name = 'DEIB Philosophy';

-- innovative-work (project-delivery)
UPDATE documents SET principle_id = 'e6877329-f23a-47ce-afde-6ae9e911a34c' WHERE name = 'Project Lifecycle & Learning System';
UPDATE documents SET principle_id = 'e6877329-f23a-47ce-afde-6ae9e911a34c' WHERE name = 'Asana Standard Operating Procedure';

-- trusted-partnerships (funder-development)
UPDATE documents SET principle_id = '7f43b99d-ccc2-4913-ae4d-146ef4fa1061' WHERE name = 'Grants Management Framework';
UPDATE documents SET principle_id = 'f4a1b7e3-3de3-4089-9488-da677dfdfd49' WHERE name = 'Funder Lifecycle — Field Mapping Matrix';
