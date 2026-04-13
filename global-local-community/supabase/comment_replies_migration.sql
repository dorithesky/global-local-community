alter table if exists comments
  add column if not exists parent_comment_id uuid references comments(id) on delete set null,
  add column if not exists root_comment_id uuid references comments(id) on delete set null,
  add column if not exists depth smallint not null default 0,
  add column if not exists reply_count integer not null default 0;

update comments
set depth = 0
where depth is distinct from 0;

update comments
set root_comment_id = id
where root_comment_id is null;

create index if not exists idx_comments_post_parent_created_at on comments(post_id, parent_comment_id, created_at asc);
create index if not exists idx_comments_root_created_at on comments(root_comment_id, created_at asc);
create index if not exists idx_comments_parent_created_at on comments(parent_comment_id, created_at asc);

alter table if exists comments
  drop constraint if exists comments_depth_check;

alter table if exists comments
  add constraint comments_depth_check check (depth in (0, 1));
