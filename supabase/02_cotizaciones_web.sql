-- JASA Extintores: solicitudes de cotización desde el sitio web y etapas nuevas del taller
-- Se pega completo en Supabase > SQL Editor > New query > Run (se puede correr varias veces)

create extension if not exists pgcrypto;

create or replace function public.solicitar_cotizacion(datos jsonb) returns text
language plpgsql volatile security definer set search_path = public, extensions as $$
declare
  v_folio text;
  v_lines jsonb;
  v_recientes int;
begin
  if datos is null or jsonb_typeof(datos) <> 'object' or length(datos::text) > 20000 then
    raise exception 'Solicitud no válida';
  end if;
  v_lines := coalesce(datos -> 'lines', '[]'::jsonb);
  if jsonb_typeof(v_lines) <> 'array' or jsonb_array_length(v_lines) = 0 or jsonb_array_length(v_lines) > 60 then
    raise exception 'Agrega al menos una partida';
  end if;
  if length(trim(coalesce(datos ->> 'cliente', ''))) < 2 then
    raise exception 'Falta el nombre del cliente';
  end if;
  if length(regexp_replace(coalesce(datos ->> 'tel', ''), '\D', '', 'g')) < 10 then
    raise exception 'Falta un teléfono de 10 dígitos';
  end if;
  select count(*) into v_recientes from public.docs
   where col = 'quotes' and data ->> 'origen' = 'web' and updated_at > now() - interval '10 minutes';
  if v_recientes >= 30 then
    raise exception 'Demasiadas solicitudes; intenta en unos minutos';
  end if;
  v_folio := left(coalesce(nullif(trim(datos ->> 'folio'), ''), 'WEB-' || to_char(now() at time zone 'America/Matamoros', 'YYMMDD')), 30);
  if exists (select 1 from public.docs where col = 'quotes' and data ->> 'folio' = v_folio) then
    v_folio := v_folio || '-' || substr(md5(random()::text), 1, 3);
  end if;
  insert into public.docs (col, id, data) values (
    'quotes',
    'web-' || replace(gen_random_uuid()::text, '-', ''),
    jsonb_build_object(
      'folio', v_folio,
      'fecha', to_char(now() at time zone 'America/Matamoros', 'YYYY-MM-DD'),
      'cliente', left(trim(datos ->> 'cliente'), 120),
      'dirigido', left(coalesce(datos ->> 'dirigido', ''), 120),
      'direccion', left(coalesce(datos ->> 'direccion', ''), 200),
      'ciudad', left(coalesce(datos ->> 'ciudad', ''), 120),
      'rfc', left(upper(coalesce(datos ->> 'rfc', '')), 20),
      'tel', left(coalesce(datos ->> 'tel', ''), 30),
      'cond', left(coalesce(datos ->> 'cond', ''), 500),
      'status', 'Nueva',
      'origen', 'web',
      'creado', (extract(epoch from now()) * 1000)::bigint,
      'lines', (
        select jsonb_agg(jsonb_build_object(
          'art', left(coalesce(l ->> 'art', ''), 200),
          'qty', greatest(1, least(10000, coalesce(nullif(regexp_replace(coalesce(l ->> 'qty', ''), '\D', '', 'g'), '')::int, 1))),
          'price', ''))
        from jsonb_array_elements(v_lines) l
      )
    )
  );
  return v_folio;
end;
$$;
revoke all on function public.solicitar_cotizacion(jsonb) from public;
grant execute on function public.solicitar_cotizacion(jsonb) to anon, authenticated;

-- El portal también devuelve la versión de etapas de cada orden
create or replace function public.portal(codigo text) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare cli record; res jsonb;
begin
  if codigo is null or length(trim(codigo)) < 10 then return null; end if;
  select id, data into cli from public.docs
   where col = 'clientes' and upper(data ->> 'codigoPortal') = upper(trim(codigo)) limit 1;
  if not found then return null; end if;
  select jsonb_build_object(
    'cliente', jsonb_build_object('nombre', cli.data ->> 'nombre', 'ciudad', cli.data ->> 'ciudad',
      'equiposDet', cli.data -> 'equiposDet', 'proximaRecarga', cli.data ->> 'proximaRecarga'),
    'ordenes', coalesce((select jsonb_agg(jsonb_build_object(
        'folio', d.data ->> 'folio', 'recibido', d.data ->> 'recibido', 'entrega', d.data ->> 'entrega',
        'entregado', d.data ->> 'entregado', 'etapa', d.data -> 'etapa', 'etapaV', d.data -> 'etapaV',
        'equiposDet', d.data -> 'equiposDet', 'unidades', d.data -> 'unidades', 'notas', d.data ->> 'notas',
        'recibio', d.data ->> 'recibio', 'entrego', d.data ->> 'entrego', 'recibioCliente', d.data ->> 'recibioCliente')
        order by d.data ->> 'recibido' desc)
      from public.docs d where d.col = 'ordenes'
        and lower(trim(d.data ->> 'cliente')) = lower(trim(cli.data ->> 'nombre'))), '[]'::jsonb)
  ) into res;
  return res;
end; $$;
revoke all on function public.portal(text) from public;
grant execute on function public.portal(text) to anon, authenticated;

select 'Listo: cotizaciones desde el sitio' as resultado;
