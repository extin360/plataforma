-- JASA Extintores: ficha pública de cada extintor al escanear su QR
-- Se pega completo en Supabase > SQL Editor > New query > Run (se puede correr varias veces)

create or replace function public.ficha_extintor(folio text) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  e record;
begin
  if folio is null or length(trim(folio)) < 4 or length(folio) > 20 then
    return null;
  end if;
  select data into e from public.docs where col = 'extintores' and id = upper(trim(folio));
  if not found then
    return null;
  end if;
  if coalesce(e.data ->> 'estado', '') = 'sin asignar' then
    return jsonb_build_object('folio', upper(trim(folio)), 'asignado', false);
  end if;
  return jsonb_build_object(
    'folio', e.data ->> 'folio',
    'asignado', true,
    'tipo', e.data ->> 'tipo',
    'cap', e.data ->> 'cap',
    'ubicacion', e.data ->> 'ubicacion',
    'estado', e.data ->> 'estado',
    'recarga', e.data ->> 'recarga',
    'vence', e.data ->> 'vence',
    'ph', e.data ->> 'ph',
    'ultima', jsonb_build_object(
      'fecha', e.data -> 'ultima' ->> 'fecha',
      'resultado', e.data -> 'ultima' ->> 'resultado',
      'puntos', e.data -> 'ultima' -> 'puntos',
      'comentario', e.data -> 'ultima' ->> 'comentario'
    )
  );
end;
$$;
revoke all on function public.ficha_extintor(text) from public;
grant execute on function public.ficha_extintor(text) to anon, authenticated;

select 'Listo: ficha pública de extintores' as resultado;
