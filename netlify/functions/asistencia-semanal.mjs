// JASA Extintores: reporte semanal de asistencia por correo.
// Corre cada lunes en la mañana (hora de Piedras Negras) con la semana anterior (lunes a domingo).
// Variables de entorno en Netlify (Site configuration › Environment variables):
//   JASA_CLAVE_ASISTENCIA  (obligatoria) la clave que muestra supabase/09_asistencia.sql al correrlo.
//   RESEND_API_KEY         (opcional) si existe, el correo sale con diseño desde Resend;
//                          si no, se manda por Netlify Forms ("reporte-asistencia") al correo de avisos de formularios.
//   JASA_CORREO_REMITENTE  (opcional, con Resend) p. ej. "JASA Extintores <avisos@jasaextintores.com>".
const SUPA_URL = "https://psggoagcdokwrkykgufr.supabase.co";
const SUPA_KEY = "sb_publishable_jwx2IRxOqdCW-SjmKcYW2A_lrJTFJa3";
const SITE = "https://jasaextintores.com";
const TZ = "America/Matamoros";
const DIAS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const hm = (m) => { m = Math.max(0, Math.round(m || 0)); return Math.floor(m / 60) + ":" + String(m % 60).padStart(2, "0"); };
const iso = (d) => d.toISOString().slice(0, 10);
const fmtD = (f) => { const p = f.split("-"); return +p[2] + "/" + p[1]; };
const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const LOGO = "https://jasaextintores.com/img/logo-correo.png";
const DISPLAY = "'Saira Condensed','Arial Narrow','Helvetica Neue',Arial,sans-serif";
const BODY = "Barlow,'Helvetica Neue',Arial,sans-serif";
const MONO = "'IBM Plex Mono',Consolas,'Courier New',monospace";

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

function semanaAnterior(ahora = new Date()) {
  const hoy = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(ahora);
  const d = new Date(hoy + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7) - 7);
  const dias = [];
  for (let i = 0; i < 7; i++) { dias.push(iso(d)); d.setUTCDate(d.getUTCDate() + 1); }
  return dias;
}

// Igual que jasaAsistCalc en src/reporte.js (horas trabajadas sin el tiempo de comida)
function calcular(marcas, desde, hasta) {
  const per = {};
  marcas.filter((m) => m.fecha >= desde && m.fecha <= hasta).sort((a, b) => String(a.t).localeCompare(String(b.t))).forEach((m) => {
    const em = String(m.email || "").toLowerCase();
    const p = per[em] = per[em] || { email: em, nombre: m.nombre || em.split("@")[0], dias: {}, total: 0, comida: 0, alertas: [], abierto: null, pausa: null };
    p.dias[m.fecha] = p.dias[m.fecha] || { min: 0, comida: 0 };
    const cierra = (fin) => {
      const min = (new Date(fin.t) - new Date(p.abierto.t)) / 60000;
      if (min > 16 * 60) p.alertas.push(fmtD(p.abierto.fecha) + ": turno de más de 16 horas (" + hm(min) + ")");
      p.dias[p.abierto.fecha].min += min; p.total += min; p.abierto = null;
    };
    if (m.tipo === "entrada") { const o = p.abierto || p.pausa; if (o) p.alertas.push(fmtD(o.fecha) + ": entrada de las " + o.hora + " sin salida"); p.abierto = m; p.pausa = null; return; }
    if (m.tipo === "comida") { if (p.abierto) cierra(m); else p.alertas.push(fmtD(m.fecha) + ": salió a comer a las " + m.hora + " sin entrada"); p.pausa = m; return; }
    if (m.tipo === "regreso") {
      if (p.pausa) { const cm = (new Date(m.t) - new Date(p.pausa.t)) / 60000; p.dias[p.pausa.fecha].comida += cm; p.comida += cm; if (cm > 180) p.alertas.push(fmtD(p.pausa.fecha) + ": comida de " + hm(cm) + " h"); } else if (p.abierto) cierra(m);
      p.pausa = null; p.abierto = m; return;
    }
    if (p.abierto) cierra(m);
    else if (p.pausa) p.alertas.push(fmtD(p.pausa.fecha) + ": salió a comer a las " + p.pausa.hora + " y no marcó regreso");
    else p.alertas.push(fmtD(m.fecha) + ": salida de las " + m.hora + " sin entrada");
    p.pausa = null;
  });
  Object.values(per).forEach((p) => { const o = p.abierto || p.pausa; if (o) { p.alertas.push(fmtD(o.fecha) + (p.pausa ? ": salió a comer a las " + o.hora + " y no regresó" : ": entrada de las " + o.hora + " sin salida")); p.abierto = null; p.pausa = null; } });
  return per;
}

