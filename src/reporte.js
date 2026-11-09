/* Reporte de inspección y servicio de JASA Extintores.
   Se comparte entre el panel (admin) y el portal de clientes; tools/build.py lo inserta en ambos. */
function jasaReportHTML(o, cli, logo) {
  function e(v) { return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function p2(n) { return String(n).padStart(2, "0"); }
  function fd(s) { if (!s) return ""; var p = String(s).split("-"); return p.length === 3 ? p[2] + "/" + p[1] + "/" + p[0] : s; }
  function fm(s) { if (!s) return ""; var p = String(s).split("-"); return p.length >= 2 ? p[1] + "/" + p[0] : s; }
  function addM(k, n) { var p = k.split("-").map(Number), d = new Date(p[0], p[1] - 1 + n, 1); return d.getFullYear() + "-" + p2(d.getMonth() + 1); }
  function tl(t) { return t === "CO2" ? "CO₂" : t === "AGUA" ? "Agua" : t === "TIPO K" ? "Tipo K" : t === "TIPO D" ? "Tipo D" : t === "AGENTE LIMPIO" ? "Agente limpio" : (t || ""); }
  cli = cli || {};
  var old = {}, rows = [];
  (o.unidades || []).forEach(function (u) { old[u.key] = u; });
  (o.equiposDet || []).forEach(function (r, i) {
    for (var k = 0; k < (+r.qty || 0); k++) {
      var u = old[i + "-" + k] || {};
      rows.push({ eq: tl(r.tipo) + " " + String(r.cap || "").toLowerCase(), svc: r.servicio || "Recarga", serie: u.serie || "", fab: u.fab || "", ph: u.ph || "", et: u.etiqueta || "", ok: !!u.listo });
    }
  });
  var entregada = o.etapaV ? (+o.etapa || 0) === 4 : (+o.etapa || 0) === 3;
  var fecha = o.entregado || o.recibido || "";
  var prox = entregada && o.entregado ? addM(o.entregado.slice(0, 7), 12) : (cli.proximaRecarga || "");
  var n = Math.max(rows.length, 8), body = "";
  for (var i = 0; i < n; i++) {
    var r = rows[i];
    body += "<tr><td>" + (r ? i + 1 : "") + "</td><td>" + (r ? e(r.eq) : "") + "</td><td>" + (r ? e(r.svc) : "") + "</td><td>" + (r ? e(r.serie) : "") + "</td><td>" + (r ? e(fm(r.fab)) : "") + "</td><td>" + (r ? e(fm(r.ph)) : "") + "</td><td>" + (r ? e(r.et) : "") + "</td><td>" + (r ? (r.ok || entregada ? "Conforme" : "En proceso") : "") + "</td></tr>";
  }
  return '<div class="sheet"><div class="sh-top"><div class="sh-logo"><img alt="JASA Extintores" width="300" height="136" src="' + (logo || "") + '"></div>' +
    '<div class="sh-co"><b>JASA EXTINTORES SA DE CV</b><span>MUTUALISTA 412 COL. BUENA VISTA SUR</span><span>PIEDRAS NEGRAS, COAHUILA</span><span>JEX180118NA0</span><span class="sh-tel">878 783 3216 · WhatsApp 878 117 4728</span></div></div>' +
    '<div class="sh-row"><div class="sh-title" style="font-size:24px">REPORTE DE INSPECCIÓN Y SERVICIO</div><div class="sh-num"><div><span>ORDEN:</span><b>' + e(o.folio) + '</b></div><div><span>FECHA:</span><b>' + e(fd(fecha)) + '</b></div><div><span>PRÓX. RECARGA:</span><b>' + e(fm(prox) || "—") + '</b></div></div></div>' +
    '<div class="sh-row"><dl class="sh-client"><dt>Cliente:</dt><dd>' + e(cli.nombre || o.cliente) + '</dd><dt>Ciudad:</dt><dd>' + e(cli.ciudad || "") + '</dd><dt>Recibido:</dt><dd>' + e(fd(o.recibido)) + '</dd><dt>Entregado:</dt><dd>' + e(entregada ? fd(o.entregado) : "EN PROCESO") + '</dd><dt>Extintores:</dt><dd>' + rows.length + '</dd></dl>' +
    '<div class="sh-cond"><b>OBSERVACIONES</b><div>' + e(o.notas || "") + '</div></div></div>' +
    '<table class="sh-table"><colgroup><col style="width:5%"><col style="width:17%"><col style="width:15%"><col style="width:14%"><col style="width:11%"><col style="width:12%"><col style="width:14%"><col style="width:12%"></colgroup>' +
    '<thead><tr><th>#</th><th>Equipo</th><th>Servicio</th><th>No. de serie</th><th>Fabricación</th><th>Próx. P. H.</th><th>Etiqueta NOM-154</th><th>Resultado</th></tr></thead><tbody>' + body + '</tbody></table>' +
    '<div class="sh-legal">Servicio de mantenimiento y recarga conforme a la NOM-154-SCFI-2005 y a la NOM-002-STPS-2010. P. H. = prueba hidrostática. Conserve este reporte para sus inspecciones de Protección Civil.</div>' +
    '<div class="sh-sign" style="grid-template-columns:repeat(2,1fr)"><div><span>TÉCNICO RESPONSABLE (JASA)</span><small>' + e(o.entrego || o.recibio || "") + '</small></div><div><span>RECIBE DE CONFORMIDAD (CLIENTE)</span><small>' + e(o.recibioCliente || "") + '</small></div></div></div>';
}
var JASA_SHEET_CSS = ".sheet{width:816px;background:#ffffff;color:#111111;padding:36px 40px 40px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.3;box-sizing:border-box}" +
  ".sheet *{box-sizing:border-box}" +
  ".sh-top{display:flex;justify-content:space-between;align-items:center;border:1px solid #444;border-bottom:0;padding:10px 14px}" +
  ".sh-logo img{display:block;width:210px;height:auto}" +
  ".sh-co{display:flex;flex-direction:column;align-items:flex-end;text-align:right;gap:2px;font-weight:700;font-size:11.5px}" +
  ".sh-co b{color:#c00000;font-size:16px}.sh-co .sh-tel{color:#777;font-weight:400}" +
  ".sh-row{display:grid;grid-template-columns:1fr 210px;border:1px solid #444;border-bottom:0}" +
  ".sh-title{text-align:center;color:#c00000;font-weight:700;font-size:30px;letter-spacing:.02em;padding:8px;border-right:1px solid #444;display:flex;align-items:center;justify-content:center}" +
  ".sh-num{display:flex;flex-direction:column;justify-content:center;padding:6px 10px;color:#c00000;font-weight:700;gap:2px}" +
  ".sh-num div{display:flex;justify-content:space-between;gap:8px}" +
  ".sh-client{margin:0;padding:10px 12px;display:grid;grid-template-columns:72px 1fr;gap:5px 8px;align-items:baseline;border-right:1px solid #444;min-height:110px}" +
  ".sh-client dt{color:#999;font-size:10.5px;text-align:right}" +
  ".sh-client dd{margin:0;font-size:13px;text-transform:uppercase;min-height:16px;border-bottom:1px solid #eee;overflow-wrap:anywhere}" +
  ".sh-cond{padding:8px 10px;font-size:11px;display:flex;flex-direction:column;gap:6px}" +
  ".sh-cond div{text-transform:uppercase;overflow-wrap:anywhere;white-space:pre-line}" +
  ".sh-table{width:100%;border-collapse:collapse;table-layout:fixed;border:1px solid #444}" +
  ".sh-table th{font-family:Arial,Helvetica,sans-serif;background:#fff;color:#c00000;font-weight:400;font-size:10.5px;border:1px solid #aaa;border-top:2px solid #444;border-bottom:2px solid #444;padding:4px 5px;text-align:center;letter-spacing:0;text-transform:none}" +
  ".sh-table td{color:#111;border:1px solid #bbb;padding:5px 5px;height:24px;font-size:11px;vertical-align:middle;overflow-wrap:anywhere}" +
  ".sh-legal{border:1px solid #444;border-top:0;padding:8px 12px;font-size:10px;color:#555}" +
  ".sh-sign{display:grid;grid-template-columns:repeat(2,1fr);border:1px solid #444;border-top:0}" +
  ".sh-sign div{padding:46px 10px 8px;text-align:center;font-size:10.5px;border-right:1px solid #444}" +
  ".sh-sign div:last-child{border-right:0}" +
  ".sh-sign span{display:block;border-top:1px solid #444;padding-top:4px;font-weight:700}" +
  ".sh-sign small{display:block;color:#666;font-size:10px;margin-top:2px;min-height:12px}";

/* Puntos de la hoja de inspección de JASA (mismo orden que el formato en papel). */
var JASA_PUNTOS = [
  { k: "recipiente", l: "Recipiente", o: ["bien", "mal"] },
  { k: "pintura", l: "Pintura", o: ["bien", "mal"] },
  { k: "seguro", l: "Seguro", o: ["bien", "mal"] },
  { k: "sello", l: "Sello", o: ["bien", "mal"] },
  { k: "manguera", l: "Manguera", o: ["bien", "mal"] },
  { k: "portamanguera", l: "Porta mang.", o: ["bien", "mal"] },
  { k: "corneta", l: "Corneta difusor", o: ["bien", "mal"] },
  { k: "acceso", l: "Acceso", o: ["libre", "obstruido"] },
  { k: "letrero", l: "Letrero", o: ["si", "no"] },
  { k: "pedestal", l: "Pedestal", o: ["si", "no"] }
];
var JASA_OPT_LABEL = { bien: "Bien", mal: "Mal", libre: "Libre", obstruido: "Obst.", si: "Sí", no: "No" };
function jasaPuntoMalo(k, v) { return v === "mal" || v === "obstruido" || (k === "letrero" && v === "no"); }
function jasaVencido(vence, hoyMes) { return !!vence && vence < hoyMes; }

/* Hoja de inspección (carta horizontal), una página por cada 18 extintores. Devuelve un arreglo de HTML. */
function jasaInspeccionPages(insp, logo) {
  function e(v) { return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function fm(s) { if (!s) return ""; var p = String(s).split("-"); return p.length >= 2 ? p[1] + "/" + p[0].slice(2) : s; }
  var MES = ["ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO", "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"];
  var f = String(insp.fecha || ""), mes = f ? MES[+f.slice(5, 7) - 1] + " " + f.slice(0, 4) : "";
  var items = insp.items || [], per = 18, pages = [], tot = {}, ok = 0;
  items.forEach(function (it) { var key = (it.tipo === "CO2" ? "CO₂" : it.tipo || "") + " " + String(it.cap || "").toLowerCase(); tot[key] = (tot[key] || 0) + 1; if (it.resultado === "Conforme") ok++; });
  var head = '<tr><th rowspan="2">Ext</th><th rowspan="2">Ubicación</th><th rowspan="2">Folio</th><th rowspan="2">Tipo</th><th rowspan="2">Cap.</th><th rowspan="2">Fecha rec.</th><th rowspan="2">Fecha venc.</th><th rowspan="2">P.H.</th>' +
    JASA_PUNTOS.map(function (p) { return '<th colspan="2">' + p.l + '</th>'; }).join("") + '<th rowspan="2">Comentarios</th></tr><tr>' +
    JASA_PUNTOS.map(function (p) { return '<th class="o">' + JASA_OPT_LABEL[p.o[0]] + '</th><th class="o">' + JASA_OPT_LABEL[p.o[1]] + '</th>'; }).join("") + '</tr>';
  for (var s = 0; s < Math.max(items.length, 1); s += per) {
    var rows = items.slice(s, s + per).map(function (it, j) {
      var marks = JASA_PUNTOS.map(function (p) { var v = (it.puntos || {})[p.k]; return '<td class="m">' + (v === p.o[0] ? "✓" : "") + '</td><td class="m bad">' + (v === p.o[1] ? "✗" : "") + '</td>'; }).join("");
      return '<tr><td>' + (s + j + 1) + '</td><td class="u">' + e(it.ubicacion) + '</td><td class="f">' + e(it.folio || "") + '</td><td>' + e(it.tipo === "CO2" ? "CO₂" : it.tipo) + '</td><td>' + e(String(it.cap || "").replace(/\s*KG/i, "")) + '</td><td>' + e(fm(it.recarga)) + '</td><td' + (it.vencido ? ' class="bad"' : '') + '>' + e(fm(it.vence)) + '</td><td>' + e(it.ph || "") + '</td>' + marks + '<td class="c' + (it.resultado === "Conforme" ? '' : ' bad') + '">' + e([it.comentario, it.resultado === "Conforme" ? "" : it.resultado].filter(Boolean).join(" · ")) + '</td></tr>';
    }).join("");
    var last = s + per >= items.length;
    pages.push('<div class="ip"><div class="ip-h"><div><b class="ip-cli">' + e(insp.cliente) + '</b><div>INSPECCIÓN DE EXTINTORES</div><div>MES DE ' + e(mes) + '</div><div>REVISÓ: ' + e(insp.reviso || "") + '</div></div><div class="ip-r"><img alt="JASA Extintores" src="' + (logo || "") + '"><div>RESPONSABLE: ' + e(insp.responsable || "") + '</div><div>FECHA: ' + e(f.split("-").reverse().join("/")) + '</div><div>HOJA ' + (pages.length + 1) + ' DE ' + Math.max(1, Math.ceil(items.length / per)) + '</div></div></div>' +
      '<table class="ip-t"><colgroup><col style="width:26px"><col style="width:118px"><col style="width:66px"><col style="width:34px"><col style="width:30px"><col style="width:40px"><col style="width:40px"><col style="width:36px">' + JASA_PUNTOS.map(function () { return '<col style="width:21px"><col style="width:21px">'; }).join("") + '<col></colgroup>' + head + rows + '</table>' +
      (last ? '<div class="ip-f"><div><b>RESUMEN:</b> ' + items.length + ' extintores · ' + ok + ' conformes · ' + (items.length - ok) + ' requieren atención<br>' + Object.keys(tot).map(function (k) { return tot[k] + " × " + e(k); }).join(" · ") + '</div><div class="ip-s">' + (insp.firma ? '<img alt="Firma" src="' + insp.firma + '">' : '') + '<span>' + e(insp.responsable || "Responsable del cliente") + '</span></div></div>' : '') + '</div>');
  }
  return pages;
}
var JASA_INSP_CSS = ".ip{width:1056px;height:816px;background:#fff;color:#111;padding:28px 32px;font-family:Arial,Helvetica,sans-serif;font-size:10px;box-sizing:border-box;display:flex;flex-direction:column;gap:10px}" +
  ".ip *{box-sizing:border-box}.ip-h{display:flex;justify-content:space-between;align-items:flex-start;font-size:11px;line-height:1.35}.ip-cli{font-size:15px}" +
  ".ip-r{text-align:right}.ip-r img{width:150px;display:block;margin:0 0 4px auto}" +
  ".ip-t{width:100%;border-collapse:collapse;table-layout:fixed}.ip-t th,.ip-t td{border:1px solid #777;padding:2px 3px;text-align:center;overflow:hidden;white-space:nowrap}" +
  ".ip-t th{font-family:Arial,Helvetica,sans-serif;letter-spacing:0;text-transform:none;font-size:7.5px;background:#f2f2f2;font-weight:700;white-space:normal;line-height:1.1;color:#111;padding:2px 1px}.ip-t th.o{font-weight:400;font-size:7px}" +
  ".ip-t td{height:28px;font-size:10px}.ip-t td.u{text-align:left;white-space:normal;font-size:9px;line-height:1.1}.ip-t td.f{font-family:monospace;font-size:8.5px}" +
  ".ip-t td.m{font-size:12px;font-weight:700;width:20px}.ip-t td.c{text-align:left;white-space:normal;font-size:8.5px;line-height:1.1}.ip-t .bad{color:#c00000}" +
  ".ip-f{display:flex;justify-content:space-between;align-items:flex-end;font-size:10px;line-height:1.5;margin-top:auto}.ip-s{text-align:center;min-width:220px}.ip-s img{height:56px;display:block;margin:0 auto}.ip-s span{display:block;border-top:1px solid #111;padding-top:3px}";
