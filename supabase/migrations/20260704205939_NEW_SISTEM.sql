create table sync_entities (
  user_id      uuid not null references auth.users(id) on delete cascade,
  semester_id  text not null,
  feature      text not null check (feature in ('ramos', 'schedule', 'escenarios', 'semesters')),
  entity_id    text not null,
  payload      jsonb,
  sequence     bigint generated always as identity,
  device_id    text not null default '',
  updated_at   timestamptz not null default now(),
  primary key (user_id, semester_id, feature, entity_id)
);

alter table sync_entities enable row level security;

create policy own_entities
on sync_entities
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create index idx_sync_entities_user_seq on sync_entities (user_id, sequence);

create table user_sync_watermark (
  user_id      uuid primary key references auth.users(id) on delete cascade,
  max_sequence bigint not null default 0
);

alter table user_sync_watermark enable row level security;

create policy own_watermark
on user_sync_watermark
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create or replace function bump_watermark() returns trigger as $$
begin
  insert into user_sync_watermark (user_id, max_sequence)
  values (NEW.user_id, NEW.sequence)
  on conflict (user_id) do update
    set max_sequence = greatest(user_sync_watermark.max_sequence, NEW.sequence);
  return NEW;
end;
$$ language plpgsql;

create trigger trg_bump_watermark
after insert or update on sync_entities
for each row execute function bump_watermark();

alter publication supabase_realtime add table sync_entities;

grant all on sync_entities to authenticated;
grant all on user_sync_watermark to authenticated;
