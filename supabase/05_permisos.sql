-- JASA Extintores: permisos por persona (qué secciones puede ver y modificar cada quien)
-- Se pega completo en Supabase > SQL Editor > New query > Run (se puede correr varias veces)
-- Requiere haber corrido antes 04_puestos.sql

alter table public.staff add column if not exists rol text not null default 'admin';
alter table public.staff add column if not exists nombre text not null default '';
alter table public.staff add column if not exists permisos text[] not null default '{}';

-- Qué datos abre cada permiso. Los administradores ven todo.
create or replace function public.colecciones_de(p text[], rol text) returns text[]
language sql immutable set search_path = public as $$
  select coalesce(array_agg(distinct c), '{}') from (
    select unnest(case s
      when 'cotizaciones' then array['quotes','precios','clientes','ordenes']
      when 'clientes'     then array['clientes','extintores']
      when 'proveedores'  then array['proveedores']
      when 'finanzas'     then array['movs','inventario','proveedores','compras']
      when 'taller'       then array['ordenes','clientes','inventario']
      when 'inventario'   then array['inventario','compras','conteos','proveedores']
      when 'costos'       then array['recetas','precios','inventario']
      when 'extintores'   then array['extintores','clientes']
      when 'inspecciones' then array['inspecciones','visitas','clientes','extintores','quotes','precios','firmas']
      when 'pendientes'   then array['pendientes','ordenes','clientes']
      when 'campo'        then array['visitas','clientes','extintores','inspecciones','firmas','ordenes']
      else array[]::text[] end) as c
    from unnest(coalesce(p, '{}') || case when rol = 'tecnico' then array['campo'] else array[]::text[] end) as s
  ) x;
$$;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.staff
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')) and rol = 'admin'
  );
$$;

create or replace function public.puede(c text) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.staff s
    where lower(s.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      and (s.rol = 'admin' or c = any(public.colecciones_de(s.permisos, s.rol)))
  );
$$;

-- Para escribir: además, la firma de cada persona solo la cambia ella misma o un administrador
create or replace function public.puede_escribir(c text, doc_id text) returns boolean
language sql stable security definer set search_path = public as $$
  select public.puede(c) and (c <> 'firmas' or public.is_admin()
    or lower(doc_id) = lower(coalesce(auth.jwt() ->> 'email', '')));
$$;

-- Datos: cada quien solo lee y escribe lo que su permiso abre
drop policy if exists "staff lee" on public.docs;
drop policy if exists "staff crea" on public.docs;
drop policy if exists "staff edita" on public.docs;
drop policy if exists "staff borra" on public.docs;
create policy "staff lee"   on public.docs for select to authenticated using (public.puede(col));
create policy "staff crea"  on public.docs for insert to authenticated with check (public.puede_escribir(col, id));
create policy "staff edita" on public.docs for update to authenticated using (public.puede_escribir(col, id)) with check (public.puede_escribir(col, id));
create policy "staff borra" on public.docs for delete to authenticated using (public.puede_escribir(col, id));

-- Personal: todos ven la lista (para nombres y técnicos); solo administradores la cambian
drop policy if exists "staff ve staff" on public.staff;
drop policy if exists "admin agrega staff" on public.staff;
drop policy if exists "admin edita staff" on public.staff;
drop policy if exists "admin borra staff" on public.staff;
create policy "staff ve staff"     on public.staff for select to authenticated using (public.is_staff());
create policy "admin agrega staff" on public.staff for insert to authenticated with check (public.is_admin());
create policy "admin edita staff"  on public.staff for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin borra staff"  on public.staff for delete to authenticated using (public.is_admin());
grant select, insert, update, delete on public.staff to authenticated;

-- Nunca dejar el sistema sin administrador
create or replace function public.staff_un_admin() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if old.rol = 'admin' and (tg_op = 'DELETE' or new.rol <> 'admin') and
     (select count(*) from public.staff where rol = 'admin') <= 1 then
    raise exception 'Debe quedar al menos un administrador';
  end if;
  return case when tg_op = 'DELETE' then old else new end;
end;
$$;
drop trigger if exists staff_un_admin on public.staff;
create trigger staff_un_admin before update or delete on public.staff
  for each row execute function public.staff_un_admin();

-- Los correos se guardan en minúsculas
update public.staff set email = lower(trim(email)) where email <> lower(trim(email));

select 'Listo: permisos por persona' as resultado, email, rol, permisos from public.staff;
