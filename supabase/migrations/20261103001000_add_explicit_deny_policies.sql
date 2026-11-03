create policy "Deny client access" on public.contact_requests for all to anon, authenticated using (false) with check (false);
create policy "Deny client access" on public.reservation_requests for all to anon, authenticated using (false) with check (false);
create policy "Deny client access" on public.newsletter_signups for all to anon, authenticated using (false) with check (false);
create policy "Deny client access" on public.submission_rate_limits for all to anon, authenticated using (false) with check (false);
