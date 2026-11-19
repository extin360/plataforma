# Pendientes de JASA Extintores y Extin360

Exportado el 19/11/2026 del tablero "Pendientes JASA" (artifact de claude.ai de la cuenta de JASA). Desde ahora este archivo es la fuente: al publicar, marca aquí lo terminado y agrega lo nuevo.

## Pendientes (68)

### Desarrollo (Claude)

**Correos y seguridad**

- [ ] Cambiar el correo del sitio, el portal y los reportes al nuevo dominio `e03`

**Extin360**

- [ ] Extin360: correos de Netlify y sitio público con los datos de Mi empresa `c20`
  - netlify/lib/correo.mjs y las funciones (avisos, reporte semanal, envío de reportes) siguen con JASA fijo; el sitio público index.html también.
- [ ] Extin360: instalación en un paso para un negocio nuevo `c21`
  - Config única (URL y llave de Supabase, dominio) en lugar de valores fijos en cada página; un solo SQL de instalación; guía para crear el proyecto de Supabase y el sitio de Netlify.
- [ ] Extin360: colores y marca del panel y la app (encabezados con el logo del negocio) `c22`
- [ ] Extin360: consola del dueño (clientes del SaaS, planes y estado de cada instalación) `c23`

**Facturación**

- [ ] Conectar la facturación: botón Facturar, PDF y XML al correo del cliente y cancelaciones `f04`

**Por construir**

- [ ] Importar cuentas por cobrar (va con el módulo de Cobranza) `c14`
- [ ] Recolección con firma y comprobante, aviso de listo y entrega con firma desde la app `c10`
  - Pasos 8, 10 y 11 del flujo de órdenes. Para después.
- [ ] Al entregar: cuenta por cobrar, recordatorio de pago y botón Facturar `c11`
  - Paso 12. Se junta con Cuentas por cobrar y la facturación.
- [ ] Cuentas por cobrar: saldo por cliente, pagos y cobro por WhatsApp `c01`
- [ ] Calendario de trabajo y "Mi día" para cada trabajador `c02`
  - Entregas, recolecciones y visitas.
- [ ] Etiqueta de servicio NOM-154 para la Zebra al entregar del taller `c03`
- [ ] Foto y ubicación del técnico en cada inspección `c04`
  - Puede requerir el plan de pago de Supabase por el espacio de las fotos.
- [ ] Recordatorios automáticos de recarga a los clientes `c05`
- [ ] Tablero del cliente en el portal: vigentes, por vencer y reportes por mes `c06`
- [ ] Exportar a Excel la lista de extintores y los reportes `c07`
- [ ] Préstamo de extintores mientras el del cliente está en el taller `c08`
- [ ] Respaldo semanal automático de la base de datos `c09`
- [ ] Ruta con visitas de inspección y orden sugerido por cercanía `c12`
  - Opcional: sumar las visitas a la ruta del día y proponer el orden más corto.

### Los dos

**Correo**

- [ ] Correos de contraseña de Supabase desde Resend (SMTP propio) `c16`
  - Supabase › Authentication › Emails › SMTP Settings con smtp.resend.com y remitente @jasaextintores.com, para que no salgan como Supabase Auth ni con límite de envíos.

**Correos y seguridad**

- [ ] Crear los buzones y conectarlos al dominio en Netlify `e02`
- [ ] Conectar Supabase a un servidor de correo propio (SMTP) para que los correos salgan a nombre de JASA `e08`
  - El correo gratis de Supabase sale como "Supabase Auth", manda pocos por hora y solo llega a miembros del equipo de Supabase: los técnicos no recibirían su enlace. Se hace junto con los correos @jasaextintores.com.

**Facturación**

- [ ] Facturación con Factorum (API de timbrado) `c18`
  - Antes de programar: (1) pedir a Factorum acceso al modo TEST; (2) en Netlify, secretas en Production: FACTORUM_USUARIO, FACTORUM_PASSWORD, FACTORUM_RFC y CSD_PASS; (3) confirmar régimen fiscal de JASA, C.P. de expedición, serie/folio inicial e IVA 8 % de frontera; (4) los archivos del CSD (.cer/.key) se suben desde el panel. Fase 1: Facturar en prueba desde la orden o cotización; fase 2: producción, cancelación y complementos de pago.

**Sitio y clientes**

