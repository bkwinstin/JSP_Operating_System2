/*
  # Change person_responsible from text to text[]

  1. Changes
    - `network_nodes.person_responsible`: changed from nullable text to nullable text[]
      Allows multiple people to be responsible for a node's documents.
      Existing non-null values are wrapped into a single-element array.
      NULL values remain NULL.

  2. Notes
    - Uses a safe cast via USING clause to preserve existing data
*/

ALTER TABLE network_nodes
  ALTER COLUMN person_responsible TYPE text[]
  USING CASE
    WHEN person_responsible IS NULL THEN NULL
    ELSE ARRAY[person_responsible]
  END;

ALTER TABLE network_nodes
  ALTER COLUMN person_responsible SET DEFAULT NULL;
