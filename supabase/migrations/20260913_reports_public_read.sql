-- Enables the webapp (now using the publishable key, not the secret key)
-- to read shared reports by UUID. Restricted to SELECT only — writes still
-- require the secret key server-side (e.g. from the future "Share" flow,
-- which should go through a Supabase Edge Function, not the browser).

alter table public.reports enable row level security;

create policy "Public can read reports"
  on public.reports
  for select
  using (true);
