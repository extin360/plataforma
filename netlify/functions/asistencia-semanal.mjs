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

function semanaAnterior(ahora = new Date()) {
  const hoy = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(ahora);
  const d = new Date(hoy + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7) - 7);
  const dias = [];
  for (let i = 0; i < 7; i++) { dias.push(iso(d)); d.setUTCDate(d.getUTCDate() + 1); }
  return dias;
}

// Igual que jasaAsistCalc en src/reporte.js
function calcular(marcas, desde, hasta) {
  const per = {};
  marcas.filter((m) => m.fecha >= desde && m.fecha <= hasta).sort((a, b) => String(a.t).localeCompare(String(b.t))).forEach((m) => {
    const em = String(m.email || "").toLowerCase();
    const p = per[em] = per[em] || { email: em, nombre: m.nombre || em.split("@")[0], dias: {}, total: 0, alertas: [], abierto: null };
    const dia = p.dias[m.fecha] = p.dias[m.fecha] || { min: 0 };
    if (m.tipo === "entrada") { if (p.abierto) p.alertas.push(fmtD(p.abierto.fecha) + ": entrada de las " + p.abierto.hora + " sin salida"); p.abierto = m; return; }
    if (!p.abierto) { p.alertas.push(fmtD(m.fecha) + ": salida de las " + m.hora + " sin entrada"); return; }
    const min = (new Date(m.t) - new Date(p.abierto.t)) / 60000;
    if (min > 16 * 60) p.alertas.push(fmtD(p.abierto.fecha) + ": turno de más de 16 horas (" + hm(min) + ")");
    p.dias[p.abierto.fecha].min += min; p.total += min; p.abierto = null;
  });
  Object.values(per).forEach((p) => { if (p.abierto) { p.alertas.push(fmtD(p.abierto.fecha) + ": entrada de las " + p.abierto.hora + " sin salida"); p.abierto = null; } });
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
  const texto = titulo + "\n\n" + lista.map((p) => p.nombre + ": " + hm(p.total) + " h\n  " + dias.map((f, i) => DIAS[i] + " " + (p.dias[f] && p.dias[f].min ? hm(p.dias[f].min) : "—")).join(" · ") + (p.alertas.length ? "\n  Avisos: " + p.alertas.join("; ") : "")).join("\n\n") + "\n\nTotal: " + hm(total) + " h\nDetalle: " + ver;
  const th = 'style="background:#1a1716;color:#fff;font:600 11px Arial,sans-serif;letter-spacing:.06em;padding:8px 10px;text-align:right"';
  const html = '<div style="font-family:Arial,Helvetica,sans-serif;color:#1a1716;max-width:760px">' +
    '<div style="background:#0d0d0d;border-bottom:4px solid #e10f0f;padding:14px 18px"><b style="color:#e10f0f;font:italic 900 26px Arial,sans-serif">JASA</b> <span style="color:#fff;font:12px Arial;letter-spacing:.12em">ASISTENCIA</span></div>' +
    '<h2 style="margin:18px 0 6px">Semana del ' + fmtD(dias[0]) + ' al ' + fmtD(dias[6]) + '</h2><p style="margin:0 0 14px;color:#6f6864">Total del equipo: <b>' + hm(total) + ' h</b></p>' +
    '<table style="border-collapse:collapse;width:100%;font-size:14px"><tr><th ' + th.replace("right", "left") + '>PERSONA</th>' + dias.map((f, i) => '<th ' + th + '>' + DIAS[i].toUpperCase() + '<br>' + fmtD(f) + '</th>').join("") + '<th ' + th + '>TOTAL</th></tr>' +
    lista.map((p) => '<tr><td style="padding:8px 10px;border-bottom:1px solid #e4dfdc"><b>' + esc(p.nombre) + '</b>' + (p.alertas.length ? '<div style="color:#8f6100;font-size:12px">' + p.alertas.map(esc).join("<br>") + '</div>' : "") + '</td>' +
      dias.map((f) => '<td style="padding:8px 10px;border-bottom:1px solid #e4dfdc;text-align:right;font-family:monospace">' + (p.dias[f] && p.dias[f].min ? hm(p.dias[f].min) : '<span style="color:#b5aeaa">—</span>') + '</td>').join("") +
      '<td style="padding:8px 10px;border-bottom:1px solid #e4dfdc;text-align:right;font-family:monospace"><b>' + hm(p.total) + '</b></td></tr>').join("") + '</table>' +
    '<p style="margin:18px 0"><a href="' + ver + '" style="background:#e10f0f;color:#fff;text-decoration:none;padding:10px 16px;border-radius:3px;font-weight:700">Ver detalle en el panel</a></p></div>';
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
  const para = (datos.ajustes && datos.ajustes.correo) || "";
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
    body: new URLSearchParams({ "form-name": "reporte-asistencia", subject: c.titulo, semana: fmtD(dias[0]) + " al " + fmtD(dias[6]), para, resumen: c.texto, ver_detalle: c.ver }).toString(),
  });
  console.log("Netlify Forms", f.status);
  return new Response("Enviado por Netlify Forms (" + f.status + ")");
};

// Lunes 13:15 UTC = 7:15 en Piedras Negras (8:15 en horario de verano)
export const config = { schedule: "15 13 * * 1" };
