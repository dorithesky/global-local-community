alter table public.user_roles
  drop constraint if exists user_roles_role_check;

alter table public.user_roles
  add constraint user_roles_role_check
  check (role in ('admin', 'moderator', 'content_operator'));

create index if not exists idx_user_roles_role_user_id on public.user_roles(role, user_id);

drop policy if exists user_roles_admin_insert on public.user_roles;
create policy user_roles_admin_insert
on public.user_roles
for insert
with check (
  exists (
    select 1
    from public.user_roles actor_roles
    where actor_roles.user_id = auth.uid()
      and actor_roles.role = 'admin'
  )
);

drop policy if exists user_roles_admin_delete on public.user_roles;
create policy user_roles_admin_delete
on public.user_roles
for delete
using (
  exists (
    select 1
    from public.user_roles actor_roles
    where actor_roles.user_id = auth.uid()
      and actor_roles.role = 'admin'
  )
);
