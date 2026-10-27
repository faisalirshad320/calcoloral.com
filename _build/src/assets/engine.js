/*!
 * CalcoloRAL — motore di calcolo stipendio netto 2026
 * Parametri verificati il 27/10/2026 su fonti ufficiali (vedi /metodologia/).
 * Funziona sia nel browser (window.CR) sia in Node (module.exports).
 */
(function (root) {
  'use strict';

  var P = {
    anno: 2026,
    aggiornato: '2026-10-27',
    // IRPEF 2026 — Legge di Bilancio 2026, art. 1 commi 3-4 (secondo scaglione dal 35% al 33%)
    irpef: [
      { fino: 28000, aliquota: 0.23 },
      { fino: 50000, aliquota: 0.33 },
      { fino: Infinity, aliquota: 0.43 }
    ],
    // Contributi INPS a carico del lavoratore
    inps: {
      standard: 0.0919,      // FPLD — generalità dei dipendenti privati
      industria: 0.0949,     // + 0,30% CIGS (industria oltre 15 dipendenti)
      apprendista: 0.0584,   // apprendisti
      sogliaAggiuntiva: 56224, // prima fascia di retribuzione pensionabile 2026 (circ. INPS 6/2026)
      aliquotaAggiuntiva: 0.01,
      massimale: 122295
    },
    // Cuneo fiscale strutturale — L. 207/2024, art. 1 commi 4-6
    cuneo: {
      sommaEsente: [
        { fino: 8500, pct: 0.071 },
        { fino: 15000, pct: 0.053 },
        { fino: 20000, pct: 0.048 }
      ],
      ulterioreDetrazione: { da: 20000, pieno: 32000, fino: 40000, importo: 1000 }
    },
    // Detrazione lavoro dipendente — art. 13 TUIR
    detrazioneLavoro: {
      fascia1: { fino: 15000, importo: 1955 },
      fascia2: { fino: 28000, base: 1910, variabile: 1190, divisore: 13000 },
      fascia3: { fino: 50000, base: 1910, divisore: 22000 },
      maggiorazione: { da: 25000, fino: 35000, importo: 65 }
    },
    // Detrazione redditi da pensione — art. 13 c.3 TUIR
    detrazionePensione: {
      fascia1: { fino: 8500, importo: 1955 },
      fascia2: { fino: 28000, base: 700, variabile: 1255, divisore: 19500 },
      fascia3: { fino: 50000, base: 700, divisore: 22000 },
      maggiorazione: { da: 25000, fino: 29000, importo: 50 }
    },
    // Trattamento integrativo — DL 3/2020 come modificato
    trattamentoIntegrativo: { importo: 1200, fino: 15000, finoEsteso: 28000, franchigia: 75 },
    // Addizionali regionali 2026 — Dipartimento delle Finanze (MEF), tabelle pubblicate gen-giu 2026
    // tipo 'scaglioni': aliquote marginali per scaglione; 'unica': aliquota su tutto l'imponibile
    regioni: {
      'abruzzo':        { nome: 'Abruzzo', scaglioni: [[28000, 1.67], [50000, 2.87], [Infinity, 3.33]] },
      'basilicata':     { nome: 'Basilicata', scaglioni: [[Infinity, 1.23]] },
      'bolzano':        { nome: 'P.A. Bolzano', scaglioni: [[50000, 1.23], [Infinity, 1.73]], detrazione: { importo: 430.50, finoReddito: 90000 } },
      'calabria':       { nome: 'Calabria', scaglioni: [[Infinity, 1.73]] },
      'campania':       { nome: 'Campania', scaglioni: [[15000, 1.73], [28000, 2.96], [50000, 3.20], [Infinity, 3.33]] },
      'emilia-romagna': { nome: 'Emilia-Romagna', scaglioni: [[15000, 1.33], [28000, 1.93], [50000, 2.78], [Infinity, 3.33]] },
      'friuli-venezia-giulia': { nome: 'Friuli Venezia Giulia', scaglioni: [[Infinity, 1.23]], ridotta: { finoReddito: 15000, aliquota: 0.70 } },
      'lazio':          { nome: 'Lazio', scaglioni: [[15000, 1.73], [Infinity, 3.33]], ridotta: { finoReddito: 28000, aliquota: 1.73 }, detrazione: { importo: 60, daReddito: 28000, finoReddito: 30000 } },
      'liguria':        { nome: 'Liguria', scaglioni: [[28000, 1.23], [50000, 3.18], [Infinity, 3.23]] },
      'lombardia':      { nome: 'Lombardia', scaglioni: [[15000, 1.23], [28000, 1.58], [50000, 1.72], [Infinity, 1.73]] },
      'marche':         { nome: 'Marche', scaglioni: [[15000, 1.23], [28000, 1.53], [50000, 1.70], [Infinity, 1.73]] },
      'molise':         { nome: 'Molise', scaglioni: [[15000, 2.03], [28000, 2.23], [Infinity, 3.63]] },
      'piemonte':       { nome: 'Piemonte', scaglioni: [[15000, 1.62], [28000, 2.68], [50000, 3.31], [Infinity, 3.33]] },
      'puglia':         { nome: 'Puglia', scaglioni: [[15000, 1.33], [28000, 2.13], [50000, 3.23], [Infinity, 3.33]] },
      'sardegna':       { nome: 'Sardegna', scaglioni: [[Infinity, 1.23]] },
      'sicilia':        { nome: 'Sicilia', scaglioni: [[Infinity, 1.23]] },
      'toscana':        { nome: 'Toscana', scaglioni: [[15000, 1.42], [28000, 1.43], [50000, 3.32], [Infinity, 3.33]] },
      'trento':         { nome: 'P.A. Trento', scaglioni: [[50000, 1.23], [Infinity, 1.73]], esenteFino: 30000 },
      'umbria':         { nome: 'Umbria', scaglioni: [[15000, 1.73], [28000, 3.02], [50000, 3.12], [Infinity, 3.33]], ridotta: { finoReddito: 28000, aliquota: 1.23 }, detrazione: { importo: 150, daReddito: 28000, finoReddito: 50000 } },
      'valle-d-aosta':  { nome: "Valle d'Aosta", scaglioni: [[Infinity, 1.23]], esenteFino: 15000 },
      'veneto':         { nome: 'Veneto', scaglioni: [[Infinity, 1.23]] }
    },
    addizionaleComunaleDefault: 0.8,
    // NASpI 2026 — circ. INPS n. 4 del 28/01/2026
    naspi: { soglia: 1456.72, massimo: 1584.70, decalagePct: 0.03, meseDecalage: 6, meseDecalageOver55: 8 },
    // Gestione separata 2026 — professionisti senza cassa
    gestioneSeparata: { aliquota: 0.2607, minimale: 18808, massimale: 122295 },
    // TFR — art. 2120 c.c.
    tfr: { divisore: 13.5, contributoFondo: 0.005, rivalutazioneFissa: 0.015, quotaInflazione: 0.75, impostaRivalutazione: 0.17 },
    // CCNL — minimi mensili lordi
    ccnl: {
      commercio: {
        nome: 'Terziario, Distribuzione e Servizi (Confcommercio)',
        decorrenza: '2026-11-01', mensilita: 14, ore: 40,
        // minimo tabellare + contingenza (+ indennità di funzione per i Quadri)
        livelli: [
          { id: 'quadro', nome: 'Quadro', minimo: 2243.86, contingenza: 540.37, indennita: 260.76 },
          { id: '1', nome: 'I livello', minimo: 2021.28, contingenza: 537.52 },
          { id: '2', nome: 'II livello', minimo: 1748.39, contingenza: 532.54 },
          { id: '3', nome: 'III livello', minimo: 1494.41, contingenza: 527.90 },
          { id: '4', nome: 'IV livello', minimo: 1292.46, contingenza: 524.22 },
          { id: '5', nome: 'V livello', minimo: 1167.69, contingenza: 521.94 },
          { id: '6', nome: 'VI livello', minimo: 1048.33, contingenza: 519.76 },
          { id: '7', nome: 'VII livello', minimo: 902.69, contingenza: 517.51 }
        ]
      },
      metalmeccanico: {
        nome: 'Metalmeccanica Industria (Federmeccanica-Assistal)',
        decorrenza: '2026-06-01', mensilita: 13, ore: 40,
        livelli: [
          { id: 'd1', nome: 'D1 (ex 2ª cat.)', minimo: 1784.94 },
          { id: 'd2', nome: 'D2 (ex 3ª cat.)', minimo: 1979.37 },
          { id: 'c1', nome: 'C1 (ex 3ª super)', minimo: 2022.12 },
          { id: 'c2', nome: 'C2 (ex 4ª cat.)', minimo: 2064.88 },
          { id: 'c3', nome: 'C3 (ex 5ª cat.)', minimo: 2211.43 },
          { id: 'b1', nome: 'B1 (ex 5ª super)', minimo: 2370.33 },
          { id: 'b2', nome: 'B2 (ex 6ª cat.)', minimo: 2542.98 },
          { id: 'b3', nome: 'B3 (ex 7ª cat.)', minimo: 2838.99 },
          { id: 'a1', nome: 'A1 (ex 8ª Quadri)', minimo: 2907.01 }
        ]
      }
    }
  };

  function r2(x) { return Math.round(x * 100) / 100; }

  function irpefLorda(imponibile) {
    var tax = 0, prev = 0;
    for (var i = 0; i < P.irpef.length; i++) {
      var s = P.irpef[i];
      if (imponibile > prev) tax += (Math.min(imponibile, s.fino) - prev) * s.aliquota;
      prev = s.fino;
    }
    return tax;
  }

  function aliquotaMarginale(imponibile) {
    for (var i = 0; i < P.irpef.length; i++) if (imponibile <= P.irpef[i].fino) return P.irpef[i].aliquota;
    return P.irpef[P.irpef.length - 1].aliquota;
  }

  function detrazioneLavoro(r) {
    var d = P.detrazioneLavoro, det = 0;
    if (r <= 0) return 0;
    if (r <= d.fascia1.fino) det = d.fascia1.importo;
    else if (r <= d.fascia2.fino) det = d.fascia2.base + d.fascia2.variabile * (d.fascia2.fino - r) / d.fascia2.divisore;
    else if (r <= d.fascia3.fino) det = d.fascia3.base * (d.fascia3.fino - r) / d.fascia3.divisore;
    if (r > d.maggiorazione.da && r <= d.maggiorazione.fino) det += d.maggiorazione.importo;
    return det;
  }

  function detrazionePensione(r) {
    var d = P.detrazionePensione, det = 0;
    if (r <= 0) return 0;
    if (r <= d.fascia1.fino) det = d.fascia1.importo;
    else if (r <= d.fascia2.fino) det = d.fascia2.base + d.fascia2.variabile * (d.fascia2.fino - r) / d.fascia2.divisore;
    else if (r <= d.fascia3.fino) det = d.fascia3.base * (d.fascia3.fino - r) / d.fascia3.divisore;
    if (r > d.maggiorazione.da && r <= d.maggiorazione.fino) det += d.maggiorazione.importo;
    return det;
  }

  function sommaEsenteCuneo(redditoLavoro, redditoComplessivo) {
    if (redditoComplessivo > 20000 || redditoLavoro <= 0) return 0;
    var s = P.cuneo.sommaEsente, pct = s[s.length - 1].pct;
    for (var i = 0; i < s.length; i++) if (redditoLavoro <= s[i].fino) { pct = s[i].pct; break; }
    return redditoLavoro * pct;
  }

  function ulterioreDetrazioneCuneo(rc) {
    var u = P.cuneo.ulterioreDetrazione;
    if (rc <= u.da || rc > u.fino) return 0;
    if (rc <= u.pieno) return u.importo;
    return u.importo * (u.fino - rc) / (u.fino - u.pieno);
  }

  function addizionaleRegionale(imponibile, regioneId) {
    var reg = P.regioni[regioneId] || P.regioni['lombardia'];
    if (imponibile <= 0) return 0;
    if (reg.esenteFino && imponibile <= reg.esenteFino) return 0;
    var tax = 0;
    if (reg.ridotta && imponibile <= reg.ridotta.finoReddito) {
      tax = imponibile * reg.ridotta.aliquota / 100;
    } else {
      var prev = 0;
      for (var i = 0; i < reg.scaglioni.length; i++) {
        var lim = reg.scaglioni[i][0], al = reg.scaglioni[i][1];
        if (imponibile > prev) tax += (Math.min(imponibile, lim) - prev) * al / 100;
        prev = lim;
      }
    }
    if (reg.detrazione) {
      var d = reg.detrazione;
      var ok = imponibile <= d.finoReddito && (d.daReddito === undefined || imponibile > d.daReddito);
      if (ok) tax -= d.importo;
    }
    return Math.max(0, tax);
  }

  function addizionaleComunale(imponibile, aliquotaPct, sogliaEsenzione) {
    if (imponibile <= 0) return 0;
    if (sogliaEsenzione && imponibile <= sogliaEsenzione) return 0;
    return imponibile * (aliquotaPct || 0) / 100;
  }

  function contributiInps(lordo, tipo) {
    var c = P.inps, rate = c[tipo] || c.standard;
    var base = Math.min(lordo, c.massimale);
    var extra = Math.max(0, base - c.sogliaAggiuntiva) * c.aliquotaAggiuntiva;
    return base * rate + extra;
  }

  /**
   * Calcolo completo da RAL (retribuzione annua lorda) a netto, lavoratore dipendente.
   * opt: { ral, mensilita, regione, comunale, sogliaComunale, inps, altriRedditi }
   */
  function calcolaNetto(opt) {
    var ral = Math.max(0, +opt.ral || 0);
    var mens = +opt.mensilita || 13;
    var regione = opt.regione || 'lombardia';
    var comunale = opt.comunale === undefined || opt.comunale === '' ? P.addizionaleComunaleDefault : +opt.comunale;
    var inpsTipo = opt.inps || 'standard';

    var inps = contributiInps(ral, inpsTipo);
    var redditoLavoro = ral - inps;              // imponibile fiscale
    var rc = redditoLavoro + (+opt.altriRedditi || 0); // reddito complessivo
    var lorda = irpefLorda(rc);
    var detLav = detrazioneLavoro(rc);
    var ulteriore = ulterioreDetrazioneCuneo(rc);
    var detUsata = Math.min(lorda, detLav);
    var ultUsata = Math.min(lorda - detUsata, ulteriore);
    var irpefNetta = Math.max(0, lorda - detUsata - ultUsata);

    // Trattamento integrativo (ex bonus 100 euro)
    var ti = 0, t = P.trattamentoIntegrativo;
    if (rc > 0 && rc <= t.fino) {
      if (lorda > detLav - t.franchigia) ti = t.importo;
    } else if (rc > t.fino && rc <= t.finoEsteso) {
      if (detLav > lorda) ti = Math.min(t.importo, detLav - lorda);
    }

    var cuneoBonus = sommaEsenteCuneo(redditoLavoro, rc);
    var dovutaIrpef = irpefNetta > 0;
    var addReg = dovutaIrpef ? addizionaleRegionale(rc, regione) : 0;
    var addCom = dovutaIrpef ? addizionaleComunale(rc, comunale, +opt.sogliaComunale || 0) : 0;

    var netto = ral - inps - irpefNetta - addReg - addCom + ti + cuneoBonus;
    var trattenute = inps + irpefNetta + addReg + addCom;
    return {
      ral: r2(ral), mensilita: mens, regione: regione, regioneNome: (P.regioni[regione] || {}).nome,
      inps: r2(inps), imponibile: r2(redditoLavoro), irpefLorda: r2(lorda),
      detrazioneLavoro: r2(detUsata), ulterioreDetrazione: r2(ultUsata), irpefNetta: r2(irpefNetta),
      addizionaleRegionale: r2(addReg), addizionaleComunale: r2(addCom),
      trattamentoIntegrativo: r2(ti), bonusCuneo: r2(cuneoBonus),
      nettoAnnuo: r2(netto), nettoMensile: r2(netto / mens),
      trattenute: r2(trattenute),
      aliquotaMedia: ral > 0 ? r2(trattenute / ral * 100) : 0,
      aliquotaMarginale: aliquotaMarginale(rc) * 100,
      lordoMensile: r2(ral / mens)
    };
  }

  /** Da netto mensile (o annuo) alla RAL necessaria — ricerca per bisezione */
  function calcolaRalDaNetto(opt) {
    var target = +opt.nettoAnnuo || (+opt.nettoMensile * (+opt.mensilita || 13));
    var lo = 0, hi = 1000000;
    for (var i = 0; i < 80; i++) {
      var mid = (lo + hi) / 2;
      var n = calcolaNetto(Object.assign({}, opt, { ral: mid })).nettoAnnuo;
      if (n < target) lo = mid; else hi = mid;
    }
    return calcolaNetto(Object.assign({}, opt, { ral: Math.round(hi) }));
  }

  /** Tredicesima / quattordicesima: lordo pro-rata e netto stimato (tassazione all'aliquota marginale) */
  function calcolaMensilitaAggiuntiva(opt) {
    var mensile = +opt.lordoMensile || 0;
    var mesi = Math.min(12, Math.max(0, +opt.mesi || 12));
    var lordo = mensile * mesi / 12;
    var ral = +opt.ral || mensile * (+opt.mensilita || 13);
    var inpsRate = (P.inps[opt.inps] || P.inps.standard);
    var inps = lordo * inpsRate;
    var marg = aliquotaMarginale(ral - contributiInps(ral, opt.inps || 'standard'));
    var irpef = (lordo - inps) * marg;
    return { lordo: r2(lordo), inps: r2(inps), irpef: r2(irpef), aliquota: marg * 100, netto: r2(lordo - inps - irpef) };
  }

  /** TFR maturato con rivalutazione e tassazione separata stimata */
  function calcolaTfr(opt) {
    var ral = +opt.ral || 0, anni = Math.max(0, +opt.anni || 0), infl = (opt.inflazione === undefined ? 1.7 : +opt.inflazione) / 100;
    var t = P.tfr, fondo = 0, rival = 0;
    var quotaAnnua = ral / t.divisore - ral * t.contributoFondo;
    var tasso = t.rivalutazioneFissa + t.quotaInflazione * infl;
    var full = Math.floor(anni), frac = anni - full;
    for (var i = 0; i < full; i++) {
      var r = fondo * tasso; rival += r; fondo += r + quotaAnnua;
    }
    if (frac > 0) { var r3 = fondo * tasso * frac; rival += r3; fondo += r3 + quotaAnnua * frac; }
    var capitale = fondo - rival;
    var impostaRival = rival * t.impostaRivalutazione;
    // reddito di riferimento = TFR (al netto delle rivalutazioni) × 12 / anni di servizio
    var redditoRif = anni > 0 ? capitale * 12 / anni : 0;
    var aliqMedia = redditoRif > 0 ? irpefLorda(redditoRif) / redditoRif : 0;
    var imposta = capitale * aliqMedia;
    return {
      quotaAnnua: r2(quotaAnnua), lordo: r2(fondo), rivalutazioni: r2(rival), capitale: r2(capitale),
      impostaRivalutazioni: r2(impostaRival), aliquotaMedia: r2(aliqMedia * 100), imposta: r2(imposta),
      netto: r2(fondo - impostaRival - imposta)
    };
  }

  /** NASpI: importo mensile lordo e andamento con décalage */
  function calcolaNaspi(opt) {
    var R = +opt.retribuzioneMedia || 0, n = P.naspi;
    var base = R <= n.soglia ? R * 0.75 : n.soglia * 0.75 + (R - n.soglia) * 0.25;
    base = Math.min(base, n.massimo);
    var settimane = Math.max(0, +opt.settimane || 0);
    var mesiDurata = Math.round((settimane / 2) / 4.345 * 10) / 10;
    var startDec = opt.over55 ? n.meseDecalageOver55 : n.meseDecalage;
    var piano = [], totale = 0, importo = base;
    for (var m = 1; m <= Math.ceil(mesiDurata) && m <= 24; m++) {
      if (m >= startDec) importo = importo * (1 - n.decalagePct);
      var quota = (m > mesiDurata) ? importo * (mesiDurata - (m - 1)) : importo;
      piano.push({ mese: m, importo: r2(importo) });
      totale += quota;
    }
    return { mensileIniziale: r2(base), durataMesi: mesiDurata, settimanePagate: Math.round(settimane / 2), piano: piano, totaleLordo: r2(totale) };
  }

  /** Pensione netta (13 mensilità) */
  function calcolaPensioneNetta(opt) {
    var mensile = +opt.lordoMensile || 0;
    var annuo = mensile * 13;
    var lorda = irpefLorda(annuo);
    var det = Math.min(lorda, detrazionePensione(annuo));
    var irpef = Math.max(0, lorda - det);
    var reg = irpef > 0 ? addizionaleRegionale(annuo, opt.regione || 'lombardia') : 0;
    var com = irpef > 0 ? addizionaleComunale(annuo, opt.comunale === undefined ? P.addizionaleComunaleDefault : +opt.comunale, 0) : 0;
    var netto = annuo - irpef - reg - com;
    return { lordoAnnuo: r2(annuo), irpefLorda: r2(lorda), detrazione: r2(det), irpef: r2(irpef), addizionaleRegionale: r2(reg), addizionaleComunale: r2(com), nettoAnnuo: r2(netto), nettoMensile: r2(netto / 13) };
  }

  /** IRPEF generica su un reddito imponibile */
  function calcolaIrpef(opt) {
    var r = +opt.reddito || 0, tipo = opt.tipo || 'dipendente';
    var lorda = irpefLorda(r), det = 0, ult = 0;
    if (tipo === 'dipendente') { det = detrazioneLavoro(r); ult = ulterioreDetrazioneCuneo(r); }
    else if (tipo === 'pensione') det = detrazionePensione(r);
    var detU = Math.min(lorda, det), ultU = Math.min(lorda - detU, ult);
    var netta = Math.max(0, lorda - detU - ultU);
    var scaglioni = [], prev = 0;
    P.irpef.forEach(function (s) {
      var q = Math.max(0, Math.min(r, s.fino) - prev);
      scaglioni.push({ da: prev, a: s.fino, aliquota: s.aliquota * 100, imponibile: r2(q), imposta: r2(q * s.aliquota) });
      prev = s.fino;
    });
    return { reddito: r, lorda: r2(lorda), detrazione: r2(detU), ulteriore: r2(ultU), netta: r2(netta), aliquotaMedia: r > 0 ? r2(netta / r * 100) : 0, aliquotaMarginale: aliquotaMarginale(r) * 100, scaglioni: scaglioni };
  }

  /** Partita IVA forfettaria: netto annuo da ricavi */
  function calcolaForfettario(opt) {
    var ricavi = +opt.ricavi || 0, coeff = (+opt.coefficiente || 78) / 100;
    var aliq = opt.startup ? 0.05 : 0.15;
    var reddito = ricavi * coeff;
    var gs = P.gestioneSeparata;
    var inps = Math.min(reddito, gs.massimale) * gs.aliquota;
    var imponibile = Math.max(0, reddito - inps);
    var imposta = imponibile * aliq;
    var netto = ricavi - inps - imposta;
    return { ricavi: r2(ricavi), reddito: r2(reddito), inps: r2(inps), imponibile: r2(imponibile), imposta: r2(imposta), aliquotaImposta: aliq * 100, nettoAnnuo: r2(netto), nettoMensile: r2(netto / 12) };
  }

  /** Busta paga mensile ordinaria (stima) */
  function calcolaBustaPaga(opt) {
    var annuale = calcolaNetto(opt);
    var mens = annuale.mensilita;
    var lordoMese = annuale.ral / mens;
    var f = function (x) { return r2(x / mens); };
    return {
      annuale: annuale,
      voci: [
        { voce: 'Retribuzione lorda mensile', importo: r2(lordoMese), segno: '+' },
        { voce: 'Contributi INPS a carico del dipendente', importo: f(annuale.inps), segno: '-' },
        { voce: 'Imponibile fiscale', importo: f(annuale.imponibile), segno: '=' },
        { voce: 'IRPEF lorda', importo: f(annuale.irpefLorda), segno: '-' },
        { voce: 'Detrazione lavoro dipendente', importo: f(annuale.detrazioneLavoro), segno: '+' },
        { voce: 'Ulteriore detrazione (cuneo fiscale)', importo: f(annuale.ulterioreDetrazione), segno: '+' },
        { voce: 'Addizionale regionale', importo: f(annuale.addizionaleRegionale), segno: '-' },
        { voce: 'Addizionale comunale', importo: f(annuale.addizionaleComunale), segno: '-' },
        { voce: 'Trattamento integrativo', importo: f(annuale.trattamentoIntegrativo), segno: '+' },
        { voce: 'Somma esente cuneo fiscale', importo: f(annuale.bonusCuneo), segno: '+' },
        { voce: 'Netto in busta', importo: annuale.nettoMensile, segno: '=' }
      ]
    };
  }

  var api = {
    P: P, r2: r2, irpefLorda: irpefLorda, aliquotaMarginale: aliquotaMarginale,
    detrazioneLavoro: detrazioneLavoro, detrazionePensione: detrazionePensione,
    sommaEsenteCuneo: sommaEsenteCuneo, ulterioreDetrazioneCuneo: ulterioreDetrazioneCuneo,
    addizionaleRegionale: addizionaleRegionale, addizionaleComunale: addizionaleComunale,
    contributiInps: contributiInps, calcolaNetto: calcolaNetto, calcolaRalDaNetto: calcolaRalDaNetto,
    calcolaMensilitaAggiuntiva: calcolaMensilitaAggiuntiva, calcolaTfr: calcolaTfr, calcolaNaspi: calcolaNaspi,
    calcolaPensioneNetta: calcolaPensioneNetta, calcolaIrpef: calcolaIrpef, calcolaForfettario: calcolaForfettario,
    calcolaBustaPaga: calcolaBustaPaga
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.CR = api;
})(typeof window !== 'undefined' ? window : this);
