-- Employees
create table employees (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid,
  user_id uuid references auth.users(id),
  name text not null,
  email text not null,
  department text,
  title text,
  hire_date date not null,
  salary numeric(14,2) not null,
  pay_frequency text not null default 'biweekly',
  tax_filing_status text default 'single',
  federal_allowances integer not null default 0,
  state_allowances integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table employees enable row level security;
create policy "Users manage own employees" on employees for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Payroll Runs
create table payroll_runs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid,
  pay_period_start date not null,
  pay_period_end date not null,
  pay_date date not null,
  status text not null default 'draft',
  total_gross numeric(14,2) not null default 0,
  total_deductions numeric(14,2) not null default 0,
  total_net numeric(14,2) not null default 0,
  total_employer_taxes numeric(14,2) not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
-- Note: payroll_runs uses organization_id for multi-tenant, add user_id if needed for RLS
alter table payroll_runs enable row level security;
-- Simple single-user RLS: allow all for now; tighten with user_id in production
create policy "Authenticated users manage payroll runs" on payroll_runs for all
  using (auth.role() = 'authenticated');

-- Pay Stubs
create table pay_stubs (
  id uuid primary key default gen_random_uuid(),
  payroll_run_id uuid references payroll_runs(id) on delete cascade not null,
  employee_id uuid references employees(id) not null,
  gross_pay numeric(14,2) not null default 0,
  federal_tax numeric(14,2) not null default 0,
  state_tax numeric(14,2) not null default 0,
  social_security numeric(14,2) not null default 0,
  medicare numeric(14,2) not null default 0,
  other_deductions numeric(14,2) not null default 0,
  net_pay numeric(14,2) not null default 0,
  hours_worked numeric(6,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table pay_stubs enable row level security;
create policy "Authenticated users manage pay stubs" on pay_stubs for all
  using (auth.role() = 'authenticated');