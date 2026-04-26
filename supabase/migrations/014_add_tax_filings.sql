  create table tax_filings (                                                         
    id uuid primary key default gen_random_uuid(),
    organization_id uuid,
    user_id uuid references auth.users(id),                                                                             
    name text not null,
    form_type text not null,                                                                                            
    tax_period_start date,                                                                                            
    tax_period_end date,
    due_date date not null,
    filed_date date,
    status text not null default 'not_started',
    amount_due numeric(12,2),
    amount_paid numeric(12,2),
    notes text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
  );
  alter table tax_filings enable row level security;
  create policy "Users manage own filings" on tax_filings for all
    using (auth.uid() = user_id) with check (auth.uid() = user_id);