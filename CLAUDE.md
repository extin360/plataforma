# JASA Extintores — contexto del proyecto

Sitio y sistema interno de JASA Extintores SA de CV (Piedras Negras, Coahuila). Dueño: Jimmy SVGZ; su hijo
ayuda con la configuración. Todo el texto para el usuario va en español de México.

## Qué hay y dónde vive

| Pieza | URL | Fuente | Publicación |
| --- | --- | --- | --- |
| Sitio público | https://jasaextintores.com | `index.html`, `img/` | Netlify publica `main` de GitHub `jasa-extin/jasa-extintores` |
| Panel interno | https://jasaextintores.com/admin | `admin.html` → `tools/build.py` genera `admin/index.html` | Netlify |
| Portal de clientes | https://jasaextintores.com/clientes | `src/clientes.html` → `clientes/index.html` | Netlify |
| App del técnico | https://jasaextintores.com/tecnico | `src/tecnico.html` → `tecnico/index.html` | Netlify |
| Ficha pública del QR | https://jasaextintores.com/e/JX-000245 | `src/ficha.html` → `e/index.html` (`_redirects` manda `/e/*` ahí) | Netlify |
| Reportes PDF y puntos de inspección | — | `src/reporte.js` (lo inserta el build en panel, portal, app y ficha) | — |
| Base de datos | Supabase `psggoagcdokwrkykgufr` | `supabase/*.sql` (se pegan en SQL Editor) | Supabase |
| Panel viejo (solo lectura) | claude.ai artifact BHJcxnzgNkVbLfyVe49MNu | `admin.html` en modo claude.ai | Artifact |

Después de cambiar `admin.html` o cualquier archivo de `src/`: `python3 tools/build.py` y commit de los archivos
generados.

## Datos (Supabase)

- Una tabla `public.docs (col, id, data jsonb)`; `col` = colección: `quotes`, `clientes`, `proveedores`,
  `movs`, `ordenes`, `inventario`, `precios`, `pendientes`, `extintores` (id = folio `PREFIJO-001` del cliente, o
  `JX-000001` para etiquetas en blanco; `jasaFolio()` los normaliza), `inspecciones`, `visitas`, `recetas`, `compras`, `conteos`.
- Clientes: cada registro es la planta/ubicación del servicio (`direccion`, `ciudad`, `estado`, `cp`, `mapa`, `contacto`,
  `tel`, `email` para reportes). Datos fiscales CFDI 4.0 (`razonSocial`, `rfc`, `regimen`, `cpFiscal`, `domFiscal`, `usoCfdi`,
  `metodoPago`, `formaPago`, `diasCredito`, `requiereOC`, `emailFact`) o `fiscalDe` = id de otro cliente que factura
  (corporativo); usar siempre `fiscalOf(cliente)`.
- Inventario tiene pestañas: Existencias, Levantar inventario (`conteos {estado: en curso|aplicado, items{invId:contado}}`;
  al aplicar, `stock` = contado) y Órdenes de compra (`compras {folio OC-0001, proveedor, lines[{inv,cant,costo}], estado
  Borrador|Enviada|Recibida|Cancelada, pago}`; al recibir suma `stock`, actualiza `costo` y crea egreso o suma `saldo` al proveedor).
- Costos: `inventario.costo` (por unidad) se actualiza al registrar un egreso ligado a un artículo (`movs.articulo`,
  `movs.cant`). `recetas {art, insumos[{inv,cant}|{nombre,cant,costo}], margen}`; el precio = costo × (1 + margen/100) y se
  guarda en `precios` (id = `priceId(art)`) con `receta` y `margen`.
- `public.staff` tiene `rol` (`admin` | `tecnico`) y `nombre` (`supabase/04_puestos.sql`). El técnico solo ve en la app
  sus `visitas` programadas; es filtro de la app, no de RLS (pendiente: permisos por puesto en la base).
- Acceso: RLS; solo correos en `public.staff` leen y escriben (`public.is_staff()`). `anon` no lee nada.
- Clientes del portal: función `public.portal(codigo)` con el `codigoPortal` del cliente (XXXX-XXXX-XX).
- Sitio público: función `public.solicitar_cotizacion(datos)` crea una cotización `Nueva` con `origen: web`.
- Ficha del QR: función `public.ficha_extintor(folio)` (sin cliente ni serie).
- Etiquetas: impresora Zebra ZD420, se imprimen desde el panel (Extintores › Generar etiquetas) con QR a `/e/<folio>`.
- Inspección: los puntos están en `JASA_PUNTOS` (mismo orden que el formato en papel de JASA). Al terminar, la app
  manda la inspección `por revisar`; en el panel se revisa, `jasaHallazgos()` agrupa lo encontrado por categoría y un
  botón crea la cotización `origen: inspeccion` (la inspección queda `revisada`). La app guarda sin señal en localStorage.
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
