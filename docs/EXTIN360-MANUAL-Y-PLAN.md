# Extin360 · Manual del sistema y plan de implementación

Documento de traspaso, 19/11/2026. Resume todo lo que se construyó para **JASA Extintores** (Piedras Negras, Coahuila)
desde la cuenta de claude.ai de JASA, cómo se usa, cómo está hecho por dentro y cómo se monta **Extin360** desde cero
en las cuentas de Benjamín, con **JASA como el primer cliente** al que se invita.

Archivos que acompañan a este documento:

- `EXTIN360-PROMPT-INICIAL.md`: el mensaje para arrancar la cuenta nueva de Claude.
- `PENDIENTES.md`: todos los pendientes (68), lo terminado (61) y las 39 publicaciones.
- `TRASPASO-EXTIN360.md`: mapa de cuentas y secretos.
- `jasa-extintores.bundle`: el código completo con todo su historial (`git clone jasa-extintores.bundle plataforma`).
- `CLAUDE.md` (dentro del código): la referencia técnica que Claude lee en cada sesión.

---

## Índice

1. Resumen
2. Qué se construyó (por módulo)
3. Manual de uso por puesto
4. Cómo está hecho por dentro
5. Seguridad y secretos
6. Extin360: modelo, marca y paquetes
7. Plan para montar Extin360 desde cero
8. Migración de JASA como cliente invitado
9. Lista de verificación del cambio (día del corte)
10. Pendientes y siguientes pasos
11. Glosario

---

## 1. Resumen

JASA tenía su operación en Excel, papel y WhatsApp. En noviembre de 2026 se construyó un sistema completo en la web:

- **Sitio público** jasaextintores.com con solicitud de cotización.
- **Panel interno** (/admin): clientes, cotizaciones, taller, inventario, costos, finanzas, facturas del SAT, extintores,
  inspecciones, asistencia, personal y permisos, reportes, monitor del taller, Mi empresa.
- **App del técnico** (/tecnico): ruta del día, órdenes por recoger/entregar, inspección en el celular con firma y sin
  señal, asistencia.
- **Portal de clientes** (/clientes): extintores, vencimientos, calendario, reportes PDF, cotizaciones.
- **Ficha pública del QR** (/e/FOLIO) y **cotización en línea** (/q/TOKEN) que el cliente autoriza.
- **Funciones automáticas**: avisos por correo con diseño, envío de reportes PDF, reporte semanal de asistencia,
  descarga de facturas del SAT cada hora.

Todo vive en un solo repositorio, se publica en Netlify y guarda los datos en Supabase. La idea de **Extin360** es vender
ese mismo sistema a otros negocios de extintores: cada negocio con **su propia base de datos**, su marca y su dominio, y
un solo código para todos.

---

## 2. Qué se construyó (por módulo)

### 2.1 Clientes
- Cada registro es una **planta o ubicación** de servicio: dirección, ciudad, estado, C.P., mapa, contacto, teléfono,
  correo para reportes.
- **Datos fiscales CFDI 4.0** (razón social, RFC, régimen, C.P. fiscal, uso de CFDI, método y forma de pago, días de
  crédito, requiere OC, correo de facturación) o **"Factura a nombre de"** otra planta (corporativo).
- **Inspección mensual**: día de visita y técnico; el panel crea solas las visitas del mes y del siguiente.
- **Código de portal** (XXXX-XXXX-XX) para que el cliente entre a su portal.
- **Importar clientes desde Excel** con plantilla; los que ya existen solo se completan.

### 2.2 Cotizaciones
- Folio, líneas con lista de precios, condiciones, vigencia, tiempo de entrega. Hoja carta en PDF o imagen con el
  encabezado de la empresa.
- Llegan solas desde el **sitio público** (estado Nueva, origen web) con aviso por correo.
- Se mandan por **WhatsApp o correo** con enlace `/q/<token>`; el cliente la **autoriza en línea** con su nombre y
  comentario, y llega aviso por correo.
- Al aceptarla se crea el cliente (si no existe) y se abre la **orden de taller**.
- Desde una **inspección** se genera la cotización de lo encontrado (ver 2.7).

