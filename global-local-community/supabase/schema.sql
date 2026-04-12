create extension if not exists pgcrypto;

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  display_name text not null,
  bio text,
  city text not null default 'Daegu',
  origin_country text,
  occupation text,
  avatar_url text,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references profiles(id) on delete cascade,
  category text not null check (category in ('housing','jobs','daily-life','events','marketplace')),
  title text not null,
  body text not null,
  city text not null default 'Daegu',
  district text,
  tags text[] not null default '{}',
  image_urls text[] not null default '{}',
  ai_label text,
  ai_score numeric(5,4),
  ai_explanation text,
  moderation_status text not null default 'published' check (moderation_status in ('published','review','hidden')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts(id) on delete cascade,
  author_id uuid not null references profiles(id) on delete cascade,
  body text not null,
  deleted_at timestamptz,
  deleted_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists comment_events (
  id bigint generated always as identity primary key,
  comment_id uuid references comments(id) on delete cascade,
  actor_id uuid references profiles(id) on delete set null,
  event_type text not null check (event_type in ('created','edited','deleted')),
  old_body text,
  new_body text,
  created_at timestamptz not null default now()
);

create table if not exists likes (
  user_id uuid not null references profiles(id) on delete cascade,
  post_id uuid not null references posts(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, post_id)
);

create table if not exists bookmarks (
  user_id uuid not null references profiles(id) on delete cascade,
  post_id uuid not null references posts(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, post_id)
);

create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references profiles(id) on delete cascade,
  post_id uuid references posts(id) on delete cascade,
  comment_id uuid references comments(id) on delete cascade,
  reason text not null,
  details text,
  status text not null default 'open' check (status in ('open','reviewing','resolved')),
  created_at timestamptz not null default now(),
  check ((post_id is not null) <> (comment_id is not null))
);

create unique index if not exists idx_reports_unique_post_reporter on reports(reporter_id, post_id) where post_id is not null;
create unique index if not exists idx_reports_unique_comment_reporter on reports(reporter_id, comment_id) where comment_id is not null;

create table if not exists workflow_events (
  id bigint generated always as identity primary key,
  event_type text not null,
  entity_type text not null,
  entity_id uuid,
  payload jsonb not null default '{}'::jsonb,
  processed_at timestamptz,
  created_at timestamptz not null default now()
);

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

create table if not exists moderator_notes (
  id bigint generated always as identity primary key,
  target_user_id uuid references profiles(id) on delete cascade,
  report_id uuid references reports(id) on delete cascade,
  post_id uuid references posts(id) on delete cascade,
  comment_id uuid references comments(id) on delete cascade,
  author_id uuid references profiles(id) on delete set null,
  note text not null,
  created_at timestamptz not null default now()
);

create table if not exists user_sanctions (
  id bigint generated always as identity primary key,
  user_id uuid not null references profiles(id) on delete cascade,
  sanction_type text not null check (sanction_type in ('warn','mute','suspend','ban')),
  reason text not null,
  note text,
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  active boolean not null default true,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists user_settings (
  user_id uuid primary key references profiles(id) on delete cascade,
  notify_likes boolean not null default true,
  notify_comments boolean not null default true,
  marketing_consent boolean not null default true,
  third_party_email_consent boolean not null default true,
  origin_country text,
  life_stage text,
  immediate_need text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists user_roles (
  user_id uuid not null references profiles(id) on delete cascade,
  role text not null check (role in ('admin','moderator')),
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  primary key (user_id, role)
);

create table if not exists request_logs (
  id bigint generated always as identity primary key,
  user_id uuid references profiles(id) on delete set null,
  ip text,
  path text not null,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists idx_posts_city_category_created_at on posts(city, category, created_at desc);
create index if not exists idx_posts_author_id_created_at on posts(author_id, created_at desc);
create index if not exists idx_comments_post_id_created_at on comments(post_id, created_at asc);
create index if not exists idx_reports_status_created_at on reports(status, created_at desc);
create index if not exists idx_workflow_events_event_type_processed on workflow_events(event_type, processed_at, created_at desc);
create index if not exists idx_post_media_post_id_created_at on post_media(post_id, created_at desc);
create index if not exists idx_moderator_notes_target_user_created_at on moderator_notes(target_user_id, created_at desc);
create index if not exists idx_user_sanctions_user_active on user_sanctions(user_id, active, created_at desc);
create index if not exists idx_user_roles_role_user_id on user_roles(role, user_id);
