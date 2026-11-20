-- Homestead schema. Demo-grade RLS (no auth). See .kiro/specs/homestead/design.md.

create extension if not exists pgcrypto;

create table public.homesteads (
  id uuid primary key default gen_random_uuid(),
  neighbourhood_slug text not null check (neighbourhood_slug in
    ('siliconvalley','heartland','soho','sunsetstrip','enchantedforest','motorcity')),
  name text not null check (name ~ '^[a-z0-9]([a-z0-9-]{1,22})[a-z0-9]$'
    and name not in ('admin','root','support','homestead','explore','new','build','api','www')),
  title text not null default '' check (char_length(title) <= 120),
  theme jsonb not null default '{}'::jsonb,
  blocks jsonb not null default '[]'::jsonb,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  unique (neighbourhood_slug, name)
);

create table public.guestbook_entries (
  id uuid primary key default gen_random_uuid(),
  homestead_id uuid not null references public.homesteads(id) on delete cascade,
  author_name text not null check (char_length(author_name) between 1 and 50),
  message text not null check (char_length(message) between 1 and 500),
  created_at timestamptz not null default now()
);
create index guestbook_entries_homestead_idx on public.guestbook_entries (homestead_id, created_at desc);

create table public.page_views (
  homestead_id uuid primary key references public.homesteads(id) on delete cascade,
  count bigint not null default 0
);

-- The only way to change a counter: atomic upsert, returns the new count.
create or replace function public.increment_page_views(hid uuid)
returns bigint
language sql
security definer
set search_path = public
as $$
  insert into public.page_views (homestead_id, count) values (hid, 1)
  on conflict (homestead_id) do update set count = public.page_views.count + 1
  returning count;
$$;
grant execute on function public.increment_page_views(uuid) to anon, authenticated;

-- Row Level Security
alter table public.homesteads enable row level security;
alter table public.guestbook_entries enable row level security;
alter table public.page_views enable row level security;

-- Drafts must stay readable so the builder can reload an unpublished page; the app hides unpublished pages from
-- the public route and from the webring. Demo-grade: no auth, so this cannot be enforced per owner.
create policy "read homesteads" on public.homesteads for select using (true);
create policy "claim an address" on public.homesteads for insert with check (true);
create policy "edit a homestead" on public.homesteads for update using (true) with check (true);

create policy "read guestbook" on public.guestbook_entries for select using (true);
create policy "sign guestbook" on public.guestbook_entries for insert
  with check (char_length(author_name) between 1 and 50 and char_length(message) between 1 and 500);
create policy "owner removes entries" on public.guestbook_entries for delete using (true);

create policy "read counters" on public.page_views for select using (true);
-- no insert/update policy: counters change only through increment_page_views()
