create table if not exists user_roles (
  user_id uuid not null references profiles(id) on delete cascade,
  role text not null check (role in ('admin','moderator')),
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  primary key (user_id, role)
);

create index if not exists idx_user_roles_role_user_id on user_roles(role, user_id);
