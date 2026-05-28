/*
  # Add SME, Project Lead, and Dir of Area to org_chart_data roles

  1. Changes
    - Adds three new role entries to the roles JSON in org_chart_data:
      - `sme`: Subject Matter Expert
      - `projectLeadSingle`: Project Lead (singular, non-center-zone, for responsibility assignment)
      - `dirOfArea`: Dir of Area
    - These roles are NOT marked isCenterZone so they appear in the
      primary/additional person responsible selectors in NetworkAdmin

  2. Notes
    - Existing center-zone roles (projectLead, staffProjects, etc.) are unchanged
    - These new roles are positioned off-canvas (x/y don't matter for responsibility use)
*/

UPDATE org_chart_data
SET roles = roles
  || jsonb_build_object(
    'sme', jsonb_build_object(
      'r', 36,
      'x', 700,
      'y', 700,
      'desc', 'Subject Matter Expert',
      'color', '#2E7D6E',
      'label', 'SME',
      'fullLabel', 'Subject Matter Expert',
      'textColor', '#ffffff'
    ),
    'projectLeadRole', jsonb_build_object(
      'r', 36,
      'x', 700,
      'y', 750,
      'desc', 'Leads a project',
      'color', '#1A5F8A',
      'label', 'Project Lead',
      'fullLabel', 'Project Lead',
      'textColor', '#ffffff'
    ),
    'dirOfArea', jsonb_build_object(
      'r', 36,
      'x', 700,
      'y', 800,
      'desc', 'Director of a functional area',
      'color', '#6A453A',
      'label', 'Dir of Area',
      'fullLabel', 'Dir of Area',
      'textColor', '#ffffff'
    )
  );