### 2.3 Taller
- Etapas: **Por recoger → Recibido → En reparación → En entrega → Entregado**.
- La orden asigna **técnico, prioridad** (urgente/normal/programada) y **fecha de visita**; avisa al técnico por WhatsApp.
- Detalle por extintor (serie, fabricación, P.H., etiqueta) y **reporte de servicio** en PDF.
- Al entregar: próxima recarga del cliente = mes de entrega + 12 y se descuenta inventario (PQS, CO2, etiquetas).
- **Monitor de taller** a pantalla completa para una TV.

### 2.4 Inventario, compras y costos
- Existencias con mínimo, **levantar inventario** (conteo y aplicar) y **órdenes de compra** (Borrador → Enviada →
  Recibida); al recibir suma existencias, actualiza el costo y registra el egreso o el saldo con el proveedor.
- **Recetas**: insumos de cada servicio + margen = precio, que se guarda en la lista de precios.

### 2.5 Finanzas, reportes y facturas del SAT
- Ingresos y egresos, proveedores con saldo y RFC.
- **Reportes** por periodo (hoy a año o personalizado) con gráficas y tablas.
- **Facturas recibidas del SAT**: cada hora se descargan con la **e.firma** (Descarga Masiva) las facturas que le hacen
  al negocio; se registran como gasto pagado, a crédito, nota de crédito o pago. También se suben XML/ZIP a mano.
  Estado al traspaso: e.firma cargada el 18/11, esperando la primera descarga.

### 2.6 Extintores y etiquetas QR
- Cada extintor con **folio** (`PREFIJO-001` del cliente, o `JX-000001` para etiquetas en blanco), número, ubicación,
  tipo, capacidad, recarga, vencimiento, P.H. y estado.
- **Vencimiento automático** (NOM-154): recarga + 12 meses; nunca se captura y no se aceptan recargas en meses futuros.
- **Prueba hidrostática**: se captura la **última**; la próxima = + 5 años. Aviso y botón para convertir fechas viejas.
- **Lista precargada** desde los equipos registrados del cliente (el técnico escribe la ubicación en la primera visita).
- Selección múltiple: modificar, imprimir, eliminar.
- **Etiquetas** para Zebra ZD420, 50 × 25 mm (también 76 × 51 y 102 × 51), con QR a la ficha pública.
- **Importar extintores e inspección desde Excel** (plantilla sencilla con OK / X / NA o el Excel de papel de JASA),
  estricto: cualquier fila con error bloquea la importación.

### 2.7 Inspecciones
- Puntos (iguales al Excel de JASA): recipiente, pintura, seguro, sello, manguera, portamanguera, corneta (bien/mal),
  acceso (libre/obstruido), letrero y presión (sí/no).
- El técnico la hace en el celular; al terminar queda **por revisar** con su firma y la del responsable.
- En el panel: **Requiere atención** agrupa lo encontrado; se pueden **adelantar recargas** 1 a 3 meses, **agregar
  conceptos** y crear o actualizar la **cotización**.
- **Reporte PDF horizontal** que replica el formato de papel (BIEN/MAL con X, resumen de vencidos, firmas).
- **Enviar por WhatsApp** (enlace y código del portal) o **por correo** con el PDF adjunto y copia al negocio.

### 2.8 App del técnico
- **Mi ruta**: órdenes por recoger y entregar, ruta del día en Google Maps, "Ya lo recogí".
- **Inspecciones**: visitas asignadas y **no programadas**; lista ordenada por número; escanear QR; guardar sin señal;
  salir y continuar después, o cancelar.
- **Mi cuenta**: firma, asistencia, actualizar órdenes y visitas.

### 2.9 Portal de clientes y páginas públicas
- **Portal**: extintores en la planta, vencidos, próxima recarga, en el taller, "Requiere atención" con botón de
  cotizar (o adelantando), reportes con **Ver** (las hojas en pantalla) y **PDF**, calendario de recargas a 12 meses,
  cotizaciones por autorizar, lista de extintores y órdenes.
- **Ficha del QR**: tipo, capacidad, ubicación, recarga, vencimiento, P.H. y última revisión (sin cliente, serie ni precios).
- **Cotización en línea**: ver y autorizar.

