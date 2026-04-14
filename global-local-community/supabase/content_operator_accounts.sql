create table if not exists public.content_operator_accounts (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  active boolean not null default true,
  note text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_content_operator_accounts_active on public.content_operator_accounts(active);

alter table public.content_operator_accounts enable row level security;

drop policy if exists content_operator_accounts_no_public_read on public.content_operator_accounts;
create policy content_operator_accounts_no_public_read
on public.content_operator_accounts
for select
using (false);

drop policy if exists content_operator_accounts_admin_insert on public.content_operator_accounts;
create policy content_operator_accounts_admin_insert
on public.content_operator_accounts
for insert
with check (
  exists (
    select 1
    from public.user_roles
    where user_roles.user_id = auth.uid()
      and user_roles.role = 'admin'
  )
);

drop policy if exists content_operator_accounts_admin_update on public.content_operator_accounts;
create policy content_operator_accounts_admin_update
on public.content_operator_accounts
for update
using (
  exists (
    select 1
    from public.user_roles
    where user_roles.user_id = auth.uid()
      and user_roles.role = 'admin'
  )
)
with check (
  exists (
    select 1
    from public.user_roles
    where user_roles.user_id = auth.uid()
      and user_roles.role = 'admin'
  )
);

drop policy if exists content_operator_accounts_admin_delete on public.content_operator_accounts;
create policy content_operator_accounts_admin_delete
on public.content_operator_accounts
for delete
using (
  exists (
    select 1
    from public.user_roles
    where user_roles.user_id = auth.uid()
      and user_roles.role = 'admin'
  )
);
