# Prompt inicial para la cuenta de Claude de Extin360

Cómo usarlo:

1. En GitHub, sube el código a `extin360/plataforma` (pasos en la sección 7.2 de `EXTIN360-MANUAL-Y-PLAN.md`) y
   copia a `docs/` estos archivos: `EXTIN360-PROMPT-INICIAL.md`, `EXTIN360-MANUAL-Y-PLAN.md`, `PENDIENTES.md` y
   `TRASPASO-EXTIN360.md` (si el bundle ya los trae, no hace falta).
2. En claude.ai (tu cuenta) conecta GitHub con el Claude GitHub App en la organización `extin360`.
3. Abre una sesión de Claude Code con el repositorio `extin360/plataforma` y pega el texto de abajo, completo.

---

## Texto para pegar

Hola. Soy Benjamín, dueño de **Extin360**, una plataforma web para negocios de extintores en México. Vas a ser el
desarrollador principal del proyecto desde esta cuenta. Te pongo en contexto, te digo cómo trabajamos y qué sigue.

### De dónde viene
Este código se construyó en noviembre de 2026 para **JASA Extintores SA de CV** (Piedras Negras, Coahuila; el negocio
de mi papá) desde la cuenta de Claude de JASA. Funciona en producción en jasaextintores.com: sitio público, panel
interno, app del técnico, portal de clientes, ficha pública del QR, cotización en línea y funciones automáticas
(correos con Resend, reporte semanal de asistencia, facturas del SAT por Descarga Masiva). Ahora lo convierto en
Extin360 para venderlo a otros negocios de extintores. **JASA va a ser el primer cliente**: lo montamos dentro de mis
cuentas y lo invitamos.

### Lee primero, en este orden
1. `CLAUDE.md`: referencia técnica completa (módulos, datos, reglas de cada pantalla, seguridad, diseño).
2. `docs/EXTIN360-MANUAL-Y-PLAN.md`: qué se construyó, manual de uso por puesto, arquitectura, modelo de Extin360,
   plan por fases y la migración de JASA.
3. `docs/PENDIENTES.md`: pendientes por quién y área, lo terminado y el historial de publicaciones.
4. `docs/TRASPASO-EXTIN360.md`: mapa de cuentas y secretos (solo nombres).
5. `docs/Manual-de-identidad-Extin360.pdf` y `img/extin360/`: marca de Extin360.

Después de leer, dame un resumen corto de lo que entendiste y confirma que puedes hacer push a `main` en
`extin360/plataforma`. No cambies código hasta que te confirme el plan.

### Cómo trabajamos (reglas fijas)
- **Idioma**: todo lo que vea el usuario va en español de México, claro y sin tecnicismos. Yo no soy programador de
  tiempo completo: explícame qué hiciste, qué probaste y qué tengo que hacer yo, paso a paso y con la ruta exacta de
  cada botón (Netlify, Supabase, GitHub).
- **Publicar**: trabajas en la rama `avance`, haces merge fast-forward a `main` y push; Netlify publica solo.
  Después de cambiar `admin.html` o algo de `src/`, corre `python3 tools/build.py` y sube también los archivos
  generados.
- **Pruebas**: antes de publicar, prueba con Playwright (hay Chromium) usando un Supabase simulado y un servidor
  local; para SQL, un Postgres local. Si algo no se puede probar, dímelo.
- **Pendientes**: cada publicación se anota al final del historial de `docs/PENDIENTES.md`; marca lo terminado y
  agrega lo nuevo.
- **Seguridad**:
  - Nunca pongas en el código ni me pidas por chat contraseñas, la Secret key de Supabase, la contraseña de la base,
    la e.firma o el CSD. La llave publicable de Supabase sí puede ir en el código.
  - Los secretos van solo en variables de Netlify o en `public.claves_privadas`.
  - Nunca vuelvas a correr `schema.sql` en una base que ya tenga `05_permisos.sql`.
  - El registro de usuarios está cerrado: el personal se invita.
  - La ficha pública del QR no muestra cliente, serie ni precios.
  - En capturas de venta usa datos ficticios.
- **Datos de la empresa**: nunca los escribas fijos. Usa Mi empresa (`JASA_EMPRESA.*`, `jasaSheetCo()`, `jasaWaLink()`,
  `jasaContacto()`, `jasaIva()`, `data-emp` + `jasaEmpresaPintar()`).
- **Diseño**:
  - Las páginas de cada negocio llevan la marca del negocio (Mi empresa); JASA conserva su manual (fondo claro, negro,
    franja roja, Saira Condensed / Barlow / IBM Plex Mono).
  - Lo de Extin360 (sitio de ventas, consola, instalación) usa su manual: Tinta #0E1726, Rojo señal #E8321F, Verde
    vigente #1DB46C, Niebla #EEF1F4, Inter + IBM Plex Mono.
  - Nunca redibujes el logotipo: usa los archivos.
- **Commits**: mensajes en español, cortos y claros.

### El modelo de Extin360 (ya decidido)
- **Un solo código** en `extin360/plataforma` para todos los negocios.
- **Una instalación por negocio**: su propio proyecto de Supabase (datos aislados, se le entregan si se va) y su propio
  sitio de Netlify (dirección `negocio.extin360.com` o dominio propio).
- **Paquetes**, con IVA incluido y sin límite de extintores ni usuarios:
  - **Básico**: $1,299 al mes.
  - **Profesional**: $2,199 al mes. Agrega asistencia, facturas del SAT, costos, dominio propio y soporte prioritario.
- **Sitio de ventas** en `extin360/` y dominio **extin360.com**, comprado en mi equipo Extin360 de Netlify.

### Plan por fases (detalle en el manual, sección 7)
1. **Fase 1, código para varios negocios**:
   - **Configuración única** (`c21`): hoy la URL y la llave de Supabase están fijas en 9 lugares (`admin.html`, 4
     páginas de `src/`, `index.html` y 3 funciones). Deben salir de una sola configuración, y las funciones deben leer
     `SUPABASE_URL` de Netlify.
   - **Un solo** `supabase/instalar.sql` para una base vacía (`schema.sql` + `02` … `13`, en orden).
   - **Correos de las funciones y sitio público con Mi empresa** (`c20`).
2. **Fase 2**: publicar extin360.com y montar **demo.extin360.com** con datos ficticios, probando la instalación en un paso.
3. **Fase 3, JASA como cliente invitado** (manual, sección 8):
   - base nueva en mi Supabase y datos copiados de la base vieja (`docs` y `staff`; la e.firma se vuelve a subir);
   - sitio nuevo en mi Netlify;
   - invitar al personal de JASA (Authentication › Invite user + Personal y permisos);
   - mover el dominio jasaextintores.com con la lista de verificación del corte.
4. **Fase 4**: consola de Extin360 (`c23`) y marca en panel y app (`c22`).

### Lo primero que te pido
1. Lee todo y dame el resumen.
2. Propón cómo hacer la **configuración única** y el **instalar.sql** sin romper la instalación actual de JASA, que
   sigue en producción mientras migramos.
3. Dime qué cuentas o pasos me tocan a mí antes de empezar (Supabase, Netlify, Resend, Zoho), en orden.

### Mejoras chicas pendientes que ya identificamos
- Importador de Excel: mostrar las filas con error hasta arriba y el mensaje dentro del aviso rojo; aceptar "C02" (con
  cero) como CO2.
- Que los correos de Netlify (`netlify/lib/correo.mjs`) usen el logo y los datos de Mi empresa.