function armarCorreo(datos, dias) {
  const nombres = {};
  (datos.personal || []).forEach((s) => { nombres[s.email] = s.nombre || s.email.split("@")[0]; });
  const calc = calcular(datos.marcas || [], dias[0], dias[6]);
  (datos.personal || []).forEach((s) => { calc[s.email] = calc[s.email] || { email: s.email, dias: {}, total: 0, alertas: [] }; });
  const lista = Object.values(calc).map((p) => ({ ...p, nombre: nombres[p.email] || p.nombre || p.email })).sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
  const total = lista.reduce((a, p) => a + p.total, 0);
  const titulo = "Asistencia JASA · semana del " + fmtD(dias[0]) + " al " + fmtD(dias[6]);
  const ver = SITE + "/admin/#asistencia";
  const texto = titulo + "\n\nHoras trabajadas (sin comida)\n\n" + lista.map((p) => p.nombre + ": " + hm(p.total) + " h" + (p.comida ? " (comida " + hm(p.comida) + " h)" : "") + "\n  " + dias.map((f, i) => DIAS[i] + " " + (p.dias[f] && p.dias[f].min ? hm(p.dias[f].min) : "—")).join(" · ") + (p.alertas.length ? "\n  Avisos: " + p.alertas.join("; ") : "")).join("\n\n") + "\n\nTotal: " + hm(total) + " h\nDetalle: " + ver;
  const th = (al) => `style="background:#1a1716;color:#ffffff;font-family:${MONO};font-size:10px;letter-spacing:.08em;padding:8px 6px;text-align:${al}"`;
  const td = (al) => `style="padding:9px 6px;border-bottom:1px solid #e3ded9;font-family:${BODY};font-size:14px;color:#1a1716;text-align:${al};vertical-align:top"`;
  const tabla = '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin:6px 0 4px">' +
    '<tr><th ' + th("left") + '>PERSONA</th>' + dias.map((f, i) => '<th ' + th("center") + '>' + DIAS[i].toUpperCase() + '<br>' + fmtD(f) + '</th>').join("") + '<th ' + th("right") + '>TOTAL</th></tr>' +
    lista.map((p) => '<tr><td ' + td("left") + '><b>' + esc(p.nombre) + '</b>' + (p.alertas.length ? '<div style="margin-top:3px;font-size:12px;line-height:1.35;color:#8f6100">' + p.alertas.map(esc).join("<br>") + '</div>' : "") + '</td>' +
      dias.map((f) => '<td ' + td("center") + '><span style="font-family:' + MONO + ';font-size:13px">' + (p.dias[f] && p.dias[f].min ? hm(p.dias[f].min) : '<span style="color:#b5aeaa">—</span>') + '</span></td>').join("") +
      '<td ' + td("right") + '><b style="font-family:' + MONO + '">' + hm(p.total) + '</b>' + (p.comida ? '<div style="font-size:11px;color:#6b6460">comida ' + hm(p.comida) + '</div>' : "") + '</td></tr>').join("") +
    '<tr><td ' + td("left") + '><b>Total del equipo</b></td>' + dias.map(() => '<td ' + td("center") + '></td>').join("") + '<td ' + td("right") + '><b style="font-family:' + MONO + ';color:#E10F0F">' + hm(total) + '</b></td></tr></table>';
  const conAvisos = lista.filter((p) => p.alertas.length).length;
  const html = marco({
    eyebrow: "Asistencia · reporte semanal", titulo: "Semana del " + fmtD(dias[0]) + " al " + fmtD(dias[6]),
    intro: "Horas trabajadas por persona, <b>sin contar la comida</b>." + (conAvisos ? " Hay " + conAvisos + (conAvisos === 1 ? " persona" : " personas") + " con avisos (marcas incompletas); revísalas en el panel y agrega la marca manual si hace falta." : ""),
    bloque: tabla, boton: ["Ver detalle en el panel", ver],
    nota: "Llega cada lunes con la semana anterior. Se marca en jasaextintores.com/admin › Asistencia o en la app › Mi cuenta.",
  });
  return { titulo, texto, html, ver };
}

export default async () => {
  const clave = process.env.JASA_CLAVE_ASISTENCIA;
  if (!clave) { console.log("Falta la variable JASA_CLAVE_ASISTENCIA"); return new Response("Falta JASA_CLAVE_ASISTENCIA", { status: 500 }); }
  const dias = semanaAnterior();
  const r = await fetch(SUPA_URL + "/rest/v1/rpc/reporte_asistencia", {
    method: "POST", headers: { apikey: SUPA_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ clave, desde: dias[0], hasta: dias[6] }),
  });
  const datos = await r.json();
  if (!r.ok || !datos) { console.log("Supabase no devolvió el reporte", r.status, JSON.stringify(datos).slice(0, 300)); return new Response("Sin datos", { status: 500 }); }
  const c = armarCorreo(datos, dias);
  const para = (datos.ajustes && datos.ajustes.correo) || process.env.JASA_CORREO_AVISOS || "";
  if (process.env.RESEND_API_KEY && para) {
    const s = await fetch("https://api.resend.com/emails", {
      method: "POST", headers: { Authorization: "Bearer " + process.env.RESEND_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ from: process.env.JASA_CORREO_REMITENTE || "JASA Extintores <avisos@jasaextintores.com>", to: para.split(/[,;\s]+/).filter(Boolean), subject: c.titulo, html: c.html, text: c.texto }),
    });
    console.log("Resend", s.status, (await s.text()).slice(0, 200));
    if (s.ok) return new Response("Enviado por Resend");
  }
  const f = await fetch(SITE + "/", {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ "form-name": "reporte-asistencia", subject: c.titulo, semana: fmtD(dias[0]) + " al " + fmtD(dias[6]), resumen: c.texto, ver_detalle: c.ver }).toString(),
  });
  console.log("Netlify Forms", f.status);
  return new Response("Enviado por Netlify Forms (" + f.status + ")");
};

// Lunes 13:15 UTC = 7:15 en Piedras Negras (8:15 en horario de verano)
export const config = { schedule: "15 13 * * 1" };