- [ ] Oferta y flyer de diciembre en el sitio `s01`
- [ ] Enlace para pedir reseñas en Google por WhatsApp `s02`

### Tú (dueño / configuración)

**Correo**

- [ ] Probar aviso de cotización con diseño y apagar los avisos simples de Netlify `p30`
  - Manda una solicitud de prueba desde el sitio. Si llega con diseño: Netlify › Project configuration › Notifications › Form submission notifications › borrar los avisos por correo. En Outlook agrega avisos@jasaextintores.com a Remitentes seguros.
- [ ] Crear correos @jasaextintores.com para el personal `p37`
  - Elegir proveedor (Zoho Mail gratis hasta 5 usuarios, o Google Workspace / Microsoft 365 de paga), agregar sus registros MX/TXT en Netlify › DNS (sin borrar los de Resend) y crear tecnico@, tecnico2@…

**Correos y seguridad**

- [ ] En Supabase, agregar las direcciones permitidas para cambiar contraseña `p23`
  - Authentication › URL Configuration: Site URL https://jasaextintores.com y en Redirect URLs agregar https://jasaextintores.com/admin/ y https://jasaextintores.com/tecnico/
- [ ] Pegar las plantillas de correo en Supabase `p24`
  - Página Correos JASA: https://claude.ai/artifact/9EmpeHUxiepKvcVrVH1XRc (Authentication › Emails).
- [ ] Elegir el correo con tu dominio: Zoho (gratis) o Google Workspace `e01`
- [ ] Verificación en dos pasos en Outlook, Facebook, Google, Netlify, GitHub y Supabase `e04`
- [ ] Guardar las contraseñas en un administrador y cambiar las que se repiten `e05`
- [ ] Revisar quién tiene acceso a Facebook y al Perfil de Empresa en Google `e06`
- [ ] Pasar las cuentas de servicios a un correo admin@ del dominio `e07`

**Extin360**

- [ ] Conectar el proyecto extin360 de Netlify a GitHub (Base directory: extin360) `x01`
  - Project configuration › Build & deploy › Link repository › jasa-extin/jasa-extintores, rama main, Base directory extin360, sin comando de build. Luego Forms › Enable form detection y Form notifications › correo.
- [ ] Crear correo admin@extin360.com (Zoho) y cuentas de Extin360 en GitHub, Supabase y Resend `x02`

**Extintores**

- [ ] Subir los extintores e inspecciones de tus clientes con la plantilla de Excel `p27`
  - Clientes › Extintores e inspecciones (Excel) › Descargar plantilla. Una fila por extintor; columna Cliente para varios a la vez. Al terminar, imprime sus etiquetas en Extintores › Imprimir etiquetas pendientes.
- [ ] Crear las listas de extintores de todos los clientes `p33`
  - Panel › Extintores (sin elegir cliente) › Crear listas de N clientes sin extintores. Toma tipo y capacidad de sus equipos registrados; la ubicación la escribe el técnico en la primera visita. Luego imprimir las etiquetas pendientes.
- [ ] Configurar la Zebra ZD420 para etiqueta de 50 × 25 mm `p35`
  - Preferencias de impresión › tamaño 50 × 25 mm, etiquetas con separación; calibrar (botón de avance hasta 2 parpadeos). En el navegador: impresora Zebra, papel 50 × 25, márgenes Ninguno, escala 100 %, sin encabezados. Probar que el QR se lea con el celular.
- [ ] Corregir los vencimientos que no cuadran `p38`
  - Panel › Extintores: si aparece el aviso “N extintores tienen un vencimiento que no cuadra”, toca Corregir. Deja vence = última recarga + 12 meses.
- [ ] Convertir las fechas de P.H. de cada cliente `p40`
  - Panel › Extintores › elegir cliente: si sale el aviso de P.H., decide si las fechas son la última prueba (como en el Excel) o la próxima. Luego revisa que ya no salgan pruebas hidrostáticas de más al cotizar.

**Facturación**

- [ ] Esperar la respuesta de Factorum sobre su API `f01`
  - Correo enviado a soporte.
- [ ] Si Factorum no tiene API, abrir la cuenta de Facturama API `f02`
- [ ] Conseguir con el contador el CSD (.cer, .key y contraseña) y las claves SAT de tus servicios `f03`
  - No los mandes por el chat; te digo cómo guardarlos.
