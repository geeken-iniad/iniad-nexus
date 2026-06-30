-- Assignments hybrid upgrade migration for iniad-nexus Database Schema v3.2.
-- Goal: keep assignments flexible like Todo items while optionally linking them to timetable entries.

begin;

-- 1. Add columns for timetable linkage, term filtering, richer assignment details, and structured links.
alter table public.assignments
  add column if not exists timetable_entry_id uuid,
  add column if not exists academic_year integer,
  add column if not exists semester text,
  add column if not exists description text,
  add column if not exists submission_type text,
  add column if not exists submission_location text,
  add column if not exists status text,
  add column if not exists links jsonb;

-- 2. Backfill safe defaults for existing rows before adding stricter constraints.
update public.assignments
set
  subject = coalesce(nullif(btrim(subject), ''), 'Unassigned'),
  academic_year = coalesce(
    academic_year,
    case
      when extract(month from due_date at time zone 'Asia/Tokyo') >= 4
        then extract(year from due_date at time zone 'Asia/Tokyo')::integer
      else extract(year from due_date at time zone 'Asia/Tokyo')::integer - 1
    end
  ),
  semester = coalesce(
    semester,
    case
      when extract(month from due_date at time zone 'Asia/Tokyo') between 4 and 9
        then 'spring'
      else 'fall'
    end
  ),
  submission_type = coalesce(nullif(submission_type, ''), 'online'),
  status = coalesce(
    nullif(status, ''),
    case
      when is_done then 'done'
      when due_date < now() then 'overdue'
      else 'todo'
    end
  ),
  links = coalesce(links, '[]'::jsonb);

-- 3. Make required fields explicit after backfill.
alter table public.assignments
  alter column subject set not null,
  alter column academic_year set not null,
  alter column semester set not null,
  alter column submission_type set not null,
  alter column submission_type set default 'online',
  alter column status set not null,
  alter column status set default 'todo',
  alter column links set not null,
  alter column links set default '[]'::jsonb;

-- 4. Convert priority from smallint 1/2/3 to readable text.
-- Existing v3.2 meaning: 1=high, 2=medium, 3=low.
do $$
declare
  check_constraint record;
begin
  for check_constraint in
    select conname
    from pg_constraint
    where conrelid = 'public.assignments'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%priority%'
  loop
    execute format('alter table public.assignments drop constraint if exists %I', check_constraint.conname);
  end loop;
end;
$$;

alter table public.assignments
  alter column priority drop default,
  alter column priority type text
    using case priority
      when 1 then 'high'
      when 2 then 'medium'
      when 3 then 'low'
      else 'medium'
    end,
  alter column priority set default 'medium',
  alter column priority set not null;

-- 5. Add clear check constraints for frontend union types.
alter table public.assignments
  drop constraint if exists assignments_academic_year_check,
  add constraint assignments_academic_year_check
    check (academic_year between 2000 and 2100),
  drop constraint if exists assignments_semester_check,
  add constraint assignments_semester_check
    check (semester in ('spring', 'fall')),
  drop constraint if exists assignments_submission_type_check,
  add constraint assignments_submission_type_check
    check (submission_type in ('online', 'paper', 'presentation', 'other')),
  drop constraint if exists assignments_status_check,
  add constraint assignments_status_check
    check (status in ('todo', 'in_progress', 'submitted', 'done', 'overdue')),
  drop constraint if exists assignments_priority_check,
  add constraint assignments_priority_check
    check (priority in ('high', 'medium', 'low')),
  drop constraint if exists assignments_links_array_check,
  add constraint assignments_links_array_check
    check (jsonb_typeof(links) = 'array');

-- 6. Add optional timetable foreign key. Assignments can still exist without timetable linkage.
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'assignments_timetable_entry_id_fkey'
      and conrelid = 'public.assignments'::regclass
  ) then
    alter table public.assignments
      add constraint assignments_timetable_entry_id_fkey
      foreign key (timetable_entry_id)
      references public.timetable(id)
      on delete set null;
  end if;
end;
$$;

-- 7. Indexes for common UI queries: deadline list, status tabs, term filters, timetable-linked views.
create index if not exists idx_assignments_due_open
  on public.assignments (user_id, due_date)
  where status <> 'done';

create index if not exists idx_assignments_user_status
  on public.assignments (user_id, status);

create index if not exists idx_assignments_user_term
  on public.assignments (user_id, academic_year, semester);

create index if not exists idx_assignments_timetable_entry
  on public.assignments (timetable_entry_id)
  where timetable_entry_id is not null;

-- 8. Redefine RLS policies by operation for readability and stricter INSERT/UPDATE checks.
alter table public.assignments enable row level security;

do $$
declare
  policy_record record;
begin
  for policy_record in
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'assignments'
  loop
    execute format('drop policy if exists %I on public.assignments', policy_record.policyname);
  end loop;
end;
$$;

create policy "assignments_select_own"
  on public.assignments
  for select
  using (auth.uid() = user_id);

create policy "assignments_insert_own"
  on public.assignments
  for insert
  with check (auth.uid() = user_id);

create policy "assignments_update_own"
  on public.assignments
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "assignments_delete_own"
  on public.assignments
  for delete
  using (auth.uid() = user_id);

-- 9. Keep done_at synced from status on both insert and update.
create or replace function public.sync_assignment_done_at()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'done' and (tg_op = 'INSERT' or old.status is distinct from 'done') then
    new.done_at := coalesce(new.done_at, now());
  elsif new.status <> 'done' then
    new.done_at := null;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_assignment_done_at on public.assignments;

create trigger trg_assignment_done_at
  before insert or update on public.assignments
  for each row
  execute function public.sync_assignment_done_at();

-- 10. Remove the legacy boolean completion flag after status has been backfilled.
alter table public.assignments
  drop column if exists is_done;

commit;
