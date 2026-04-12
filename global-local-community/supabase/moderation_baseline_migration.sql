alter table reports
  add column if not exists comment_id uuid references comments(id) on delete cascade;

alter table reports
  drop constraint if exists reports_post_or_comment_check;

alter table reports
  add constraint reports_post_or_comment_check
  check ((post_id is not null) <> (comment_id is not null));

create unique index if not exists idx_reports_unique_post_reporter
  on reports(reporter_id, post_id)
  where post_id is not null;

create unique index if not exists idx_reports_unique_comment_reporter
  on reports(reporter_id, comment_id)
  where comment_id is not null;

alter table user_settings
  add column if not exists origin_country text,
  add column if not exists life_stage text,
  add column if not exists immediate_need text;

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

create index if not exists idx_moderator_notes_target_user_created_at
  on moderator_notes(target_user_id, created_at desc);

create index if not exists idx_user_sanctions_user_active
  on user_sanctions(user_id, active, created_at desc);
