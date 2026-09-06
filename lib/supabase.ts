import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Cliente para uso no frontend (com anon key)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Cliente para uso no backend (com service role key)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Verificar se as variáveis estão configuradas
export function isSupabaseConfigured(): boolean {
  return !!(supabaseUrl && supabaseAnonKey && supabaseServiceKey);
}
