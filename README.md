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
