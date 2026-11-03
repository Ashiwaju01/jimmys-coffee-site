create table if not exists public.submission_rate_limits (
  bucket_hash text not null,
  window_start timestamptz not null,
  request_count integer not null default 0 check (request_count >= 0),
  primary key (bucket_hash, window_start)
);

alter table public.submission_rate_limits enable row level security;
revoke all on public.submission_rate_limits from anon, authenticated, public;

create or replace function public.consume_submission_rate_limit(
  p_bucket_hash text,
  p_window_start timestamptz,
  p_limit integer default 8
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  if p_bucket_hash is null or length(p_bucket_hash) < 32 or p_limit < 1 or p_limit > 100 then
    raise exception 'invalid rate limit arguments';
  end if;
  insert into public.submission_rate_limits (bucket_hash, window_start, request_count)
  values (p_bucket_hash, p_window_start, 1)
  on conflict (bucket_hash, window_start)
  do update set request_count = public.submission_rate_limits.request_count + 1
  returning request_count into v_count;
  delete from public.submission_rate_limits where window_start < now() - interval '1 day';
  return v_count;
end;
$$;

revoke all on function public.consume_submission_rate_limit(text, timestamptz, integer) from public, anon, authenticated;
grant execute on function public.consume_submission_rate_limit(text, timestamptz, integer) to service_role;
