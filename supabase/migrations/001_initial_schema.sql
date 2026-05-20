-- ═══════════════════════════════════════════════════════════════
--  Continental Propiedades — Supabase Database Schema
--  Migration: 001_initial_schema.sql
--  Run via: supabase db push  OR  paste in Supabase SQL editor
-- ═══════════════════════════════════════════════════════════════

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── ENUMS ───────────────────────────────────────────────────
create type user_role        as enum ('admin', 'vendor', 'guest');
create type property_status  as enum ('Disponible', 'Reservada', 'En consulta', 'Vendida');
create type property_type    as enum ('Casa', 'Departamento', 'PH', 'Lote', 'Local', 'Campo', 'Oficina', 'Cochera');
create type credit_status    as enum ('si', 'no');
create type sale_type        as enum ('auto', 'manual');
create type matching_role    as enum ('Busca comprar', 'Vende / permuta', 'Puede financiar');
create type checklist_status as enum ('0', '1', '2', '3');  -- vacio|completo|faltan|critico

-- ─── PROFILES (extends auth.users) ───────────────────────────
create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  nombre      text          not null,
  email       text          not null unique,
  role        user_role     not null default 'vendor',
  activo      boolean       not null default true,
  foto_url    text,
  created_at  timestamptz   not null default now(),
  updated_at  timestamptz   not null default now()
);
comment on table profiles is 'Extended user profiles — one per auth.users row';

-- ─── SITE CONFIG ─────────────────────────────────────────────
create table site_config (
  id              uuid primary key default uuid_generate_v4(),
  nombre          text    not null default 'Inmobiliaria',
  subtitulo       text    not null default '· Río Cuarto',
  logo_url        text,
  accent          text    not null default '#2c5f3f',
  accent2         text    not null default '#b8621a',
  bg              text    not null default '#f5f2ec',
  surface         text    not null default '#ffffff',
  border          text    not null default '#e0d9cc',
  text_color      text    not null default '#1a1510',
  fuente          text    not null default 'DM Sans',
  show_stats      boolean not null default true,
  bold_shadow     boolean not null default false,
  round_cards     boolean not null default true,
  pin             text,
  recovery_email  text,
  updated_at      timestamptz not null default now()
);
-- Only ever one row
insert into site_config (id) values ('00000000-0000-0000-0000-000000000001')
  on conflict do nothing;

-- ─── PROPERTIES ──────────────────────────────────────────────
create table properties (
  id          uuid           primary key default uuid_generate_v4(),
  dir         text           not null,
  barrio      text           not null default 'Sin especificar',
  tipo        property_type  not null default 'Casa',
  precio      numeric(12,2)  not null default 0,
  estado      property_status not null default 'Disponible',
  m2t         numeric(8,2)   not null default 0,
  m2c         numeric(8,2)   not null default 0,
  amb         smallint       not null default 0,
  dorm        smallint       not null default 0,
  banos       smallint       not null default 0,
  antig       text           not null default '',
  cont        text           not null default '',
  notas       text           not null default '',
  descr       text           not null default '',
  fuente      text           not null default '',
  lat         double precision,
  lng         double precision,
  credito     credit_status  not null default 'no',
  llave_prop  boolean        not null default false,
  -- Services stored as JSONB for flexibility
  servicios   jsonb          not null default '{"agua":false,"luz":false,"gas":false,"cloacas":false,"pavimento":false}',
  -- Images stored as Supabase Storage URLs array
  imagenes    text[]         not null default '{}',
  vendedor_id uuid           references profiles(id) on delete set null,
  honorarios  numeric(12,2),
  fecha_venta timestamptz,
  created_by  uuid           not null references profiles(id),
  created_at  timestamptz    not null default now(),
  updated_at  timestamptz    not null default now()
);
create index idx_properties_estado   on properties(estado);
create index idx_properties_tipo     on properties(tipo);
create index idx_properties_barrio   on properties(barrio);
create index idx_properties_precio   on properties(precio);
create index idx_properties_vendedor on properties(vendedor_id);
comment on table properties is 'Real estate listings';

-- ─── VISITS ──────────────────────────────────────────────────
create table visits (
  id                   uuid         primary key default uuid_generate_v4(),
  property_id          uuid         not null references properties(id) on delete cascade,
  vendor_id            uuid         references profiles(id) on delete set null,
  cliente              text         not null default '',
  nota                 text         not null default '',
  fecha                timestamptz  not null,
  llave_retirada       boolean      not null default false,
  llave_devuelta       boolean      not null default false,
  agendado_por_admin   boolean      not null default false,
  created_at           timestamptz  not null default now()
);
create index idx_visits_property on visits(property_id);
create index idx_visits_vendor   on visits(vendor_id);
create index idx_visits_fecha    on visits(fecha);

