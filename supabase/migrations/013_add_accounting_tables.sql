-- Chart of Accounts
create table accounts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid,
  user_id uuid references auth.users(id),
  code text not null,
  name text not null,
  category text not null,
  parent_id uuid references accounts(id),
  description text,
  is_active boolean not null default true,
  balance numeric(14,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table accounts enable row level security;
create policy "Users manage own accounts" on accounts for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Journal Entries
create table journal_entries (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid,
  user_id uuid references auth.users(id),
  entry_number text not null,
  date date not null,
  description text not null,
  status text not null default 'draft',
  reference text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table journal_entries enable row level security;
create policy "Users manage own entries" on journal_entries for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Journal Entry Lines
create table journal_entry_lines (
  id uuid primary key default gen_random_uuid(),
  journal_entry_id uuid references journal_entries(id) on delete cascade not null,
  account_id uuid references accounts(id) not null,
  description text,
  debit numeric(14,2) not null default 0,
  credit numeric(14,2) not null default 0,
  "order" integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table journal_entry_lines enable row level security;
create policy "Users manage own lines" on journal_entry_lines for all
  using (
    exists (
      select 1 from journal_entries je
      where je.id = journal_entry_id and je.user_id = auth.uid()
    )
  );