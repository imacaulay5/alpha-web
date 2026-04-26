  create table bills (
    id uuid primary key default gen_random_uuid(),                                                                      
    user_id uuid references auth.users(id) on delete cascade not null,
    name text not null,                                                                                                 
    payee text not null,                                                           
    amount numeric(12,2) not null,
    currency text not null default 'USD',
    category text not null,
    due_date date not null,
    status text not null default 'upcoming',
    recurrence text not null default 'monthly',
    notes text,
    paid_at timestamptz,
    auto_pay boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
  );

  -- RLS
  alter table bills enable row level security;

  create policy "Users can manage their own bills"
    on bills for all
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);