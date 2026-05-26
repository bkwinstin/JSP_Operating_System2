/*
  # Add Why/How content to network swimlanes

  ## Changes
  - Adds `why_title`, `why_content`, `how_title`, `how_content` columns to `network_swimlanes`
  - These fields power expandable Why/How panels when a swimlane title is clicked in the network map
  - Seeds default placeholder content for each of the 4 visible swimlanes

  ## New Columns
  - `why_title` (text): Short heading for the Why panel (e.g. "Why Employees Matter")
  - `why_content` (text): Body copy explaining the swimlane's purpose
  - `how_title` (text): Short heading for the How panel
  - `how_content` (text): Body copy explaining how this lane operates
*/

ALTER TABLE network_swimlanes
  ADD COLUMN IF NOT EXISTS why_title   text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS why_content text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS how_title   text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS how_content text NOT NULL DEFAULT '';

-- Employees
UPDATE network_swimlanes SET
  why_title   = 'Why Employees',
  why_content = 'Our staff are the engine of every outcome we produce. When people are equipped, supported, and growing, they bring their full capacity to the work — and that capacity directly shapes what partners and communities experience.',
  how_title   = 'How Employees Work',
  how_content = 'We invest in people through structured onboarding, ongoing coaching, learning teams, and a shared practice framework. Development is continuous, feedback is built into the rhythm, and growth is tied directly to the skills the work demands.'
WHERE label = 'Employees';

-- Projects
UPDATE network_swimlanes SET
  why_title   = 'Why Projects',
  why_content = 'Projects are where strategy becomes impact. Each engagement is a direct expression of our mission — a chance to drive real, measurable change in a partner system. The quality and coherence of our project work defines our credibility as a field partner.',
  how_title   = 'How Projects Work',
  how_content = 'Projects move through a defined lifecycle: proposal, contract, staff assignment, kickoff, effectuating work, and closeout. Each phase has clear roles, tools, and checkpoints to keep quality high and learning embedded at every step.'
WHERE label = 'Projects';

-- Internal Catalyst
UPDATE network_swimlanes SET
  why_title   = 'Why Internal Catalyst',
  why_content = 'Internal infrastructure isn''t overhead — it''s what makes field-facing work possible and sustainable. Strong internal systems free staff to focus on impact rather than friction, and they signal the organizational maturity our partners trust.',
  how_title   = 'How Internal Catalyst Works',
  how_content = 'Internal catalyst functions span operations, communications, knowledge management, and strategy. These teams support every other lane — enabling hiring, learning, reporting, and the systems that hold the organization together.'
WHERE label = 'Internal Catalyst';

-- External Catalyst
UPDATE network_swimlanes SET
  why_title   = 'Why External Catalyst',
  why_content = 'Our influence extends beyond individual projects. By shaping field narratives, cultivating relationships, and contributing to sector knowledge, we multiply impact far beyond what any single engagement can achieve.',
  how_title   = 'How External Catalyst Works',
  how_content = 'External catalyst work includes funder development, thought leadership, communities of practice, and strategic communications. These efforts build the reputation and relationships that open doors for future work and amplify what we learn in the field.'
WHERE label = 'External Catalyst';

-- Infrastructure
UPDATE network_swimlanes SET
  why_title   = 'Why Infrastructure',
  why_content = 'Executive leadership and organizational infrastructure set the conditions for everything else to succeed. Clear direction, sound resource allocation, and a healthy culture aren''t separate from the work — they are foundational to it.',
  how_title   = 'How Infrastructure Works',
  how_content = 'Infrastructure includes strategic planning, budgeting, board relations, and culture stewardship. These functions operate at the organizational level, shaping priorities and ensuring the whole system is aligned and resourced.'
WHERE label = 'Infrastructure';

-- Executive Team
UPDATE network_swimlanes SET
  why_title   = 'Why Executive Team',
  why_content = 'Senior leadership translates vision into organizational reality. The executive team carries responsibility for long-range positioning, funder relationships, talent strategy, and the decisions that shape JSP''s future.',
  how_title   = 'How Executive Team Works',
  how_content = 'The executive team works through strategic planning cycles, leadership team meetings, funder strategy sessions, and board engagement. Decisions are data-informed, mission-anchored, and made with the full organizational picture in view.'
WHERE label = 'Executive Team';
