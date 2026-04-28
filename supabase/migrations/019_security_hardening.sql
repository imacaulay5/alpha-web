-- Security hardening for user ownership, payroll isolation, RPC access, and receipts.

-- Organizations need an owner boundary for signup/onboarding before a user row
-- has been attached to the organization.
alter table public.organizations
  add column if not exists owner_id uuid references auth.users(id) on delete set null;

create index if not exists idx_organizations_owner_id on public.organizations(owner_id);

update public.organizations o
set owner_id = owner_user.id
from (
  select distinct on (organization_id) organization_id, id
  from public.users
  where organization_id is not null
  order by organization_id, case when role = 'OWNER' then 0 when role = 'ADMIN' then 1 else 2 end, created_at
) owner_user
where o.id = owner_user.organization_id
  and o.owner_id is null;

create or replace function public.set_org_owner()
returns trigger
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
begin
  if new.owner_id is null then
    new.owner_id := auth.uid();
  end if;

  if new.owner_id is null then
    raise exception 'Cannot create organization: no authenticated user found';
  end if;

  return new;
end;
$$;

drop trigger if exists set_org_owner_before_insert on public.organizations;
create trigger set_org_owner_before_insert
  before insert on public.organizations
  for each row execute function public.set_org_owner();

drop policy if exists "Authenticated users can create organizations" on public.organizations;
drop policy if exists "Users can update their organization" on public.organizations;
drop policy if exists "Owners can view their organization by owner_id" on public.organizations;

create policy "Authenticated users can create organizations"
  on public.organizations
  for insert
  to authenticated
  with check (owner_id is null or owner_id = auth.uid());

create policy "Owners can view their organization by owner_id"
  on public.organizations
  for select
  to authenticated
  using (owner_id = auth.uid());

create policy "Users can update their organization"
  on public.organizations
  for update
  to authenticated
  using (
    owner_id = auth.uid()
    or exists (
      select 1
      from public.users u
      where u.id = auth.uid()
        and u.organization_id = organizations.id
        and u.role in ('OWNER', 'ADMIN')
    )
  )
  with check (
    owner_id = auth.uid()
    or exists (
      select 1
      from public.users u
      where u.id = auth.uid()
        and u.organization_id = organizations.id
        and u.role in ('OWNER', 'ADMIN')
    )
  );

-- Direct client writes to public.users are only for self-service profile and
-- onboarding fields. Role, email, active state, and arbitrary org joins are
-- blocked even if a permissive RLS policy exists.
create or replace function public.enforce_user_self_service_fields()
returns trigger
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
declare
  actor_id uuid := auth.uid();
  actor_email text := auth.jwt() ->> 'email';
begin
  if coalesce(auth.jwt() ->> 'role', '') = 'service_role' then
    return new;
  end if;

  if actor_id is null then
    raise exception 'Not authenticated';
  end if;

  if tg_op = 'INSERT' then
    if new.id is distinct from actor_id then
      raise exception 'Users can only create their own profile';
    end if;

    if actor_email is not null and new.email is distinct from actor_email then
      raise exception 'Profile email must match the authenticated user';
    end if;

    if new.organization_id is not null and not exists (
      select 1 from public.organizations o
      where o.id = new.organization_id and o.owner_id = actor_id
    ) then
      raise exception 'Users can only join organizations they own during onboarding';
    end if;

    return new;
  end if;

  if old.id is distinct from actor_id then
    raise exception 'Users can only update their own profile';
  end if;

  if new.id is distinct from old.id
    or new.email is distinct from old.email
    or (
      new.role is distinct from old.role
      and not (
        old.organization_id is null
        and new.role = 'OWNER'
        and exists (
          select 1 from public.organizations o
          where o.id = new.organization_id and o.owner_id = actor_id
        )
      )
    )
    or (
      new.account_type is distinct from old.account_type
      and current_setting('app.allow_account_type_update', true) is distinct from 'true'
    )
    or new.is_active is distinct from old.is_active then
    raise exception 'Protected profile fields cannot be changed directly';
  end if;

  if new.organization_id is distinct from old.organization_id
    and new.organization_id is not null
    and not exists (
      select 1 from public.organizations o
      where o.id = new.organization_id and o.owner_id = actor_id
    ) then
    raise exception 'Users can only join organizations they own during onboarding';
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_user_self_service_fields_before_write on public.users;
create trigger enforce_user_self_service_fields_before_write
  before insert or update on public.users
  for each row execute function public.enforce_user_self_service_fields();

create or replace function public.set_own_account_type(account_type_param public.account_type_enum)
returns public.users
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
declare
  updated_user public.users;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  perform set_config('app.allow_account_type_update', 'true', true);

  update public.users
  set account_type = account_type_param,
      organization_id = case
        when account_type_param = 'business' then organization_id
        else null
      end
  where id = auth.uid()
    and (
      organization_id is null
      or exists (
        select 1
        from public.organizations o
        where o.id = users.organization_id
          and o.owner_id = auth.uid()
      )
    )
  returning * into updated_user;

  if updated_user.id is null then
    raise exception 'Could not update account type for this user';
  end if;

  return updated_user;
end;
$$;

revoke all on function public.set_own_account_type(public.account_type_enum) from public, anon;
grant execute on function public.set_own_account_type(public.account_type_enum) to authenticated;

