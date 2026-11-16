// JASA Extintores: sincroniza las facturas recibidas (CFDI) con el SAT (servicio de Descarga Masiva).
// Corre cada hora. En cada corrida hace un solo paso para no pasar de 30 segundos:
//   1) si hay una solicitud pendiente, la verifica; si ya está lista, baja un paquete y guarda los CFDI;
//   2) si no hay pendientes, pide al SAT los CFDI recibidos (vigentes) desde el último día descargado hasta ayer.
// Necesita en Netlify: JASA_CLAVE_ASISTENCIA (clave del servidor, la misma del reporte) y SAT_EFIRMA_PASS
// (contraseña de la e.firma). Los archivos .cer y .key los sube un administrador desde el panel › Facturas SAT.
import {
  Fiel, FielRequestBuilder, HttpsWebClient, Service, QueryParameters, DateTimePeriod,
  DownloadType, RequestType, DocumentStatus,
} from "@nodecfdi/sat-ws-descarga-masiva";
import JSZip from "jszip";

const SUPA_URL = "https://psggoagcdokwrkykgufr.supabase.co";
const SUPA_KEY = "sb_publishable_jwx2IRxOqdCW-SjmKcYW2A_lrJTFJa3";
const TZ = "America/Mexico_City";
const LIMITE_MS = 22000;

