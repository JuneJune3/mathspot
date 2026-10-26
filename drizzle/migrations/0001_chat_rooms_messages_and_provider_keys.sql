create table public.chat_rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 40),
  created_by uuid,
  created_at timestamptz not null default now()
);

create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.chat_rooms(id) on delete cascade,
  user_id uuid not null,
  username text not null default 'user',
  content text not null check (char_length(btrim(content)) between 1 and 1000),
  created_at timestamptz not null default now()
);

create table public.user_api_keys (
  user_id uuid not null,
  provider text not null check (provider in ('hyperbrowser','steel','kernel')),
  api_key text not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, provider)
);

create index chat_messages_room_created_idx on public.chat_messages (room_id, created_at);

GRANT SELECT, INSERT, DELETE ON public.chat_rooms TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.chat_messages TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_api_keys TO authenticated;
GRANT ALL ON public.chat_rooms TO service_role;
GRANT ALL ON public.chat_messages TO service_role;
GRANT ALL ON public.user_api_keys TO service_role;

ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_api_keys ENABLE ROW LEVEL SECURITY;

create policy "Signed-in users can read rooms"
  on public.chat_rooms for select to authenticated using (true);
create policy "Signed-in users can create rooms"
  on public.chat_rooms for insert to authenticated with check (auth.uid() = created_by);
create policy "Room owners can delete their rooms"
  on public.chat_rooms for delete to authenticated using (auth.uid() = created_by);

create policy "Signed-in users can read messages"
  on public.chat_messages for select to authenticated using (true);
create policy "Users post their own messages"
  on public.chat_messages for insert to authenticated with check (auth.uid() = user_id);
create policy "Users delete their own messages"
  on public.chat_messages for delete to authenticated using (auth.uid() = user_id);

create policy "Users read their own provider keys"
  on public.user_api_keys for select to authenticated using (auth.uid() = user_id);
create policy "Users save their own provider keys"
  on public.user_api_keys for insert to authenticated with check (auth.uid() = user_id);
create policy "Users update their own provider keys"
  on public.user_api_keys for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users delete their own provider keys"
  on public.user_api_keys for delete to authenticated using (auth.uid() = user_id);