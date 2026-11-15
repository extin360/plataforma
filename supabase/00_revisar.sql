-- JASA Extintores: revisa qué scripts ya están instalados en Supabase (no cambia nada)
-- Se pega en Supabase > SQL Editor > New query > Run. Cada columna dice true (instalado) o false (falta correrlo).

select
  exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'docs')               as "schema.sql (base)",
  exists (select 1 from pg_proc where proname = 'solicitar_cotizacion')                             as "02_cotizaciones_web",
  exists (select 1 from pg_proc where proname = 'ficha_extintor')                                   as "03_extintores_qr",
  exists (select 1 from information_schema.columns
          where table_schema = 'public' and table_name = 'staff' and column_name = 'rol')           as "04_puestos",
  exists (select 1 from pg_proc where proname = 'puede_escribir')                                   as "05_permisos";
