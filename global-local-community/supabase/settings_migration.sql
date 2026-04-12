create table if not exists user_settings (
  user_id uuid primary key references profiles(id) on delete cascade,
  notify_likes boolean not null default true,
  notify_comments boolean not null default true,
  marketing_consent boolean not null default true,
  third_party_email_consent boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_user_settings_notify_likes on user_settings(notify_likes);
create index if not exists idx_user_settings_notify_comments on user_settings(notify_comments);
