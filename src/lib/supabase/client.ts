// ─────────────────────────────────────────────────────────────
//  lib/supabase/client.ts  — Browser Supabase client
//  Use in: Client Components, hooks
// ─────────────────────────────────────────────────────────────
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