-- Payroll data contains highly sensitive compensation details. Scope runs to
-- user/org ownership and scope stubs through their parent run.
alter table public.payroll_runs
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

update public.payroll_runs pr
set user_id = owner_user.id
from (
  select distinct on (organization_id) organization_id, user_id as id
  from public.employees
  where organization_id is not null and user_id is not null
  order by organization_id, created_at
) owner_user
where pr.organization_id = owner_user.organization_id
  and pr.user_id is null;

drop policy if exists "Authenticated users manage payroll runs" on public.payroll_runs;
drop policy if exists "Authenticated users manage pay stubs" on public.pay_stubs;

create policy "Users manage scoped payroll runs"
  on public.payroll_runs
  for all
  to authenticated
  using (
    user_id = auth.uid()
    or exists (
      select 1
      from public.users u
      where u.id = auth.uid()
        and u.organization_id = payroll_runs.organization_id
        and u.role in ('OWNER', 'ADMIN')
    )
  )
  with check (
    user_id = auth.uid()
    or exists (
      select 1
      from public.users u
      where u.id = auth.uid()
        and u.organization_id = payroll_runs.organization_id
        and u.role in ('OWNER', 'ADMIN')
    )
  );

create policy "Users manage scoped pay stubs"
  on public.pay_stubs
  for all
  to authenticated
  using (
    exists (
      select 1
      from public.payroll_runs pr
      where pr.id = pay_stubs.payroll_run_id
        and (
          pr.user_id = auth.uid()
          or exists (
            select 1
            from public.users u
            where u.id = auth.uid()
              and u.organization_id = pr.organization_id
              and u.role in ('OWNER', 'ADMIN')
          )
        )
    )
  )
  with check (
    exists (
      select 1
      from public.payroll_runs pr
      join public.employees e on e.id = pay_stubs.employee_id
      where pr.id = pay_stubs.payroll_run_id
        and (
          pr.user_id = auth.uid()
          or exists (
            select 1
            from public.users u
            where u.id = auth.uid()
              and u.organization_id = pr.organization_id
              and u.role in ('OWNER', 'ADMIN')
          )
        )
        and (
          e.user_id = auth.uid()
          or e.organization_id = pr.organization_id
        )
    )
  );

create or replace function public.get_dashboard_metrics(user_id_param uuid)
returns json
language plpgsql
stable
security definer
set search_path = public, auth, extensions
as $$
declare
  result json;
  today date := current_date;
  week_start date := today - (extract(dow from today)::integer);
begin
  if user_id_param is distinct from auth.uid() then
    raise exception 'Cannot read dashboard metrics for another user';
  end if;

  select json_build_object(
    'hours_today', coalesce((
      select sum(duration_minutes) / 60.0
      from public.time_entries
      where user_id = user_id_param and start_at::date = today
    ), 0),
    'hours_week', coalesce((
      select sum(duration_minutes) / 60.0
      from public.time_entries
      where user_id = user_id_param and start_at >= week_start
    ), 0),
    'pending_expenses_count', coalesce((
      select count(*) from public.expenses
      where user_id = user_id_param and status in ('DRAFT', 'SUBMITTED')
    ), 0),
    'pending_approvals_count', coalesce((
      select count(*) from public.time_entries
      where user_id = user_id_param and status = 'SUBMITTED'
    ), 0),
    'outstanding_invoices_count', coalesce((
      select count(*) from public.invoices i
      join public.users u on u.organization_id = i.organization_id
      where u.id = user_id_param and i.status in ('SENT', 'OVERDUE')
    ), 0)
  ) into result;

  return result;
end;
$$;

create or replace function public.get_business_metrics(user_id_param uuid)
returns json
language plpgsql
stable
security definer
set search_path = public, auth, extensions
as $$
declare
  result json;
  org_id uuid;
  month_start date := date_trunc('month', current_date);
begin
  if user_id_param is distinct from auth.uid() then
    raise exception 'Cannot read business metrics for another user';
  end if;

  select organization_id into org_id from public.users where id = user_id_param;

  select json_build_object(
    'total_revenue', coalesce((
      select sum(total) from public.invoices
      where organization_id = org_id and status = 'PAID'
    ), 0),
    'outstanding_revenue', coalesce((
      select sum(total) from public.invoices
      where organization_id = org_id and status in ('SENT', 'OVERDUE')
    ), 0),
    'billable_hours_this_month', coalesce((
      select sum(duration_minutes) / 60.0 from public.time_entries
      where user_id = user_id_param and start_at >= month_start and billable_rate is not null
    ), 0),
    'pending_invoices', coalesce((
      select count(*) from public.invoices
      where organization_id = org_id and status in ('SENT', 'OVERDUE')
    ), 0)
  ) into result;

  return result;
end;
$$;

revoke all on function public.get_dashboard_metrics(uuid) from public, anon;
revoke all on function public.get_business_metrics(uuid) from public, anon;
grant execute on function public.get_dashboard_metrics(uuid) to authenticated;
grant execute on function public.get_business_metrics(uuid) to authenticated;

-- Private receipts bucket and object policies. Receipt object names are
-- expected to start with the authenticated user's UUID.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'receipts',
  'receipts',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Users manage own receipt files" on storage.objects;

create policy "Users manage own receipt files"
  on storage.objects
  for all
  to authenticated
  using (
    bucket_id = 'receipts'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'receipts'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
