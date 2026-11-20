-- Extin360: schema multi-tenant
-- Un solo proyecto de Supabase para todos los negocios clientes.
-- Pega en Supabase > SQL Editor > New query > Run (proyecto plataforma de Extin360).
-- NO correr en el proyecto de JASA.

-- ─── Extensiones ──────────────────────────────────────────────────────────────
create extension if not exists "pgcrypto";

-- ─── Planes ───────────────────────────────────────────────────────────────────
create table if not exists public.planes (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  precio_mensual numeric(10,2) not null,
  features jsonb not null default '{}'::jsonb
);

insert into public.planes (nombre, precio_mensual, features) values
  ('Básico',       1299.00, '{"usuarios": "ilimitados", "extintores": "ilimitados"}'::jsonb),
  ('Profesional',  2199.00, '{"usuarios": "ilimitados", "extintores": "ilimitados", "facturacion": true}'::jsonb)
on conflict do nothing;

-- ─── Negocios ─────────────────────────────────────────────────────────────────
create table if not exists public.negocios (
  id      uuid primary key default gen_random_uuid(),
  slug    text not null unique,          -- ej: "jasa" → extin360.com/app/jasa
  plan_id uuid references public.planes(id),
  estado  text not null default 'activo' check (estado in ('activo','suspendido','prueba')),
  config  jsonb not null default '{}'::jsonb,  -- nombre, logo, colores, dominio propio, etc.
  created_at timestamptz not null default now()
);

-- ─── Staff ────────────────────────────────────────────────────────────────────
-- Cada persona del negocio; vinculada a auth.users por email.
create table if not exists public.staff (
  id         uuid primary key default gen_random_uuid(),
  negocio_id uuid not null references public.negocios(id) on delete cascade,
  email      text not null,
  nombre     text not null default '',
  permisos   jsonb not null default '{}'::jsonb,
  activo     boolean not null default true,
  unique (negocio_id, email)
);

-- ─── Docs ─────────────────────────────────────────────────────────────────────
-- Tabla principal: todos los datos de todos los negocios.
-- col = colección (extintores, clientes, ordenes, cotizaciones, etc.)
create table if not exists public.docs (
  negocio_id uuid not null references public.negocios(id) on delete cascade,
  col        text not null,
  id         text not null,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (negocio_id, col, id)
);

-- ─── RLS ──────────────────────────────────────────────────────────────────────
alter table public.planes   enable row level security;
alter table public.negocios enable row level security;
alter table public.staff    enable row level security;
alter table public.docs     enable row level security;

-- Función: devuelve el negocio_id del usuario autenticado
create or replace function public.mi_negocio() returns uuid
language sql stable security definer set search_path = public as $$
  select negocio_id from public.staff
   where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
     and activo = true
   limit 1;
$$;

-- Función: ¿es admin de Extin360? (para consola central)
-- El admin tiene una fila en staff sin negocio_id (negocio_id = NULL especial)
-- Por ahora se controla por email; más adelante con un rol dedicado.
create or replace function public.es_admin_extin360() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.staff
     where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
       and negocio_id is null
       and activo = true
  );
$$;

-- Planes: cualquier autenticado puede leerlos (para mostrar precios en app)
drop policy if exists "planes públicos" on public.planes;
create policy "planes públicos" on public.planes
  for select to authenticated using (true);

-- Negocios: cada staff ve solo el suyo; admin ve todos
drop policy if exists "negocio propio" on public.negocios;
drop policy if exists "admin ve todos negocios" on public.negocios;
create policy "negocio propio" on public.negocios
  for select to authenticated
  using (id = public.mi_negocio() or public.es_admin_extin360());

-- Staff: cada quien ve a su equipo; admin ve todos
drop policy if exists "staff ve su negocio" on public.staff;
drop policy if exists "staff edita su negocio" on public.staff;
drop policy if exists "admin ve todo staff" on public.staff;
create policy "staff ve su negocio" on public.staff
  for select to authenticated
  using (negocio_id = public.mi_negocio() or public.es_admin_extin360());
create policy "staff edita su negocio" on public.staff
  for all to authenticated
  using (negocio_id = public.mi_negocio() or public.es_admin_extin360())
  with check (negocio_id = public.mi_negocio() or public.es_admin_extin360());

-- Docs: cada negocio ve y edita solo sus propios datos; admin ve todos
drop policy if exists "docs lee" on public.docs;
drop policy if exists "docs crea" on public.docs;
drop policy if exists "docs edita" on public.docs;
drop policy if exists "docs borra" on public.docs;
create policy "docs lee" on public.docs
  for select to authenticated
  using (negocio_id = public.mi_negocio() or public.es_admin_extin360());
create policy "docs crea" on public.docs
  for insert to authenticated
  with check (negocio_id = public.mi_negocio() or public.es_admin_extin360());
create policy "docs edita" on public.docs
  for update to authenticated
  using (negocio_id = public.mi_negocio() or public.es_admin_extin360())
  with check (negocio_id = public.mi_negocio() or public.es_admin_extin360());
create policy "docs borra" on public.docs
  for delete to authenticated
  using (negocio_id = public.mi_negocio() or public.es_admin_extin360());

-- ─── Permisos API ─────────────────────────────────────────────────────────────
revoke all on public.planes   from anon;
revoke all on public.negocios from anon;
revoke all on public.staff    from anon;
revoke all on public.docs     from anon;

grant select on public.planes to authenticated;
grant select on public.negocios to authenticated;
grant select, insert, update, delete on public.staff to authenticated;
grant select, insert, update, delete on public.docs  to authenticated;

-- ─── Realtime ─────────────────────────────────────────────────────────────────
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
     where pubname = 'supabase_realtime' and tablename = 'docs'
  ) then
    alter publication supabase_realtime add table public.docs;
  end if;
end $$;

-- ─── Admin Extin360 ───────────────────────────────────────────────────────────
-- Benjamín: staff sin negocio_id = acceso total a la consola
-- INSTRUCCIÓN: después de correr este script, inserta tu usuario así:
--   insert into public.staff (negocio_id, email, nombre, permisos)
--   values (null, 'hola@extin360.com', 'Benjamín Sáenz', '{"admin_extin360": true}'::jsonb);
-- (negocio_id = null es válido aquí porque el FK permite null para el admin)

-- Ajustar el FK para permitir null en admin
alter table public.staff alter column negocio_id drop not null;

select 'Listo: schema multi-tenant Extin360 creado' as resultado;
