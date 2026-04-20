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
const SUPABASE_URL = 'https://fogkffpcbedujdymgpwu.supabase.co';

/**
 * TODO: Replace with your Supabase service role (secret) key.
 * Found at: https://app.supabase.com → Your Project → Settings → API → service_role secret
 * NOTE: Do not commit this to a public repo — it has full table access.
 */
const SUPABASE_SECRET_KEY = '__SUPABASE_SECRET_KEY__';

// Validate at import time so missing config fails loudly during development
if (SUPABASE_URL.startsWith('TODO') || SUPABASE_SECRET_KEY.startsWith('TODO')) {
  console.warn(
    '[Prism] Supabase is not configured. ' +
    'Open src/supabaseClient.js and replace the TODO placeholders.'
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY);
