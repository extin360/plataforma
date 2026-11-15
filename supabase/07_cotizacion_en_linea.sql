-- JASA Extintores: teléfono del personal, órdenes en la app del técnico y cotización en línea para el cliente
-- Se pega completo en Supabase > SQL Editor > New query > Run (se puede correr varias veces)
-- Requiere haber corrido antes 05_permisos.sql

alter table public.staff add column if not exists tel text not null default '';

-- La app del técnico también ve las órdenes de taller (para recoger y entregar)
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

-- Página pública de una cotización: se abre con el enlace que JASA le manda al cliente
create or replace function public.cotizacion_publica(token text) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare q record;
begin
  if token is null or length(trim(token)) < 20 then return null; end if;
  select id, data into q from public.docs
   where col = 'quotes' and data ->> 'token' = trim(token) limit 1;
  if not found then return null; end if;
  return jsonb_build_object(
    'folio', q.data ->> 'folio', 'fecha', q.data ->> 'fecha', 'cliente', q.data ->> 'cliente',
    'dirigido', q.data ->> 'dirigido', 'direccion', q.data ->> 'direccion', 'ciudad', q.data ->> 'ciudad',
    'cond', q.data ->> 'cond', 'entregaTxt', q.data ->> 'entregaTxt', 'vigencia', q.data ->> 'vigencia',
    'status', q.data ->> 'status', 'autorizo', q.data -> 'autorizo',
    'lines', coalesce((select jsonb_agg(jsonb_build_object('art', l ->> 'art', 'qty', l -> 'qty', 'price', l -> 'price'))
                       from jsonb_array_elements(coalesce(q.data -> 'lines', '[]'::jsonb)) l), '[]'::jsonb));
end; $$;
revoke all on function public.cotizacion_publica(text) from public;
grant execute on function public.cotizacion_publica(text) to anon, authenticated;

-- El cliente autoriza la cotización desde esa página
create or replace function public.autorizar_cotizacion(token text, nombre text, comentario text default '') returns text
language plpgsql volatile security definer set search_path = public as $$
declare q record;
begin
  if token is null or length(trim(token)) < 20 then raise exception 'Enlace no válido'; end if;
  if length(trim(coalesce(nombre, ''))) < 3 then raise exception 'Escribe tu nombre para autorizar'; end if;
  select id, data into q from public.docs
   where col = 'quotes' and data ->> 'token' = trim(token) limit 1 for update;
  if not found then raise exception 'Enlace no válido'; end if;
  if q.data ->> 'status' in ('Autorizada', 'Aceptada') then return q.data ->> 'folio'; end if;
  if q.data ->> 'status' = 'Rechazada' then raise exception 'Esta cotización ya no está vigente; pide una nueva a JASA'; end if;
  if exists (select 1 from jsonb_array_elements(coalesce(q.data -> 'lines', '[]'::jsonb)) l
             where coalesce(l ->> 'price', '') = '') then
    raise exception 'La cotización todavía no tiene todos sus precios';
  end if;
  update public.docs set
    data = data || jsonb_build_object('status', 'Autorizada', 'autorizo', jsonb_build_object(
      'nombre', left(trim(nombre), 120), 'comentario', left(coalesce(comentario, ''), 500),
      'fecha', to_char(now() at time zone 'America/Matamoros', 'YYYY-MM-DD HH24:MI'))),
    updated_at = now()
   where col = 'quotes' and id = q.id;
  return q.data ->> 'folio';
end; $$;
revoke all on function public.autorizar_cotizacion(text, text, text) from public;
grant execute on function public.autorizar_cotizacion(text, text, text) to anon, authenticated;

select 'Listo: órdenes del técnico y cotización en línea' as resultado;
