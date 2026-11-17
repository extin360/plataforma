# JASA Extintores — contexto del proyecto

Sitio y sistema interno de JASA Extintores SA de CV (Piedras Negras, Coahuila). Dueño: Jimmy SVGZ; su hijo
ayuda con la configuración. Todo el texto para el usuario va en español de México. Diseño: manual de identidad 2026 (fondo claro, Negro JASA en
barras y encabezados de tabla, franja roja, Saira Condensed / Barlow / IBM Plex Mono; ámbar solo de fondo o en avisos).

## Qué hay y dónde vive

| Pieza | URL | Fuente | Publicación |
| --- | --- | --- | --- |
| Sitio público | https://jasaextintores.com | `index.html`, `img/` | Netlify publica `main` de GitHub `jasa-extin/jasa-extintores` |
| Panel interno | https://jasaextintores.com/admin | `admin.html` → `tools/build.py` genera `admin/index.html` | Netlify |
| Portal de clientes | https://jasaextintores.com/clientes | `src/clientes.html` → `clientes/index.html` | Netlify |
| App del técnico | https://jasaextintores.com/tecnico | `src/tecnico.html` → `tecnico/index.html` | Netlify |
| Cotización en línea | https://jasaextintores.com/q/<token> | `src/cotizacion.html` → `q/index.html` (`_redirects` manda `/q/*` ahí) | Netlify |
| Ficha pública del QR | https://jasaextintores.com/e/JX-000245 | `src/ficha.html` → `e/index.html` (`_redirects` manda `/e/*` ahí) | Netlify |
| Reportes PDF y puntos de inspección | — | `src/reporte.js` (lo inserta el build en panel, portal, app y ficha) | — |
| Reporte semanal de asistencia | — | `netlify/functions/asistencia-semanal.mjs` (lunes 13:15 UTC) | Netlify Functions |
| Avisos con diseño (formularios) | — | `netlify/functions/submission-created.mjs` (Resend; sin `RESEND_API_KEY` no hace nada) | Netlify Functions |
| Facturas recibidas del SAT | — | `netlify/functions/sat-recibidos.mjs` (cada hora; npm `@nodecfdi/sat-ws-descarga-masiva`, `package.json`, `netlify.toml`) | Netlify Functions |
| Base de datos | Supabase `psggoagcdokwrkykgufr` | `supabase/*.sql` (se pegan en SQL Editor) | Supabase |
| Panel viejo (solo lectura) | claude.ai artifact BHJcxnzgNkVbLfyVe49MNu | `admin.html` en modo claude.ai | Artifact |

Después de cambiar `admin.html` o cualquier archivo de `src/`: `python3 tools/build.py` y commit de los archivos
generados.

## Datos (Supabase)

- Una tabla `public.docs (col, id, data jsonb)`; `col` = colección: `quotes`, `clientes`, `proveedores`,
  `movs`, `ordenes`, `inventario`, `precios`, `pendientes`, `extintores` (id = folio `PREFIJO-001` del cliente, o
  `JX-000001` para etiquetas en blanco; `jasaFolio()` los normaliza), `inspecciones`, `visitas`, `recetas`, `compras`, `conteos`, `firmas` (id = correo; firma PNG de cada persona, va en
  `inspecciones.firmaTecnico`).
- Inspección mensual: clientes con `inspMensual: 'si'`, `diaVisita`, `tecMensual`; el panel (admin) crea solas las
  visitas `men-<cliente>-<YYYY-MM>` del mes actual y el siguiente.
- `supabase/00_revisar.sql` dice qué scripts ya están instalados. Nunca volver a correr `schema.sql` después de
  `05_permisos.sql` (regresaría las políticas viejas).
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
- `public.staff` tiene `rol` (`admin` | `oficina` | `taller` | `tecnico` | `otro`), `nombre` y `permisos text[]`
  (`supabase/04_puestos.sql`, `05_permisos.sql`). RLS de `docs` usa `public.puede(col)`: admin todo; los demás, las
  colecciones que abre cada permiso en `colecciones_de()` (mantener igual que `PERMS`/`SCREEN_PERM` en `admin.html`).
  Solo admin cambia `staff` (pantalla Personal y permisos); un trigger impide quedarse sin administrador. En la app,
  quien no es admin solo ve sus `visitas`.
- Acceso: RLS; solo correos en `public.staff` leen y escriben según sus permisos. `anon` no lee nada.
- Clientes del portal: función `public.portal(codigo)` con el `codigoPortal` del cliente (XXXX-XXXX-XX); desde
  `08_portal_inspecciones.sql` también devuelve `extintores` e `inspecciones` (menos las `en curso`) y el portal descarga el PDF de inspección.
