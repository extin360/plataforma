-- JASA Extintores: revisa qué scripts ya están instalados en Supabase (no cambia nada)
-- Se pega en Supabase > SQL Editor > New query > Run. Cada columna dice true (instalado) o false (falta correrlo).

select
  exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'docs')               as "schema.sql (base)",
  exists (select 1 from pg_proc where proname = 'solicitar_cotizacion')                             as "02_cotizaciones_web",
  exists (select 1 from pg_proc where proname = 'ficha_extintor')                                   as "03_extintores_qr",
  exists (select 1 from information_schema.columns
          where table_schema = 'public' and table_name = 'staff' and column_name = 'rol')           as "04_puestos",
  exists (select 1 from pg_proc where proname = 'puede_escribir')                                   as "05_permisos",
  exists (select 1 from pg_proc where proname = 'solicitar_cotizacion'
          and prosrc like '%''email''%')                                                            as "06_cotizacion_correo",
  exists (select 1 from pg_proc where proname = 'autorizar_cotizacion')                             as "07_cotizacion_en_linea",
  exists (select 1 from pg_proc where proname = 'portal' and prosrc like '%inspecciones%')         as "08_portal_inspecciones",
  exists (select 1 from pg_proc where proname = 'marcar_asistencia')                                as "09_asistencia",
  exists (select 1 from pg_proc where proname = 'marcar_asistencia' and prosrc like '%regreso%')    as "10_asistencia_comida",
  exists (select 1 from pg_proc where proname = 'sat_guardar')                                      as "11_facturas_sat",
  exists (select 1 from pg_proc where proname = 'portal' and prosrc like '%cotizaciones%')          as "12_portal_cotizaciones",
  exists (select 1 from pg_proc where proname = 'empresa_publica')                                 as "13_empresa";
