/*
  # Seed Initial Jobs Data

  Inserts all four Jobs to Be Done with their full Why/How/What content
  sourced from the JSP Operating System prototype.

  Jobs:
  1. Thriving Staff
  2. Trusted Partnerships
  3. System Change
  4. Innovative Work
*/

INSERT INTO jobs (id, name, color, light, dark, wheel_start, wheel_end, sort_order) VALUES
  ('thriving-staff',      'Thriving Staff',      '#FABE3D', '#FEF3CC', '#7A5500', 270, 360, 1),
  ('trusted-partnerships','Trusted Partnerships','#F3755E', '#FDE8E2', '#7A2410', 0,   90,  2),
  ('system-change',       'System Change',       '#6A453A', '#EDE0DC', '#2E1710', 90,  180, 3),
  ('innovative-work',     'Innovative Work',     '#90226C', '#F0D9E8', '#4A0F38', 180, 270, 4)
ON CONFLICT (id) DO NOTHING;

-- WHY CONTENT
INSERT INTO job_why (job_id, statement, body, anchor, values) VALUES
(
  'thriving-staff',
  'We believe in the power of people to change systems.',
  'For our staff to change systems routinized in status quo, we must create an environment where people can thrive. Employees who feel supported, encouraged to grow, and empowered to make decisions that effect change, staff must be at their best. We believe JSP is responsible for creating environments in which staff can thrive.',
  'If we can build an environment where staff thrive, they can help others do the same.',
  ARRAY['Individualization', 'Development', 'Learning', 'Equity']
),
(
  'trusted-partnerships',
  'We believe that lasting impact is only possible through trusted partnerships—because meaningful change depends on shared purpose, transparency, and mutual accountability. Trust empowers our partners and us to exchange ideas openly, make better decisions together, and deliver solutions that truly serve our communities.',
  'All of our work is nested within relationships. If it is a funder, a director of an agency, line staff, or people in the system, everything we do is connected with individuals trying to do their best work. We build strong relationships so that we can help people align their systems, organizations, and personal practices with the job to be done--help people thrive.',
  'We cannot make the criminal and juvenile justice system a place where everyone can thrive without building strong relationships.',
  ARRAY['Credibility', 'Investment', 'Trying their best', 'Capacity to grow']
),
(
  'system-change',
  'The juvenile and adult criminal justice systems, as currently designed, cause more harm than they heal. JSP exists to change that.',
  'System change is not a project deliverable — it is the reason every project exists. When JSP helps a jurisdiction rethink pretrial detention, reduce technical violations, or redesign supervision conditions, it is not completing a contract. It is contributing to a shift in how an entire system treats the people inside it. The four pillars are not a service menu — they are a theory of change about what it takes to make justice systems worthy of the name.',
  'Better systems mean brighter futures. That is not a marketing tagline. It is the entire logic of why this organization exists.',
  ARRAY['Equity', 'Dignity', 'Effectiveness', 'Evidence']
),
(
  'innovative-work',
  'Systems are built for status quo--to have the greatest impact our work must push beyond the job we are doing and build strategies to accomplish the job to be done.',
  'Innovation at JSP is not a department or a project type — it is an organizational disposition. JSP''s commitment to innovative work is a commitment to approaching entrenched problems with genuine creativity: new methodologies like the CRMC, technology that puts evidence directly in practitioners'' hands, cutting edge research that challenges ingrained assumptions, and products that help us align practices with the true purpose of the system--to help people thrive.',
  'Innovative Work is what makes JSP who we are. We can attract the best talent, build the most effective strategies, and assist the field changing faster than traditional TA can keep pace with.',
  ARRAY['Creativity', 'Courage', 'Technology', 'Field Advancement']
)
ON CONFLICT DO NOTHING;

