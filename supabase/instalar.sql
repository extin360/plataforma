-- Extin360: instalación completa en un proyecto nuevo de Supabase
-- Pega este archivo en Supabase › SQL Editor › New query › Run
-- Orden: schema → permisos → módulos opcionales
--
-- ANTES de correr:
--   1. Crea el proyecto en supabase.com (nombre del negocio, región más cercana)
--   2. En Authentication › URL Configuration, pon la URL del sitio (ej. https://minegocio.com)
--   3. Copia la URL y la llave anónima del proyecto y ponlas en config.js y en las variables de Netlify
--
-- ADVERTENCIA: si ya tienes una base con datos, NO corras este archivo completo.
--              Corre solo los scripts que falten, uno por uno.

-- ─── 1. Schema base ───────────────────────────────────────────────────────────
\ir schema.sql

-- ─── 2. Puestos y roles ───────────────────────────────────────────────────────
\ir 04_puestos.sql

-- ─── 3. Permisos RLS ──────────────────────────────────────────────────────────
\ir 05_permisos.sql

-- ─── 4. Módulos ───────────────────────────────────────────────────────────────
\ir 02_cotizaciones_web.sql
\ir 03_extintores_qr.sql
\ir 06_cotizacion_correo.sql
\ir 07_cotizacion_en_linea.sql
\ir 08_portal_inspecciones.sql
\ir 09_asistencia.sql
\ir 10_asistencia_comida.sql
\ir 11_facturas_sat.sql
\ir 12_portal_cotizaciones.sql
\ir 13_empresa.sql
