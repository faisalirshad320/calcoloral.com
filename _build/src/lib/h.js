/* Helper condivisi per i contenuti delle pagine */
'use strict';
const CR = require('../assets/engine.js');
const UI = require('../assets/ui.js');
const { eur, fmt, pct } = UI;

const SRC = {
  bilancio2026: ['Legge 30 dicembre 2025 (Legge di Bilancio 2026), art. 1 commi 3-4 — nuove aliquote IRPEF', 'https://www.gazzettaufficiale.it/'],
  l207: ['Legge 30 dicembre 2024 n. 207, art. 1 commi 4-6 — cuneo fiscale (Normattiva)', 'https://www.normattiva.it/eli/id/2024/12/31/24G00229/CONSOLIDATED'],
  tuir13: ['DPR 917/1986 (TUIR), art. 13 — detrazioni per lavoro dipendente e pensione', 'https://www.normattiva.it/uri-res/N2Ls?urn:nir:presidente.repubblica:decreto:1986-12-22;917'],
  ade: ['Agenzia delle Entrate — Aliquote e calcolo dell\'IRPEF', 'https://www.agenziaentrate.gov.it/portale/aliquote-e-calcolo-dell-irpef'],
  mef: ['Dipartimento delle Finanze (MEF) — Addizionale regionale all\'IRPEF', 'https://www1.finanze.gov.it/finanze2/dipartimentopolitichefiscali/fiscalitalocale/addregirpef/sceltaregione.htm'],
  mefCom: ['Dipartimento delle Finanze (MEF) — Addizionale comunale all\'IRPEF', 'https://www1.finanze.gov.it/finanze/pagina_dichiarazioni/public/dichiarazioni.php'],
  inps6: ['INPS — Circolare n. 6 del 30/01/2026: minimali, massimali e prima fascia di retribuzione pensionabile', 'https://www.inps.it/it/it/inps-comunica/atti/circolari-messaggi-e-normativa.html'],
  inps4: ['INPS — Circolare n. 4 del 28/01/2026: importi massimi NASpI e ammortizzatori 2026', 'https://www.inps.it/it/it/inps-comunica/atti/circolari-messaggi-e-normativa.html'],
  naspi: ['INPS — NASpI: indennità mensile di disoccupazione', 'https://www.inps.it/it/it/dettaglio-scheda.schede-servizio-strumento.schede-servizi.naspi-indennit-mensile-di-disoccupazione-50660.naspi-indennit-mensile-di-disoccupazione.html'],
  cc2120: ['Codice civile, art. 2120 — Disciplina del trattamento di fine rapporto', 'https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:codice.civile:1942-03-16;262~art2120'],
  tuir19: ['TUIR, artt. 17 e 19 — tassazione separata del TFR', 'https://www.normattiva.it/uri-res/N2Ls?urn:nir:presidente.repubblica:decreto:1986-12-22;917'],
  dl3: ['DL 5 febbraio 2020 n. 3 — trattamento integrativo (Normattiva)', 'https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.legge:2020-02-05;3'],
  forf: ['Agenzia delle Entrate — Regime forfetario', 'https://www.agenziaentrate.gov.it/portale/regime-forfetario'],
  gs: ['INPS — Gestione separata: aliquote 2026', 'https://www.inps.it/it/it/inps-comunica/atti/circolari-messaggi-e-normativa.html'],
  ccnlComm: ['CCNL Terziario, Distribuzione e Servizi — rinnovo 22 marzo 2024 (Confcommercio)', 'https://www.confcommercio.it/'],
  ccnlMet: ['CCNL Metalmeccanica Industria Federmeccanica-Assistal — minimi dal 1° giugno 2026', 'https://www.federmeccanica.it/'],
  cnel: ['CNEL — Archivio nazionale dei contratti collettivi', 'https://www.cnel.it/Archivio-Contratti']
};

/** Riga netto per una RAL */
function netto(ral, extra) { return CR.calcolaNetto(Object.assign({ ral, mensilita: 13, regione: 'lombardia', comunale: 0.8 }, extra || {})); }

/** Tabella HTML generica */
function table(head, rows, opt) {
  opt = opt || {};
  const th = head.map((h, i) => `<th${(opt.num || []).includes(i) ? ' class="n"' : ''}>${h}</th>`).join('');
  const tr = rows.map((r, ri) => `<tr${(opt.hl || []).includes(ri) ? ' class="hl"' : ''}>` + r.map((c, i) => `<td${(opt.num || []).includes(i) ? ' class="n"' : ''}>${c}</td>`).join('') + '</tr>').join('');
  return `<div class="tbl"><table>${opt.caption ? `<caption>${opt.caption}</caption>` : ''}<thead><tr>${th}</tr></thead><tbody>${tr}</tbody></table></div>`;
}

/** Tabella RAL → netto */
function ralTable(rals, opt) {
  opt = opt || {};
  const reg = opt.regione || 'lombardia';
  const rows = rals.map(r => {
    const a = netto(r, { regione: reg, mensilita: 13 }), b = netto(r, { regione: reg, mensilita: 14 });
    const link = opt.links && opt.links.includes(r) ? `<a href="/ral/${r}/">${eur(r, 0)}</a>` : eur(r, 0);
    return [link, eur(a.nettoAnnuo, 0), eur(a.nettoMensile, 0), eur(b.nettoMensile, 0), pct(a.aliquotaMedia)];
  });
  return table(['RAL', 'Netto annuo', 'Netto mensile (13)', 'Netto mensile (14)', 'Trattenute'], rows,
    { num: [1, 2, 3, 4], hl: opt.hl !== undefined ? [rals.indexOf(opt.hl)] : [], caption: opt.caption || `Calcolo 2026, ${CR.P.regioni[reg].nome}, addizionale comunale 0,8%, nessun familiare a carico.` });
}

/** Tabella netto per regione per una RAL */
function regionTable(ral, mens) {
  const rows = Object.keys(CR.P.regioni).map(k => [k, netto(ral, { regione: k, mensilita: mens || 13 })])
    .sort((a, b) => b[1].nettoAnnuo - a[1].nettoAnnuo)
    .map(([k, n]) => [CR.P.regioni[k].nome, eur(n.addizionaleRegionale), eur(n.nettoAnnuo, 0), eur(n.nettoMensile, 0)]);
  return table(['Regione', 'Addizionale regionale', 'Netto annuo', `Netto mensile (${mens || 13})`], rows,
    { num: [1, 2, 3], caption: `RAL ${eur(ral, 0)}, addizionale comunale 0,8%. Ordinate dal netto più alto al più basso.` });
}

function scaglioniTable() {
  return table(['Scaglione di reddito', 'Aliquota 2026', 'Aliquota 2025', 'Imposta massima dello scaglione'], [
    ['Fino a 28.000 €', '23%', '23%', '6.440 €'],
    ['Da 28.000,01 a 50.000 €', '<strong>33%</strong>', '35%', '7.260 €'],
    ['Oltre 50.000 €', '43%', '43%', '—']
  ], { num: [3] });
}

module.exports = { CR, UI, eur, fmt, pct, SRC, netto, table, ralTable, regionTable, scaglioniTable };
