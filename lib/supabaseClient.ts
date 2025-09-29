import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../env'; // put these in env.ts

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