- [ ] Conectar la e.firma para traer las facturas del SAT `p31`
  - 1) Revisar en Netlify › Deploys que la publicación terminó bien. 2) Netlify › Environment variables: SAT_EFIRMA_PASS (secreta, Production) con la contraseña de la e.firma › Trigger deploy. 3) Panel › Facturas SAT › subir .cer y .key de la e.firma (FIEL, no el CSD). 4) Functions › sat-recibidos › Run now varias veces: pide, espera al SAT y descarga. 5) Revisar el estado en Conexión con el SAT.
- [ ] Capturar el RFC de los proveedores principales `p32`
  - Proveedores › Editar › RFC. Así cada factura del SAT se liga sola a su proveedor (si no, al registrarla se crea uno nuevo).
- [ ] Poner SAT_EFIRMA_PASS en Netlify `p39`
  - Contraseña de la e.firma (la del archivo .key), no la CIEC ni la del sello de facturar. Secreta, en Production. Luego Trigger deploy y Functions › sat-recibidos › Run now dos veces con unos minutos de diferencia.

**Inspecciones**

- [ ] Migrar las inspecciones de cada planta con la plantilla sencilla `p34`
  - EKM ya quedó (17/11). Faltan las demás plantas: en el cliente › Importar extintores e inspección › Descargar plantilla › llenar con OK / X / NA › subirla.
- [ ] Quitar la inspección repetida de EKM `p36`
  - Panel › Inspecciones › abrir la que sobra (la del archivo equivocado) › Eliminar inspección. Desaparece también del portal.

**Para usarlo ya**

- [ ] Hacer la prueba completa: cotización del sitio → enlace → autorizar → orden → técnico `p20`
  - Con tu nombre y tu celular; al final borra la cotización y la orden de prueba.
- [ ] Revisar y aprobar el flujo completo: solicitud → taller → nota o factura → cobro → reportes `p22`
  - Mi propuesta está en el chat del 15/11. Con tu visto bueno lo construyo.
- [ ] Mandar una cotización de prueba desde jasaextintores.com `p02`
  - Debe llegarte el correo y aparecer en Cotizaciones del panel. Después bórrala.
- [ ] Probar la app del técnico con un cliente de confianza `p05`
  - Programa la visita, escanea, termina con firma y revisa el reporte en Inspecciones.
- [ ] Poner el monitor de taller en una TV o compu del taller `p25`
  - Abrir jasaextintores.com/admin#monitor con un usuario de puesto Taller y tocar Pantalla completa.
- [ ] Capturar datos fiscales y ubicación de los clientes principales `p06`
  - Clientes › Editar: planta, correo del responsable y datos de facturación.
- [ ] Activar la inspección mensual en los clientes con contrato `p07`
  - Ficha del cliente › Servicio: Sí, día del mes y técnico.
- [ ] Capturar el costo de los insumos y armar las recetas de tus servicios principales `p09`
  - Costos y precios. Empieza por Recarga de extintor 2 kg PQS.
- [ ] Levantar el inventario físico inicial `p10`
  - Inventario › Levantar inventario.
- [ ] Cerrar o reprogramar las órdenes atrasadas del taller `p11`
- [ ] Agregar el teléfono de cada cliente y corregir el cliente "La" `p12`
- [ ] Mandar a cada cliente su código del portal `p13`
  - Clientes › Portal.
- [ ] Poner la app del técnico en la pantalla de inicio de los celulares del taller `p15`
- [ ] Decidir si el taller necesita la etapa "En elaboración" para ventas de extintores nuevos `p16`

**Personal**

- [ ] Fijar la ubicación del negocio en Asistencia `p28`
  - Desde el negocio: panel › Asistencia › Usar mi ubicación actual › Guardar. Revisa el radio (150 m) y el correo del reporte.

**Supabase**

- [ ] Correr 09_asistencia.sql y poner la clave en Netlify (JASA_CLAVE_ASISTENCIA) `t-sql-09`
  - El 09 ya se corrió. Falta: Netlify › Environment variables › Key JASA_CLAVE_ASISTENCIA, marcar Contains secret values, pegar la clave en Values › Create variable, y luego Deploys › Trigger deploy.
- [ ] Correr 10_asistencia_comida.sql en Supabase `t-sql-10`
  - Activa los botones Salir a comer / Regresé de comer. No cambia la clave del reporte.
- [ ] Correr 12_portal_cotizaciones.sql en Supabase `t-sql-12`
  - Para que el portal del cliente muestre sus cotizaciones enviadas (Ver y autorizar).
