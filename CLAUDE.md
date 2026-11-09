# JASA Extintores — contexto del proyecto

Sitio y sistema interno de JASA Extintores SA de CV (Piedras Negras, Coahuila). Dueño: Jimmy SVGZ; su hijo
ayuda con la configuración. Todo el texto para el usuario va en español de México.

## Qué hay y dónde vive

| Pieza | URL | Fuente | Publicación |
| --- | --- | --- | --- |
| Sitio público | https://jasaextintores.com | `index.html`, `img/` | Netlify publica `main` de GitHub `jasa-extin/jasa-extintores` |
| Panel interno | https://jasaextintores.com/admin | `admin.html` → `tools/build.py` genera `admin/index.html` | Netlify |
| Portal de clientes | https://jasaextintores.com/clientes | `src/clientes.html` → `clientes/index.html` | Netlify |
| Reporte de inspección PDF | — | `src/reporte.js` (lo inserta el build en panel y portal) | — |
| Base de datos | Supabase `psggoagcdokwrkykgufr` | `supabase/*.sql` (se pegan en SQL Editor) | Supabase |
| Panel viejo (solo lectura) | claude.ai artifact BHJcxnzgNkVbLfyVe49MNu | `admin.html` en modo claude.ai | Artifact |

Después de cambiar `admin.html`, `src/clientes.html` o `src/reporte.js`: `python3 tools/build.py` y commit de
los archivos generados.

## Datos (Supabase)

- Una tabla `public.docs (col, id, data jsonb)`; `col` = colección: `quotes`, `clientes`, `proveedores`,
  `movs`, `ordenes`, `inventario`, `precios`, `pendientes`.
- Acceso: RLS; solo correos en `public.staff` leen y escriben (`public.is_staff()`). `anon` no lee nada.
- Clientes del portal: función `public.portal(codigo)` con el `codigoPortal` del cliente (XXXX-XXXX-XX).
- Sitio público: función `public.solicitar_cotizacion(datos)` crea una cotización `Nueva` con `origen: web`.
- Llave publicable en el código (es pública por diseño). Nunca poner la Secret key ni contraseñas en el repo.
- Registro de usuarios cerrado: el personal se da de alta en Authentication › Users y en `public.staff`.

## Taller

Etapas (`etapa`, con `etapaV: 2`): 0 Por recoger, 1 Recibido, 2 En reparación, 3 En entrega, 4 Entregado.
Órdenes sin `etapaV` usan la numeración vieja (0–3) y el panel las convierte al cargarlas.
Al entregar: próxima recarga del cliente = mes de entrega + 12 y se descuenta inventario marcado con `consumo`
(`PQS`, `CO2`, `ETIQUETA`).

## Pendientes

El checklist vivo está en el doc de claude.ai "Plan de pendientes JASA Extintores"
(https://claude.ai/artifact/BaxhQ51FJp3pDTqNRKmYYp). Siguientes: calendario de entregas/recolecciones/visitas
para trabajadores, cuentas por cobrar, usuarios para trabajadores, verificación de Google Search Console,
correos @jasaextintores.com y verificación en dos pasos en todas las cuentas.