### 2.10 Personal, permisos y asistencia
- Puestos: administrador, oficina, taller, técnico, otro; **permisos por módulo**, cumplidos en la base de datos.
- Registro cerrado: el personal se da de alta en Supabase (Authentication) y en Personal y permisos.
- **Asistencia** con ubicación: entrada y salida dentro del radio del negocio; comida y regreso desde cualquier lugar;
  marcas manuales del administrador; exportar a Excel; **reporte semanal** por correo cada lunes.

### 2.11 Mi empresa (primer paso de Extin360)
- Pantalla para capturar nombre comercial, razón social, RFC, domicilio, teléfono, WhatsApp, correo, sitio, I.V.A.,
  norma, pie de cotización, textos de la etiqueta y logo. Todo el sistema y las páginas públicas toman esos datos.

---

## 3. Manual de uso por puesto

### Administrador (dueño)
1. **Mi empresa**: revisar datos y logo (vacíos = valores de fábrica).
2. **Personal y permisos**: dar de alta a cada persona (correo, puesto, permisos) y crear su usuario en Supabase.
3. **Asistencia**: fijar la ubicación del negocio y el radio; correo del reporte semanal.
4. **Clientes**: importar desde Excel; capturar datos fiscales; activar inspección mensual; mandar código del portal.
5. **Extintores**: importar con la plantilla, convertir fechas de P.H., corregir vencimientos, imprimir etiquetas.
6. **Costos y precios**: insumos y recetas; **Inventario**: levantar inventario inicial.
7. **Facturas SAT**: subir la e.firma (FIEL); la contraseña va en Netlify.

### Oficina
- Revisar **Cotizaciones** nuevas (sitio web) y autorizadas; mandar por WhatsApp o correo; aceptar → orden.
- En la orden: asignar técnico, prioridad y fecha; avisar por WhatsApp.
- Revisar **Inspecciones** por revisar, ajustar lo que se cotiza y mandar el reporte.

### Taller
- **Taller**: mover órdenes por etapa, capturar datos de cada extintor, reporte de servicio, entregar.
- **Monitor** en la TV.

### Técnico (celular, /tecnico; agregar a la pantalla de inicio)
1. Primera vez: dibujar la firma en Mi cuenta.
2. **Mi ruta**: agregar órdenes a la ruta, abrir Maps, marcar "Ya lo recogí".
3. **Inspecciones**: tocar la visita (o "Inspección no programada"), escanear o elegir cada extintor, contestar los
   puntos, terminar con la firma del responsable. Sin señal se guarda y se manda solo.
4. **Mi cuenta**: entrada, comida, regreso y salida.

### Cliente
- Portal con su código: ver extintores, vencimientos, reportes (Ver / PDF), autorizar cotizaciones, pedir cotización.
- Escanear el QR de un extintor para ver su ficha.

---

## 4. Cómo está hecho por dentro

| Pieza | Archivo fuente | Se publica como |
| --- | --- | --- |
| Sitio público | `index.html`, `img/` | `/` |
| Panel | `admin.html` | `admin/index.html` (lo genera `tools/build.py`) |
| Portal | `src/clientes.html` | `clientes/index.html` |
| App del técnico | `src/tecnico.html` | `tecnico/index.html` |
| Ficha QR | `src/ficha.html` | `e/index.html` (`_redirects`: `/e/*`) |
| Cotización en línea | `src/cotizacion.html` | `q/index.html` (`_redirects`: `/q/*`) |
| Código compartido | `src/reporte.js` (reportes PDF, puntos, vigencias, Mi empresa, CFDI, asistencia) | El build lo inserta entre `/*@reporte*/` y `/*@/reporte*/` |
| Funciones | `netlify/functions/*.mjs`, `netlify/lib/correo.mjs` | Netlify Functions |
| Base de datos | `supabase/*.sql` | Se pegan en SQL Editor |
| Sitio de ventas | `extin360/` | Proyecto Netlify aparte (Base directory `extin360`) |

