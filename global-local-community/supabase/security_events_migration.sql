create table if not exists security_events (
  id bigserial primary key,
  event_type text not null,
  severity text not null check (severity in ('low', 'medium', 'high', 'critical')),
  user_id uuid references profiles(id) on delete set null,
  ip text,
  path text,
  entity_type text,
  entity_id text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists security_events_event_type_created_at_idx
  on security_events (event_type, created_at desc);

create index if not exists security_events_severity_created_at_idx
  on security_events (severity, created_at desc);

create index if not exists security_events_user_id_created_at_idx
  on security_events (user_id, created_at desc);

create table if not exists security_alerts (
  id bigserial primary key,
  rule_name text not null,
  severity text not null check (severity in ('medium', 'high', 'critical')),
  status text not null default 'open' check (status in ('open', 'acknowledged', 'resolved')),
  summary text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists security_alerts_status_created_at_idx
  on security_alerts (status, created_at desc);

alter table security_events enable row level security;
alter table security_alerts enable row level security;

drop policy if exists security_events_no_public_read on security_events;
create policy security_events_no_public_read
  on security_events
  for select
  using (false);

drop policy if exists security_alerts_no_public_read on security_alerts;
create policy security_alerts_no_public_read
  on security_alerts
  for select
  using (false);
