-- Owner edit token. Replaces the open `using (true)` update/delete policies from the init migration.
--
-- Design: at claim time the browser generates a random 256-bit token, keeps it in localStorage and sends only
-- its SHA-256 hex hash, which is stored in homesteads.edit_token_hash. Changes then go through security-definer
-- functions that receive the token, hash it and compare. Anon can no longer update or delete rows directly, and
-- cannot read the hash column. Pages created before this migration have no hash and become read-only
-- (see BLOCKERS.md). Seed pages have no hash either, so nobody can edit them.

alter table public.homesteads add column if not exists edit_token_hash text
  check (edit_token_hash is null or edit_token_hash ~ '^[0-9a-f]{64}$');

-- Remove the open policies.
drop policy if exists "edit a homestead" on public.homesteads;
drop policy if exists "owner removes entries" on public.guestbook_entries;

-- Table privileges: no direct update/delete for API roles; the hash column is not selectable.
revoke all on public.homesteads from anon, authenticated;
revoke all on public.guestbook_entries from anon, authenticated;
revoke all on public.page_views from anon, authenticated;

grant select (id, neighbourhood_slug, name, title, theme, blocks, published, created_at)
  on public.homesteads to anon, authenticated;
grant insert on public.homesteads to anon, authenticated;
grant select, insert on public.guestbook_entries to anon, authenticated;
grant select on public.page_views to anon, authenticated;

create or replace function public.hs_token_matches(hid uuid, token text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.homesteads h
    where h.id = hid
      and h.edit_token_hash is not null
      and h.edit_token_hash = encode(sha256(convert_to(coalesce(token, ''), 'utf8')), 'hex')
  );
$$;
revoke all on function public.hs_token_matches(uuid, text) from public, anon, authenticated;

create or replace function public.update_homestead(
  hid uuid, token text, p_title text, p_theme jsonb, p_blocks jsonb, p_published boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.hs_token_matches(hid, token) then
    raise exception 'not the owner of this homestead' using errcode = '42501';
  end if;
  if octet_length(p_blocks::text) > 500000 or octet_length(p_theme::text) > 20000 then
    raise exception 'page is too large' using errcode = '54000';
  end if;
  update public.homesteads
     set title = p_title, theme = p_theme, blocks = p_blocks, published = p_published
   where id = hid;
end;
$$;
grant execute on function public.update_homestead(uuid, text, text, jsonb, jsonb, boolean) to anon, authenticated;

create or replace function public.delete_guestbook_entry(entry_id uuid, token text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare hid uuid;
begin
  select homestead_id into hid from public.guestbook_entries where id = entry_id;
  if hid is null then return; end if;
  if not public.hs_token_matches(hid, token) then
    raise exception 'not the owner of this homestead' using errcode = '42501';
  end if;
  delete from public.guestbook_entries where id = entry_id;
end;
$$;
grant execute on function public.delete_guestbook_entry(uuid, text) to anon, authenticated;

-- Sample data helper: sets an initial counter for an unclaimed (no token) page, only if it has no counter yet.
create or replace function public.seed_page_views(hid uuid, n bigint)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.page_views (homestead_id, count)
  select h.id, least(greatest(n, 0), 10000)
    from public.homesteads h
   where h.id = hid and h.edit_token_hash is null
  on conflict (homestead_id) do nothing;
$$;
grant execute on function public.seed_page_views(uuid, bigint) to anon, authenticated;

-- increment_page_views keeps working unchanged (security definer, granted in the init migration).
grant execute on function public.increment_page_views(uuid) to anon, authenticated;
