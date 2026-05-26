import { createClient } from '@supabase/supabase-js';

// This explicitly points to your unique database instead of the main website
const supabaseUrl = 'https://supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
