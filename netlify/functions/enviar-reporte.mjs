// JASA Extintores: manda un reporte por correo con el PDF adjunto (Resend), desde el panel.
// Solo personal de JASA: valida la sesión de Supabase del que lo manda y que esté en public.staff.
// Variables en Netlify: RESEND_API_KEY, JASA_CORREO_REMITENTE, JASA_CORREO_AVISOS (copia y respuesta).
import { marco, esc } from "../lib/correo.mjs";

const SUPA_URL = process.env.SUPABASE_URL;
const SUPA_KEY = process.env.SUPABASE_ANON_KEY;
const MAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "Content-Type": "application/json" } });

export default async (req) => {
  if (req.method !== "POST") return json({ ok: false, error: "Método no permitido" }, 405);
  const token = String(req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  if (!token) return json({ ok: false, error: "Sin sesión" }, 401);
  const u = await fetch(SUPA_URL + "/auth/v1/user", { headers: { apikey: SUPA_KEY, Authorization: "Bearer " + token } });
  if (!u.ok) return json({ ok: false, error: "Sesión no válida. Vuelve a entrar al panel." }, 401);
  const email = String((await u.json()).email || "").toLowerCase();
  const st = await fetch(SUPA_URL + "/rest/v1/staff?select=email,nombre&email=eq." + encodeURIComponent(email), { headers: { apikey: SUPA_KEY, Authorization: "Bearer " + token } });
  const yo = st.ok ? (await st.json())[0] : null;
  if (!yo) return json({ ok: false, error: "Tu correo no está en el personal." }, 403);
  if (!process.env.RESEND_API_KEY) return json({ ok: false, error: "Falta RESEND_API_KEY en Netlify." }, 500);

  let b; try { b = await req.json(); } catch (e) { return json({ ok: false, error: "Datos no válidos" }, 400); }
  const para = String(b.para || "").split(/[,;\s]+/).filter((x) => MAIL.test(x)).slice(0, 5);
  if (!para.length) return json({ ok: false, error: "El cliente no tiene un correo válido." }, 400);
  const pdf = String(b.pdf || "");
  if (!pdf || pdf.length > 7000000) return json({ ok: false, error: "El PDF no se generó o es demasiado grande." }, 400);
  const avisos = String(process.env.JASA_CORREO_AVISOS || "jasa-extintores@live.com.mx").split(/[,;\s]+/).filter(Boolean);
  const html = marco({
    eyebrow: b.eyebrow || "Reporte", titulo: b.titulo || "Reporte de JASA Extintores",
    intro: esc(b.saludo || "Hola:") + "<br><br>" + esc(b.texto || "Le compartimos su reporte en PDF (va adjunto)."),
    filas: (b.filas || []).slice(0, 8).map((f) => [String(f[0] || ""), String(f[1] || "")]),
    boton: b.portal ? ["Ver en mi portal", b.portal] : null,
    nota: b.codigo ? "Su código de acceso al portal es <b style=\"font-family:'IBM Plex Mono',monospace;letter-spacing:.1em\">" + esc(b.codigo) + "</b>. Ahí encuentra todos sus reportes, sus extintores y las fechas de recarga." : "",
  });
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST", headers: { Authorization: "Bearer " + process.env.RESEND_API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.JASA_CORREO_REMITENTE || "JASA Extintores <avisos@jasaextintores.com>", to: para, cc: avisos, reply_to: avisos[0],
      subject: String(b.asunto || b.titulo || "Reporte JASA Extintores").slice(0, 160), html,
      attachments: [{ filename: String(b.archivo || "Reporte-JASA.pdf").replace(/[^A-Za-z0-9._-]/g, "-"), content: pdf }],
    }),
  });
  const t = await r.text();
  console.log("Reporte por correo", email, "→", para.join(","), r.status, t.slice(0, 160));
  return r.ok ? json({ ok: true }) : json({ ok: false, error: "Resend respondió " + r.status + ": " + t.slice(0, 160) }, 502);
};

export const config = { path: "/api/enviar-reporte" };
