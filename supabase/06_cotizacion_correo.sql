-- JASA Extintores: la solicitud de cotización del sitio también guarda el correo del cliente
-- Se pega completo en Supabase > SQL Editor > New query > Run (se puede correr varias veces)

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
      'email', case when coalesce(datos ->> 'email', '') ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' then left(lower(trim(datos ->> 'email')), 120) else '' end,
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

select 'Listo: cotizaciones del sitio con correo' as resultado;