-- ─── SALES (ventas externas / manuales) ──────────────────────
create table sales (
  id              uuid          primary key default uuid_generate_v4(),
  tipo            sale_type     not null default 'manual',
  dir             text          not null,
  barrio          text          not null default '',
  precio          numeric(12,2) not null default 0,
  honorarios      numeric(12,2),
  fecha           timestamptz   not null default now(),
  vendor_id       uuid          references profiles(id) on delete set null,
  vendor_nombre   text,                                    -- denormalized for display
  property_id     uuid          references properties(id) on delete set null,
  created_by      uuid          not null references profiles(id),
  created_at      timestamptz   not null default now()
);
create index idx_sales_vendor   on sales(vendor_id);
create index idx_sales_fecha    on sales(fecha);
create index idx_sales_property on sales(property_id);

-- ─── MATCHING CLIENTS ────────────────────────────────────────
create table matching_clients (
  id          uuid          primary key default uuid_generate_v4(),
  tipo        matching_role not null,
  nombre      text          not null,
  tel         text          not null default '',
  descr       text          not null default '',
  presupuesto numeric(12,2) not null default 0,
  zona        text          not null default '',
  tipos_prop  text[]        not null default '{}',
  entrega     text[]        not null default '{}',
  recibe      text[]        not null default '{}',
  dorm_min    smallint      not null default 0,
  dorm_max    smallint      not null default 0,
  m2_min      numeric(8,2)  not null default 0,
  credito     boolean       not null default false,
  vendor_id   uuid          references profiles(id) on delete set null,
  created_by  uuid          not null references profiles(id),
  created_at  timestamptz   not null default now(),
  updated_at  timestamptz   not null default now()
);
create index idx_matching_tipo      on matching_clients(tipo);
create index idx_matching_vendor    on matching_clients(vendor_id);

-- ─── PRE-VENTA CHECKLIST ─────────────────────────────────────
create table preventa_checklists (
  id                   uuid        primary key default uuid_generate_v4(),
  property_id          uuid        not null unique references properties(id) on delete cascade,
  escritura            smallint    not null default 0 check (escritura between 0 and 3),
  impuestos            smallint    not null default 0 check (impuestos between 0 and 3),
  plano                smallint    not null default 0 check (plano between 0 and 3),
  reglamento           smallint    not null default 0 check (reglamento between 0 and 3),
  dni                  smallint    not null default 0 check (dni between 0 and 3),
  boleto               smallint    not null default 0 check (boleto between 0 and 3),
  locacion             smallint    not null default 0 check (locacion between 0 and 3),
  inhibicion           smallint    not null default 0 check (inhibicion between 0 and 3),
  hipoteca             smallint    not null default 0 check (hipoteca between 0 and 3),
  cit                  smallint    not null default 0 check (cit between 0 and 3),
  deadline_escritura   date,
  deadline_senia       date,
  deadline_credito     date,
  deadline_otro        date,
  deadline_otro_label  text,
  updated_at           timestamptz not null default now()
);

-- ─── INVITATIONS ─────────────────────────────────────────────
create table invitations (
  id          uuid        primary key default uuid_generate_v4(),
  token       text        not null unique,
  email       text        not null default '',
  used        boolean     not null default false,
  used_by     uuid        references profiles(id) on delete set null,
  expires_at  timestamptz not null default (now() + interval '72 hours'),
  created_by  uuid        not null references profiles(id),
  created_at  timestamptz not null default now()
);

-- ─── ACCESS LOG ──────────────────────────────────────────────
create table access_logs (
  id         bigserial    primary key,
  accion     text         not null,
  user_id    uuid         references profiles(id) on delete set null,
  ip         inet,
  created_at timestamptz  not null default now()
);
create index idx_logs_user    on access_logs(user_id);
create index idx_logs_created on access_logs(created_at desc);

-- ─── FUNCTIONS: auto-update updated_at ───────────────────────
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated_at
  before update on profiles
  for each row execute function set_updated_at();

create trigger trg_properties_updated_at
  before update on properties
  for each row execute function set_updated_at();

create trigger trg_matching_updated_at
  before update on matching_clients
  for each row execute function set_updated_at();

create trigger trg_preventa_updated_at
  before update on preventa_checklists
  for each row execute function set_updated_at();

