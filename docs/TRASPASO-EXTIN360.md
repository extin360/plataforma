# Traspaso: de la cuenta de JASA a las cuentas de Extin360

Fecha: 19/11/2026. Hasta ahora todo se construyó desde la cuenta de claude.ai de JASA Extintores. A partir de aquí,
**Extin360** (la plataforma) se desarrolla desde las cuentas de Benjamín (claude.ai, GitHub `jaime-lgtm`,
Netlify, Supabase) y **JASA queda como el cliente número 1**. El sistema es uno solo: lo que se mejore en Extin360
le llega a JASA y a los demás clientes.

## 1. Qué hay hoy y de quién es

| Pieza | Dónde está hoy | A dónde va |
| --- | --- | --- |
| Código (todo el sistema y el sitio extin360.com) | GitHub `jasa-extin/jasa-extintores` (privado) | Organización GitHub **`extin360`** (dueño `jaime-lgtm`), mismo nombre de repositorio |
| Sitio y sistema de JASA (jasaextintores.com, /admin, /tecnico, /clientes, /e, /q) | Proyecto de Netlify de la cuenta de JASA, publica la raíz del repositorio | Se queda igual; solo se vuelve a ligar al repositorio nuevo. Después, opcional: transferir el proyecto al equipo Extin360 |
| Dominio jasaextintores.com | Netlify (cuenta de JASA) | Se queda de JASA (es su marca) |
| Sitio de ventas extin360.com | Carpeta `extin360/` del repositorio; dominio comprado en el equipo **Extin360** de Netlify (cuenta de Benjamín) | Proyecto Netlify del equipo Extin360 con Base directory `extin360` |
| Base de datos de JASA | Supabase, proyecto `psggoagcdokwrkykgufr` (cuenta de JASA) | Opcional después: transferir el proyecto a la organización Supabase de Extin360 (los datos siguen siendo de JASA) |
| Correos con diseño | Resend (cuenta de JASA, dominio jasaextintores.com verificado) | Después: cuenta Resend de Extin360 con los dominios de cada cliente |
| Lista de pendientes | Artifact "Pendientes JASA" en claude.ai (cuenta de JASA) | **`docs/PENDIENTES.md`** en el repositorio (exportado completo) |
| Plantillas de correo de Supabase | Artifact "Correos JASA" (claude.ai/artifact/9EmpeHUxiepKvcVrVH1XRc) | Se pegan en Supabase › Authentication › Emails; no hace falta migrarlo |
| Manual de marca Extin360 | `docs/Manual-de-identidad-Extin360.pdf`, logos en `img/extin360/` | Ya viaja con el repositorio |

## 2. Secretos (solo nombres; los valores nunca van por chat ni al repositorio)

Variables de entorno del proyecto de Netlify de JASA:

- `RESEND_API_KEY`, `JASA_CORREO_AVISOS`, `JASA_CORREO_REMITENTE` — correos con diseño (Resend).
- `JASA_CLAVE_ASISTENCIA` — clave para el reporte semanal y la función del SAT (también vive en `public.claves_privadas`).
- `SAT_EFIRMA_PASS` — contraseña de la e.firma (los .cer/.key están en `public.claves_privadas` de Supabase).
- Futuras: `CSD_PASS`, `FACTORUM_USUARIO`, `FACTORUM_PASSWORD`, `FACTORUM_RFC`.

Si el proyecto de Netlify se transfiere de equipo, **revisar después que las variables sigan ahí**; si falta alguna,
capturarla en persona (no por chat). La llave publicable de Supabase sí está en el código (es pública por diseño).

## 3. Pasos, en orden

### Fase 1 · Código (lo primero, no afecta a JASA)

1. Con la cuenta GitHub **jasa-extin**: aceptar la invitación a la organización `extin360` (Owner).
2. En `jasa-extin/jasa-extintores` › Settings › Danger zone › **Transfer ownership** › `extin360`, mismo nombre.
   GitHub conserva el historial y redirige la dirección vieja. jasaextintores.com sigue en línea con lo último publicado.
