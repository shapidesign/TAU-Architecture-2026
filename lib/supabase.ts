import { createClient, SupabaseClient } from "@supabase/supabase-js";

// ponytail: anon key kept server-only (no NEXT_PUBLIC), acts as our API secret.
// Swap SUPABASE_KEY for the service_role key + tighten RLS if it ever leaks.
let client: SupabaseClient | null = null;

export function sb(): SupabaseClient {
  if (!client) {
    client = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!, {
      auth: { persistSession: false },
    });
  }
  return client;
}