- [ ] Correr 13_empresa.sql en Supabase `t-sql-13`
  - Para que el portal, la ficha del QR, la app y la cotización en línea usen los datos de Mi empresa. Luego revisa Panel › Mi empresa (los campos vacíos usan los datos de JASA).

## Terminadas (61)

- [x] Sitio jasaextintores.com en Netlify con dominio y HTTPS (2026-11-06) `h01`
- [x] Panel en jasaextintores.com/admin con base de datos en Supabase (2026-11-06) `h02`
- [x] Portal de clientes con código de acceso (2026-11-06) `h03`
- [x] Search Console verificado y sitemap enviado (2026-11-06) `h04`
- [x] Las cotizaciones del sitio llegan solas al panel (2026-11-07) `h05`
- [x] Extintores con folio y QR, app del técnico e inspecciones digitales (2026-11-09) `h06`
- [x] Ficha pública del extintor al escanear su QR (script 03) (2026-11-09) `h07`
- [x] Correr supabase/06_cotizacion_correo.sql en Supabase (2026-11-14) `p00`
- [x] Activar Forms en Netlify y el aviso por correo de cotizaciones (2026-11-14) `p01`
- [x] Correr supabase/07_cotizacion_en_linea.sql en Supabase (2026-11-15) `p17`
- [x] Agregar en Netlify el aviso por correo del formulario cotizacion-autorizada (2026-11-15) `p18`
- [x] Correr 08_portal_inspecciones.sql en Supabase (2026-11-15) `t-sql-08`
- [x] Poner el WhatsApp de cada técnico en Personal y permisos (2026-11-15) `p19`
- [x] Importar inspecciones y extintores del sistema anterior (Excel) y asignarlas a cliente (2026-11-15) `c13`
- [x] Sitio público con el diseño claro del manual de identidad (2026-11-15) `s03`
- [x] Folios por cliente, precarga de extintores y etiquetas con número y ubicación (2026-11-15) `h08`
- [x] Visitas programadas: cada técnico ve solo las suyas (2026-11-15) `h09`
- [x] Revisión de inspecciones y cotización en un botón (2026-11-15) `h10`
- [x] Costos y recetas con % de ganancia (2026-11-15) `h11`
- [x] Levantar inventario y órdenes de compra (2026-11-15) `h12`
- [x] Plan Personal de Netlify; la app del técnico ya abre (2026-11-15) `h13`
- [x] Clientes con ubicación de la planta, datos fiscales y correos (2026-11-15) `h14`
- [x] Diseño claro según el manual de identidad (2026-11-15) `h15`
- [x] Personal y permisos protegidos en la base de datos (script 05) (2026-11-15) `h16`
- [x] Reporte de inspección nuevo con manómetro, válvula, soporte y firmas (2026-11-15) `h17`
- [x] Firma del técnico en sus reportes (2026-11-15) `h18`
- [x] Inspección mensual programada sola (2026-11-15) `h19`
- [x] Recuadro Powered by Netlify apagado (2026-11-15) `h20`
- [x] Correo a Factorum enviado (2026-11-15) `h21`
- [x] Aviso por correo de cotizaciones del sitio programado (2026-11-15) `h22`
- [x] El cotizador del sitio pide el correo y, al aceptar, el cliente se registra solo (2026-11-15) `h23`
- [x] Cotización en línea: el cliente la autoriza desde un enlace (2026-11-15) `h24`
- [x] Orden con técnico y prioridad, aviso por WhatsApp y ruta del día en la app (2026-11-15) `h25`
- [x] Botón para asignar y avisar al técnico desde la cotización aceptada y el tablero de taller (2026-11-15) `h26`
- [x] Íconos de JASA en todas las páginas y app instalable (2026-11-15) `h27`
- [x] Todas las páginas revisadas en celular, iPad y computadora (2026-11-15) `h28`
- [x] Inspección del técnico como cuestionario de una pregunta a la vez (2026-11-15) `h29`
- [x] Cómo llegar con la dirección exacta; pedir ubicación por WhatsApp si falta (2026-11-15) `h30`
- [x] ¿Olvidaste tu contraseña? en el panel y la app del técnico (2026-11-15) `h31`
- [x] Correos de acceso con la identidad de JASA (recuperar contraseña, invitación y más) (2026-11-15) `h32`
- [x] Cambios de la orden visibles para el técnico: Guardado, indicaciones y Avisar cambios (2026-11-15) `h33`
- [x] Ruta del día acomodable con flechas y app que se actualiza sola (2026-11-15) `h34`
- [x] App del técnico con pestañas: Mi ruta, Órdenes, Inspecciones y Mi cuenta (2026-11-15) `h35`
- [x] Taller: Listo o Pendiente por extintor y botón para quitar todos los listos (2026-11-15) `h36`
- [x] App del técnico: buscador de clientes, alta de cliente nuevo, capacidades por tipo y explicación del resultado (2026-11-15) `h37`
- [x] Reportes con gráficas y filtros por periodo (2026-11-15) `h38`
- [x] Monitor de taller para TV (2026-11-15) `h39`
- [x] Importar clientes desde Excel y panel adaptado a celular (2026-11-15) `h40`
- [x] Acceso al portal por WhatsApp o correo, con código fácil de copiar y enlace directo (2026-11-15) `h41`
- [x] Conectar Resend para que los avisos lleguen con el diseño de JASA (2026-11-16) `c15`
- [x] Revisar que llegue el reporte de asistencia del lunes (2026-11-16) `p29`
- [x] Correr 11_facturas_sat.sql en Supabase (2026-11-17) `t-sql-11`
- [x] Imprimir etiquetas de prueba en la Zebra ZD420 (2026-11-17) `p03`
- [x] Decidir la estrategia de QR: solo en el extintor, o también en el punto de ubicación (2026-11-17) `p21`
- [x] Dar de alta a los técnicos con su firma (2026-11-17) `p04`
- [x] Importar los clientes del sistema anterior con la plantilla de Excel (2026-11-17) `p26`
- [x] Precargar los extintores de un cliente e imprimir sus etiquetas (2026-11-17) `p08`
- [x] Confirmar el RFC de JASA con la Constancia de Situación Fiscal (2026-11-17) `p14`
- [x] Revisar la estructura del formato de inspección (2026-11-17) `c17`
- [x] Extin360: hacer configurable “Mi empresa” (primer paso del SaaS) (2026-11-18) `c19`
- [x] Comprar el dominio extin360.com (2026-11-19) `x00`

