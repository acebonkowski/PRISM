/**
 * supabaseClient.js — Supabase Client Initialization
 *
 * ROLE IN DATA FLOW:
 *   Provides a single shared Supabase client instance to any component
 *   that needs to read from the `reports` table.
 *
 * USAGE:
 *   import { supabase } from './supabaseClient';
 *   const { data } = await supabase.from('reports').select('*').eq('id', uuid).single();
 *
 * SETUP:
 *   1. Go to https://app.supabase.com → your project → Settings → API
 *   2. Copy "Project URL" and the "publishable" key
 *   3. Set VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY in .env.local
 *   4. Make sure the `reports` table has RLS enabled with a policy that
 *      allows public SELECT (see supabase/migrations) — the publishable
 *      key only gets as far as RLS policies let it.
 *
 * SECURITY:
 *   Never use the secret key here. Vite inlines any VITE_-prefixed var
 *   into the client bundle, so the secret key would be readable by any
 *   visitor via page source — it bypasses RLS entirely and would hand
 *   out full read/write/delete access to the database.
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL             = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  console.warn('[Prism] Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to .env.local');
}

export const supabase = (SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY)
  ? createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)
  : null;
