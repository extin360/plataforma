-- JASA Extintores: hora de comida en la asistencia
-- Se pega completo en Supabase > SQL Editor > New query > Run (se puede correr varias veces).
-- Requiere haber corrido antes 09_asistencia.sql. No cambia la clave del reporte.

-- Marcar entrada, salida a comer, regreso de comer o salida.
-- Entrada y salida: solo dentro del negocio. Comida y regreso: desde cualquier lugar (la ubicación se guarda si la hay).
create or replace function public.marcar_asistencia(tipo text, lat float8, lng float8, precision_m float8, dispositivo text default '')
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare
  yo record; cfg jsonb; dist float8; radio float8; ahora timestamptz := now();
  loc timestamp := now() at time zone 'America/Matamoros'; ult jsonb; nid text; libre boolean := tipo in ('comida', 'regreso'); hoy text; ultT text;
begin
  select email, nombre, rol into yo from public.staff
   where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''));
  if not found then return jsonb_build_object('ok', false, 'motivo', 'sin_acceso'); end if;
  if tipo not in ('entrada', 'salida', 'comida', 'regreso') then return jsonb_build_object('ok', false, 'motivo', 'tipo'); end if;
  hoy := to_char(loc, 'YYYY-MM-DD');
  select data into ult from public.docs
   where col = 'asistencia' and lower(data ->> 'email') = lower(yo.email) and data ->> 'fecha' = hoy
   order by data ->> 't' desc, updated_at desc limit 1;
  ultT := coalesce(ult ->> 'tipo', '');
  if ultT = tipo then return jsonb_build_object('ok', false, 'motivo', 'repetido', 'hora', ult ->> 'hora'); end if;
  if tipo = 'comida' and ultT not in ('entrada', 'regreso') then return jsonb_build_object('ok', false, 'motivo', 'sin_entrada'); end if;
  if tipo = 'regreso' and ultT <> 'comida' then return jsonb_build_object('ok', false, 'motivo', 'sin_comida'); end if;
  select data into cfg from public.docs where col = 'ajustes' and id = 'asistencia';
  if not libre and (cfg is null or cfg ->> 'lat' is null) then return jsonb_build_object('ok', false, 'motivo', 'sin_negocio'); end if;
  if not libre and (lat is null or lng is null) then return jsonb_build_object('ok', false, 'motivo', 'sin_ubicacion'); end if;
  radio := greatest(coalesce((cfg ->> 'radio')::float8, 150), 30);
  if lat is not null and lng is not null and cfg ->> 'lat' is not null then
    dist := public.distancia_m((cfg ->> 'lat')::float8, (cfg ->> 'lng')::float8, lat, lng);
  end if;
  if not libre and coalesce(precision_m, 9999) > greatest(radio, 200) then
    return jsonb_build_object('ok', false, 'motivo', 'precision', 'precision', round(coalesce(precision_m, 0)));
  end if;
  if not libre and dist - least(coalesce(precision_m, 0), 50) > radio then
    return jsonb_build_object('ok', false, 'motivo', 'fuera', 'distancia', round(dist), 'radio', radio);
  end if;
  nid := lower(yo.email) || '-' || (extract(epoch from clock_timestamp()) * 1000)::bigint || '-' || tipo;
  insert into public.docs (col, id, data, updated_at) values ('asistencia', nid, jsonb_build_object(
    'email', lower(yo.email), 'nombre', yo.nombre, 'rol', yo.rol, 'tipo', tipo,
    't', to_char(ahora at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'fecha', to_char(loc, 'YYYY-MM-DD'), 'hora', to_char(loc, 'HH24:MI'),
    'lat', round(lat::numeric, 6), 'lng', round(lng::numeric, 6), 'precision', round(coalesce(precision_m, 0)),
    'distancia', round(dist), 'dispositivo', left(coalesce(dispositivo, ''), 80)), ahora);
  return jsonb_build_object('ok', true, 'id', nid, 'tipo', tipo, 'hora', to_char(loc, 'HH24:MI'), 'fecha', to_char(loc, 'YYYY-MM-DD'), 'distancia', round(dist));
end; $$;
revoke all on function public.marcar_asistencia(text, float8, float8, float8, text) from public, anon;
grant execute on function public.marcar_asistencia(text, float8, float8, float8, text) to authenticated;

select 'Listo: hora de comida en la asistencia' as resultado;