- Sitio público: función `public.solicitar_cotizacion(datos)` crea una cotización `Nueva` con `origen: web` (con `email`
  desde `06_cotizacion_correo.sql`) y manda copia a Netlify Forms (`solicitud-cotizacion`) para el aviso por correo.
  Al aceptarla en el panel se crea el cliente con los datos de la solicitud (o se llenan los que le falten).
- Flujo de cotización: el panel la manda por WhatsApp o correo (cc jasa-extintores@live.com.mx) con enlace
  `/q/<quotes.token>`; el cliente la autoriza (`public.autorizar_cotizacion`, estado `Autorizada`, `autorizo{}`) y
  Netlify Forms `cotizacion-autorizada` avisa por correo. Al aceptarla se abre la orden; en ella se asigna `tecnico`,
  `prioridad` (urgente|normal|programada) y `fechaVisita`, y se avisa al técnico por WhatsApp (`staff.tel`) con enlace
  `/tecnico/#orden-<folio>`. En la app el técnico ve sus órdenes por recoger/entregar, las agrega a su ruta del día
  (`enRuta`, ruta en Google Maps) y marca "Ya lo recogí" (etapa 0 → 1). `supabase/07_cotizacion_en_linea.sql`.
- Avisos por correo: Netlify Forms `solicitud-cotizacion` y `cotizacion-autorizada`; el enlace del aviso abre
  `/admin/#cotizacion-<folio>`.
  Con Resend (`RESEND_API_KEY`, `JASA_CORREO_AVISOS`, `JASA_CORREO_REMITENTE` en Netlify) los avisos salen con el marco de
  `tools/correos.py`; entonces se apagan las notificaciones simples de Netlify Forms para no duplicar.
- Ficha del QR: función `public.ficha_extintor(folio)` (sin cliente ni serie).
- Etiquetas: impresora Zebra ZD420, etiqueta de 50 × 25 mm (predeterminada; `LABEL_SIZES`), se imprimen desde el panel
  (Extintores › Generar etiquetas, Etiqueta, Imprimir pendientes o selección) con QR a `/e/<folio>`.
- Inspección: los puntos están en `JASA_PUNTOS`, iguales al Excel de inspección de JASA: recipiente, pintura, seguro, sello,
  manguera, portamanguera, corneta (BIEN/MAL), acceso (LIBRE/OBST.), letrero y presion (SI/NO). Inspecciones viejas con
  `manometro` se leen con `jasaPuntosDe()` (manometro → presion). El PDF replica el Excel (columnas BIEN/MAL con X, resumen de vencidos). Reporte PDF horizontal con datos de `JASA_EMPRESA`, cliente y firmas de técnico y responsable. Al terminar, la app
  manda la inspección `por revisar`; en el panel se revisa, `jasaHallazgos()` agrupa lo encontrado por categoría y un
  botón crea la cotización `origen: inspeccion` (la inspección queda `revisada`). La app guarda sin señal en localStorage.
- Asistencia (`supabase/09_asistencia.sql`): colección `asistencia` (id `<correo>-<ms>[-tipo]`: email, tipo entrada|comida|regreso|salida, t, fecha,
  hora, lat, lng, distancia, `manual`/`nota`/`por` si la agregó un admin). Se marca solo con `public.marcar_asistencia()`
  (hora del servidor, America/Matamoros; entrada y salida solo dentro del radio de `docs('ajustes','asistencia')
  {lat,lng,radio,correo}`; comida y regreso desde cualquier lugar, `10_asistencia_comida.sql`). Horas = trabajadas sin comida.
  Cada quien lee sus marcas (política "asistencia propia"); admin todo. Panel `#asistencia` (todos), app › Mi cuenta (personal
  sin permiso `campo` entra solo a Mi cuenta). Horas: `jasaAsistCalc()` en `src/reporte.js` (copia en la función de Netlify).
  Reporte del lunes: función programada lee `public.reporte_asistencia(clave,…)` con `JASA_CLAVE_ASISTENCIA` (env de Netlify;
  la clave vive en `public.claves_privadas`) y manda por Resend si hay `RESEND_API_KEY`, si no por Netlify Forms `reporte-asistencia`.
