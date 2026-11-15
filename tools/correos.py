"""Plantillas de los correos de acceso (Supabase › Authentication › Emails) con la identidad de JASA.

Genera supabase/correos/*.html. Cada archivo se pega en la plantilla del mismo nombre en Supabase.
Uso: python3 tools/correos.py
"""
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "supabase" / "correos"
LOGO = "https://jasaextintores.com/img/logo-correo.png"

DISPLAY = "'Saira Condensed','Arial Narrow','Helvetica Neue',Arial,sans-serif"
BODY = "Barlow,'Helvetica Neue',Arial,sans-serif"
MONO = "'IBM Plex Mono',Consolas,'Courier New',monospace"


def correo(eyebrow, titulo, parrafos, boton=None, nota="", codigo=None):
    ps = "".join(
        f'<p style="margin:0 0 14px;font-family:{BODY};font-size:16px;line-height:1.55;color:#1a1716">{p}</p>'
        for p in parrafos
    )
    btn = ""
    if boton:
        btn = (
            '<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 20px"><tr>'
            f'<td bgcolor="#E10F0F" style="border-radius:3px">'
            f'<a href="{{{{ .ConfirmationURL }}}}" style="display:inline-block;padding:14px 26px;font-family:{DISPLAY};'
            'font-weight:900;font-size:18px;letter-spacing:.04em;text-transform:uppercase;color:#ffffff;text-decoration:none;'
            f'border-radius:3px">{boton}</a></td></tr></table>'
            f'<p style="margin:0 0 6px;font-family:{BODY};font-size:13px;color:#6b6460">Si el botón no abre, copia y pega este enlace en tu navegador:</p>'
            f'<p style="margin:0 0 18px;font-family:{MONO};font-size:12px;line-height:1.4;word-break:break-all">'
            '<a href="{{ .ConfirmationURL }}" style="color:#b80c0c">{{ .ConfirmationURL }}</a></p>'
        )
    cod = ""
    if codigo:
        cod = (
            f'<p style="margin:6px 0 20px;font-family:{MONO};font-size:34px;letter-spacing:.3em;font-weight:700;'
            f'color:#1a1716;background:#f3f1ee;border-radius:6px;padding:14px 18px;text-align:center">{codigo}</p>'
        )
    nota_html = (
        f'<p style="margin:0;padding-top:16px;border-top:1px solid #e3ded9;font-family:{BODY};font-size:13px;'
        f'line-height:1.5;color:#6b6460">{nota}</p>' if nota else ""
    )
    return f"""<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>{titulo}</title></head>
<body style="margin:0;padding:0;background:#f3f1ee">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f3f1ee" style="background:#f3f1ee"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%">
<tr><td bgcolor="#0d0d0d" style="background:#0d0d0d;padding:22px 28px;border-radius:6px 6px 0 0">
<img src="{LOGO}" width="190" alt="Extintores JASA" style="display:block;width:190px;max-width:60%;height:auto;border:0"></td></tr>
<tr><td bgcolor="#E10F0F" style="background:#E10F0F;height:5px;line-height:5px;font-size:0">&nbsp;</td></tr>
<tr><td bgcolor="#ffffff" style="background:#ffffff;padding:30px 28px 26px;border:1px solid #e3ded9;border-top:0;border-radius:0 0 6px 6px">
<p style="margin:0 0 8px;font-family:{MONO};font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#6b6460">{eyebrow}</p>
<h1 style="margin:0 0 18px;font-family:{DISPLAY};font-weight:900;font-size:32px;line-height:1;text-transform:uppercase;color:#1a1716">{titulo}</h1>
{ps}{cod}{btn}{nota_html}
</td></tr>
<tr><td style="padding:18px 8px 0;text-align:center">
<p style="margin:0 0 6px;font-family:{BODY};font-size:12px;line-height:1.5;color:#6b6460">JASA Extintores SA de CV · Mutualista 412, Col. Buena Vista Sur, Piedras Negras, Coahuila<br>Tel. 878 783 3216 · WhatsApp 878 117 4728</p>
<p style="margin:0;font-family:{MONO};font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:#a8a09b">Seguridad confiable</p>
</td></tr></table>
</td></tr></table>
</body></html>
"""


PLANTILLAS = [
    ("recuperar_contrasena", "Reset Password", "Crea tu nueva contraseña · JASA Extintores",
     correo("Recuperar acceso", "Crea tu nueva contraseña",
            ["Recibimos una solicitud para cambiar la contraseña de <b>{{ .Email }}</b> en el sistema de JASA Extintores.",
             "Toca el botón para crear una nueva. El enlace sirve durante 1 hora y solo una vez."],
            boton="Crear contraseña nueva",
            nota="Si tú no lo pediste, ignora este correo: tu contraseña sigue igual y nadie puede entrar sin ella.")),
    ("invitacion", "Invite user", "Tu acceso al sistema de JASA Extintores",
     correo("Bienvenido al equipo", "Ya tienes acceso",
            ["Te dieron acceso al sistema de JASA Extintores con el correo <b>{{ .Email }}</b>.",
             "Toca el botón para crear tu contraseña. Después entra en <b>jasaextintores.com/admin</b> (oficina) o "
             "<b>jasaextintores.com/tecnico</b> (técnicos, desde el celular)."],
            boton="Crear mi contraseña",
            nota="El enlace sirve durante 24 horas. Si no esperabas este correo, ignóralo.")),
    ("enlace_para_entrar", "Magic Link", "Tu enlace para entrar · JASA Extintores",
     correo("Entrar sin contraseña", "Tu enlace para entrar",
            ["Toca el botón para entrar al sistema de JASA Extintores con <b>{{ .Email }}</b>. El enlace sirve durante 1 hora y solo una vez."],
            boton="Entrar",
            nota="Si tú no lo pediste, ignora este correo.")),
    ("cambio_de_correo", "Change Email Address", "Confirma tu nuevo correo · JASA Extintores",
     correo("Cambio de correo", "Confirma tu nuevo correo",
            ["Pediste cambiar el correo de tu cuenta de <b>{{ .Email }}</b> a <b>{{ .NewEmail }}</b>.",
             "Toca el botón para confirmarlo."],
            boton="Confirmar cambio",
            nota="Si tú no pediste este cambio, avisa a la oficina de JASA de inmediato.")),
    ("confirmar_correo", "Confirm signup", "Confirma tu correo · JASA Extintores",
     correo("Confirmar correo", "Confirma tu correo",
            ["Toca el botón para confirmar <b>{{ .Email }}</b> en el sistema de JASA Extintores."],
            boton="Confirmar correo",
            nota="Si no reconoces este correo, ignóralo.")),
    ("codigo_de_verificacion", "Reauthentication", "Tu código de verificación · JASA Extintores",
     correo("Verificación", "Tu código de verificación",
            ["Escribe este código en el sistema de JASA Extintores para confirmar que eres tú:"],
            codigo="{{ .Token }}",
            nota="El código vence en unos minutos. Si no lo pediste, cambia tu contraseña.")),
]

if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    lines = ["# Correos de acceso de JASA (Supabase › Authentication › Emails)", "",
             "| Plantilla en Supabase | Asunto | Archivo |", "| --- | --- | --- |"]
    for nombre, plantilla, asunto, html in PLANTILLAS:
        (OUT / f"{nombre}.html").write_text(html, encoding="utf-8")
        lines.append(f"| {plantilla} | {asunto} | `{nombre}.html` |")
    (OUT / "LEEME.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
    print("Listo:", ", ".join(p[0] for p in PLANTILLAS))