## Historial de publicaciones

### 2026-11-15 · Folios, visitas, costos e inventario

- Folios por cliente con precarga de extintores y etiquetas
- Visitas programadas: el técnico ve solo las suyas
- Revisión de inspecciones y cotización en un botón
- Costos y recetas con % de ganancia
- Levantar inventario y órdenes de compra

### 2026-11-15 · Diseño claro, permisos y datos de clientes

- Diseño claro del manual de identidad en panel, portal, app y ficha QR
- Personal y permisos protegidos en la base de datos
- Ubicación de la planta, datos fiscales y correos de cada cliente
- Enviar cotizaciones y reportes por correo

### 2026-11-15 · Reporte nuevo, firmas y avisos por correo

- Reporte de inspección nuevo: manómetro, válvula, soporte, estado de cada extintor y datos de JASA y del cliente
- Firma del técnico en sus reportes (se captura en el panel o en la app)
- Inspección mensual programada sola
- Aviso por correo de cada cotización del sitio (falta activar Forms en Netlify)
- Marca de versión en el panel y en la app del técnico

### 2026-11-15 · Sitio en claro y cotizador que registra al cliente

- Sitio jasaextintores.com con la identidad clara de JASA: encabezado y pie en Negro JASA con la franja roja
- El cotizador del sitio pide el correo del cliente (falta correr el script 06 en Supabase)
- Al aceptar una cotización, el cliente queda registrado con contacto, teléfono, correo, dirección y RFC
- Netlify ya detecta el formulario de cotizaciones para el aviso por correo

### 2026-11-15 · Cotización en línea y órdenes al técnico

- Enviar la cotización por WhatsApp o por correo (con copia a JASA) con un enlace propio
- El cliente ve su cotización y la autoriza desde el enlace; a JASA le llega el aviso
- Al aceptar se abre la orden: técnico, prioridad y fecha, y aviso al técnico por WhatsApp
- App del técnico: sus órdenes, Cómo llegar, ruta del día en Maps y Ya lo recogí
- El correo de nueva solicitud abre directo esa solicitud en el panel
- Falta correr el script 07 en Supabase

### 2026-11-15 · Asignar técnico siempre a la mano

