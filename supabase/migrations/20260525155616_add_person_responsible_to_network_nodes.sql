/*
  # Add person_responsible to network_nodes

  1. Changes
    - `network_nodes`: new nullable text column `person_responsible`
      Stores who is responsible for this node's documents.
      Valid values: 'Pres' | 'Ex VP' | 'DFA' | 'DII' | 'DIS' | 'DSIC' | NULL

  2. Notes
    - Only relevant for nodes flagged as "Direct documents" (has_sub_nodes = false)
    - NULL means no responsible person assigned
    - No check constraint — kept flexible for future role additions
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'network_nodes' AND column_name = 'person_responsible'
  ) THEN
    ALTER TABLE network_nodes ADD COLUMN person_responsible text DEFAULT NULL;
  END IF;
END $$;
