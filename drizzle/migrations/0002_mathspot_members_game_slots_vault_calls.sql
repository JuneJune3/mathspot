-- ===== Admin roles (separate table, never on profiles) =====
create type public.app_role as enum ('admin', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "user_roles: own rows readable" on public.user_roles
  for select to authenticated using (user_id = auth.uid());

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.user_roles where user_id = _user_id and role = _role
  );
$$;

-- ===== Game submissions (member uploads -> admin review) =====
create table public.game_submissions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null default 'Casual',
  description text not null default '',
  kind text not null default 'url',
  game_url text,
  file_path text,
  file_name text,
  status text not null default 'pending',
  submitted_by uuid not null,
  reviewed_by uuid,
  review_note text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  constraint game_submissions_kind_check check (kind in ('url', 'file')),
  constraint game_submissions_status_check check (status in ('pending', 'approved', 'declined'))
);
grant select, insert, update, delete on public.game_submissions to authenticated;
grant select on public.game_submissions to anon;
grant all on public.game_submissions to service_role;
alter table public.game_submissions enable row level security;

create policy "game_submissions: members submit their own" on public.game_submissions
  for insert to authenticated with check (submitted_by = auth.uid());
create policy "game_submissions: members see own plus approved" on public.game_submissions
  for select to authenticated using (
    status = 'approved' or submitted_by = auth.uid() or public.has_role(auth.uid(), 'admin')
  );
create policy "game_submissions: guests see approved" on public.game_submissions
  for select to anon using (status = 'approved');
create policy "game_submissions: members edit own pending" on public.game_submissions
  for update to authenticated using (submitted_by = auth.uid() and status = 'pending');
create policy "game_submissions: admins update" on public.game_submissions
  for update to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "game_submissions: admins delete" on public.game_submissions
  for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

-- Nobody but an admin (or the server) may flip a submission's status.
create or replace function public.guard_submission_review()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status is distinct from old.status
     and auth.uid() is not null
     and not public.has_role(auth.uid(), 'admin') then
    raise exception 'Only an admin can change a submission status';
  end if;
  return new;
end;
$$;
create trigger game_submissions_review_guard before update on public.game_submissions
  for each row execute function public.guard_submission_review();

-- ===== Live cloud browser slots (server-managed bookkeeping) =====
create table public.browser_sessions (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  session_id text not null,
  user_id uuid,
  url text not null default '',
  started_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  unique (provider, session_id)
);
grant all on public.browser_sessions to service_role;
grant select on public.browser_sessions to authenticated;
alter table public.browser_sessions enable row level security;
create policy "browser_sessions: own rows readable" on public.browser_sessions
  for select to authenticated using (user_id is not null and user_id = auth.uid());

-- ===== Password vault (owner only) =====
create table public.vault_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  site_name text not null,
  site_url text not null default '',
  username text not null default '',
  password text not null,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.vault_items to authenticated;
grant all on public.vault_items to service_role;
alter table public.vault_items enable row level security;
create policy "vault_items: owner only" on public.vault_items
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ===== Call rooms with join codes =====
create table public.call_rooms (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null default 'Call room',
  host_id uuid not null,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);
grant select, insert, update, delete on public.call_rooms to authenticated;
grant all on public.call_rooms to service_role;
alter table public.call_rooms enable row level security;
create policy "call_rooms: members can see rooms" on public.call_rooms
  for select to authenticated using (true);
create policy "call_rooms: members can host" on public.call_rooms
  for insert to authenticated with check (host_id = auth.uid());
create policy "call_rooms: members can refresh presence" on public.call_rooms
  for update to authenticated using (true);
create policy "call_rooms: host or admin can close" on public.call_rooms
  for delete to authenticated using (host_id = auth.uid() or public.has_role(auth.uid(), 'admin'));

-- ===== Uploaded game files =====
create policy "game files: members upload into their own folder"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'game-files' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "game files: owner or admin can read"
  on storage.objects for select to authenticated
  using (bucket_id = 'game-files' and (
    (storage.foldername(name))[1] = auth.uid()::text or public.has_role(auth.uid(), 'admin')
  ));