- Cotización ya aceptada: botón Ver orden y asignar técnico
- Al aceptar, la orden se abre sola para elegir técnico y prioridad
- Tablero de taller: Asignar técnico o Avisar al técnico en cada tarjeta por recoger o en entrega

### 2026-11-15 · Íconos, celular y tablet, y cuestionario de inspección

- Ícono de app del manual en sitio, panel, portal, app del técnico, ficha QR y cotización
- Panel y app del técnico se pueden agregar a la pantalla de inicio con su ícono
- Panel en celular: menú sin desbordes y con Cerrar sesión
- Inspección como cuestionario: una pregunta a la vez, Sí/No grandes, atajo Todo lo demás está bien y resumen

### 2026-11-15 · Cómo llegar con la dirección exacta

- La orden guarda la dirección de recolección y se puede corregir desde el panel
- Si no hay calle y número, la app ofrece pedir la ubicación por WhatsApp
- El sitio pide la dirección donde recogemos

### 2026-11-15 · Recuperar contraseña

- ¿Olvidaste tu contraseña? en el panel y en la app del técnico: llega un correo con enlace para crear una nueva

### 2026-11-15 · Correos de acceso con la identidad de JASA

- Plantillas para recuperar contraseña, invitación, enlace para entrar, cambio de correo, confirmación y código
- Logo para los correos en jasaextintores.com/img/logo-correo.png
- El panel y la app aceptan el enlace de invitación para crear la contraseña

### 2026-11-15 · Cambios visibles para el técnico y ruta acomodable

- La orden avisa que se guarda sola y la hora del último cambio
- Indicaciones para el técnico y botón Avisar cambios por WhatsApp
- La app del técnico se actualiza sola y tiene botón Actualizar
- Mi ruta de hoy: paradas numeradas que se acomodan; Maps sigue ese orden

### 2026-11-15 · App del técnico con pestañas

- Barra inferior: Mi ruta, Órdenes, Inspecciones y Mi cuenta, con contadores
- Mi ruta junta las paradas del día, lo urgente y las inspecciones de hoy
- Taller: cada extintor dice Listo o Pendiente y se pueden quitar todos los listos

### 2026-11-15 · Inspección más rápida en la app

- Buscador de clientes y alta de cliente nuevo al iniciar una inspección
- Capacidad con botones según el tipo de extintor
- Explicación de Conforme, Requiere servicio y Retirar de servicio

### 2026-11-15 · Reportes, monitor de taller e importar clientes

- Reportes con gráficas y filtros: hoy, semana, mes, bimestre, trimestre, semestre, año o fechas a elegir
- Monitor de taller a pantalla completa para TV
- Importar clientes desde Excel con plantilla
- Panel en celular con barra inferior y menú Más
- Ícono sólido para la pantalla de inicio

### 2026-11-15 · Acceso al portal más fácil

- Portal: ventana con el código grande y botón Copiar código
- Enviar el acceso por WhatsApp o por correo (con copia a JASA)
- Enlace directo que entra al portal sin escribir el código

### 2026-11-15 · Portal: reportes de inspección y extintores

- El cliente ve sus reportes de inspección y los descarga en PDF
- Lista de extintores con folio, ubicación y vencimiento (Vigente, Por vencer, Vencido)
- Próxima recarga se calcula del extintor que vence primero
- Botón Salir visible en el encabezado

### 2026-11-15 · Alta masiva de extintores e inspecciones

- Importar extintores e inspecciones desde Excel, para uno o varios clientes a la vez
- Plantilla igual al formato de inspección en papel (puntos Bien/Mal, resultado y observaciones)
- Crea el reporte de inspección revisado y el cliente lo ve en su portal
- Botón en el formato de cada cliente, en Clientes y en Extintores
- Botón de clientes renombrado a “Alta masiva de clientes”

### 2026-11-16 · Asistencia con ubicación

- Marcar entrada y salida en el panel (Asistencia) y en la app (Mi cuenta), solo dentro del negocio
- La hora la pone el servidor y se rechaza si estás fuera del radio o el GPS no es preciso
- Personal de taller sin permiso de campo puede entrar a la app solo para marcar
- Tabla semanal con horas por día y total, avisos de marcas sin salida, marcas manuales y Excel
- Reporte semanal por correo cada lunes (función programada de Netlify)

### 2026-11-16 · Asistencia: hora de comida

