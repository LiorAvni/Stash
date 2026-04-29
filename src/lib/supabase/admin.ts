import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

// Service-role client. Server-only. Bypasses RLS.
// Single-user app: we authorize with our own passcode session, not Supabase Auth.

let cached: SupabaseClient | null = null;

export function admin(): SupabaseClient {
  if (cached) return cached;
  cached = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
