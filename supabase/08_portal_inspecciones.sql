-- JASA Extintores: el portal de clientes muestra sus extintores (folio, ubicación, vencimiento)
-- y sus reportes de inspección para descargar en PDF.
-- Se pega completo en Supabase > SQL Editor > New query > Run (se puede correr varias veces).

create or replace function public.portal(codigo text) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare cli record; nom text; res jsonb;
begin
  if codigo is null or length(trim(codigo)) < 10 then return null; end if;
  select id, data into cli from public.docs
   where col = 'clientes' and upper(data ->> 'codigoPortal') = upper(trim(codigo)) limit 1;
  if not found then return null; end if;
  nom := lower(trim(cli.data ->> 'nombre'));
  select jsonb_build_object(
    'portalV', 2,
    'cliente', jsonb_build_object('nombre', cli.data ->> 'nombre', 'ciudad', cli.data ->> 'ciudad',
      'direccion', cli.data ->> 'direccion', 'estado', cli.data ->> 'estado', 'cp', cli.data ->> 'cp',
      'contacto', cli.data ->> 'contacto', 'tel', cli.data ->> 'tel',
      'equiposDet', cli.data -> 'equiposDet', 'proximaRecarga', cli.data ->> 'proximaRecarga'),
    'ordenes', coalesce((select jsonb_agg(jsonb_build_object(
        'folio', d.data ->> 'folio', 'recibido', d.data ->> 'recibido', 'entrega', d.data ->> 'entrega',
        'entregado', d.data ->> 'entregado', 'etapa', d.data -> 'etapa', 'etapaV', d.data -> 'etapaV',
        'equiposDet', d.data -> 'equiposDet', 'unidades', d.data -> 'unidades', 'notas', d.data ->> 'notas',
        'recibio', d.data ->> 'recibio', 'entrego', d.data ->> 'entrego', 'recibioCliente', d.data ->> 'recibioCliente')
        order by d.data ->> 'recibido' desc)
      from public.docs d where d.col = 'ordenes'
        and lower(trim(d.data ->> 'cliente')) = nom), '[]'::jsonb),
    'extintores', coalesce((select jsonb_agg(jsonb_build_object(
        'folio', coalesce(d.data ->> 'folio', d.id), 'numero', d.data ->> 'numero',
        'ubicacion', d.data ->> 'ubicacion', 'tipo', d.data ->> 'tipo', 'cap', d.data ->> 'cap',
        'recarga', d.data ->> 'recarga', 'vence', d.data ->> 'vence', 'ph', d.data ->> 'ph',
        'estado', d.data ->> 'estado',
        'ultima', jsonb_build_object('fecha', d.data -> 'ultima' ->> 'fecha', 'resultado', d.data -> 'ultima' ->> 'resultado'))
        order by nullif(regexp_replace(coalesce(d.data ->> 'numero', ''), '\D', '', 'g'), '')::int nulls last, d.id)
      from public.docs d where d.col = 'extintores'
        and coalesce(d.data ->> 'estado', '') not in ('sin asignar', 'baja')
        and lower(trim(d.data ->> 'cliente')) = nom), '[]'::jsonb),
    'inspecciones', coalesce((select jsonb_agg(jsonb_build_object(
        'id', d.id, 'fecha', d.data ->> 'fecha', 'cliente', d.data ->> 'cliente',
        'reviso', d.data ->> 'reviso', 'responsable', d.data ->> 'responsable',
        'items', d.data -> 'items', 'firma', d.data ->> 'firma', 'firmaTecnico', d.data ->> 'firmaTecnico')
        order by d.data ->> 'fecha' desc)
      from public.docs d where d.col = 'inspecciones'
        and coalesce(d.data ->> 'estado', '') <> 'en curso'
        and lower(trim(d.data ->> 'cliente')) = nom), '[]'::jsonb)
  ) into res;
  return res;
end; $$;
revoke all on function public.portal(text) from public;
grant execute on function public.portal(text) to anon, authenticated;

select 'Listo: portal con extintores e inspecciones' as resultado;