- **Sin framework ni build de páginas**: HTML + JS puro. `python3 tools/build.py` después de cambiar `admin.html` o `src/`.
- **Datos**: una tabla `public.docs (col, id, data jsonb)` con colecciones (quotes, clientes, ordenes, extintores,
  inspecciones, visitas, inventario, compras, precios, recetas, movs, proveedores, firmas, asistencia, cfdis, ajustes…),
  más `public.staff` y `public.claves_privadas`. Seguridad por RLS con `public.puede(col)`.
- **Funciones de base de datos** (security definer) para lo público: `portal`, `ficha_extintor`, `solicitar_cotizacion`,
  `cotizacion_publica`, `autorizar_cotizacion`, `marcar_asistencia`, `reporte_asistencia`, `sat_*`, `empresa_publica`.
- **Orden de instalación en una base nueva**: `schema.sql`, `02` … `13` (no existe `01`). **Nunca** volver a correr
  `schema.sql` después de `05_permisos.sql`. `00_revisar.sql` dice qué está instalado.
- **Pruebas**: Playwright con un Supabase simulado y un servidor local; Postgres local para probar SQL.
- **Hoy la URL y la llave de Supabase están escritas en 9 lugares** (`admin.html`, 4 páginas de `src/`, `index.html` y 3
  funciones). La instalación en un paso las junta en una sola configuración (ver 7.2).

---

## 5. Seguridad y secretos

- La **llave publicable** de Supabase puede estar en el código. La **Secret key**, la contraseña de la base de datos y
  cualquier contraseña **nunca** van al código ni por chat.
- Variables de Netlify (solo nombres): `RESEND_API_KEY`, `JASA_CORREO_AVISOS`, `JASA_CORREO_REMITENTE`,
  `JASA_CLAVE_ASISTENCIA`, `SAT_EFIRMA_PASS`; futuras `CSD_PASS`, `FACTORUM_USUARIO`, `FACTORUM_PASSWORD`, `FACTORUM_RFC`.
- e.firma (.cer/.key) en `public.claves_privadas`, nunca legibles desde la app; la contraseña solo en Netlify.
- `anon` no lee la tabla `docs`; todo lo público pasa por funciones que devuelven solo lo necesario.
- La ficha del QR no muestra cliente, serie ni precios. Capturas de venta siempre con datos ficticios.
- Archivos sensibles (e.firma, CSD, contraseñas) se entregan en persona o por USB, nunca por chat ni correo.

---

## 6. Extin360: modelo, marca y paquetes

- **Qué es**: la plataforma para negocios de extintores. Cada negocio tiene su panel, app, portal, ficha y cotización
  **con su propia marca** (Mi empresa); Extin360 es la marca de la plataforma (sitio de ventas, consola, instalación).
- **Modelo técnico**: **una base de datos de Supabase por negocio** (aislamiento total, sus datos se le entregan si se va)
  y **un sitio de Netlify por negocio**, todos publicando el **mismo código**. Costo aproximado por negocio: USD 10 al mes
  de Supabase + USD 25 al mes del plan Pro (uno para todos).
- **Marca** (`docs/Manual-de-identidad-Extin360.pdf`, `img/extin360/`): Tinta #0E1726, Rojo señal #E8321F, Rojo claro
  #FF5A44 (solo sobre tinta), Verde vigente #1DB46C, Niebla #EEF1F4, Pizarra #4A5566, ámbar #F2A516 solo «por vencer».
  Inter 400/600/800 e IBM Plex Mono 500. El 0 es un manómetro; nunca redibujar el logotipo.
- **Paquetes** (IVA incluido, sin límite de extintores ni usuarios):
  - **Básico $1,299 al mes** ($12,990 al año): operación completa, portal, QR, app, cotizaciones, taller, inventario;
    dirección `negocio.extin360.com`; instalación $3,900.
  - **Profesional $2,199 al mes** ($21,990 al año): todo lo anterior + asistencia, facturas del SAT, costos y reportes
    financieros, dominio propio, facturación cuando exista, soporte prioritario; instalación $5,900.
- **Hecho**: Mi empresa, manual y logos en el código, sitio de ventas en `extin360/` (vista previa al compartir,
  íconos, formulario de demostración), dominio **extin360.com** comprado en el equipo Extin360 de Netlify.

---

## 7. Plan para montar Extin360 desde cero

