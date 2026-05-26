/*
  # Split person_responsible into primary and additional columns

  1. Changes
    - `network_nodes`: rename `person_responsible` concept into two columns:
      - `primary_person_responsible` (text, nullable): the single primary responsible person
      - `additional_persons_responsible` (text[], nullable): zero or more additional people

  2. Migration logic
    - Existing `person_responsible[0]` → `primary_person_responsible`
    - Existing `person_responsible[2..]` → `additional_persons_responsible`
    - Then drop the old `person_responsible` column

  3. Notes
    - Safe: uses IF NOT EXISTS / IF EXISTS guards
    - No data is lost; all existing values are preserved
*/

DO $$
BEGIN
  -- 1. Add new columns if they don't already exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'network_nodes' AND column_name = 'primary_person_responsible'
  ) THEN
    ALTER TABLE network_nodes ADD COLUMN primary_person_responsible text DEFAULT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'network_nodes' AND column_name = 'additional_persons_responsible'
  ) THEN
    ALTER TABLE network_nodes ADD COLUMN additional_persons_responsible text[] DEFAULT NULL;
  END IF;
END $$;

-- 2. Populate from existing person_responsible array
UPDATE network_nodes
SET
  primary_person_responsible     = person_responsible[1],
  additional_persons_responsible = CASE
    WHEN array_length(person_responsible, 1) > 1
    THEN person_responsible[2:array_length(person_responsible, 1)]
    ELSE NULL
  END
WHERE person_responsible IS NOT NULL;

-- 3. Drop the old column
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'network_nodes' AND column_name = 'person_responsible'
  ) THEN
    ALTER TABLE network_nodes DROP COLUMN person_responsible;
  END IF;
END $$;
