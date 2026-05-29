import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  console.warn('[taproom] Supabase env vars missing; realtime will not connect.')
}

// Anonymous Realtime relay only: no auth session, no DB tables. The key is a
// public publishable key, safe to ship in the client bundle.
export const supabase = createClient(url, anonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
  realtime: { params: { eventsPerSecond: 20 } },
})
