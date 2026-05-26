import { createClient } from '@supabase/supabase-js';

// Hardcoding the credentials directly ignores the locked environment files
const supabaseUrl = 'https://supabase.co';
const supabaseAnonKey = 'sb_publishable_MZHSE5FgABcNKxhvSzpiwQ_vBpeEMur';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
