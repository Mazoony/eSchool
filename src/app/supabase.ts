import { createBrowserClient } from '@supabase/ssr'

// Create a singleton Supabase client instance.
const supabaseClient = createBrowserClient(
  'https://ouiqvgksyauvnzabflro.supabase.co',
  'sb_publishable_VOL0IKjGErubINbqFufkwg_zbCnPau6'
);

// Export a function that returns the singleton instance.
export function supabase() {
  return supabaseClient;
}
