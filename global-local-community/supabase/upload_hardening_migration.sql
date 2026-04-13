create table if not exists pending_uploads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  bucket text not null,
  storage_path text not null unique,
  original_file_name text,
  mime_type text not null,
  size_bytes bigint not null,
  status text not null default 'authorized' check (status in ('authorized','uploaded','attached','expired','rejected')),
  upload_token text not null unique,
  attached_post_id uuid references posts(id) on delete set null,
  attached_at timestamptz,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_pending_uploads_user_status_created_at on pending_uploads(user_id, status, created_at desc);
create index if not exists idx_pending_uploads_expires_at on pending_uploads(expires_at);
