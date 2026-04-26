-- Vendors
create table vendors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  organization_id uuid,
  name text not null,
  email text,
  phone text,
  address text,
  contact_name text,
  status text not null default 'active',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table vendors enable row level security;
create policy "Users manage own vendors" on vendors for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Vendor Bills
create table vendor_bills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  organization_id uuid,
  vendor_id uuid references vendors(id) not null,
  bill_number text not null,
  date date not null,
  due_date date not null,
  status text not null default 'upcoming',
  subtotal numeric(14,2) not null default 0,
  tax_rate numeric(5,2) not null default 0,
  tax_amount numeric(14,2) not null default 0,
  total numeric(14,2) not null default 0,
  notes text,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table vendor_bills enable row level security;
create policy "Users manage own vendor bills" on vendor_bills for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Vendor Bill Line Items
create table vendor_bill_line_items (
  id uuid primary key default gen_random_uuid(),
  vendor_bill_id uuid references vendor_bills(id) on delete cascade not null,
  description text not null,
  quantity numeric(10,2) not null default 1,
  rate numeric(14,2) not null default 0,
  amount numeric(14,2) not null default 0,
  "order" integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table vendor_bill_line_items enable row level security;
create policy "Users manage own bill line items" on vendor_bill_line_items for all
  using (
    exists (
      select 1 from vendor_bills vb
      where vb.id = vendor_bill_id and vb.user_id = auth.uid()
    )
  );

-- Purchase Orders
create table purchase_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  organization_id uuid,
  vendor_id uuid references vendors(id) not null,
  po_number text not null,
  date date not null,
  expected_date date,
  status text not null default 'draft',
  subtotal numeric(14,2) not null default 0,
  tax_rate numeric(5,2) not null default 0,
  tax_amount numeric(14,2) not null default 0,
  total numeric(14,2) not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table purchase_orders enable row level security;
create policy "Users manage own purchase orders" on purchase_orders for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Purchase Order Line Items
create table purchase_order_line_items (
  id uuid primary key default gen_random_uuid(),
  purchase_order_id uuid references purchase_orders(id) on delete cascade not null,
  description text not null,
  quantity numeric(10,2) not null default 1,
  rate numeric(14,2) not null default 0,
  amount numeric(14,2) not null default 0,
  "order" integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table purchase_order_line_items enable row level security;
create policy "Users manage own PO line items" on purchase_order_line_items for all
  using (
    exists (
      select 1 from purchase_orders po
      where po.id = purchase_order_id and po.user_id = auth.uid()
    )
  );