- Botones Salir a comer y Regresé de comer en el panel y en la app
- La comida se marca desde cualquier lugar; entrada y salida siguen siendo dentro del negocio
- Las horas de la semana son trabajadas, sin contar la comida; el Excel y el correo muestran también el tiempo de comida
- Avisos de comida sin regreso o de más de 3 horas

### 2026-11-16 · Avisos por correo con diseño de JASA

- Reporte semanal de asistencia probado: llega por Netlify Forms
- Nueva función que manda con el diseño de JASA los avisos de solicitud de cotización y cotización autorizada
- El reporte semanal también sale con el diseño (logo, franja roja, tabla por día)
- Se activa al conectar Resend; mientras tanto siguen los avisos simples

### 2026-11-16 · Facturas recibidas del SAT

- Nueva pantalla Facturas SAT (permiso de finanzas)
- Cada hora se piden al SAT las facturas vigentes que le hicieron a JASA (Descarga Masiva con e.firma) y se guardan sin duplicar
- Registrar cada factura como egreso pagado, a crédito (suma a lo que se le debe al proveedor) o nota de crédito; los complementos de pago crean el egreso y bajan el saldo
- Subir a mano XML o el ZIP del portal del SAT
- La e.firma se sube desde el panel y la contraseña vive solo en Netlify
- Proveedores con RFC

### 2026-11-17 · Inspección con lista precargada

- La lista de extintores sale precargada desde los equipos del cliente (folio, No., tipo y capacidad); el técnico solo escribe la ubicación la primera vez
- Se crea sola al dar de alta un cliente con equipos; en Extintores hay botón por cliente y para todos los clientes a la vez
- En la app: botón ‹ Salir (la inspección sigue abierta) y Cancelar esta inspección
- Desde las preguntas de cada extintor se puede regresar a la lista
- La lista se ordena por No. y pide la ubicación cuando falta

### 2026-11-17 · Inspección con el formato de JASA

- Puntos iguales al Excel de JASA: recipiente, pintura, seguro, sello, manguera, porta manguera, corneta (BIEN/MAL), acceso (LIBRE/OBST.), letrero y presión (SI/NO)
- El PDF de inspección replica el Excel: columnas BIEN/MAL con X, revisó y responsable, resumen de vencidos, señalamientos y P.H.
- El importador solo acepta el formato de JASA, una hoja por planta; si una fila tiene error no importa nada
- Formato descargable con los extintores del cliente ya llenos
- Extintores: seleccionar varios para modificar, imprimir etiquetas o eliminar
- Inspecciones: botón Eliminar inspección

### 2026-11-17 · Plantilla de inspección sencilla

- Títulos en la fila 1, sin encabezado arriba
- Un título por punto: OK = bien, X = mal, NA = no aplica, vacío = no revisado
- La planta, fecha, revisó y responsable se eligen al subir el archivo
- La plantilla del cliente ya trae su folio, número, ubicación, tipo, capacidad y fechas
- Se sigue aceptando el Excel de siempre (X en BIEN/MAL); títulos o valores desconocidos bloquean la carga

### 2026-11-17 · Etiquetas de 50 × 25 mm

- Nuevo tamaño 50 × 25 mm como predeterminado para la Zebra (también en reimpresiones y selección)
- Quien tenía guardado 51 × 25 pasa solo a 50 × 25
- La última etiqueta ya no deja una hoja en blanco

### 2026-11-17 · Portal de clientes más completo

- Próxima recarga y vencidos se calculan con los extintores de la planta (ya no con una fecha vieja)
- Reportes de inspección: botón Ver (en pantalla) y PDF
- Requiere atención: lo que encontró la última inspección, con botón Pedir cotización por WhatsApp
- Calendario de recargas de los próximos 12 meses
- Cotizaciones enviadas al cliente con Ver y autorizar (requiere el script 12)
- Al importar otra vez la inspección del mismo mes, se ofrece reemplazar la anterior

### 2026-11-17 · Vencimiento automático y Ver inspección tipo PDF

- El vencimiento de la recarga ya no se captura: se calcula solo con la última recarga + 12 meses (NOM-154), en el panel, la app, la importación y la edición masiva
- No deja guardar una última recarga en un mes futuro
- Aviso en Extintores con botón para corregir los vencimientos que no cuadran
- Portal: Ver muestra el reporte con el formato del PDF en pantalla, sin descargar (tocar para acercar)

