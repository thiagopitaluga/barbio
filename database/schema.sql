-- Barbio initial production data model (not applied by the demo deployment).
-- Run once on a dedicated PostgreSQL database after provisioning it.

create extension if not exists pgcrypto;
create extension if not exists btree_gist;

create table if not exists shops (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  tagline text not null default '',
  accent text not null default '#b77b52',
  logo_url text,
  phone text not null default '',
  address text not null default '',
  timezone text not null default 'America/Sao_Paulo',
  opens_at time not null default '09:00',
  closes_at time not null default '20:00',
  created_at timestamptz not null default now(),
  constraint shop_hours_valid check (opens_at < closes_at)
);

create table if not exists shop_members (
  shop_id uuid not null references shops(id) on delete cascade,
  clerk_user_id text not null,
  role text not null check (role in ('owner', 'manager', 'barber')),
  staff_id uuid,
  created_at timestamptz not null default now(),
  primary key (shop_id, clerk_user_id)
);

create table if not exists staff (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references shops(id) on delete cascade,
  name text not null,
  title text not null default 'Barbeiro',
  color text not null default '#b77b52',
  commission_percent numeric(5,2) not null default 0 check (commission_percent between 0 and 100),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (shop_id, id)
);

alter table shop_members add constraint shop_members_staff_fk
  foreign key (shop_id, staff_id) references staff(shop_id, id);

create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references shops(id) on delete cascade,
  name text not null,
  category text not null default 'Outros',
  duration_minutes integer not null check (duration_minutes between 5 and 600),
  price_cents integer not null check (price_cents >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (shop_id, id)
);

create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references shops(id) on delete cascade,
  name text not null,
  phone text not null,
  email text,
  notes text not null default '',
  preferred_staff_id uuid,
  created_at timestamptz not null default now(),
  unique (shop_id, id),
  unique (shop_id, phone),
  foreign key (shop_id, preferred_staff_id) references staff(shop_id, id)
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references shops(id) on delete cascade,
  name text not null,
  price_cents integer not null check (price_cents >= 0),
  stock integer not null default 0 check (stock >= 0),
  active boolean not null default true,
  unique (shop_id, id)
);

create table if not exists appointments (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references shops(id) on delete cascade,
  client_id uuid not null,
  staff_id uuid not null,
  service_id uuid not null,
  start_at timestamptz not null,
  end_at timestamptz not null,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')),
  source text not null default 'online' check (source in ('online', 'balcao')),
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (shop_id, id),
  foreign key (shop_id, client_id) references clients(shop_id, id),
  foreign key (shop_id, staff_id) references staff(shop_id, id),
  foreign key (shop_id, service_id) references services(shop_id, id),
  constraint appointment_time_valid check (end_at > start_at),
  constraint no_staff_overlap exclude using gist (
    staff_id with =,
    tstzrange(start_at, end_at, '[)') with &&
  ) where (status in ('pending', 'confirmed', 'in_progress'))
);

create index if not exists appointments_shop_start_idx on appointments(shop_id, start_at);
create index if not exists appointments_client_idx on appointments(shop_id, client_id, start_at desc);

create table if not exists sales (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references shops(id) on delete cascade,
  appointment_id uuid not null unique,
  service_cents integer not null check (service_cents >= 0),
  products_cents integer not null default 0 check (products_cents >= 0),
  total_cents integer generated always as (service_cents + products_cents) stored,
  payment_method text not null check (payment_method in ('pix', 'credit', 'debit', 'cash')),
  commission_cents integer not null default 0 check (commission_cents >= 0),
  paid_at timestamptz not null default now(),
  unique (shop_id, id),
  foreign key (shop_id, appointment_id) references appointments(shop_id, id)
);

create table if not exists sale_products (
  shop_id uuid not null,
  sale_id uuid not null,
  product_id uuid not null,
  quantity integer not null check (quantity > 0),
  unit_price_cents integer not null check (unit_price_cents >= 0),
  primary key (shop_id, sale_id, product_id),
  foreign key (shop_id, sale_id) references sales(shop_id, id) on delete cascade,
  foreign key (shop_id, product_id) references products(shop_id, id)
);

create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references shops(id) on delete cascade,
  description text not null,
  category text not null default 'Outros',
  amount_cents integer not null check (amount_cents >= 0),
  incurred_on date not null,
  created_at timestamptz not null default now()
);

create index if not exists expenses_shop_date_idx on expenses(shop_id, incurred_on);

create table if not exists waitlist (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references shops(id) on delete cascade,
  client_id uuid not null,
  staff_id uuid not null,
  service_id uuid not null,
  requested_on date not null,
  preferred_period text not null default 'Qualquer horário',
  created_at timestamptz not null default now(),
  foreign key (shop_id, client_id) references clients(shop_id, id),
  foreign key (shop_id, staff_id) references staff(shop_id, id),
  foreign key (shop_id, service_id) references services(shop_id, id)
);

create table if not exists audit_events (
  id bigint generated always as identity primary key,
  shop_id uuid not null references shops(id) on delete cascade,
  actor_clerk_user_id text,
  entity text not null,
  entity_id uuid,
  action text not null,
  details jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

create index if not exists audit_events_shop_time_idx on audit_events(shop_id, occurred_at desc);