Todo con las cuentas de Benjamín. La cuenta de claude.ai de JASA deja de usarse para desarrollo.

### 7.1 Fase 0 · Cuentas (Benjamín)
- GitHub: organización **`extin360`** (ya creada). Repositorio nuevo **`extin360/plataforma`** (privado, vacío).
- claude.ai: conectar GitHub e instalar el **Claude GitHub App** en `extin360`.
- Netlify: equipo **Extin360** (ya creado, con extin360.com). Instalar el app de Netlify en la organización `extin360`.
- Supabase: organización **Extin360** (plan Pro cuando entre el primer cliente real).
- Correo: Zoho con `admin@extin360.com` (registros MX/TXT en Netlify DNS). Resend: cuenta de Extin360, dominio extin360.com.

### 7.2 Fase 1 · Subir el código y prepararlo para varios negocios
1. Clonar el bundle y subirlo a `extin360/plataforma`:
   ```
   git clone jasa-extintores.bundle plataforma
   cd plataforma
   git remote set-url origin https://github.com/extin360/plataforma.git
   git push -u origin main avance
   ```
2. **Configuración única** (tarea `c21`): un archivo `config.js` (o variables que el build inserta) con URL y llave
   publicable de Supabase, dominio y prefijo de etiquetas. Las 9 copias fijas se reemplazan por esa configuración; las
   funciones leen `SUPABASE_URL` de las variables de Netlify.
3. **Un solo SQL de instalación**: `supabase/instalar.sql` que junta `schema.sql` + `02` … `13` en el orden correcto, y
   que se puede correr una vez en una base vacía. Los scripts sueltos quedan como historial.
4. **Correos y sitio con Mi empresa** (tarea `c20`): `netlify/lib/correo.mjs`, las funciones e `index.html` toman los
   datos del negocio (remitente, logo, colores) en lugar de JASA fijo.
5. Renombrar lo genérico con calma (`JASA_EMPRESA` → mantener alias), sin romper nada.

### 7.3 Fase 2 · Demo y sitio de ventas
- Proyecto Netlify **extin360.com** desde `extin360/plataforma` con Base directory `extin360`; Forms activado.
- Instancia **demo.extin360.com**: Supabase nuevo + Netlify nuevo + datos ficticios. Sirve para probar la instalación en
  un paso y para enseñar el sistema.

### 7.4 Fase 3 · JASA como primer cliente invitado (sección 8)

### 7.5 Fase 4 · Consola Extin360 (tarea `c23`)
- Lista de negocios, paquete, estado de cada instalación (último deploy, versión, base de datos), altas y bajas.

---

## 8. Migración de JASA como cliente invitado

La base de JASA hoy está en el Supabase de la cuenta de JASA (`psggoagcdokwrkykgufr`) y el sitio en el Netlify de JASA.
Para que Extin360 lo maneje todo, se monta **una instalación nueva de JASA dentro de las cuentas de Extin360** y luego
se **invita** al personal de JASA. Pasos:

1. **Base nueva**: en Supabase Extin360 crear el proyecto `jasa` (región cercana a México); correr `instalar.sql`.
   Authentication › URL Configuration: Site URL `https://jasaextintores.com` y redirecciones `/admin/` y `/tecnico/`.
   Pegar las plantillas de correo de `supabase/correos/` (ver su `LEEME.md`) y, de preferencia, SMTP propio (Resend).
2. **Copiar los datos** (lo hace quien tenga acceso a la base vieja; nunca pegar contraseñas en el chat):
   - Tabla `public.docs` completa y `public.staff`: exportar desde la base vieja (Table Editor › Export CSV, o
     `pg_dump --data-only -t public.docs -t public.staff`) e importar en la nueva.
   - `public.claves_privadas` **no se copia**: volver a subir la e.firma desde el panel nuevo y usar la
     `JASA_CLAVE_ASISTENCIA` nueva que crea la instalación (en SQL Editor: `select valor from public.claves_privadas
     where nombre = 'reporte_asistencia'`; se copia directo a Netlify, nunca al chat).
   - Revisar con `00_revisar.sql` y contar registros por colección en las dos bases (deben coincidir).
