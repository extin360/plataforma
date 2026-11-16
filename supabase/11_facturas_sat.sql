-- JASA Extintores: facturas recibidas (CFDI) sincronizadas con el SAT
-- Se pega completo en Supabase > SQL Editor > New query > Run (se puede correr varias veces).
-- Requiere haber corrido antes 05_permisos.sql y 09_asistencia.sql (usa la misma clave privada del servidor).
--
-- Cómo funciona:
--  * Un administrador sube su e.firma (.cer y .key) desde el panel > Facturas SAT. Los archivos quedan en
--    public.claves_privadas, que nadie puede leer desde la app. La CONTRASEÑA de la e.firma NO se guarda aquí:
--    vive solo en Netlify (variable SAT_EFIRMA_PASS). Así, ni la base sola ni Netlify solo tienen la e.firma completa.
--  * Cada hora la función de Netlify sat-recibidos pide al SAT (Descarga Masiva) los CFDI recibidos, los baja y los
--    guarda en docs ('cfdis', UUID). En el panel se registran como egreso o cuenta por pagar.

-- Las facturas las ve quien tiene el permiso de finanzas
create or replace function public.colecciones_de(p text[], rol text) returns text[]
language sql immutable set search_path = public as $$
  select coalesce(array_agg(distinct c), '{}') from (
    select unnest(case s
      when 'cotizaciones' then array['quotes','precios','clientes','ordenes']
      when 'clientes'     then array['clientes','extintores']
      when 'proveedores'  then array['proveedores']
      when 'finanzas'     then array['movs','inventario','proveedores','compras','cfdis']
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


-- Guardar o quitar la e.firma (solo administradores)
create or replace function public.sat_guardar_efirma(cer text, llave text) returns jsonb
language plpgsql volatile security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Solo un administrador puede guardar la e.firma'; end if;
  if cer is null or llave is null or length(cer) < 500 or length(llave) < 500 or length(cer) > 20000 or length(llave) > 20000 then
    return jsonb_build_object('ok', false, 'motivo', 'archivos');
  end if;
  insert into public.claves_privadas (nombre, valor) values ('sat_cer', cer)
    on conflict (nombre) do update set valor = excluded.valor;
  insert into public.claves_privadas (nombre, valor) values ('sat_key', llave)
    on conflict (nombre) do update set valor = excluded.valor;
  insert into public.docs (col, id, data, updated_at) values ('ajustes', 'sat', jsonb_build_object(
      'efirma', jsonb_build_object('cargada', now(), 'por', lower(coalesce(auth.jwt() ->> 'email', ''))), 'error', null), now())
    on conflict (col, id) do update set data = public.docs.data || excluded.data, updated_at = now();
  return jsonb_build_object('ok', true);
end; $$;
revoke all on function public.sat_guardar_efirma(text, text) from public, anon;
grant execute on function public.sat_guardar_efirma(text, text) to authenticated;

create or replace function public.sat_quitar_efirma() returns jsonb
language plpgsql volatile security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Solo un administrador puede quitar la e.firma'; end if;
  delete from public.claves_privadas where nombre in ('sat_cer', 'sat_key');
  update public.docs set data = data - 'efirma' - 'pendientes' || jsonb_build_object('error', null), updated_at = now()
   where col = 'ajustes' and id = 'sat';
  return jsonb_build_object('ok', true);
end; $$;
revoke all on function public.sat_quitar_efirma() from public, anon;
grant execute on function public.sat_quitar_efirma() to authenticated;

-- Para la función de Netlify (con la clave privada del servidor)
create or replace function public.sat_estado(clave text) returns jsonb
language plpgsql stable security definer set search_path = public as $$
begin
  if clave is null or clave <> (select valor from public.claves_privadas where nombre = 'reporte_asistencia') then
    return null;
  end if;
  return jsonb_build_object(
    'cer', (select valor from public.claves_privadas where nombre = 'sat_cer'),
    'key', (select valor from public.claves_privadas where nombre = 'sat_key'),
    'ajustes', coalesce((select data from public.docs where col = 'ajustes' and id = 'sat'), '{}'::jsonb));
end; $$;
revoke all on function public.sat_estado(text) from public;
grant execute on function public.sat_estado(text) to anon, authenticated;

create or replace function public.sat_guardar(clave text, ajustes jsonb, cfdis jsonb) returns jsonb
language plpgsql volatile security definer set search_path = public as $$
declare c jsonb; n int := 0;
begin
  if clave is null or clave <> (select valor from public.claves_privadas where nombre = 'reporte_asistencia') then
    return null;
  end if;
  if ajustes is not null then
    insert into public.docs (col, id, data, updated_at) values ('ajustes', 'sat', ajustes, now())
      on conflict (col, id) do update set data = public.docs.data || excluded.data, updated_at = now();
  end if;
  for c in select * from jsonb_array_elements(coalesce(cfdis, '[]'::jsonb)) loop
    if coalesce(c ->> 'uuid', '') ~ '^[0-9A-F-]{36}$' then
      insert into public.docs (col, id, data, updated_at) values ('cfdis', c ->> 'uuid', c, now())
        on conflict (col, id) do nothing;
      if found then n := n + 1; end if;
    end if;
  end loop;
  return jsonb_build_object('ok', true, 'nuevos', n);
end; $$;
revoke all on function public.sat_guardar(text, jsonb, jsonb) from public;
grant execute on function public.sat_guardar(text, jsonb, jsonb) to anon, authenticated;

select 'Listo: facturas del SAT. Falta subir la e.firma desde el panel y poner SAT_EFIRMA_PASS en Netlify.' as resultado;
