alter table profiles enable row level security;
alter table posts enable row level security;
alter table comments enable row level security;
alter table likes enable row level security;
alter table bookmarks enable row level security;
alter table reports enable row level security;
alter table workflow_events enable row level security;
alter table post_media enable row level security;
alter table moderator_notes enable row level security;
alter table user_sanctions enable row level security;
alter table user_settings enable row level security;
alter table user_roles enable row level security;
alter table request_logs enable row level security;

create policy if not exists profiles_public_read on profiles for select using (true);
create policy if not exists profiles_owner_update on profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy if not exists profiles_owner_insert on profiles for insert with check (auth.uid() = id);

create policy if not exists posts_public_read_published on posts for select using (moderation_status = 'published' or author_id = auth.uid());
create policy if not exists posts_owner_insert on posts for insert with check (author_id = auth.uid());
create policy if not exists posts_owner_update on posts for update using (author_id = auth.uid()) with check (author_id = auth.uid());
create policy if not exists posts_owner_delete on posts for delete using (author_id = auth.uid());

create policy if not exists comments_public_read_visible on comments for select using (deleted_at is null or author_id = auth.uid());
create policy if not exists comments_owner_insert on comments for insert with check (author_id = auth.uid());
create policy if not exists comments_owner_update on comments for update using (author_id = auth.uid()) with check (author_id = auth.uid());
create policy if not exists comments_owner_delete on comments for delete using (author_id = auth.uid());

create policy if not exists likes_owner_read on likes for select using (user_id = auth.uid());
create policy if not exists likes_owner_insert on likes for insert with check (user_id = auth.uid());
create policy if not exists likes_owner_delete on likes for delete using (user_id = auth.uid());

create policy if not exists bookmarks_owner_read on bookmarks for select using (user_id = auth.uid());
create policy if not exists bookmarks_owner_insert on bookmarks for insert with check (user_id = auth.uid());
create policy if not exists bookmarks_owner_delete on bookmarks for delete using (user_id = auth.uid());

create policy if not exists reports_owner_insert on reports for insert with check (reporter_id = auth.uid());
create policy if not exists reports_owner_read on reports for select using (reporter_id = auth.uid());

create policy if not exists post_media_public_read_published on post_media for select using (moderation_status = 'published');

create policy if not exists user_settings_owner_read on user_settings for select using (user_id = auth.uid());
create policy if not exists user_settings_owner_insert on user_settings for insert with check (user_id = auth.uid());
create policy if not exists user_settings_owner_update on user_settings for update using (user_id = auth.uid()) with check (user_id = auth.uid());