### 2026-11-17 · Log de la conexión con el SAT

- La función sat-recibidos escribe en el log de Netlify qué pasó: falta contraseña, e.firma abierta con su RFC, solicitud enviada, el SAT aún prepara el paquete, facturas descargadas o error del SAT

### 2026-11-17 · Diagnóstico de la e.firma

- Si se subió el sello digital (CSD) en lugar de la e.firma, el log y el panel lo dicen con el nombre del titular
- Si la e.firma está vencida, dice la fecha en que venció

### 2026-11-17 · Estado de la conexión con el SAT

- Después de volver a subir la e.firma dice “Esperando la siguiente corrida” en lugar de “Conectado”
- Aviso si la fecha inicial es de este mes (no traería las facturas anteriores)

### 2026-11-18 · P.H. cada 5 años, recargas adelantadas y envío de reportes

- Se captura la última prueba hidrostática y la próxima se calcula sola (+5 años) en panel, app, importación y edición masiva
- Aviso en Extintores para convertir las fechas de P.H. ya capturadas (última o próxima)
- Al cotizar desde la inspección entran las recargas vencidas y las del mes, y se pueden adelantar 1 a 3 meses
- En el portal, botón Cotizar adelantando las recargas del mes siguiente
- Para cotizar: agregar conceptos extra a petición del cliente y actualizar la cotización si sigue Nueva
- WhatsApp del reporte con enlace y código del portal
- Correo del reporte enviado desde el sistema con el PDF adjunto y copia a JASA

### 2026-11-18 · Inspección no programada en la app del técnico

- La sección Inspección no programada aparece siempre en la pestaña Inspecciones, también para técnicos
- Si hay una inspección abierta, se avisa en vez de ocultar la opción
- Al cambiar de pestaña la app actualiza visitas y órdenes sola (ya no hay que ir a Mi cuenta)

### 2026-11-18 · P.H. corregida en reportes y portal

- Aviso en el detalle de la inspección cuando el cliente tiene fechas de P.H. sin aclarar (botones Es la última / Es la próxima)
- Al convertir las fechas de P.H. también se corrigen los reportes de inspección de ese cliente
- Botón Actualizar P.H. del reporte para inspecciones con fechas viejas
- El portal calcula Requiere atención con la P.H. actual del extintor

### 2026-11-18 · Resultado de la inspección con la P.H. corregida

- Al convertir o actualizar la P.H. del reporte se recalcula el resultado de cada extintor (Conforme / Requiere servicio)
- También se corrige el último resultado que muestra la ficha del QR
- Reportes ya convertidos antes con resultado viejo muestran el botón Actualizar P.H. del reporte

### 2026-11-18 · App del técnico: soltar cliente y cancelar

- Botón ✕ Quitar cliente en Inspección no programada
- Cancelar esta inspección también desde la tarjeta Inspección en curso (si venía de una visita, la visita vuelve a programada)

### 2026-11-18 · Extin360 paso 1: Mi empresa

- Nueva pantalla Mi empresa (solo administradores): nombre, razón social, RFC, domicilio, teléfono, WhatsApp, correo, sitio, I.V.A., norma, pie de cotización, etiqueta y logo
- Cotizaciones, órdenes, reportes, etiquetas y mensajes de WhatsApp y correo toman esos datos
- Portal, ficha del QR, cotización en línea y app del técnico también (con 13_empresa.sql)
- Sin cambios visibles para JASA: los campos vacíos usan los datos de siempre

### 2026-11-18 · Marca Extin360 en el repositorio

- Manual de identidad (docs/) y logotipos SVG, PNG y favicons (img/extin360/)
- Reglas de la marca anotadas para el trabajo de Extin360: la plataforma lleva Extin360; cada negocio, su propia marca

### 2026-11-19 · Sitio de ventas de Extin360

- Página extin360.com con el manual de identidad: funciones, cómo funciona, capturas con marca de demostración, paquetes Básico $1,299 y Profesional $2,199, preguntas y formulario para pedir demostración
- Ficha del QR, portal y app: los textos que decían JASA ahora usan la marca de Mi empresa

### 2026-11-19 · Extin360: vista previa al compartir e íconos

- Imagen y texto de vista previa al compartir el enlace (WhatsApp, Facebook, X)
- Favicons de 16, 32, 48, 180, 192 y 512 px, ícono SVG y manifiesto para instalar en el celular
- Precios con IVA incluido
