"""Arma las páginas que publica Netlify a partir de las fuentes.

- Inserta src/reporte.js en admin.html y en el portal (entre /*@reporte*/ y /*@/reporte*/).
- admin/index.html: el panel con su propio encabezado HTML (admin.html no lo trae porque
  también se publica como página de claude.ai, que lo agrega sola).
- clientes/index.html: el portal de clientes.

Uso: python3 tools/build.py
"""
import datetime
import pathlib
import re

VERSION = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=-6))).strftime("%d/%m/%Y %H:%M")

ROOT = pathlib.Path(__file__).resolve().parent.parent
REPORTE = (ROOT / "src" / "reporte.js").read_text(encoding="utf-8").strip()
MARK = re.compile(r"/\*@reporte\*/.*?/\*@/reporte\*/", re.S)


def inject(text):
    if not MARK.search(text):
        raise SystemExit("Falta el marcador /*@reporte*/ en una fuente")
    return MARK.sub(lambda m: "/*@reporte*/\n" + REPORTE + "\n/*@/reporte*/", text)


admin_src = ROOT / "admin.html"
admin = inject(admin_src.read_text(encoding="utf-8"))
admin_src.write_text(admin, encoding="utf-8")

head = (
    '<!doctype html><html lang="es"><head><meta charset="utf-8">'
    '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
    "<style>:root{color-scheme:light;box-sizing:border-box;padding-top:env(safe-area-inset-top,0px);"
    "padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0;padding:0;font:14px -apple-system,"
    "BlinkMacSystemFont,sans-serif;background:#fff;color:#000}img{max-width:100%}"
    "[hidden]:not([hidden=until-found i]){display:none!important}</style></head><body>\n"
)
(ROOT / "admin").mkdir(exist_ok=True)
(ROOT / "admin" / "index.html").write_text(head + admin.replace("__JASA_VERSION__", VERSION) + "\n</body></html>\n", encoding="utf-8")

portal = inject((ROOT / "src" / "clientes.html").read_text(encoding="utf-8"))
(ROOT / "clientes").mkdir(exist_ok=True)
(ROOT / "clientes" / "index.html").write_text(portal, encoding="utf-8")
for src, out in (("tecnico.html", "tecnico"), ("ficha.html", "e")):
    page = inject((ROOT / "src" / src).read_text(encoding="utf-8")).replace("__JASA_VERSION__", VERSION)
    (ROOT / out).mkdir(exist_ok=True)
    (ROOT / out / "index.html").write_text(page, encoding="utf-8")
print("Listo: admin/, clientes/, tecnico/ y e/ (ficha pública)")
