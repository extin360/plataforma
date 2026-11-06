# JASA Extintores — sitio web

Sitio estático de JASA Extintores (Piedras Negras, Coahuila).

- `index.html` — sitio público (servicios, galería, oferta del mes, formulario de cotización que genera PDF/PNG, botón de WhatsApp).
- `admin.html` — panel interno empaquetado (panel, cotizaciones, clientes, proveedores, finanzas, taller, inventario).
- `img/` — imágenes en WebP (`img/galeria/thumb/` = miniaturas).

## Ver en local

```bash
python3 -m http.server 8080
```

Abrir http://localhost:8080

## Panel interno (`admin.html`)

Aplicación en HTML + JavaScript sin dependencias. Guarda sus datos en la base de datos privada del Artifact de claude.ai
(capacidad `db`; reglas: solo dueño y editores leen y escriben). Fuera de claude.ai muestra un aviso y no expone datos.

Colecciones: `quotes`, `clientes`, `proveedores`, `movs`, `ordenes`, `inventario`.
El botón "Pegar solicitud" lee el mensaje de WhatsApp que genera el formulario de cotización de `index.html`.

## Panel en jasaextintores.com/admin y portal de clientes

- `admin.html` es la fuente del panel. En claude.ai guarda en la base del Artifact; en `jasaextintores.com/admin`
  entra con correo y contraseña y guarda en Supabase (`supabase/schema.sql`).
- `src/clientes.html` es la fuente del portal (`jasaextintores.com/clientes`): cada cliente entra con su código.
- `src/reporte.js` es el reporte de inspección en PDF que comparten los dos.
- Después de cambiar cualquier fuente: `python3 tools/build.py` (genera `admin/index.html` y `clientes/index.html`).