3. Con **jaime-lgtm**:
   - Netlify: https://github.com/apps/netlify/installations/new › `extin360` › All repositories › Install.
   - Claude (cuenta de Benjamín): https://claude.ai/connect-github › instalar el Claude GitHub App en `extin360`.
4. En el proyecto de Netlify de **JASA**: Project configuration › Build & deploy › Repository › Manage repository ›
   **Link to a different repository** › `extin360/jasa-extintores`, rama `main`, sin build. Probar con un deploy.
   (Si la cuenta de Netlify de JASA no ve la organización, transferir el proyecto al equipo Extin360:
   Project configuration › General › **Transfer project** › Extin360, y ligarlo desde ahí.)
5. En el equipo **Extin360** de Netlify: Add new project › Import from GitHub › `extin360/jasa-extintores`,
   Base directory `extin360`, Publish `extin360`, sin build. Pasar el dominio extin360.com a este proyecto y
   borrar el proyecto vacío. Forms › Enable form detection › Trigger deploy › Form notifications con el correo.
6. En la cuenta de claude.ai de JASA: desconectar GitHub cuando lo anterior funcione (ya no se usa).

### Fase 2 · Hospedaje y datos (cuando haya un segundo cliente; sin prisa)

- Netlify: transferir el proyecto de JASA al equipo Extin360 (si no se hizo en la fase 1). El dominio
  jasaextintores.com sigue siendo de JASA.
- Supabase: invitar a Benjamín como Owner de la organización de JASA › Project Settings › General ›
  **Transfer project** a la organización Extin360 (plan Pro para producción). Los datos son de JASA.
- Resend: cuenta de Extin360, verificar jasaextintores.com ahí y cambiar `RESEND_API_KEY` en Netlify.
- Poner por escrito con JASA: es cliente de Extin360, sus datos son suyos y se le entregan completos si lo pide.

## 4. Cómo seguir en la cuenta nueva de Claude

1. Abrir Claude Code (web o app) con el repositorio **`extin360/jasa-extintores`**.
2. Claude lee solo `CLAUDE.md` (contexto completo del sistema, reglas de diseño, seguridad y de cada módulo) y
   `docs/PENDIENTES.md`. Este archivo explica el traspaso.
3. Primer mensaje sugerido:

   > Lee CLAUDE.md, docs/TRASPASO-EXTIN360.md y docs/PENDIENTES.md. Este proyecto venía de la cuenta de JASA y
   > ahora lo sigo yo desde la organización extin360. Confirma que puedes publicar en main, y sigamos con la
   > instalación en un paso (c21) para dar de alta un negocio nuevo.

4. Flujo de trabajo que se venía usando: rama `avance`, merge a `main` (Netlify publica solo), `python3 tools/build.py`
   después de cambiar `admin.html` o `src/`, y anotar cada publicación en `docs/PENDIENTES.md`.

## 5. Estado al momento del traspaso

- Último commit publicado en `main`: `6d555e9` (vista previa e íconos de extin360.com, precios con IVA incluido).
  Este archivo y `docs/PENDIENTES.md` van en el commit siguiente.
- Pendientes de JASA en Supabase: correr `12_portal_cotizaciones.sql` y `13_empresa.sql` (revisar con `00_revisar.sql`).
- Facturas del SAT: e.firma cargada el 18/11; falta confirmar la primera descarga.
- Extin360 hecho: Mi empresa configurable, manual y logos, sitio de ventas con paquetes Básico $1,299 y
  Profesional $2,199 al mes (IVA incluido, sin límite de extintores), dominio extin360.com comprado.
- Extin360 siguiente: conectar extin360.com (paso 5), instalación en un paso (c21), correos y sitio público con
  Mi empresa (c20), marca en panel y app (c22), consola del dueño (c23).
