create table if not exists request_logs (
  id bigint generated always as identity primary key,
  user_id uuid references profiles(id) on delete set null,
  ip text,
  path text not null,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists idx_request_logs_user_id_created_at on request_logs(user_id, created_at desc);
create index if not exists idx_request_logs_path_created_at on request_logs(path, created_at desc);
