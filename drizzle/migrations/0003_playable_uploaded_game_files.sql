-- An approved upload may be opened by anyone; the check runs as a
-- security-definer function so storage policies never recurse into RLS.
create or replace function public.is_approved_game_file(_path text)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.game_submissions
    where status = 'approved' and file_path = _path
  );
$$;

create policy "game files: approved uploads are playable by members"
  on storage.objects for select to authenticated
  using (bucket_id = 'game-files' and public.is_approved_game_file(name));

create policy "game files: approved uploads are playable by guests"
  on storage.objects for select to anon
  using (bucket_id = 'game-files' and public.is_approved_game_file(name));

-- A declined or withdrawn upload stops being readable straight away.
create or replace function public.game_submissions_drop_file()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'declined' and old.file_path is not null then
    delete from storage.objects
      where bucket_id = 'game-files' and name = old.file_path;
  end if;
  return new;
end;
$$;
create trigger game_submissions_drop_file after update on public.game_submissions
  for each row execute function public.game_submissions_drop_file();
