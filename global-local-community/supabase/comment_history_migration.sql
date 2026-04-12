create table if not exists comment_events (
  id bigint generated always as identity primary key,
  comment_id uuid references comments(id) on delete cascade,
  actor_id uuid references profiles(id) on delete set null,
  event_type text not null check (event_type in ('created','edited','deleted')),
  old_body text,
  new_body text,
  created_at timestamptz not null default now()
);

create index if not exists idx_comment_events_comment_id_created_at on comment_events(comment_id, created_at desc);
