-- JASA Extintores: asistencia (entrada y salida con ubicación dentro del negocio)
-- Se pega completo en Supabase > SQL Editor > New query > Run (se puede correr varias veces).
-- Requiere haber corrido antes 05_permisos.sql.
--
-- Cómo funciona:
--  * La ubicación del negocio y el radio se guardan en docs ('ajustes', 'asistencia') desde el panel (solo administradores).
--  * Cada persona marca con public.marcar_asistencia(...): la hora la pone el servidor y la distancia se calcula aquí,
--    así nadie puede cambiar la hora ni marcar lejos del negocio.
--  * Cada quien ve sus propias marcas; los administradores ven y corrigen todas.
--  * El reporte semanal por correo lo arma una función programada de Netlify con una clave privada (abajo).

create extension if not exists pgcrypto;

-- Clave privada para el reporte semanal (no la puede leer nadie desde la app)
create table if not exists public.claves_privadas (nombre text primary key, valor text not null);
alter table public.claves_privadas enable row level security;
revoke all on public.claves_privadas from anon, authenticated;
insert into public.claves_privadas (nombre, valor)
  values ('reporte_asistencia', encode(gen_random_bytes(24), 'hex'))
  on conflict (nombre) do nothing;

-- Distancia en metros entre dos puntos
create or replace function public.distancia_m(lat1 float8, lng1 float8, lat2 float8, lng2 float8) returns float8
language sql immutable as $$
  select 2 * 6371000 * asin(sqrt(
    power(sin(radians(lat2 - lat1) / 2), 2) +
    cos(radians(lat1)) * cos(radians(lat2)) * power(sin(radians(lng2 - lng1) / 2), 2)));
$$;

-- Cada quien lee sus propias marcas (los administradores ya leen todo con "staff lee")
drop policy if exists "asistencia propia" on public.docs;
create policy "asistencia propia" on public.docs for select to authenticated
  using (col = 'asistencia' and lower(data ->> 'email') = lower(coalesce(auth.jwt() ->> 'email', '')));

-- Marcar entrada o salida
create or replace function public.marcar_asistencia(tipo text, lat float8, lng float8, precision_m float8, dispositivo text default '')
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare
  yo record; cfg jsonb; dist float8; radio float8; ahora timestamptz := now();
  loc timestamp := now() at time zone 'America/Matamoros'; ult jsonb; nid text;
begin
  select email, nombre, rol into yo from public.staff
   where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''));
  if not found then return jsonb_build_object('ok', false, 'motivo', 'sin_acceso'); end if;
  if tipo not in ('entrada', 'salida') then return jsonb_build_object('ok', false, 'motivo', 'tipo'); end if;
  if lat is null or lng is null then return jsonb_build_object('ok', false, 'motivo', 'sin_ubicacion'); end if;
  select data into cfg from public.docs where col = 'ajustes' and id = 'asistencia';
  if cfg is null or cfg ->> 'lat' is null then return jsonb_build_object('ok', false, 'motivo', 'sin_negocio'); end if;
  radio := greatest(coalesce((cfg ->> 'radio')::float8, 150), 30);
  dist := public.distancia_m((cfg ->> 'lat')::float8, (cfg ->> 'lng')::float8, lat, lng);
  if coalesce(precision_m, 9999) > greatest(radio, 200) then
    return jsonb_build_object('ok', false, 'motivo', 'precision', 'precision', round(coalesce(precision_m, 0)));
  end if;
  if dist - least(coalesce(precision_m, 0), 50) > radio then
    return jsonb_build_object('ok', false, 'motivo', 'fuera', 'distancia', round(dist), 'radio', radio);
  end if;
  -- No dos entradas (o dos salidas) seguidas el mismo día
  select data into ult from public.docs
   where col = 'asistencia' and lower(data ->> 'email') = lower(yo.email)
   order by data ->> 't' desc limit 1;
  if ult is not null and ult ->> 'tipo' = tipo and ult ->> 'fecha' = to_char(loc, 'YYYY-MM-DD') then
    return jsonb_build_object('ok', false, 'motivo', 'repetido', 'hora', ult ->> 'hora');
  end if;
  nid := lower(yo.email) || '-' || (extract(epoch from ahora) * 1000)::bigint;
  insert into public.docs (col, id, data, updated_at) values ('asistencia', nid, jsonb_build_object(
    'email', lower(yo.email), 'nombre', yo.nombre, 'rol', yo.rol, 'tipo', tipo,
    't', to_char(ahora at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
    'fecha', to_char(loc, 'YYYY-MM-DD'), 'hora', to_char(loc, 'HH24:MI'),
    'lat', round(lat::numeric, 6), 'lng', round(lng::numeric, 6), 'precision', round(coalesce(precision_m, 0)),
    'distancia', round(dist), 'dispositivo', left(coalesce(dispositivo, ''), 80)), ahora);
  return jsonb_build_object('ok', true, 'id', nid, 'tipo', tipo, 'hora', to_char(loc, 'HH24:MI'), 'fecha', to_char(loc, 'YYYY-MM-DD'), 'distancia', round(dist));
end; $$;
revoke all on function public.marcar_asistencia(text, float8, float8, float8, text) from public, anon;
grant execute on function public.marcar_asistencia(text, float8, float8, float8, text) to authenticated;

-- Para el reporte semanal por correo (función programada de Netlify con la clave privada)
create or replace function public.reporte_asistencia(clave text, desde date, hasta date) returns jsonb
language plpgsql stable security definer set search_path = public as $$
begin
  if clave is null or clave <> (select valor from public.claves_privadas where nombre = 'reporte_asistencia') then
    return null;
  end if;
  return jsonb_build_object(
    'personal', (select coalesce(jsonb_agg(jsonb_build_object('email', lower(email), 'nombre', nombre, 'rol', rol)), '[]') from public.staff),
    'ajustes', (select data from public.docs where col = 'ajustes' and id = 'asistencia'),
    'marcas', (select coalesce(jsonb_agg(d.data || jsonb_build_object('id', d.id) order by d.data ->> 't'), '[]') from public.docs d
               where d.col = 'asistencia' and (d.data ->> 'fecha') between desde::text and hasta::text));
end; $$;
revoke all on function public.reporte_asistencia(text, date, date) from public;
grant execute on function public.reporte_asistencia(text, date, date) to anon, authenticated;

select 'Listo: asistencia. Copia esta clave en Netlify (variable JASA_CLAVE_ASISTENCIA):' as resultado,
       valor as clave from public.claves_privadas where nombre = 'reporte_asistencia';
