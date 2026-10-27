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
