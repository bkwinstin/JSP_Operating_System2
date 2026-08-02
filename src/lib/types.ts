export type UserRole = 'staff' | 'executive' | 'jsp_admin' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  display_name: string;
  created_at: string;
  last_login: string;
}

export interface Job {
  id: string;
  name: string;
  color: string;
  light: string;
  dark: string;
  wheel_start: number;
  wheel_end: number;
  sort_order: number;
  function_area: string;
  why?: JobWhy;
  howPrinciples?: JobHowPrinciple[];
  howConnection?: JobHowConnection;
  whatTools?: JobWhatTool[];
}

export interface JobWhy {
  id: string;
  job_id: string;
  statement: string;
  body: string;
  anchor: string;
  values: string[];
}

export interface JobHowPrinciple {
  id: string;
  job_id: string;
  sort_order: number;
  title: string;
  body: string;
}

export interface JobHowConnection {
  id: string;
  job_id: string;
  body: string;
}

export interface JobWhatTool {
  id: string;
  job_id: string;
  sort_order: number;
  name: string;
  description: string;
  tag: string;
  system_name: string;
  principle_id?: string;
  document_id?: string;
}

export interface Document {
  id: string;
  name: string;
  description: string;
  function_area: string;
  doc_type: string;
  security_level: 'all' | 'jsp_admin' | 'executive';
  storage_url?: string;
  file_name?: string;
  dropbox_url?: string;
  canva_url?: string;
  asana_url?: string;
  node_key?: string;
  catalyst_key?: string;
  doc_date: string;
  is_default: boolean;
  created_at: string;
  principle_id?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface ExternalLink {
  id: string;
  job_id: string;
  key: string;
  label: string;
  url: string;
}

export const FN_COLORS: Record<string, { c: string; l: string; label: string }> = {
  'staff-development':  { c: '#90226C', l: '#F0D9E8', label: 'Staff Dev' },
  'operations':         { c: '#1F1D1C', l: '#ECEAE5', label: 'Operations' },
  'project-delivery':   { c: '#F3755E', l: '#FDE8E2', label: 'Delivery' },
  'funder-development': { c: '#FABE3D', l: '#FEF3CC', label: 'Funder Dev' },
  'communications':     { c: '#6A453A', l: '#EDE0DC', label: 'Comms' },
};

export const ROLE_META: Record<UserRole, { label: string; bg: string; tc: string }> = {
  staff:     { label: 'Line Staff',        bg: '#EDE0DC', tc: '#2E1710' },
  executive: { label: 'Executive Staff',   bg: '#FEF3CC', tc: '#7A5500' },
  jsp_admin: { label: 'JSP Administration', bg: '#D6EAF3', tc: '#1A4F66' },
  admin:     { label: 'Admin',             bg: '#FDE8E2', tc: '#7A2410' },
};