async function rpc(fn, args) {
  const r = await fetch(SUPA_URL + "/rest/v1/rpc/" + fn, { method: "POST", headers: { apikey: SUPA_KEY, "Content-Type": "application/json" }, body: JSON.stringify(args) });
  const t = await r.text();
  if (!r.ok) throw new Error("Supabase " + fn + " " + r.status + ": " + t.slice(0, 200));
  return t ? JSON.parse(t) : null;
}
const hoyMx = () => new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
const masDias = (f, n) => { const d = new Date(f + "T12:00:00Z"); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const inicioMesPasado = () => { const h = hoyMx(); const d = new Date(h.slice(0, 7) + "-01T12:00:00Z"); d.setUTCMonth(d.getUTCMonth() - 1); return d.toISOString().slice(0, 10); };

// Copia de jasaCfdiLeer (src/reporte.js)
function jasaCfdiLeer(xml) {
  xml = String(xml || "").replace(/^\uFEFF/, "");
  function dec(v) { return String(v).replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#x([0-9a-f]+);/gi, function (m, h) { return String.fromCharCode(parseInt(h, 16)); }).replace(/&#(\d+);/g, function (m, d) { return String.fromCharCode(+d); }).replace(/&amp;/g, "&"); }
  function tags(n) { var re = new RegExp("<(?:[A-Za-z0-9_]+:)?" + n + "(?=[\\s/>])([^>]*)>", "g"), out = [], m; while ((m = re.exec(xml))) out.push(m[1]); return out; }
  function at(s, a) { if (!s) return ""; var m = s.match(new RegExp("(?:^|\\s)" + a + "\\s*=\\s*\"([^\"]*)\"")) || s.match(new RegExp("(?:^|\\s)" + a + "\\s*=\\s*'([^']*)'")); return m ? dec(m[1]).trim() : ""; }
  function num(v) { var n = parseFloat(v); return isFinite(n) ? n : 0; }
  var c = tags("Comprobante")[0], t = tags("TimbreFiscalDigital")[0];
  if (!c || !t) return null;
  var em = tags("Emisor")[0], re = tags("Receptor")[0], imps = tags("Impuestos").filter(function (s) { return /TotalImpuestos/.test(s); });
  var imp = imps[imps.length - 1] || "", tipo = at(c, "TipoDeComprobante");
  var iva = 0, gi = imp ? xml.lastIndexOf(imp) : -1;
  if (gi >= 0) { var fin = xml.indexOf("Impuestos>", gi + imp.length), sec = xml.slice(gi, fin < 0 ? undefined : fin), rt = /<(?:[A-Za-z0-9_]+:)?Traslado(?=[\s/>])([^>]*)>/g, mt;
    while ((mt = rt.exec(sec))) if (at(mt[1], "Impuesto") === "002") iva += num(at(mt[1], "Importe")); }
  var pagos = tipo === "P" ? tags("Pago").map(function (s) { return { fecha: at(s, "FechaPago").slice(0, 10), monto: num(at(s, "Monto")), forma: at(s, "FormaDePagoP") }; }) : [];
  var docs = tipo === "P" ? tags("DoctoRelacionado").map(function (s) { return { uuid: at(s, "IdDocumento").toUpperCase(), pagado: num(at(s, "ImpPagado")), saldo: num(at(s, "ImpSaldoInsoluto")), parcialidad: at(s, "NumParcialidad") }; }) : [];
  return {
    uuid: at(t, "UUID").toUpperCase(), version: at(c, "Version"), tipo: tipo, serie: at(c, "Serie"), folio: at(c, "Folio"),
    fecha: at(c, "Fecha").slice(0, 10), hora: at(c, "Fecha").slice(11, 16), timbrado: at(t, "FechaTimbrado"),
    emisorRfc: at(em, "Rfc").toUpperCase(), emisorNombre: at(em, "Nombre"), emisorRegimen: at(em, "RegimenFiscal"),
    receptorRfc: at(re, "Rfc").toUpperCase(), receptorNombre: at(re, "Nombre"), uso: at(re, "UsoCFDI"),
    moneda: at(c, "Moneda") || "MXN", tipoCambio: num(at(c, "TipoCambio")) || 1,
    subtotal: num(at(c, "SubTotal")), descuento: num(at(c, "Descuento")), total: num(at(c, "Total")),
    iva: Math.round(iva * 100) / 100, trasladados: num(at(imp, "TotalImpuestosTrasladados")), retenidos: num(at(imp, "TotalImpuestosRetenidos")),
    metodoPago: at(c, "MetodoPago"), formaPago: at(c, "FormaPago"),
    conceptos: tags("Concepto").slice(0, 60).map(function (s) { return { clave: at(s, "ClaveProdServ"), d: at(s, "Descripcion"), c: num(at(s, "Cantidad")), u: at(s, "ClaveUnidad") || at(s, "Unidad"), v: num(at(s, "ValorUnitario")), i: num(at(s, "Importe")) }; }),
    relacion: at(tags("CfdiRelacionados")[0], "TipoRelacion"), relacionados: tags("CfdiRelacionado").map(function (s) { return at(s, "UUID").toUpperCase(); }),
    pagos: pagos, pagados: docs
  };
}

export default async () => {
  const t0 = Date.now(), clave = process.env.JASA_CLAVE_ASISTENCIA, pass = process.env.SAT_EFIRMA_PASS;
  if (!clave) { console.log("Falta JASA_CLAVE_ASISTENCIA"); return new Response("Falta JASA_CLAVE_ASISTENCIA", { status: 500 }); }
  const st = await rpc("sat_estado", { clave });
  if (!st) { console.log("Clave del servidor incorrecta"); return new Response("Clave incorrecta", { status: 500 }); }
  const aj = st.ajustes || {}, log = Array.isArray(aj.log) ? aj.log.slice(-14) : [];
  const nota = (txt) => { console.log(txt); log.push({ t: new Date().toISOString(), txt }); };
  const guardar = (cambios, cfdis) => rpc("sat_guardar", { clave, ajustes: { ...cambios, log: log.slice(-15), ultimaRevision: new Date().toISOString() }, cfdis: cfdis || [] });
  if (!st.cer || !st.key) { console.log("Sin e.firma cargada"); return new Response("Sin e.firma"); }
  if (!pass) { await guardar({ error: "Falta la variable SAT_EFIRMA_PASS en Netlify." }); return new Response("Falta SAT_EFIRMA_PASS"); }

  let fiel;
  try { fiel = Fiel.create(Buffer.from(st.cer, "base64").toString("binary"), Buffer.from(st.key, "base64").toString("binary"), pass); }
  catch (e) { await guardar({ error: "No se pudo abrir la e.firma: la contraseña (SAT_EFIRMA_PASS) no corresponde al archivo .key, o los archivos no son de la misma e.firma." }); return new Response("e.firma no abre"); }
  if (!fiel.isValid()) { await guardar({ error: "La e.firma no es válida: está vencida o es un sello digital (CSD). Se necesita la e.firma (FIEL) vigente." }); return new Response("e.firma no válida"); }
  const rfc = fiel.getRfc();
  const service = new Service(new FielRequestBuilder(fiel), new HttpsWebClient());
  const pendientes = Array.isArray(aj.pendientes) ? aj.pendientes.slice() : [];
  let hasta = aj.hasta || "", cambios = { rfc, error: null };

  try {
    if (pendientes.length) {
      const p = pendientes[0];
      if (!p.paquetes) {
        const v = await service.verify(p.id);
        if (!v.getStatus().isAccepted()) throw new Error("Verificación: " + v.getStatus().getMessage());
        const sr = v.getStatusRequest(), cr = v.getCodeRequest();
        if (cr.isTypeOf("EmptyResult")) { pendientes.shift(); nota("Del " + p.desde + " al " + p.hasta + ": sin facturas recibidas."); }
        else if (sr.isTypeOf("Finished")) { p.paquetes = v.getPackageIds(); p.total = v.getNumberCfdis(); nota("Del " + p.desde + " al " + p.hasta + ": " + p.total + " facturas en " + p.paquetes.length + " paquete(s)."); if (!p.paquetes.length) pendientes.shift(); }
        else if (sr.isTypeOf("Expired") || sr.isTypeOf("Failure") || sr.isTypeOf("Rejected")) {
          pendientes.shift(); nota("El SAT no completó la solicitud del " + p.desde + " al " + p.hasta + " (" + cr.getMessage() + "). Se vuelve a pedir.");
          if (hasta === p.hasta) hasta = masDias(p.desde, -1);
        } else { p.revisada = new Date().toISOString(); console.log("Solicitud " + p.id + " en proceso"); }
      }
      if (p.paquetes && p.paquetes.length && Date.now() - t0 < LIMITE_MS) {
        const pid = p.paquetes[0], d = await service.download(pid);
        if (!d.getStatus().isAccepted()) throw new Error("Descarga del paquete: " + d.getStatus().getMessage());
        const zip = await JSZip.loadAsync(Buffer.from(d.getPackageContent(), "base64")), cfdis = [], ahora = new Date().toISOString();
        for (const nombre of Object.keys(zip.files)) {
          if (!/\.xml$/i.test(nombre)) continue;
          const xml = await zip.files[nombre].async("string"), c = jasaCfdiLeer(xml);
          if (!c || !c.uuid) continue;
          cfdis.push({ ...c, origen: "sat", recibido: ahora, estado: "nuevo", ...(xml.length < 60000 ? { xml } : {}) });
        }
        p.paquetes.shift();
        if (!p.paquetes.length) pendientes.shift();
        const r = await guardar({ ...cambios, pendientes, hasta }, cfdis);
        nota("Paquete descargado: " + cfdis.length + " facturas, " + (r && r.nuevos) + " nuevas.");
        await guardar({ ...cambios, pendientes, hasta });
        return new Response("Paquete listo");
      }
    } else {
      const ayer = masDias(hoyMx(), -1), desde = hasta ? masDias(hasta, 1) : (aj.desde || inicioMesPasado());
      const reciente = aj.ultimaSolicitud && Date.now() - new Date(aj.ultimaSolicitud).getTime() < 6 * 3600e3;
      if (desde <= ayer && !reciente) {
        const q = QueryParameters.create()
          .withPeriod(DateTimePeriod.createFromValues(desde + " 00:00:00", ayer + " 23:59:59"))
          .withDownloadType(new DownloadType("received"))
          .withRequestType(new RequestType("xml"))
          .withDocumentStatus(new DocumentStatus("active"));
        const r = await service.query(q);
        cambios.ultimaSolicitud = new Date().toISOString();
        if (!r.getStatus().isAccepted()) throw new Error("Solicitud al SAT del " + desde + " al " + ayer + ": " + r.getStatus().getMessage());
        pendientes.push({ id: r.getRequestId(), desde, hasta: ayer, creada: new Date().toISOString() });
        hasta = ayer;
        nota("Solicitud al SAT del " + desde + " al " + ayer + " (" + rfc + ").");
      }
    }
    await guardar({ ...cambios, pendientes, hasta });
    return new Response("OK");
  } catch (e) {
    let msg = String(e && e.message || e).slice(0, 300);
    if (/root element|ECONNRESET|ETIMEDOUT|ENOTFOUND|socket hang up|5\d\d/i.test(msg)) msg = "El SAT no respondió (su servicio a veces se cae o está saturado). Se vuelve a intentar en una hora. Detalle: " + msg;
    nota("Error: " + msg);
    await guardar({ ...cambios, pendientes, hasta, error: msg });
    return new Response("Error: " + msg, { status: 500 });
  }
};

// Cada hora, al minuto 20
export const config = { schedule: "20 * * * *" };
