import { createClient } from '@supabase/supabase-js';

// Hardcoding the URL directly fixes Netlify's local pathing bugs
const supabaseUrl = 'https://supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

