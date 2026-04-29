-- Stash: initial schema
-- Run once in Supabase SQL Editor.
-- Single-user model: authorization is enforced by the app's passcode session.
-- We still enable RLS and use the service-role key only on the server.

create extension if not exists "uuid-ossp";

-- ---------- folders ----------
create table if not exists public.folders (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  parent_id   uuid references public.folders(id) on delete cascade,
  icon        text not null default 'folder',
  color       text not null default 'indigo',
  pinned      boolean not null default false,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

create index if not exists folders_parent_idx on public.folders(parent_id);

-- ---------- items ----------
create table if not exists public.items (
  id            uuid primary key default uuid_generate_v4(),
  folder_id     uuid references public.folders(id) on delete set null,
  type          text not null check (type in ('note','image','file','link')),
  title         text,
  body          text,
  url           text,
  storage_path  text,
  mime_type     text,
  size_bytes    bigint,
  pinned        boolean not null default false,
  favorite      boolean not null default false,
  due_at        timestamptz,
  reminder_at   timestamptz,
  deleted_at    timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  search        tsvector
);

create index if not exists items_folder_idx     on public.items(folder_id);
create index if not exists items_type_idx       on public.items(type);
create index if not exists items_favorite_idx   on public.items(favorite) where favorite = true;
create index if not exists items_pinned_idx     on public.items(pinned)   where pinned   = true;
create index if not exists items_deleted_idx    on public.items(deleted_at);
create index if not exists items_created_idx    on public.items(created_at desc);
create index if not exists items_search_idx     on public.items using gin(search);

-- Full-text search trigger: keep `search` in sync with title/body/url/mime_type.
create or replace function public.items_search_trigger()
returns trigger language plpgsql as $$
begin
  new.search :=
    setweight(to_tsvector('simple', coalesce(new.title, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(new.body,  '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(new.url,   '')), 'C') ||
    setweight(to_tsvector('simple', coalesce(new.mime_type, '')), 'D');
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists items_search_update on public.items;
create trigger items_search_update
before insert or update on public.items
for each row execute function public.items_search_trigger();

-- ---------- tags (v2-ready) ----------
create table if not exists public.tags (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null unique,
  created_at  timestamptz not null default now()
);

create table if not exists public.item_tags (
  item_id uuid not null references public.items(id) on delete cascade,
  tag_id  uuid not null references public.tags(id)  on delete cascade,
  primary key (item_id, tag_id)
);

-- ---------- RLS ----------
-- We deny all anon/public access. The app uses the service-role key on the server
-- and gates access with its own passcode session. If you ever switch to multi-user
-- with Supabase Auth, replace these policies with user_id-scoped ones.
alter table public.folders   enable row level security;
alter table public.items     enable row level security;
alter table public.tags      enable row level security;
alter table public.item_tags enable row level security;

-- No policies => deny all for anon/authenticated. Service role bypasses RLS.

-- ---------- seed ----------
insert into public.folders (name, icon, color, sort_order)
values
  ('Inbox',    'inbox',    'slate',  0),
  ('Ideas',    'lightbulb','amber',  1),
  ('School',   'book',     'blue',   2),
  ('Plans',    'calendar', 'emerald',3)
on conflict do nothing;