- Facturas recibidas (`supabase/11_facturas_sat.sql`): colección `cfdis` (id = UUID; `jasaCfdiLeer()` en `src/reporte.js`,
  copia en la función) con `estado` nuevo|registrado|ignorado y `forma` pagada|credito|nota|pago (`mov`, `proveedor`, `porPagar`).
  Permiso finanzas. La e.firma: .cer/.key en `public.claves_privadas` (`sat_guardar_efirma`, solo admin; nunca se leen desde
  la app), contraseña solo en Netlify `SAT_EFIRMA_PASS`. La función usa `sat_estado`/`sat_guardar` con `JASA_CLAVE_ASISTENCIA`
  y guarda su avance en `docs('ajustes','sat')` {desde, hasta, pendientes, rfc, error, log}. Pide recibidos vigentes (XML).
  Panel `#facturas`: registrar como egreso, a crédito (suma `saldo` del proveedor) o pago (complemento P resta saldo);
  también se suben XML/ZIP a mano. Proveedores ahora tienen `rfc`.
- Lista precargada para inspección: `extListaDesdeEquipos(cliente)` (panel) y `precargar()` (app) crean los extintores
  `PREFIJO-001…` con `numero`, tipo y capacidad desde `equiposDet` cuando el cliente no tiene ninguno (`precargado: true`,
  ubicación vacía; el técnico la escribe en la primera visita). Se hace sola al guardar un cliente con equipos; en Extintores
  hay botón por cliente y para todos. En la app la visita tiene "‹ Salir" (sigue en curso) y "Cancelar esta inspección"
  (borra la inspección con `enqueue({del:true})`); la lista se ordena por No.
- Llave publicable en el código (es pública por diseño). Nunca poner la Secret key ni contraseñas en el repo.
- Registro de usuarios cerrado: el personal se da de alta en Authentication › Users y en `public.staff`.

## Panel: reportes, monitor e importación

- Reportes (`#reportes`, permiso finanzas): periodo Hoy/Semana/Mes/Bimestre/Trimestre/Semestre/Año/Personalizado;
  gráficas de una sola serie (Carbón = entradas, Rojo JASA = salidas) en SVG con tooltip y tabla.
- Monitor de taller (`#monitor`, permiso taller): pantalla completa tipo comandero para una TV.
- Importar clientes desde Excel (SheetJS 0.18.5 de cdnjs): plantilla descargable; los existentes solo se completan.
- Importar inspección desde Excel (`extImpOpen`, `eiHoja`/`eiParse`, `eiParseSimple`, `eiResolver`, `eiDo`), solo para la
  migración inicial. Plantilla sencilla (`eiTpl`): títulos en la fila 1 (FOLIO, EXT, UBICACIÓN, TIPO, CAP., FECHA REC.,
  FECHA VENC., P.H., un título por punto, COMENTARIOS) con OK / X / NA. También acepta el Excel de siempre de JASA
  (encabezado planta/MES DE/REVISÓ/RESPONSABLE y X en BIEN/MAL). Títulos desconocidos rechazan la hoja; una hoja por planta,
  con cliente, fecha, revisó y responsable elegidos al subir; cualquier fila con error bloquea toda la importación. Casa por folio o cliente + No.; filas sin
  tipo ni capacidad (STOCK) se omiten. `eiTpl` descarga el formato con los extintores del cliente. Extintores tiene selección
  múltiple (modificar, imprimir, eliminar) y una inspección se puede eliminar (`inspDel`, solo admin).
- En celular el panel usa barra inferior (Panel, Cotizar, Taller, Clientes, Más) y el menú como hoja.

## Taller

Etapas (`etapa`, con `etapaV: 2`): 0 Por recoger, 1 Recibido, 2 En reparación, 3 En entrega, 4 Entregado.
Órdenes sin `etapaV` usan la numeración vieja (0–3) y el panel las convierte al cargarlas.
Al entregar: próxima recarga del cliente = mes de entrega + 12 y se descuenta inventario marcado con `consumo`
(`PQS`, `CO2`, `ETIQUETA`).

## Pendientes

Tablero vivo: artifact "Pendientes JASA" (https://claude.ai/artifact/RfWANAWfCLJyoCzcpzqkUc), con base de datos
(`tareas/{id}`: titulo, detalle, quien `tu|claude|ambos`, area, orden, estado `pendiente|hecho`, hechoEn;
`publicaciones/{AAAA-MM-DD-x}`: fecha, orden, titulo, cambios[]). **Cada vez que se publica en `main`:** marcar como
hechas las tareas terminadas, agregar las nuevas que salgan y registrar la publicación (ArtifactData `batch`).
El doc anterior "Plan de pendientes" (https://claude.ai/artifact/BaxhQ51FJp3pDTqNRKmYYp) quedó como historial.