-- ─── FUNCTION: create profile on signup ──────────────────────
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, email, nombre, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'nombre', split_part(new.email, '@', 1)),
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'vendor')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────
-- Enable RLS on all tables
alter table profiles             enable row level security;
alter table site_config          enable row level security;
alter table properties           enable row level security;
alter table visits               enable row level security;
alter table sales                enable row level security;
alter table matching_clients     enable row level security;
alter table preventa_checklists  enable row level security;
alter table invitations          enable row level security;
alter table access_logs          enable row level security;

-- Helper: get current user role
create or replace function get_my_role()
returns user_role language sql stable as $$
  select role from profiles where id = auth.uid()
$$;

-- ── profiles ─────────────────────────────────────────────────
create policy "profiles: read own"        on profiles for select using (id = auth.uid());
create policy "profiles: admin read all"  on profiles for select using (get_my_role() = 'admin');
create policy "profiles: update own"      on profiles for update using (id = auth.uid());
create policy "profiles: admin update all" on profiles for update using (get_my_role() = 'admin');

-- ── site_config ───────────────────────────────────────────────
create policy "config: anyone can read"   on site_config for select using (true);
create policy "config: admin write"       on site_config for all using (get_my_role() = 'admin');

-- ── properties ────────────────────────────────────────────────
-- Guests and vendors can read available properties
create policy "props: authenticated read" on properties for select using (auth.role() = 'authenticated');
-- Only admin can insert/update/delete
create policy "props: admin write"        on properties for insert with check (get_my_role() = 'admin');
create policy "props: admin update"       on properties for update using (get_my_role() = 'admin');
create policy "props: admin delete"       on properties for delete using (get_my_role() = 'admin');

-- ── visits ────────────────────────────────────────────────────
-- Vendors see only their visits; admin sees all
create policy "visits: vendor read own"   on visits for select using (vendor_id = auth.uid() or get_my_role() = 'admin');
create policy "visits: vendor insert"     on visits for insert with check (get_my_role() in ('admin', 'vendor'));
create policy "visits: vendor update own" on visits for update using (vendor_id = auth.uid() or get_my_role() = 'admin');
create policy "visits: admin delete"      on visits for delete using (get_my_role() = 'admin' or vendor_id = auth.uid());

-- ── sales ─────────────────────────────────────────────────────
create policy "sales: authenticated read" on sales for select using (auth.role() = 'authenticated');
create policy "sales: admin write"        on sales for all using (get_my_role() = 'admin');

-- ── matching ──────────────────────────────────────────────────
create policy "matching: authenticated read"  on matching_clients for select using (auth.role() = 'authenticated');
create policy "matching: admin+vendor insert" on matching_clients for insert with check (get_my_role() in ('admin', 'vendor'));
create policy "matching: own update"          on matching_clients for update using (created_by = auth.uid() or get_my_role() = 'admin');
create policy "matching: own delete"          on matching_clients for delete using (created_by = auth.uid() or get_my_role() = 'admin');

-- ── preventa ──────────────────────────────────────────────────
create policy "preventa: authenticated read"    on preventa_checklists for select using (auth.role() = 'authenticated');
create policy "preventa: admin+vendor write"    on preventa_checklists for all using (get_my_role() in ('admin', 'vendor'));

-- ── invitations ───────────────────────────────────────────────
create policy "invites: admin all"        on invitations for all using (get_my_role() = 'admin');
-- Anyone with valid token can read (for registration)
create policy "invites: public read"      on invitations for select using (true);

-- ── access_logs ───────────────────────────────────────────────
create policy "logs: admin read"          on access_logs for select using (get_my_role() = 'admin');
create policy "logs: insert authenticated" on access_logs for insert with check (auth.role() = 'authenticated');

-- ─── STORAGE BUCKETS ─────────────────────────────────────────
insert into storage.buckets (id, name, public) values
  ('property-images', 'property-images', true),
  ('vendor-photos',   'vendor-photos',   true),
  ('brand-assets',    'brand-assets',    true)
on conflict do nothing;

-- Storage policies
create policy "storage: anyone reads public buckets"
  on storage.objects for select using (bucket_id in ('property-images', 'vendor-photos', 'brand-assets'));

create policy "storage: auth users upload"
  on storage.objects for insert
  with check (auth.role() = 'authenticated');

create policy "storage: own delete"
  on storage.objects for delete
  using (auth.uid()::text = (storage.foldername(name))[1] or get_my_role() = 'admin');

-- ─── REALTIME ────────────────────────────────────────────────
-- Enable realtime on tables that need live sync
alter publication supabase_realtime add table properties;
alter publication supabase_realtime add table visits;
alter publication supabase_realtime add table sales;
alter publication supabase_realtime add table matching_clients;
