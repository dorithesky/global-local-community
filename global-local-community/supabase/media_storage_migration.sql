alter table posts
  add column if not exists image_urls text[] not null default '{}';

create table if not exists post_media (
  id bigint generated always as identity primary key,
  post_id uuid not null references posts(id) on delete cascade,
  storage_path text not null,
  public_url text not null,
  mime_type text not null,
  size_bytes bigint not null,
  moderation_status text not null default 'published' check (moderation_status in ('published','review','hidden')),
  created_at timestamptz not null default now()
);

create index if not exists idx_post_media_post_id_created_at
  on post_media(post_id, created_at desc);
