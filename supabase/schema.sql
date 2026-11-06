-- JASA Extintores: base de datos del panel y del portal de clientes
-- Se pega completo en Supabase > SQL Editor > New query > Run

create table if not exists public.docs (
  col text not null,
  id text not null,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (col, id)
);

create table if not exists public.staff (
  email text primary key
);
insert into public.staff (email) values ('jasa-extintores@live.com.mx') on conflict do nothing;

alter table public.docs enable row level security;
alter table public.staff enable row level security;

create or replace function public.is_staff() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.staff
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

drop policy if exists "staff lee" on public.docs;
drop policy if exists "staff crea" on public.docs;
drop policy if exists "staff edita" on public.docs;
drop policy if exists "staff borra" on public.docs;
drop policy if exists "staff ve staff" on public.staff;
create policy "staff lee" on public.docs for select to authenticated using (public.is_staff());
create policy "staff crea" on public.docs for insert to authenticated with check (public.is_staff());
create policy "staff edita" on public.docs for update to authenticated using (public.is_staff()) with check (public.is_staff());
create policy "staff borra" on public.docs for delete to authenticated using (public.is_staff());
create policy "staff ve staff" on public.staff for select to authenticated using (public.is_staff());

revoke all on public.docs from anon;
revoke all on public.staff from anon;
grant select, insert, update, delete on public.docs to authenticated;
grant select on public.staff to authenticated;

-- Portal de clientes: cada cliente entra con su codigo de acceso
create or replace function public.portal(codigo text) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  cli record;
  res jsonb;
begin
  if codigo is null or length(trim(codigo)) < 10 then
    return null;
  end if;
  select id, data into cli from public.docs
   where col = 'clientes' and upper(data ->> 'codigoPortal') = upper(trim(codigo))
   limit 1;
  if not found then
    return null;
  end if;
  select jsonb_build_object(
    'cliente', jsonb_build_object(
      'nombre', cli.data ->> 'nombre',
      'ciudad', cli.data ->> 'ciudad',
      'equiposDet', cli.data -> 'equiposDet',
      'proximaRecarga', cli.data ->> 'proximaRecarga'),
    'ordenes', coalesce((
      select jsonb_agg(jsonb_build_object(
        'folio', d.data ->> 'folio',
        'recibido', d.data ->> 'recibido',
        'entrega', d.data ->> 'entrega',
        'entregado', d.data ->> 'entregado',
        'etapa', d.data -> 'etapa',
        'equiposDet', d.data -> 'equiposDet',
        'unidades', d.data -> 'unidades',
        'notas', d.data ->> 'notas',
        'recibio', d.data ->> 'recibio',
        'entrego', d.data ->> 'entrego',
        'recibioCliente', d.data ->> 'recibioCliente')
        order by d.data ->> 'recibido' desc)
      from public.docs d
      where d.col = 'ordenes'
        and lower(trim(d.data ->> 'cliente')) = lower(trim(cli.data ->> 'nombre'))
    ), '[]'::jsonb)
  ) into res;
  return res;
end;
$$;
revoke all on function public.portal(text) from public;
grant execute on function public.portal(text) to anon, authenticated;

-- Cambios en vivo para el panel
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'docs'
  ) then
    alter publication supabase_realtime add table public.docs;
  end if;
end $$;

select 'Listo: base de JASA creada' as resultado;