3. **Sitio nuevo**: proyecto Netlify del equipo Extin360 desde `extin360/plataforma` (raíz), con las variables de entorno
   (capturadas en persona) y la configuración apuntando a la base nueva. Probar en la dirección `*.netlify.app`.
4. **Invitar a JASA**:
   - Supabase › Authentication › **Invite user** con el correo de cada persona de JASA (el registro sigue cerrado).
   - En el panel nuevo › Personal y permisos: dar de alta a esas personas con su puesto; el dueño de JASA como
     **administrador** de su instalación. Benjamín queda como administrador técnico.
   - Opcional: invitar a JASA al equipo de Netlify solo con permiso de ver (no hace falta para usar el sistema).
5. **Cambio de dominio**: jasaextintores.com es de JASA. En el Netlify de JASA quitar el dominio del proyecto viejo y
   agregarlo al proyecto nuevo (o transferir el dominio al equipo Extin360 si JASA lo autoriza). Los QR impresos siguen
   funcionando porque apuntan a `jasaextintores.com/e/FOLIO`.
6. **Después del corte**: el proyecto viejo de Netlify y la base vieja quedan en pausa unas semanas como respaldo; luego
   se borran con autorización de JASA.
7. **Acuerdo por escrito**: JASA es cliente de Extin360, sus datos son suyos y se le entregan completos si lo pide.

---

## 9. Lista de verificación del cambio (día del corte)

- [ ] Avisar al personal: 1 hora sin capturar (de preferencia sábado por la tarde).
- [ ] Técnicos: sin inspecciones pendientes de mandar en el celular (la app dice "Todo guardado").
- [ ] Exportar `docs` y `staff` de la base vieja; importar en la nueva; comparar conteos por colección.
- [ ] Variables de Netlify capturadas en el proyecto nuevo; e.firma subida; clave de asistencia nueva.
- [ ] Probar en `*.netlify.app`: entrar al panel, abrir un cliente, una inspección, el portal con un código real, una
      ficha QR, una cotización en línea, mandar un correo de prueba.
- [ ] Mover el dominio; esperar el candado (HTTPS); repetir las pruebas en jasaextintores.com.
- [ ] Técnicos: cerrar sesión y volver a entrar en la app (la base nueva pide su usuario).
- [ ] Revisar al día siguiente: reporte del SAT, avisos por correo, asistencia.
- [ ] Plan de regreso: si algo falla, devolver el dominio al proyecto viejo (la base vieja sigue intacta).

---

## 10. Pendientes y siguientes pasos

Ver `PENDIENTES.md` (lista completa). Lo más importante:

- **Extin360**: conectar extin360.com; instalación en un paso (`c21`); correos y sitio con Mi empresa (`c20`); marca en
  panel y app (`c22`); consola (`c23`); demo.
- **JASA (antes o durante la migración)**: correr `12_portal_cotizaciones.sql` y `13_empresa.sql` en la base actual;
  confirmar la primera descarga del SAT; convertir fechas de P.H. por cliente; importar EMN (corregir **C02 → CO2** en la
  celda D203 del Excel); quitar la inspección repetida de EKM; configurar la Zebra.
- **Mejoras chicas ya identificadas**: que el importador muestre las filas con error hasta arriba y acepte "C02" con
  cero como CO2.
- **Por construir**: cuentas por cobrar y cobranza, facturación con Factorum (timbrado), recordatorios automáticos de
  recarga, foto y ubicación en la inspección, préstamo de extintores, respaldo semanal, exportar a Excel, etiqueta de
  servicio NOM-154, calendario "Mi día".

---

## 11. Glosario

- **P.H.**: prueba hidrostática (cada 5 años). **NOM-154-SCFI**: servicio de extintores (vigencia 12 meses).
  **NOM-002-STPS**: revisión mensual en el centro de trabajo.
- **e.firma (FIEL)**: firma electrónica del SAT para descargar facturas. **CSD**: sello para timbrar facturas (distinto).
- **RLS**: reglas de la base de datos que deciden quién lee y escribe cada cosa.
- **Bundle**: archivo con el repositorio completo y su historial.
- **Instancia**: la instalación de un negocio (su base de Supabase + su sitio de Netlify).