-- HOW PRINCIPLES: Thriving Staff
INSERT INTO job_how_principles (job_id, sort_order, title, body) VALUES
('thriving-staff', 1, 'North Star', 'The North Star is directional, not prescriptive. It shows what is possible over time, not what is expected immediately or required of everyone in your role. It exists to help you understand what mastery of your role looks like in practice so you can make informed choices about your own growth.'),
('thriving-staff', 2, 'JSP Employee Dimensions', 'Embedded in the North Star are four dimensions: Effectiveness, Efficiency, Relationships, and Vision. Each one of these dimensions are important for us to have the greatest impact on the field.

Effective: Delivering quality work across settings, complexity, and pillars. This includes taking initiative, demonstrating strong technical skills, managing complex tasks, and delivering quality outcomes.

Efficient: Meeting deadlines consistently, balancing workload effectively, and ensuring that work is completed in a timely manner without sacrificing quality.

Relationships: Developing quality connections with colleagues and external partners. This includes building trust, managing conflict, supporting team success, and giving and receiving feedback effectively.

Vision: Seeing beyond individual tasks to understand how projects and pillars interconnect. This involves driving the field forward, creating impact beyond immediate responsibilities, and contributing to the organization''s broader mission.'),
('thriving-staff', 3, 'Levels and Tiers', 'We have created levels within each role at JSP (e.g., Associate, Admin Specialist). Each role has a set of levels designed to help us gauge progress towards the North Star. The levels are created to help staff identify where they currently stand within and across each dimension.

Nested within each level are 2 tiers. The first tier within each level represents the opportunity for staff to practice, stretch, and grow their skills to prepare them for the next level. Tier 2 is the opportunity for employees to put everything together and prepare to move up to the next level.'),
('thriving-staff', 4, 'Practice Profile', 'The North Star, Employee Dimensions, and Levels/Tiers are incorporated into an individualized practice profile for each employee. The practice profile lays out your plan for continued growth and development at JSP. The practice profile operationalizes your own North Star as well as your current positioning on the appropriate level and tier.

The practice profile will be used to recognize your long-term growth and development at JSP. With each Tier/Level increase, we will recognize it with increased salary as well as more autonomy.'),
('thriving-staff', 5, 'Employee Investment Plan', 'The Employee Investment Plan is your personal growth plan here at JSP. It is how we support your development and growth, year-to-year, month-to-month, even day-to-day. This is where you will identify goals, strategies, and learning opportunities to help you move to the next Tier/Level.'),
('thriving-staff', 6, 'Learning Opportunities', 'Each employee will be provided with structural ways to learn new skills, meaningful relationships to support your development, and resources to continue your professional development across the four dimensions.')
ON CONFLICT DO NOTHING;

-- HOW PRINCIPLES: Trusted Partnerships
INSERT INTO job_how_principles (job_id, sort_order, title, body) VALUES
('trusted-partnerships', 1, 'Invest in People', 'We create an organization that prioritizes relationships. One of the four dimensions of a quality JSP employee is relationship. We invest in our employees so they can invest in others — through listening, helping people identify the job to be done. We believe our partners know where they want to go. Our job is to help them understand how to get there, providing expertise and guidance to support their journey, and being a thought partner with them.'),
('trusted-partnerships', 2, 'Lead with Curiosity, Not Conclusions', 'We believe the most powerful thing we can offer a partner is not an answer — it''s a better question. Across all of our work, we inspire partners to ask fundamental questions that get at the heart of public service, help them design methods for critical inquiry, support them in gathering essential data, and arrive together at creative solutions. This posture of curiosity is not a technique. It is who we are.'),
('trusted-partnerships', 3, 'Honor the Knowledge That Exists', 'Partners are not problems to be solved — they are repositories of wisdom, experience, and context that we could never replicate. This means we engage communities not just at the receiving end of our work, but in designing it. We involve diverse voices from the start through dissemination, compensate participants for their expertise rather than extracting it, and hire people with lived experience to inform and shape what we do.'),
('trusted-partnerships', 4, 'Tailor to Context', 'There is no generic partner and therefore no generic JSP. We tailor our services, approaches, and strategies to the specific needs of the jurisdiction, agency, or community we are working with. This is not a service feature — it is a value. It reflects our conviction that partners deserve to be seen in their particularity, not categorized into a solution we happened to bring with us.'),
('trusted-partnerships', 5, 'Earn Trust through Consistency and Follow Through', 'Trust is not declared — it is built, over time, through doing what we say we will do and helping people with their job to be done. Our staff development expectations reflect this directly: at the highest levels of performance, JSP staff are not just maintaining productive relationships with external stakeholders — they are building and sustaining meaningful connections, navigating delays and issues that arise, and creating new opportunities to improve JSP''s impact.')
ON CONFLICT DO NOTHING;

-- HOW PRINCIPLES: System Change
INSERT INTO job_how_principles (job_id, sort_order, title, body) VALUES
('system-change', 1, 'Research-informed', 'JSP does not produce research for its own sake. We don''t build solutions for theoretical applications. Every study, each project, every innovation is designed to produce outcomes that practitioners can act on. The bridge between what we know and what people do is JSP''s contribution to the field.'),
('system-change', 2, 'Four pillars as portfolio discipline', 'All JSP initiatives align with at least one of four pillars. This structure ensures growth is coherent and mission-aligned, not just responsive to funding availability. If an opportunity does not connect to a pillar, that is a signal to examine the fit carefully.'),
('system-change', 3, 'Vision beyond Projects', 'Embedded in every employee''s growth plan is the ability to expand their vision from what they are doing on this project, to how it impacts the field. What can we learn from this interaction that can help us inform others. How do we build a depth of knowledge that crosses jurisdictional boundaries, helping others learn from innovations across the world.'),
('system-change', 4, 'Adjacent sectors expand system change reach', 'Criminal justice reform funding is shifting toward upstream causes. JSP''s expansion into housing, behavioral health, economic mobility, and education is recognition that the systems feeding incarceration need to change so that the criminal and juvenile justice systems can shift as well.'),
('system-change', 5, 'Lessons learned feed future impact', 'Every project closeout generates lessons that inform the next proposal, project design, and field conversation. System change accumulates — each project is a contribution to a longer arc.')
ON CONFLICT DO NOTHING;

-- HOW PRINCIPLES: Innovative Work
INSERT INTO job_how_principles (job_id, sort_order, title, body) VALUES
('innovative-work', 1, 'Innovation happens within projects and between them', 'The most innovative work at JSP often emerges from recognizing patterns across projects that no single project team would see. Cross-project integration — connecting findings from a pretrial study to an emerging adult caseload — is where genuine insight is generated.'),
('innovative-work', 2, 'Impact over Projects', 'JSP is moving from individual calls for action to field catalyst. Products — the CRMC, validated assessment tools, curricula, frameworks — create leverage beyond any single engagement. Innovative Work combined with quality staff and trusted relationships produces products that extend well beyond the initial project.'),
('innovative-work', 3, 'Technology as force multiplier', 'AI-powered tools for practitioners, immersive learning environments, and data visualization platforms are not peripheral to the mission — they are how the mission scales. Developing technology fluency internally is as important as developing research fluency.'),
('innovative-work', 4, 'Adjacent sectors as innovation surfaces', 'Housing, behavioral health, economic mobility, and education are adjacent systems where the same design principles apply and where fresh perspectives on justice reform can be generated.'),
('innovative-work', 5, 'Field advancement requires a public presence', 'Innovation that stays inside JSP is not field innovation. Publications, speaking, Substack writing, and social media are how JSP''s innovative thinking reaches practitioners, funders, and policymakers who can apply it.')
ON CONFLICT DO NOTHING;

-- HOW CONNECTION TEXT
INSERT INTO job_how_connection (job_id, body) VALUES
('thriving-staff', 'Thriving Staff leads to better outcomes. We cannot do innovative work without employees that are thriving. We create an immersive environment where learning is not an event, but it is the culture of the organization--embedding learning across interactions, experiences, and people.'),
('trusted-partnerships', 'Trusted partnerships are not transactions. They are relationships in motion — and that means they need to be tended, examined, and refined continuously. JSP builds structured moments of reflection into every project: framing conversations, calibration checks, external kickoffs designed around partner alignment, and explicit space to surface risk, confusion, and misalignment before they become problems.'),
('system-change', 'Every project is a system change contribution. The quality and reach of that contribution depends on how well JSP staffs the work (Thriving Staff) and how widely the findings are amplified (Field Catalyst).'),
('innovative-work', 'Innovative Work sits at the intersection of Project Delivery (where research and methodology development happens) and Communications (where findings and tools reach the field). It also draws on Staff Development — employees are the organizational resources who can see across projects and generate the cross-pillar connections that drive genuine innovation.')
ON CONFLICT DO NOTHING;

-- WHAT TOOLS: Thriving Staff
INSERT INTO job_what_tools (job_id, sort_order, name, description, tag, system_name) VALUES
('thriving-staff', 1, 'Skills Inventory', '82 skills across 8 categories, self-rated + director-rated annually', 'Assessment', 'Annual'),
('thriving-staff', 2, 'Practice Profiles', 'Four-dimension, six-level rubric — versions for project staff, admin, and coordinators', 'Framework', 'Reference'),
('thriving-staff', 3, 'Employee Investment Plan', 'Initial assessment to development plan to monthly check-ins to quarterly reviews to 2-year merit review', 'Process', 'Asana + Paychex'),
('thriving-staff', 4, 'Three-Way Vortex', 'DSIC + DII + EVP making project assignment decisions at the intersection of all three lenses', 'Decision Process', 'Ongoing'),
('thriving-staff', 5, 'Short-Term Coaching Plan', 'Targeted, time-bound coaching for staff needing support in specific performance areas', 'Policy', 'DSIC-led'),
('thriving-staff', 6, 'Learning Teams', 'Standing and ad hoc teams building connection and skill across the organization', 'Culture', 'Ongoing')
ON CONFLICT DO NOTHING;

-- WHAT TOOLS: Trusted Partnerships
INSERT INTO job_what_tools (job_id, sort_order, name, description, tag, system_name) VALUES
('trusted-partnerships', 1, 'HubSpot — Funder Pipeline', 'Prospect through stewardship — all funder contacts, opportunities, and grant records', 'CRM', 'HubSpot'),
('trusted-partnerships', 2, 'Proposal Development Process', 'Go/No-Go to proposal team to narrative, budget, review, submission, debrief', 'Process', 'HubSpot + Asana'),
('trusted-partnerships', 3, 'Grant Management System', 'Award through closeout — budget codes, reporting schedules, deliverable tracking', 'System', 'HubSpot + Financial'),
('trusted-partnerships', 4, 'Decision Matrix', 'Role-based authority across all fundraising types — RFPs, BD, individual donors, speaking', 'Framework', 'Reference'),
('trusted-partnerships', 5, 'Comms Amplification Plan', 'DIS-led content calendar tied to project milestones and funder announcements', 'Process', 'Asana Comms Board'),
('trusted-partnerships', 6, 'Stewardship Calendar', 'Post-project touchpoint schedule ensuring relationships remain warm and growing', 'System', 'HubSpot')
ON CONFLICT DO NOTHING;

-- WHAT TOOLS: System Change
INSERT INTO job_what_tools (job_id, sort_order, name, description, tag, system_name) VALUES
('system-change', 1, 'Project Lifecycle', 'Contract execution through lessons learned — the full arc of how JSP delivers', 'Framework', 'Asana + HubSpot'),
('system-change', 2, 'Asana Project Template', 'Standard setup: workplan, deliverables, reporting milestones, comms, closeout tasks', 'Template', 'Asana'),
('system-change', 3, 'CRMC Framework', 'Coach-Referee Model for Change — JSP''s flagship organizational change methodology', 'Product', 'JSP IP'),
('system-change', 4, 'Four-Pillar Portfolio Tracker', 'Active projects mapped to pillars with status, funding, and impact metrics', 'Dashboard', 'HubSpot'),
('system-change', 5, 'Lessons Learned Protocol', 'Structured debrief that converts project experience into institutional knowledge', 'Process', 'HubSpot + Dropbox'),
('system-change', 6, 'Quality Review Process', 'Project Director-led review of deliverable quality against proposal commitments', 'Process', 'Asana')
ON CONFLICT DO NOTHING;

-- WHAT TOOLS: Innovative Work
INSERT INTO job_what_tools (job_id, sort_order, name, description, tag, system_name) VALUES
('innovative-work', 1, 'CRMC — Coach-Referee Model', 'Flagship innovation — organizational change methodology spanning law enforcement through parole', 'Product', 'JSP IP'),
('innovative-work', 2, 'Technology Assessment Process', 'Structured evaluation of AI and technology tools for integration into research and TA', 'Process', 'Emerging'),
('innovative-work', 3, 'Product Development Pipeline', 'Tracking JSP products from concept through validation, packaging, and delivery', 'System', 'HubSpot'),
('innovative-work', 4, 'Immersive Curriculum Framework', 'Employment readiness curriculum using immersive technology for incarcerated people (NIC)', 'Product', 'Active'),
('innovative-work', 5, 'Field Advancement Tracker', 'Publications, speaking, media mentions, and social reach — JSP''s field footprint', 'Dashboard', 'HubSpot'),
('innovative-work', 6, 'Cross-Project Insight Protocol', 'Process for connecting findings across active projects to generate field-level insights', 'Process', 'Connecting Through the Work')
ON CONFLICT DO NOTHING;

-- DEFAULT DOCUMENTS
INSERT INTO documents (name, description, function_area, doc_type, security_level, is_default, doc_date) VALUES
('Practice Profile — Project Staff', 'Four-dimension, six-level rubric for project staff development', 'staff-development', 'Reference', 'all', true, '2025'),
('Decision Matrix', 'Role-based decision authority across all organizational functions', 'operations', 'Policy', 'executive', true, '2025'),
('Asana Standard Operating Procedure', 'How to set up and manage projects in Asana', 'project-delivery', 'SOP', 'all', true, '2025'),
('Grants Management Framework', 'End-to-end grants management process and HubSpot configuration', 'funder-development', 'Framework', 'executive', true, '2025'),
('Strategic Plan 2026–2030', 'Better Systems. Brighter Futures. Five-year strategic direction', 'operations', 'Strategy', 'all', true, '2025'),
('Employee Investment Plan Framework', 'EIP structure, skills inventory, and growth planning process', 'staff-development', 'Framework', 'executive', true, '2025'),
('Short-Term Coaching Plan Policy', 'STCP policy and process for performance support', 'staff-development', 'Policy', 'executive', true, '2025'),
('Project Lifecycle & Learning System', 'Full project lifecycle phases, triggers, and learning architecture', 'project-delivery', 'Framework', 'all', true, '2025'),
('DEIB Philosophy', 'JSP approach to diversity, equity, inclusion, and belonging', 'operations', 'Reference', 'all', true, '2025'),
('Funder Lifecycle — Field Mapping Matrix', 'Data field mapping across HubSpot, Asana, and Financial system', 'funder-development', 'Reference', 'executive', true, '2025'),
('Professional Development Policy', 'Framework for professional development opportunities at JSP', 'staff-development', 'Policy', 'all', true, '2025'),
('Learning Environment Policy', 'JSP commitment to building a learning environment for all staff', 'staff-development', 'Policy', 'all', true, '2025'),
('Brand Guidelines', 'JSP brand book — colors, fonts, logo, imagery, and tone of voice', 'communications', 'Reference', 'all', true, '2025'),
('Staff Skills Inventory', 'Current staff ratings across 82 skills — used for EIP and assignment', 'staff-development', 'Data', 'executive', true, '2025'),
('Disciplinary Process', 'JSP disciplinary process policy and procedures', 'staff-development', 'Policy', 'executive', true, '2025')
ON CONFLICT DO NOTHING;
