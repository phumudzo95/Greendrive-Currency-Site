import { createClient } from "@supabase/supabase-js";

// This client is only instantiated in Server Actions / Route Handlers.
// It uses the anon key — RLS policies on the applications table permit
// anonymous inserts but deny all reads, so this is safe for the public form.
// When an admin panel is built, swap to service_role key via
// SUPABASE_SERVICE_ROLE_KEY environment variable for that client only.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export function createServerClient() {
  return createClient(supabaseUrl, supabaseAnonKey);
}
