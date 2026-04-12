alter table comments add column if not exists deleted_at timestamptz;
alter table comments add column if not exists deleted_by uuid references profiles(id) on delete set null;
