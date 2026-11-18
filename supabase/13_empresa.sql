-- 13_empresa.sql — "Mi empresa": datos del negocio editables desde el panel.
-- Se guardan en docs ('ajustes', 'empresa') (solo administradores escriben; ya lo cubre la política de docs).
-- public.empresa_publica() los entrega a todas las páginas (panel, app, portal, ficha del QR y cotización en línea),
-- también sin sesión, porque son los mismos datos que ya salen impresos en cotizaciones y reportes.
-- Nunca guardes contraseñas ni llaves aquí. Seguro de correr más de una vez.

create or replace function public.empresa_publica()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select data - 'privado' from public.docs where col = 'ajustes' and id = 'empresa'), '{}'::jsonb);
$$;

revoke all on function public.empresa_publica() from public;
grant execute on function public.empresa_publica() to anon, authenticated;
