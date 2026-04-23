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
 *   2. Copy "Project URL" and "service_role" secret key
 *   3. Replace the TODO values below
 *
 * SECURITY:
 *   The service role key bypasses RLS and has full table access.
 *   For hackathon use this is fine — never commit this to a public repo.
 */
import { createClient } from '@supabase/supabase-js';

/**
 * TODO: Replace with your Supabase project URL.
 * Format: https://xxxxxxxxxxxxxxxxxxxx.supabase.co
 */
const SUPABASE_URL        = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_SECRET_KEY = import.meta.env.VITE_SUPABASE_SECRET_KEY;

if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
  console.warn('[Prism] Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_SECRET_KEY to .env.local');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY);
