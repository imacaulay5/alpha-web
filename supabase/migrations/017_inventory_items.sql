create table inventory_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid,
  user_id uuid references auth.users(id),
  sku text not null,
  name text not null,
  description text,
  category text,
  unit_price numeric(14,2) not null default 0,
  cost_price numeric(14,2) not null default 0,
  quantity_on_hand integer not null default 0,
  reorder_point integer not null default 0,
  reorder_quantity integer not null default 0,
  supplier_id uuid references vendors(id),
  stock_status text not null default 'in_stock',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table inventory_items enable row level security;
create policy "Users manage own inventory" on inventory_items for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);