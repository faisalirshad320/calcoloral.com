/*! CalcoloRAL — interfaccia calcolatori (browser + pre-render in build) */
(function (root) {
  'use strict';
  var CR = (typeof module !== 'undefined' && module.exports) ? require('./engine.js') : root.CR;

  var fmt = function (n, dec) {
    if (dec === undefined) dec = 2;
    var s = Math.abs(n).toFixed(dec).split('.');
    s[0] = s[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return (n < 0 ? '−' : '') + s.join(',');
  };
  var eur = function (n, dec) { return fmt(n, dec === undefined ? 2 : dec) + ' €'; };
  var pct = function (n) { return fmt(n, 2).replace(/,00$/, '') + '%'; };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };

  function regioniOptions(sel) {
    return Object.keys(CR.P.regioni).sort(function (a, b) { return CR.P.regioni[a].nome.localeCompare(CR.P.regioni[b].nome, 'it'); })
      .map(function (k) { return '<option value="' + k + '"' + (k === sel ? ' selected' : '') + '>' + esc(CR.P.regioni[k].nome) + '</option>'; }).join('');
  }
  function num(name, label, val, unit, help, attrs) {
    return '<div class="field"><label for="f-' + name + '">' + label + '</label><div class="inp"><input id="f-' + name + '" name="' + name + '" type="number" inputmode="decimal" value="' + val + '"' + (attrs || ' min="0" step="any"') + '><span class="unit">' + (unit || '€') + '</span></div>' + (help ? '<small>' + help + '</small>' : '') + '</div>';
  }
  function seg(name, label, opts, val) {
    return '<div class="field"><span class="lbl-like" style="display:block;font-weight:650;font-size:15px;margin:0 0 6px">' + label + '</span><div class="seg" role="radiogroup" aria-label="' + esc(label) + '">' +
      opts.map(function (o) { return '<label><input type="radio" name="' + name + '" value="' + o[0] + '"' + (String(o[0]) === String(val) ? ' checked' : '') + '><span>' + o[1] + '</span></label>'; }).join('') + '</div></div>';
  }
  function select(name, label, optionsHtml, help) {
    return '<div class="field"><label for="f-' + name + '">' + label + '</label><select id="f-' + name + '" name="' + name + '">' + optionsHtml + '</select>' + (help ? '<small>' + help + '</small>' : '') + '</div>';
  }
  function luogo(d) {
    return '<div class="row2">' + select('regione', 'Regione di residenza', regioniOptions(d.regione || 'lombardia')) +
      num('comunale', 'Addizionale comunale', d.comunale === undefined ? CR.P.addizionaleComunaleDefault : d.comunale, '%', 'Tra 0% e 0,9% (Roma fino a 1,2%)', ' min="0" max="1.5" step="0.01"') + '</div>';
  }
  function inpsSel(val) {
    return select('inps', 'Contribuzione INPS', [['standard', 'Dipendente privato — 9,19%'], ['industria', 'Industria oltre 15 dip. — 9,49%'], ['apprendista', 'Apprendista — 5,84%']]
      .map(function (o) { return '<option value="' + o[0] + '"' + (o[0] === val ? ' selected' : '') + '>' + o[1] + '</option>'; }).join(''));
  }

  /* ---------- FORMS ---------- */
  var forms = {
    netto: function (d) {
      return '<h2>Inserisci i tuoi dati</h2>' +
        num('ral', 'RAL — Retribuzione annua lorda', d.ral || 30000, '€', 'Lo stipendio lordo annuo scritto nel contratto') +
        seg('mensilita', 'Mensilità', [[12, '12'], [13, '13'], [14, '14']], d.mensilita || 13) + luogo(d) +
        '<details class="adv"><summary>Opzioni avanzate</summary><div style="margin-top:10px">' + inpsSel(d.inps || 'standard') +
        num('altriRedditi', 'Altri redditi annui (es. affitti)', 0, '€', 'Lascia 0 se hai solo lo stipendio') + '</div></details>';
    },
    parttime: function (d) {
      return '<h2>Calcola il netto part-time</h2>' +
        num('ralFull', 'RAL full-time (40 ore)', d.ralFull || 30000, '€', 'La RAL del tuo livello a tempo pieno') +
        num('perc', 'Percentuale part-time', d.perc || 50, '%', 'Es. 20 ore su 40 = 50%; 30 ore su 40 = 75%', ' min="1" max="100" step="1"') +
        seg('mensilita', 'Mensilità', [[12, '12'], [13, '13'], [14, '14']], d.mensilita || 14) + luogo(d);
    },
    ralDaNetto: function (d) {
      return '<h2>Quanto netto vuoi in busta?</h2>' +
        num('netto', 'Netto mensile desiderato', d.netto || 1800, '€') +
        seg('mensilita', 'Su quante mensilità', [[12, '12'], [13, '13'], [14, '14']], d.mensilita || 13) + luogo(d) +
        '<details class="adv"><summary>Opzioni avanzate</summary><div style="margin-top:10px">' + inpsSel('standard') + '</div></details>';
    },
    busta: function (d) {
      return '<h2>Simula la tua busta paga</h2>' +
        num('ral', 'RAL — Retribuzione annua lorda', d.ral || 28000, '€') +
        seg('mensilita', 'Mensilità', [[12, '12'], [13, '13'], [14, '14']], d.mensilita || 14) + luogo(d) +
        '<details class="adv"><summary>Opzioni avanzate</summary><div style="margin-top:10px">' + inpsSel('standard') + '</div></details>';
    },
    tfr: function (d) {
      return '<h2>Calcola il tuo TFR</h2>' +
        num('ral', 'RAL media degli ultimi anni', d.ral || 30000, '€', 'Retribuzione annua lorda utile ai fini del TFR') +
        num('anni', 'Anni di servizio', d.anni || 10, 'anni', 'Puoi usare i decimali: 6 mesi = 0,5', ' min="0" max="50" step="0.5"') +
        num('inflazione', 'Inflazione media annua (ISTAT FOI)', d.inflazione === undefined ? 1.7 : d.inflazione, '%', 'Serve per la rivalutazione del fondo', ' min="0" max="15" step="0.1"');
    },
    mensilita: function (d) {
      var tipo = d.tipo || 'tredicesima';
      return '<h2>Calcola la ' + tipo + '</h2><input type="hidden" name="tipo" value="' + tipo + '">' +
        num('lordoMensile', 'Retribuzione lorda mensile', d.lordoMensile || 1800, '€', 'Minimo + contingenza + scatti + superminimo') +
        num('mesi', 'Mesi lavorati nel periodo', d.mesi || 12, 'mesi', tipo === 'tredicesima' ? 'Da gennaio a dicembre (15 giorni = 1 mese)' : 'Da luglio a giugno (15 giorni = 1 mese)', ' min="0" max="12" step="1"') +
        seg('mensilita', 'Mensilità del contratto', [[13, '13'], [14, '14']], d.mensilita || (tipo === 'tredicesima' ? 13 : 14));
    },
    naspi: function (d) {
      return '<h2>Calcola la NASpI 2026</h2>' +
        num('retribuzioneMedia', 'Retribuzione media mensile lorda', d.retribuzioneMedia || 1800, '€', 'Media degli ultimi 4 anni (imponibile previdenziale)') +
        num('settimane', 'Settimane di contributi negli ultimi 4 anni', d.settimane || 208, 'sett.', 'Massimo 208 settimane', ' min="13" max="208" step="1"') +
        '<div class="field"><label class="chk"><input type="checkbox" name="over55"' + (d.over55 ? ' checked' : '') + '> Ho 55 anni o più alla domanda</label></div>';
    },
    pensione: function (d) {
      return '<h2>Calcola la pensione netta</h2>' +
        num('lordoMensile', 'Pensione lorda mensile', d.lordoMensile || 1500, '€', 'Importo lordo pagato per 13 mensilità') + luogo(d);
    },
    irpef: function (d) {
      return '<h2>Calcola l\'IRPEF 2026</h2>' +
        num('reddito', 'Reddito imponibile annuo', d.reddito || 35000, '€', 'Al netto dei contributi previdenziali') +
        select('tipo', 'Tipo di reddito', [['dipendente', 'Lavoro dipendente'], ['pensione', 'Pensione'], ['altro', 'Altro (nessuna detrazione)']]
          .map(function (o) { return '<option value="' + o[0] + '"' + (o[0] === (d.tipo || 'dipendente') ? ' selected' : '') + '>' + o[1] + '</option>'; }).join(''));
    },
    forfettario: function (d) {
      return '<h2>Partita IVA forfettaria o dipendente?</h2>' +
        num('ricavi', 'Fatturato annuo (ricavi)', d.ricavi || 40000, '€', 'Massimo 85.000 € per il regime forfettario') +
        select('coefficiente', 'Coefficiente di redditività', [[78, '78% — professionisti (codici ATECO 69-75, 85, 86-88)'], [67, '67% — altre attività di servizi'], [86, '86% — costruzioni e attività immobiliari'], [62, '62% — commercio ambulante non alimentare'], [40, '40% — commercio e ristorazione']]
          .map(function (o) { return '<option value="' + o[0] + '"' + (String(o[0]) === String(d.coefficiente || 78) ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('')) +
        '<div class="field"><label class="chk"><input type="checkbox" name="startup"' + (d.startup ? ' checked' : '') + '> Nuova attività (imposta al 5% per 5 anni)</label></div>';
    },
    ccnl: function (d) {
      var c = CR.P.ccnl[d.ccnl || 'commercio'];
      var opts = c.livelli.map(function (l) { return '<option value="' + l.id + '"' + (l.id === (d.livello || c.livelli[3].id) ? ' selected' : '') + '>' + esc(l.nome) + '</option>'; }).join('');
      return '<h2>Netto per livello — CCNL ' + esc(d.ccnl === 'metalmeccanico' ? 'Metalmeccanico' : 'Commercio') + '</h2><input type="hidden" name="ccnl" value="' + (d.ccnl || 'commercio') + '">' +
        select('livello', 'Livello di inquadramento', opts) +
        num('extra', 'Scatti di anzianità + superminimo (mensili)', d.extra || 0, '€', 'Lascia 0 per il minimo contrattuale') +
        num('perc', 'Orario (% del tempo pieno)', d.perc || 100, '%', '100% = 40 ore settimanali', ' min="1" max="100" step="1"') + luogo(d);
    },
    regionale: function (d) {
      return '<h2>Calcola l\'addizionale regionale</h2>' +
        num('reddito', 'Reddito imponibile IRPEF', d.reddito || 30000, '€') + select('regione', 'Regione o Provincia autonoma', regioniOptions(d.regione || 'lazio'));
    }
  };

  /* ---------- RENDER ---------- */
  function breakdownBar(res) {
    var tot = res.ral || 1, w = function (x) { return Math.max(0, x / tot * 100).toFixed(2); };
    var add = res.addizionaleRegionale + res.addizionaleComunale;
    var net = res.ral - res.inps - res.irpefNetta - add;
    return '<div class="bar" aria-hidden="true"><i class="b-net" style="width:' + w(net) + '%"></i><i class="b-inps" style="width:' + w(res.inps) + '%"></i><i class="b-irpef" style="width:' + w(res.irpefNetta) + '%"></i><i class="b-add" style="width:' + w(add) + '%"></i></div>' +
      '<div class="legend"><span><i style="background:var(--brand)"></i>Netto ' + pct(net / tot * 100) + '</span><span><i style="background:#5b8def"></i>INPS ' + pct(res.inps / tot * 100) + '</span><span><i style="background:var(--accent)"></i>IRPEF ' + pct(res.irpefNetta / tot * 100) + '</span><span><i style="background:var(--gold)"></i>Addizionali ' + pct(add / tot * 100) + '</span></div>';
  }
  function rowsTable(rows) {
    return '<table class="brk"><tbody>' + rows.map(function (r) {
      return '<tr class="' + (r[2] || '') + '"><td>' + r[0] + '</td><td>' + r[1] + '</td></tr>';
    }).join('') + '</tbody></table>';
  }
  function nettoBlock(res, titolo) {
    var rows = [
      ['Retribuzione annua lorda (RAL)', eur(res.ral)],
      ['Contributi INPS dipendente', '− ' + eur(res.inps), 'minus'],
      ['IRPEF lorda', eur(res.irpefLorda)],
      ['Detrazione lavoro dipendente', '− ' + eur(res.detrazioneLavoro)],
      ['Ulteriore detrazione cuneo fiscale', '− ' + eur(res.ulterioreDetrazione)],
      ['IRPEF netta', '− ' + eur(res.irpefNetta), 'minus'],
      ['Addizionale regionale (' + esc(res.regioneNome || '') + ')', '− ' + eur(res.addizionaleRegionale), 'minus'],
      ['Addizionale comunale', '− ' + eur(res.addizionaleComunale), 'minus']
    ];
    if (res.bonusCuneo > 0) rows.push(['Somma esente cuneo fiscale', '+ ' + eur(res.bonusCuneo), 'plus']);
    if (res.trattamentoIntegrativo > 0) rows.push(['Trattamento integrativo', '+ ' + eur(res.trattamentoIntegrativo), 'plus']);
    rows.push(['Stipendio netto annuo', eur(res.nettoAnnuo), 'tot']);
    return '<div class="big"><span class="lbl">' + (titolo || 'Stipendio netto mensile') + '</span><span class="val" data-k="nettoMensile">' + eur(res.nettoMensile) + '</span><span class="sub">su ' + res.mensilita + ' mensilità · ' + eur(res.nettoAnnuo, 0) + ' netti all\'anno</span></div>' +
      '<div class="kpis"><div class="kpi"><b>' + eur(res.lordoMensile, 0) + '</b><span>Lordo mensile</span></div><div class="kpi"><b>' + pct(res.aliquotaMedia) + '</b><span>Trattenute medie</span></div><div class="kpi"><b>' + pct(res.aliquotaMarginale) + '</b><span>Aliquota IRPEF marginale</span></div></div>' +
      breakdownBar(res) + rowsTable(rows);
  }

  var renders = {
    netto: function (v) {
      var res = CR.calcolaNetto(v);
      return nettoBlock(res) + '<p class="note">Calcolo annuale con parametri 2026: le addizionali sono trattenute in busta l\'anno successivo, ma qui le includiamo per mostrarti il netto reale. Nessun familiare a carico.</p>';
    },
    parttime: function (v) {
      var ral = (+v.ralFull || 0) * (+v.perc || 0) / 100;
      var res = CR.calcolaNetto(Object.assign({}, v, { ral: ral }));
      var full = CR.calcolaNetto(Object.assign({}, v, { ral: +v.ralFull || 0 }));
      return nettoBlock(res, 'Netto mensile part-time ' + fmt(+v.perc || 0, 0) + '%') +
        '<p class="note">A tempo pieno il netto sarebbe ' + eur(full.nettoMensile) + ' al mese: il part-time al ' + fmt(+v.perc || 0, 0) + '% ti dà il ' + pct(full.nettoAnnuo ? res.nettoAnnuo / full.nettoAnnuo * 100 : 0) + ' del netto, più della percentuale di orario grazie alla progressività dell\'IRPEF e al cuneo fiscale.</p>';
    },
    ralDaNetto: function (v) {
      var res = CR.calcolaRalDaNetto({ nettoMensile: +v.netto, mensilita: +v.mensilita || 13, regione: v.regione, comunale: v.comunale, inps: v.inps });
      return '<div class="big"><span class="lbl">RAL da chiedere</span><span class="val">' + eur(res.ral, 0) + '</span><span class="sub">per avere ' + eur(+v.netto) + ' netti × ' + res.mensilita + ' mensilità</span></div>' +
        '<div class="kpis"><div class="kpi"><b>' + eur(res.lordoMensile, 0) + '</b><span>Lordo mensile</span></div><div class="kpi"><b>' + eur(res.nettoAnnuo, 0) + '</b><span>Netto annuo</span></div><div class="kpi"><b>' + pct(res.aliquotaMedia) + '</b><span>Trattenute medie</span></div></div>' +
        breakdownBar(res) + rowsTable([
          ['Contributi INPS', '− ' + eur(res.inps), 'minus'], ['IRPEF netta', '− ' + eur(res.irpefNetta), 'minus'],
          ['Addizionali regionale + comunale', '− ' + eur(res.addizionaleRegionale + res.addizionaleComunale), 'minus'],
          ['Bonus cuneo + trattamento integrativo', '+ ' + eur(res.bonusCuneo + res.trattamentoIntegrativo), 'plus'],
          ['Netto annuo', eur(res.nettoAnnuo), 'tot']]) +
        '<p class="note">Arrotondiamo la RAL all\'euro. In un colloquio conviene chiedere una cifra tonda leggermente superiore.</p>';
    },
    busta: function (v) {
      var b = CR.calcolaBustaPaga(v);
      return '<div class="big"><span class="lbl">Netto in busta (mese ordinario)</span><span class="val">' + eur(b.annuale.nettoMensile) + '</span><span class="sub">RAL ' + eur(b.annuale.ral, 0) + ' su ' + b.annuale.mensilita + ' mensilità</span></div>' +
        rowsTable(b.voci.map(function (x) { return [x.voce, (x.segno === '=' ? '' : x.segno + ' ') + eur(x.importo), x.segno === '=' ? (x.voce === 'Netto in busta' ? 'tot' : '') : (x.segno === '+' ? 'plus' : 'minus')]; })) +
        '<p class="note">Valori medi mensili: nella busta reale l\'IRPEF viene ricalcolata a conguaglio e le addizionali dell\'anno precedente si pagano da gennaio a novembre.</p>';
    },
    tfr: function (v) {
      var r = CR.calcolaTfr(v);
      return '<div class="big"><span class="lbl">TFR netto stimato</span><span class="val">' + eur(r.netto, 0) + '</span><span class="sub">TFR lordo ' + eur(r.lordo, 0) + ' dopo ' + fmt(+v.anni || 0, 1).replace(',0', '') + ' anni</span></div>' +
        rowsTable([
          ['Quota TFR accantonata ogni anno', eur(r.quotaAnnua)],
          ['Quote accantonate (capitale)', eur(r.capitale)],
          ['Rivalutazioni maturate', '+ ' + eur(r.rivalutazioni), 'plus'],
          ['TFR lordo', eur(r.lordo)],
          ['Imposta sostitutiva 17% sulle rivalutazioni', '− ' + eur(r.impostaRivalutazioni), 'minus'],
          ['IRPEF a tassazione separata (aliquota media ' + pct(r.aliquotaMedia) + ')', '− ' + eur(r.imposta), 'minus'],
          ['TFR netto', eur(r.netto), 'tot']]) +
        '<p class="note">Stima: l\'Agenzia delle Entrate riliquida l\'imposta usando l\'aliquota media del quinquennio se più favorevole.</p>';
    },
    mensilita: function (v) {
      var r = CR.calcolaMensilitaAggiuntiva({ lordoMensile: +v.lordoMensile, mesi: +v.mesi, mensilita: +v.mensilita });
      var nome = v.tipo === 'quattordicesima' ? 'Quattordicesima' : 'Tredicesima';
      return '<div class="big"><span class="lbl">' + nome + ' netta stimata</span><span class="val">' + eur(r.netto) + '</span><span class="sub">' + nome + ' lorda ' + eur(r.lordo) + ' per ' + (+v.mesi || 0) + ' mesi</span></div>' +
        rowsTable([['Importo lordo (' + (+v.mesi || 0) + '/12)', eur(r.lordo)], ['Contributi INPS 9,19%', '− ' + eur(r.inps), 'minus'], ['IRPEF all\'aliquota marginale ' + pct(r.aliquota), '− ' + eur(r.irpef), 'minus'], [nome + ' netta', eur(r.netto), 'tot']]) +
        '<p class="note">Sulle mensilità aggiuntive non si applicano le detrazioni (già godute nei mesi ordinari): per questo il netto è proporzionalmente più basso.</p>';
    },
    naspi: function (v) {
      var r = CR.calcolaNaspi({ retribuzioneMedia: +v.retribuzioneMedia, settimane: +v.settimane, over55: !!v.over55 });
      var rows = r.piano.filter(function (p, i) { return i < 3 || p.mese % 3 === 0 || i === r.piano.length - 1; })
        .map(function (p) { return ['Mese ' + p.mese, eur(p.importo)]; });
      return '<div class="big"><span class="lbl">NASpI lorda — primo mese</span><span class="val">' + eur(r.mensileIniziale) + '</span><span class="sub">per circa ' + fmt(r.durataMesi, 1).replace(',0', '') + ' mesi (' + r.settimanePagate + ' settimane)</span></div>' +
        '<div class="kpis"><div class="kpi"><b>' + eur(r.totaleLordo, 0) + '</b><span>Totale lordo</span></div><div class="kpi"><b>' + (v.over55 ? '8°' : '6°') + ' mese</b><span>Inizio décalage −3%</span></div><div class="kpi"><b>' + eur(CR.P.naspi.massimo, 0) + '</b><span>Massimo 2026</span></div></div>' +
        rowsTable(rows) + '<p class="note">Importi lordi: la NASpI è tassata come reddito da lavoro dipendente, con le relative detrazioni.</p>';
    },
    pensione: function (v) {
      var r = CR.calcolaPensioneNetta(v);
      return '<div class="big"><span class="lbl">Pensione netta mensile</span><span class="val">' + eur(r.nettoMensile) + '</span><span class="sub">' + eur(r.nettoAnnuo, 0) + ' netti all\'anno su 13 mensilità</span></div>' +
        rowsTable([['Pensione lorda annua', eur(r.lordoAnnuo)], ['IRPEF lorda', eur(r.irpefLorda)], ['Detrazione redditi da pensione', '− ' + eur(r.detrazione)], ['IRPEF netta', '− ' + eur(r.irpef), 'minus'], ['Addizionale regionale', '− ' + eur(r.addizionaleRegionale), 'minus'], ['Addizionale comunale', '− ' + eur(r.addizionaleComunale), 'minus'], ['Pensione netta annua', eur(r.nettoAnnuo), 'tot']]);
    },
    irpef: function (v) {
      var r = CR.calcolaIrpef(v);
      var rows = r.scaglioni.map(function (s) { return ['Scaglione ' + (s.a === Infinity || s.a === null ? 'oltre ' + fmt(s.da, 0) : fmt(s.da, 0) + '–' + fmt(s.a, 0)) + ' € al ' + s.aliquota + '%', eur(s.imposta)]; });
      rows.push(['IRPEF lorda', eur(r.lorda)]);
      if (r.detrazione) rows.push(['Detrazioni', '− ' + eur(r.detrazione + r.ulteriore), 'plus']);
      rows.push(['IRPEF netta', eur(r.netta), 'tot']);
      return '<div class="big"><span class="lbl">IRPEF netta 2026</span><span class="val">' + eur(r.netta) + '</span><span class="sub">aliquota media ' + pct(r.aliquotaMedia) + ' · marginale ' + pct(r.aliquotaMarginale) + '</span></div>' + rowsTable(rows) +
        '<p class="note">Addizionali regionali e comunali escluse. Detrazioni per familiari e oneri non considerate.</p>';
    },
    forfettario: function (v) {
      var f = CR.calcolaForfettario(v);
      var eq = CR.calcolaRalDaNetto({ nettoAnnuo: f.nettoAnnuo, mensilita: 13, regione: 'lombardia' });
      return '<div class="big"><span class="lbl">Netto annuo con partita IVA</span><span class="val">' + eur(f.nettoAnnuo, 0) + '</span><span class="sub">' + eur(f.nettoMensile, 0) + ' al mese su 12 mesi</span></div>' +
        rowsTable([['Fatturato', eur(f.ricavi)], ['Reddito forfettario (× coefficiente)', eur(f.reddito)], ['Contributi INPS Gestione separata 26,07%', '− ' + eur(f.inps), 'minus'], ['Imposta sostitutiva ' + f.aliquotaImposta + '%', '− ' + eur(f.imposta), 'minus'], ['Netto annuo', eur(f.nettoAnnuo), 'tot']]) +
        '<div class="callout" style="margin-top:14px">Per avere lo stesso netto da dipendente ti servirebbe una <strong>RAL di circa ' + eur(eq.ral, 0) + '</strong> (Lombardia, 13 mensilità). Da dipendente avresti però anche TFR, ferie e malattia pagate.</div>';
    },
    ccnl: function (v) {
      var c = CR.P.ccnl[v.ccnl || 'commercio'];
      var lv = c.livelli.filter(function (l) { return l.id === v.livello; })[0] || c.livelli[0];
      var mensile = (lv.minimo + (lv.contingenza || 0) + (lv.indennita || 0) + (+v.extra || 0)) * (+v.perc || 100) / 100;
      var ral = mensile * c.mensilita;
      var res = CR.calcolaNetto({ ral: ral, mensilita: c.mensilita, regione: v.regione, comunale: v.comunale });
      return nettoBlock(res, 'Netto mensile ' + esc(lv.nome)) + '<p class="note">Lordo mensile ' + eur(mensile) + ' × ' + c.mensilita + ' mensilità = RAL ' + eur(ral, 0) + '. Minimi in vigore dal ' + c.decorrenza.split('-').reverse().join('/') + '.</p>';
    },
    regionale: function (v) {
      var r = CR.addizionaleRegionale(+v.reddito || 0, v.regione);
      var reg = CR.P.regioni[v.regione];
      var all = Object.keys(CR.P.regioni).map(function (k) { return [k, CR.addizionaleRegionale(+v.reddito || 0, k)]; }).sort(function (a, b) { return a[1] - b[1]; });
      var pos = all.map(function (x) { return x[0]; }).indexOf(v.regione) + 1;
      return '<div class="big"><span class="lbl">Addizionale regionale 2026</span><span class="val">' + eur(r) + '</span><span class="sub">' + esc(reg.nome) + ' · ' + eur(r / 12) + ' al mese circa · ' + pos + 'ª su 21 per importo più basso</span></div>' +
        rowsTable([['Regione più conveniente: ' + CR.P.regioni[all[0][0]].nome, eur(all[0][1])], ['Regione più cara: ' + CR.P.regioni[all[all.length - 1][0]].nome, eur(all[all.length - 1][1])], ['Differenza massima', eur(all[all.length - 1][1] - all[0][1]), 'tot']]);
    }
  };

  function toolHtml(tool, defaults) {
    defaults = defaults || {};
    var vals = defaultsToValues(tool, defaults);
    return '<section class="tool" data-tool="' + tool + '" aria-label="Calcolatore"><form class="tool-form" onsubmit="return false" novalidate>' + forms[tool](defaults) +
      '</form><div class="tool-out" aria-live="polite"><div class="out">' + renders[tool](vals) + '</div><div class="share"><button type="button" class="btn" data-act="link">Copia link al risultato</button><button type="button" class="btn" data-act="print">Stampa</button></div></div></section>';
  }

  function defaultsToValues(tool, d) {
    var base = { regione: d.regione || (tool === 'regionale' ? 'lazio' : 'lombardia'), comunale: d.comunale === undefined ? CR.P.addizionaleComunaleDefault : d.comunale, inps: d.inps || 'standard' };
    var map = {
      netto: { ral: d.ral || 30000, mensilita: d.mensilita || 13 },
      parttime: { ralFull: d.ralFull || 30000, perc: d.perc || 50, mensilita: d.mensilita || 14 },
      ralDaNetto: { netto: d.netto || 1800, mensilita: d.mensilita || 13 },
      busta: { ral: d.ral || 28000, mensilita: d.mensilita || 14 },
      tfr: { ral: d.ral || 30000, anni: d.anni || 10, inflazione: d.inflazione === undefined ? 1.7 : d.inflazione },
      mensilita: { tipo: d.tipo || 'tredicesima', lordoMensile: d.lordoMensile || 1800, mesi: d.mesi || 12, mensilita: d.mensilita || (d.tipo === 'quattordicesima' ? 14 : 13) },
      naspi: { retribuzioneMedia: d.retribuzioneMedia || 1800, settimane: d.settimane || 208, over55: !!d.over55 },
      pensione: { lordoMensile: d.lordoMensile || 1500 },
      irpef: { reddito: d.reddito || 35000, tipo: d.tipo || 'dipendente' },
      forfettario: { ricavi: d.ricavi || 40000, coefficiente: d.coefficiente || 78, startup: !!d.startup },
      ccnl: { ccnl: d.ccnl || 'commercio', livello: d.livello || CR.P.ccnl[d.ccnl || 'commercio'].livelli[3].id, extra: d.extra || 0, perc: d.perc || 100 },
      regionale: { reddito: d.reddito || 30000 }
    };
    return Object.assign(base, map[tool]);
  }

  /* ---------- BROWSER ---------- */
  function readForm(form) {
    var v = {};
    Array.prototype.forEach.call(form.elements, function (el) {
      if (!el.name) return;
      if (el.type === 'radio') { if (el.checked) v[el.name] = el.value; }
      else if (el.type === 'checkbox') v[el.name] = el.checked;
      else v[el.name] = el.value;
    });
    return v;
  }
  function applyQuery(form) {
    if (!root.location || !root.location.search) return;
    var q = new URLSearchParams(root.location.search);
    q.forEach(function (val, key) {
      var els = form.querySelectorAll('[name="' + key + '"]');
      Array.prototype.forEach.call(els, function (el) {
        if (el.type === 'radio') el.checked = el.value === val;
        else if (el.type === 'checkbox') el.checked = val === '1' || val === 'true';
        else el.value = val;
      });
    });
  }
  function init() {
    var tools = document.querySelectorAll('[data-tool]');
    Array.prototype.forEach.call(tools, function (t) {
      var tool = t.getAttribute('data-tool'), form = t.querySelector('form'), out = t.querySelector('.out');
      applyQuery(form);
      var run = function () {
        try { out.innerHTML = renders[tool](readForm(form)); } catch (e) { if (root.console) console.error(e); }
      };
      form.addEventListener('input', run); form.addEventListener('change', run);
      t.addEventListener('click', function (e) {
        var act = e.target.getAttribute && e.target.getAttribute('data-act');
        if (act === 'print') root.print();
        if (act === 'link') {
          var v = readForm(form), q = new URLSearchParams();
          Object.keys(v).forEach(function (k) { if (v[k] !== '' && v[k] !== false) q.set(k, v[k] === true ? '1' : v[k]); });
          var url = root.location.origin + root.location.pathname + '?' + q.toString();
          if (navigator.clipboard) navigator.clipboard.writeText(url).then(function () { e.target.textContent = 'Link copiato ✓'; });
          root.history.replaceState(null, '', url);
        }
      });
      if (root.location.search) run();
    });
    var mb = document.querySelector('.menu-btn'), nav = document.querySelector('.nav');
    if (mb && nav) mb.addEventListener('click', function () { var o = nav.classList.toggle('open'); mb.setAttribute('aria-expanded', o); });
  }

  var api = { toolHtml: toolHtml, renders: renders, forms: forms, fmt: fmt, eur: eur, pct: pct, init: init };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else { root.CRUI = api; if (document.readyState !== 'loading') init(); else document.addEventListener('DOMContentLoaded', init); }
})(typeof window !== 'undefined' ? window : this);
