// JASA Extintores: avisos por correo con la identidad de JASA para los formularios del sitio.
// Netlify la corre sola cada vez que llega un formulario (evento "submission-created").
// Solo manda correo si existe RESEND_API_KEY; sin ella no hace nada y siguen los avisos simples de Netlify.
// Variables de entorno en Netlify:
//   RESEND_API_KEY          clave de Resend (secreta).
//   JASA_CORREO_AVISOS      a quién llegan los avisos (uno o varios separados por coma). Si falta: jasa-extintores@live.com.mx
//   JASA_CORREO_REMITENTE   p. ej. "JASA Extintores <avisos@jasaextintores.com>" (dominio verificado en Resend).
const LOGO = "https://jasaextintores.com/img/logo-correo.png";
const DISPLAY = "'Saira Condensed','Arial Narrow','Helvetica Neue',Arial,sans-serif";
const BODY = "Barlow,'Helvetica Neue',Arial,sans-serif";
const MONO = "'IBM Plex Mono',Consolas,'Courier New',monospace";
const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// Mismo marco que supabase/correos (tools/correos.py)
function marco({ eyebrow, titulo, intro = "", filas = [], bloque = "", boton = null, nota = "" }) {
  const tabla = filas.filter((f) => f[1]).map(([k, v, html]) =>
    `<tr><td style="padding:9px 12px 9px 0;border-bottom:1px solid #e3ded9;font-family:${MONO};font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:#6b6460;vertical-align:top;white-space:nowrap">${esc(k)}</td>` +
    `<td style="padding:9px 0;border-bottom:1px solid #e3ded9;font-family:${BODY};font-size:16px;line-height:1.45;color:#1a1716">${html ? v : esc(v)}</td></tr>`).join("");
  const btn = boton ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:22px 0 6px"><tr><td bgcolor="#E10F0F" style="border-radius:3px"><a href="${esc(boton[1])}" style="display:inline-block;padding:14px 26px;font-family:${DISPLAY};font-weight:900;font-size:18px;letter-spacing:.04em;text-transform:uppercase;color:#ffffff;text-decoration:none;border-radius:3px">${esc(boton[0])}</a></td></tr></table>` : "";
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${esc(titulo)}</title></head>
<body style="margin:0;padding:0;background:#f3f1ee"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f3f1ee" style="background:#f3f1ee"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%">
<tr><td bgcolor="#0d0d0d" style="background:#0d0d0d;padding:22px 28px;border-radius:6px 6px 0 0"><img src="${LOGO}" width="190" alt="Extintores JASA" style="display:block;width:190px;max-width:60%;height:auto;border:0"></td></tr>
<tr><td bgcolor="#E10F0F" style="background:#E10F0F;height:5px;line-height:5px;font-size:0">&nbsp;</td></tr>
<tr><td bgcolor="#ffffff" style="background:#ffffff;padding:30px 28px 26px;border:1px solid #e3ded9;border-top:0;border-radius:0 0 6px 6px">
<p style="margin:0 0 8px;font-family:${MONO};font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#6b6460">${esc(eyebrow)}</p>
<h1 style="margin:0 0 16px;font-family:${DISPLAY};font-weight:900;font-size:32px;line-height:1;text-transform:uppercase;color:#1a1716">${esc(titulo)}</h1>
${intro ? `<p style="margin:0 0 14px;font-family:${BODY};font-size:16px;line-height:1.55;color:#1a1716">${intro}</p>` : ""}
${tabla ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:3px solid #1a1716">${tabla}</table>` : ""}
${bloque}${btn}
${nota ? `<p style="margin:18px 0 0;padding-top:16px;border-top:1px solid #e3ded9;font-family:${BODY};font-size:13px;line-height:1.5;color:#6b6460">${nota}</p>` : ""}
</td></tr>
<tr><td style="padding:18px 8px 0;text-align:center"><p style="margin:0 0 6px;font-family:${BODY};font-size:12px;line-height:1.5;color:#6b6460">JASA Extintores SA de CV · Mutualista 412, Col. Buena Vista Sur, Piedras Negras, Coahuila<br>Tel. 878 783 3216 · WhatsApp 878 117 4728</p>
<p style="margin:0;font-family:${MONO};font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:#a8a09b">Seguridad confiable</p></td></tr>
</table></td></tr></table></body></html>`;
}

const wa = (tel) => { const d = String(tel || "").replace(/\D/g, "").slice(-10); return d.length === 10 ? `<a href="https://wa.me/52${d}" style="color:#b80c0c">${esc(tel)}</a> · <a href="tel:${d}" style="color:#b80c0c">llamar</a>` : esc(tel); };
const pre = (t) => t ? `<div style="margin:18px 0 0;padding:14px 16px;background:#f3f1ee;border-left:4px solid #E10F0F;border-radius:3px;font-family:${BODY};font-size:15px;line-height:1.5;color:#1a1716;white-space:pre-wrap">${esc(t)}</div>` : "";

function armar(form, d) {
  if (form === "solicitud-cotizacion") {
    return {
      asunto: d.subject || `Nueva solicitud de cotización ${d.folio || ""}`,
      responder: /@/.test(d.correo || "") ? d.correo : "",
      html: marco({
        eyebrow: "Sitio web · solicitud de cotización", titulo: `Nueva solicitud ${d.folio || ""}`,
        intro: "Llegó una solicitud desde jasaextintores.com. Ya está en el panel como cotización <b>Nueva</b>.",
        filas: [["Cliente", d.cliente], ["Teléfono", d.telefono ? wa(d.telefono) : "", true], ["Correo", d.correo], ["Dirección", d.ciudad]],
        bloque: pre(d.detalle), boton: d.ver_solicitud ? ["Ver solicitud", d.ver_solicitud] : null,
        nota: "Respóndele por WhatsApp o manda la cotización desde el panel con el botón Enviar por correo.",
      }),
    };
  }
  if (form === "cotizacion-autorizada") {
    return {
      asunto: d.subject || `Cotización autorizada ${d.folio || ""}`,
      html: marco({
        eyebrow: "Cotización en línea · autorizada", titulo: `${d.folio || "Cotización"} autorizada`,
        intro: `<b>${esc(d.cliente)}</b> autorizó la cotización desde su enlace.`,
        filas: [["Cliente", d.cliente], ["Autorizó", d.autorizo], ["Total", d.total]],
        bloque: d.comentario ? pre("Comentario del cliente:\n" + d.comentario) : "",
        boton: d.ver_cotizacion ? ["Abrir y convertir en orden", d.ver_cotizacion] : null,
        nota: "Al aceptarla en el panel se abre la orden de taller para asignar técnico.",
      }),
    };
  }
  return null; // reporte-asistencia lo manda con diseño la función asistencia-semanal
}

export const handler = async (event) => {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { statusCode: 200, body: "Sin RESEND_API_KEY: solo aviso de Netlify" };
  let p = {};
  try { p = JSON.parse(event.body || "{}").payload || {}; } catch (e) { return { statusCode: 200, body: "Sin datos" }; }
  const form = p.form_name || (p.data && p.data["form-name"]) || "";
  const c = armar(form, p.data || {});
  if (!c) return { statusCode: 200, body: "Formulario sin plantilla: " + form };
  const para = (process.env.JASA_CORREO_AVISOS || "jasa-extintores@live.com.mx").split(/[,;\s]+/).filter(Boolean);
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST", headers: { Authorization: "Bearer " + key, "Content-Type": "application/json" },
    body: JSON.stringify({ from: process.env.JASA_CORREO_REMITENTE || "JASA Extintores <avisos@jasaextintores.com>", to: para, subject: c.asunto, html: c.html, ...(c.responder ? { reply_to: c.responder } : {}) }),
  });
  const t = await r.text();
  console.log("Resend", form, r.status, t.slice(0, 200));
  return { statusCode: 200, body: "Resend " + r.status };
};
