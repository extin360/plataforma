-- JASA Extintores: puesto de cada usuario (administrador o técnico)
-- Se pega completo en Supabase > SQL Editor > New query > Run (se puede correr varias veces)

alter table public.staff add column if not exists rol text not null default 'admin';
alter table public.staff add column if not exists nombre text not null default '';

-- Los dueños y la oficina quedan como administradores
update public.staff set rol = 'admin' where rol is null or rol = '';

-- Para dar de alta a un técnico (después de crearle su usuario en Authentication > Users):
-- insert into public.staff (email, rol, nombre) values ('correo@ejemplo.com', 'tecnico', 'Nombre');

select email, rol, nombre from public.staff;
