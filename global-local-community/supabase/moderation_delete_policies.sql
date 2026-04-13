drop policy if exists posts_moderated_delete on posts;
create policy posts_moderated_delete on posts for delete using (
  exists (
    select 1
    from user_roles actor_roles
    where actor_roles.user_id = auth.uid()
      and actor_roles.role = 'admin'
  )
  or (
    exists (
      select 1
      from user_roles actor_roles
      where actor_roles.user_id = auth.uid()
        and actor_roles.role = 'moderator'
    )
    and not exists (
      select 1
      from user_roles target_roles
      where target_roles.user_id = posts.author_id
        and target_roles.role = 'admin'
    )
  )
);

drop policy if exists comments_moderated_delete on comments;
create policy comments_moderated_delete on comments for delete using (
  exists (
    select 1
    from user_roles actor_roles
    where actor_roles.user_id = auth.uid()
      and actor_roles.role = 'admin'
  )
  or (
    exists (
      select 1
      from user_roles actor_roles
      where actor_roles.user_id = auth.uid()
        and actor_roles.role = 'moderator'
    )
    and not exists (
      select 1
      from user_roles target_roles
      where target_roles.user_id = comments.author_id
        and target_roles.role = 'admin'
    )
  )
);
