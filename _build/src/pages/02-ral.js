'use strict';
const { CR, eur, fmt, pct, SRC, netto, table, ralTable, regionTable } = require('../lib/h.js');

const RAL_PAGES = [25000, 28000, 30000, 35000, 40000, 45000, 50000, 60000, 70000, 80000];
const ALL = [20000, 21000, 22000, 23000, 24000, 25000, 26000, 27000, 28000, 29000, 30000, 31000, 32000, 33000, 34000, 35000, 36000, 37000, 38000, 39000, 40000, 42000, 44000, 45000, 46000, 48000, 50000, 52000, 55000, 58000, 60000, 65000, 70000, 75000, 80000, 85000, 90000, 95000, 100000];

const PROFILI = {
  25000: { chi: 'impiegati junior, commessi e operai qualificati al primo impiego', ccnl: 'il IV livello del commercio (1.787 € lordi × 14 mensilità) o il livello D2 metalmeccanico (1.979 € × 13)' },
  28000: { chi: 'impiegati con qualche anno di esperienza e operai specializzati', ccnl: 'il III livello del commercio (1.988 € lordi × 14) o il C2 metalmeccanico' },
  30000: { chi: 'impiegati di concetto, tecnici e neolaureati STEM dopo i primi anni', ccnl: 'il II-III livello commercio o il C3 metalmeccanico' },
  35000: { chi: 'impiegati esperti, programmatori junior-mid, infermieri con anzianità', ccnl: 'il II livello commercio (2.240 € × 14) o il B1 metalmeccanico' },
  40000: { chi: 'professionisti con 5-8 anni di esperienza, quadri junior, project manager', ccnl: 'il I livello commercio (2.510 € × 14) o il B2 metalmeccanico' },
  45000: { chi: 'quadri, ingegneri senior, specialisti IT e finance', ccnl: 'il livello Quadro commercio (2.990 € × 14) o il B3 metalmeccanico' },
  50000: { chi: 'quadri con responsabilità di team, sviluppatori senior, consulenti', ccnl: 'il livello Quadro con superminimo o l\'A1 metalmeccanico' },
  60000: { chi: 'manager intermedi, quadri apicali, specialisti molto richiesti', ccnl: 'quadri con superminimi importanti; sotto la soglia dirigenziale' },
  70000: { chi: 'manager, quadri direttivi, medici ospedalieri con anzianità', ccnl: 'quadri apicali o primi livelli dirigenziali di piccole aziende' },
  80000: { chi: 'dirigenti junior e senior manager', ccnl: 'il CCNL Dirigenti industria o commercio: il minimo dirigenti industria è di circa 75.000 €' }
};

function ralPage(ral) {
  const n13 = netto(ral), n14 = netto(ral, { mensilita: 14 }), n12 = netto(ral, { mensilita: 12 });
  const i = ALL.indexOf(ral);
  const prevP = RAL_PAGES[RAL_PAGES.indexOf(ral) - 1], nextP = RAL_PAGES[RAL_PAGES.indexOf(ral) + 1];
  const near = ALL.slice(Math.max(0, i - 4), i + 5);
  const k = fmt(ral / 1000, 0);
  const pt = [50, 60, 75, 80].map(p => { const n = netto(ral * p / 100, { mensilita: 14 }); return [p + '%', fmt(40 * p / 100, 0) + ' ore', eur(ral * p / 100, 0), eur(n.nettoMensile, 0), eur(n.nettoAnnuo, 0)]; });
  const regs = Object.keys(CR.P.regioni).map(r => [r, netto(ral, { regione: r })]).sort((a, b) => b[1].nettoAnnuo - a[1].nettoAnnuo);
  const prof = PROFILI[ral];
  return {
    path: `/ral/${ral}/`, priority: '0.8', changefreq: 'monthly',
    title: `RAL ${k}.000 €: Stipendio Netto Mensile 2026 (13 e 14 Mensilità)`,
    description: `RAL ${k}.000 euro quanto è netto? Nel 2026 sono ${eur(n13.nettoMensile, 0)} al mese su 13 mensilità e ${eur(n14.nettoMensile, 0)} su 14. Calcolo completo con IRPEF, INPS, addizionali e confronto tra regioni.`,
    h1: `RAL ${k}.000 €: quanto è lo stipendio netto nel 2026`, short: `RAL ${k}.000 € netto`,
    appName: `Calcolo netto RAL ${k}.000 €`, ogTitle: `RAL ${k}.000 € = ${eur(n13.nettoMensile, 0)} netti al mese (2026)`,
    lead: `Il calcolo aggiornato alle aliquote 2026 per una retribuzione annua lorda di ${eur(ral, 0)}: netto mensile, trattenute voce per voce, differenze tra regioni e tra 13 e 14 mensilità.`,
    tool: { type: 'netto', defaults: { ral, mensilita: 13 } },
    answer: `Con una <strong>RAL di ${k}.000 €</strong> lo stipendio netto 2026 è di <strong>${eur(n13.nettoMensile, 0)} al mese su 13 mensilità</strong> (${eur(n14.nettoMensile, 0)} su 14, ${eur(n12.nettoMensile, 0)} su 12), cioè <strong>${eur(n13.nettoAnnuo, 0)} netti all'anno</strong>. Le trattenute totali sono ${eur(n13.trattenute, 0)}, il ${pct(n13.aliquotaMedia)} del lordo (Lombardia, addizionale comunale 0,8%).`,
    crumbs: [['Tabelle RAL', '/ral/'], [`RAL ${k}.000 €`, `/ral/${ral}/`]],
    section: 'Tabelle RAL', about: ['Retribuzione annua lorda', 'Stipendio netto'],
    related: [prevP ? `/ral/${prevP}/` : '/ral/', nextP ? `/ral/${nextP}/` : '/ral/', '/calcolo-ral-da-netto/', '/part-time/', '/irpef/addizionale-regionale-2026/'].filter(Boolean),
    faq: [
      [`RAL ${k}.000 € quanto è al mese netto?`, `${eur(n13.nettoMensile, 0)} netti al mese con 13 mensilità, ${eur(n14.nettoMensile, 0)} con 14 e ${eur(n12.nettoMensile, 0)} con 12. Il netto annuo è sempre ${eur(n13.nettoAnnuo, 0)}.`],
      [`RAL ${k}.000 € è un buono stipendio?`, `${ral < 30000 ? 'È sotto' : ral < 36000 ? 'È in linea con' : 'È sopra'} la retribuzione media dei dipendenti privati italiani (circa 33.000 € lordi secondo i dati INPS sulle posizioni a tempo pieno). Tipicamente la ricevono ${prof.chi}.`],
      [`Quanto IRPEF si paga con ${k}.000 € di RAL?`, `${eur(n13.irpefNetta, 0)} l'anno di IRPEF netta (${eur(n13.irpefLorda, 0)} lorda meno ${eur(n13.detrazioneLavoro + n13.ulterioreDetrazione, 0)} di detrazioni), più ${eur(n13.addizionaleRegionale + n13.addizionaleComunale, 0)} di addizionali. L'aliquota marginale è del ${pct(n13.aliquotaMarginale)}.`],
      [`Quanto è il lordo mensile con RAL ${k}.000 €?`, `${eur(ral / 13, 0)} lordi al mese su 13 mensilità, ${eur(ral / 14, 0)} su 14 e ${eur(ral / 12, 0)} su 12.`],
      [`A quale livello contrattuale corrisponde una RAL di ${k}.000 €?`, `Indicativamente a ${prof.ccnl}. Il livello esatto dipende dal CCNL applicato e dagli elementi aggiuntivi (superminimo, scatti, premi).`],
      [`In quale regione la RAL di ${k}.000 € rende di più?`, `In ${CR.P.regioni[regs[0][0]].nome}, con ${eur(regs[0][1].nettoAnnuo, 0)} netti l'anno; la meno conveniente è ${CR.P.regioni[regs[regs.length - 1][0]].nome} con ${eur(regs[regs.length - 1][1].nettoAnnuo, 0)}. La differenza è di ${eur(regs[0][1].nettoAnnuo - regs[regs.length - 1][1].nettoAnnuo, 0)} l'anno.`]
    ],
    sources: [SRC.bilancio2026, SRC.l207, SRC.tuir13, SRC.inps6, SRC.mef],
    body: () => `
<h2>Da ${k}.000 € lordi al netto: il calcolo passo per passo</h2>
${table(['Voce', 'Annuo', 'Mensile (÷13)'], [
  ['Retribuzione annua lorda', eur(ral), eur(ral / 13)],
  ['Contributi INPS (9,19%' + (ral > CR.P.inps.sogliaAggiuntiva ? ' + 1% oltre 56.224 €' : '') + ')', '− ' + eur(n13.inps), '− ' + eur(n13.inps / 13)],
  ['Reddito imponibile IRPEF', eur(n13.imponibile), eur(n13.imponibile / 13)],
  ['IRPEF lorda (scaglioni 2026)', eur(n13.irpefLorda), eur(n13.irpefLorda / 13)],
  ['Detrazione lavoro dipendente', '− ' + eur(n13.detrazioneLavoro), '− ' + eur(n13.detrazioneLavoro / 13)],
  ['Ulteriore detrazione cuneo fiscale', '− ' + eur(n13.ulterioreDetrazione), '− ' + eur(n13.ulterioreDetrazione / 13)],
  ['IRPEF netta', '− ' + eur(n13.irpefNetta), '− ' + eur(n13.irpefNetta / 13)],
  ['Addizionale regionale (Lombardia)', '− ' + eur(n13.addizionaleRegionale), '− ' + eur(n13.addizionaleRegionale / 13)],
  ['Addizionale comunale (0,8%)', '− ' + eur(n13.addizionaleComunale), '− ' + eur(n13.addizionaleComunale / 13)]
].concat(n13.bonusCuneo ? [['Somma esente cuneo fiscale', '+ ' + eur(n13.bonusCuneo), '+ ' + eur(n13.bonusCuneo / 13)]] : [])
 .concat(n13.trattamentoIntegrativo ? [['Trattamento integrativo', '+ ' + eur(n13.trattamentoIntegrativo), '+ ' + eur(n13.trattamentoIntegrativo / 13)]] : [])
 .concat([['<strong>Stipendio netto</strong>', '<strong>' + eur(n13.nettoAnnuo) + '</strong>', '<strong>' + eur(n13.nettoMensile) + '</strong>']]), { num: [1, 2] })}
<p>L'imponibile di ${eur(n13.imponibile, 0)} ${n13.imponibile <= 28000 ? 'rientra interamente nel primo scaglione al 23%.' : n13.imponibile <= 50000 ? 'è tassato al 23% fino a 28.000 € e al 33% per i restanti ' + eur(n13.imponibile - 28000, 0) + ': l\'aliquota del 33% (era 35% nel 2025) è la novità 2026 che fa risparmiare ' + eur(Math.min(n13.imponibile - 28000, 22000) * 0.02, 0) + ' l\'anno.' : 'supera i 50.000 €: la parte eccedente è tassata al 43%, mentre i 22.000 € tra 28.000 e 50.000 € beneficiano della nuova aliquota del 33%.'} ${n13.ulterioreDetrazione > 0 ? 'Rientrando nella fascia 20.000-40.000 € spetta l\'ulteriore detrazione del cuneo fiscale' + (n13.imponibile > 32000 ? ', in misura ridotta' : ' per intero (1.000 €)') + '.' : ''}</p>

<h2>Netto mensile con 12, 13 o 14 mensilità</h2>
${table(['Mensilità', 'Lordo mensile', 'Netto mensile', 'Netto annuo'], [[12, n12], [13, n13], [14, n14]].map(([m, n]) => [m, eur(ral / m, 0), '<strong>' + eur(n.nettoMensile, 0) + '</strong>', eur(n.nettoAnnuo, 0)]), { num: [1, 2, 3] })}
<p>Il netto annuo non cambia: con 14 mensilità il singolo stipendio è più basso, ma ricevi la quattordicesima a luglio. Tredicesima e quattordicesima sono però tassate senza detrazioni: calcolale con precisione con il <a href="/calcolo-tredicesima/">calcolo tredicesima</a>.</p>

<h2>RAL ${k}.000 € nelle 21 regioni e province autonome</h2>
<p>L'addizionale regionale va dall'1,23% (Veneto, Sicilia, Sardegna, Basilicata, Valle d'Aosta) al 3,63% del Molise. Ecco il netto in ogni regione.</p>
${regionTable(ral)}

<h2>RAL ${k}.000 € part-time</h2>
<p>Con un part-time il lordo si riduce in proporzione all'orario, ma il netto in percentuale è più alto grazie alla progressività dell'IRPEF e al cuneo fiscale.</p>
${table(['Part-time', 'Ore settimanali', 'RAL', 'Netto mensile (14)', 'Netto annuo'], pt, { num: [2, 3, 4] })}
<p>Usa il <a href="/part-time/">calcolatore part-time</a> per qualsiasi percentuale di orario.</p>

<h2>RAL vicine: confronto</h2>
${ralTable(near, { links: RAL_PAGES, hl: ral })}
<div class="ral-nav">${prevP ? `<a class="btn" href="/ral/${prevP}/">← RAL ${fmt(prevP, 0)} €</a>` : ''}<a class="btn" href="/ral/">Tutte le RAL</a>${nextP ? `<a class="btn" href="/ral/${nextP}/">RAL ${fmt(nextP, 0)} € →</a>` : ''}</div>

<h2>Chi guadagna ${k}.000 € lordi</h2>
<p>Una RAL di ${eur(ral, 0)} è tipica di ${prof.chi}. Nei contratti collettivi corrisponde indicativamente a ${prof.ccnl}. Consulta il <a href="/ccnl/commercio/">netto per livello del CCNL Commercio</a> e del <a href="/ccnl/metalmeccanico/">CCNL Metalmeccanico</a>.</p>
<div class="callout">Vuoi negoziare un aumento? Per ottenere ${eur(Math.round((n13.nettoMensile + 100) / 10) * 10, 0)} netti al mese (100 € in più) servono circa ${eur(CR.calcolaRalDaNetto({ nettoMensile: Math.round((n13.nettoMensile + 100) / 10) * 10, mensilita: 13, regione: 'lombardia' }).ral, 0)} di RAL. Calcola la tua cifra con il <a href="/calcolo-ral-da-netto/">calcolo RAL da netto</a>.</div>
`
  };
}

const HUB_RALS = [20000, 22000, 24000, 25000, 26000, 28000, 30000, 32000, 34000, 35000, 36000, 38000, 40000, 42000, 45000, 48000, 50000, 55000, 60000, 65000, 70000, 75000, 80000, 90000, 100000];

module.exports = [
/* ============================== HUB /ral/ ============================== */
{
  path: '/ral/', priority: '0.9', changefreq: 'monthly',
  title: 'RAL: Cos\'è, Come si Calcola e Tabella RAL Netto 2026',
  description: 'RAL significato e calcolo: cos\'è la retribuzione annua lorda, cosa comprende, come si passa da RAL a netto mensile. Tabella RAL netto 2026 da 20.000 a 100.000 €.',
  h1: 'RAL: cos\'è, come si calcola e tabella RAL netto 2026', short: 'Cos\'è la RAL (tabella)',
  lead: 'Tutto sulla retribuzione annua lorda: cosa include, come si legge nel contratto, come si calcola dal lordo mensile e quanto resta netto per ogni fascia.',
  tool: { type: 'netto', defaults: { ral: 35000, mensilita: 14 } }, appName: 'Calcolo RAL netto',
  answer: 'La <strong>RAL (Retribuzione Annua Lorda)</strong> è la somma di tutte le mensilità lorde che il datore di lavoro ti corrisponde in un anno — stipendio base, contingenza, scatti, superminimo, tredicesima e quattordicesima — prima di contributi INPS e tasse. Non comprende TFR, straordinari non fissi, buoni pasto e rimborsi spese.',
  section: 'Guide', about: ['Retribuzione annua lorda', 'RAL'],
  howto: { name: 'Come calcolare la RAL dalla busta paga', steps: [
    ['Trova il lordo mensile', 'Nella busta paga prendi la "retribuzione lorda" (o "totale competenze" al netto di voci variabili come straordinari e rimborsi).'],
    ['Moltiplica per le mensilità', 'Moltiplica per 13 o 14 in base al CCNL. Se hai il cedolino di dicembre, puoi leggere direttamente l\'imponibile annuo.'],
    ['Aggiungi i premi fissi', 'Somma eventuali premi o bonus garantiti dal contratto. Escludi il TFR e i benefit non monetari.']
  ] },
  dataset: { name: 'Tabella RAL netto 2026', description: 'Stipendio netto annuo e mensile per RAL da 20.000 a 100.000 euro con parametri fiscali 2026 (Lombardia).', keywords: ['RAL', 'stipendio netto', 'IRPEF 2026'], distribution: [{ '@type': 'DataDownload', encodingFormat: 'application/json', contentUrl: 'https://www.calcoloral.com/dati/parametri-2026.json' }] },
  related: ['/calcolo-ral-da-netto/', '/', '/lordo-netto/', '/ccnl/commercio/', '/ccnl/metalmeccanico/'],
  faq: [
    ['Cosa significa RAL?', 'RAL è l\'acronimo di Retribuzione Annua Lorda: lo stipendio complessivo di un anno prima delle trattenute fiscali e previdenziali. È la cifra usata nei contratti e nelle offerte di lavoro.'],
    ['La RAL include la tredicesima?', 'Sì, la RAL include tredicesima e quattordicesima. Per sapere il lordo mensile dividi la RAL per 13 o 14.'],
    ['La RAL include il TFR?', 'No. Il TFR (circa il 7% della retribuzione) è accantonato dal datore di lavoro e non fa parte della RAL. Non ne fanno parte nemmeno buoni pasto, auto aziendale e rimborsi spese.'],
    ['Come si calcola la RAL dal netto?', 'Serve un calcolo inverso che tenga conto di scaglioni IRPEF, detrazioni e addizionali. Usa il nostro <a href="/calcolo-ral-da-netto/">calcolatore RAL da netto</a>: ad esempio per 1.800 € netti al mese su 13 mensilità servono circa 30.000 € di RAL.'],
    ['RAL e RAL lorda sono la stessa cosa?', 'Sì: "RAL lorda" è una ridondanza, la RAL è per definizione lorda. La "RAL netta" non esiste: si parla di netto annuo.'],
    ['Qual è la RAL media in Italia?', 'Secondo l\'Osservatorio INPS sui lavoratori dipendenti privati, la retribuzione media annua dei rapporti a tempo pieno si aggira intorno ai 33.000 € lordi, con forti differenze tra Nord e Sud, tra uomini e donne e tra settori.'],
    ['Qual è la differenza tra RAL e RGA?', 'La RGA (Retribuzione Globale Annua) comprende anche la parte variabile: bonus, premi di risultato, straordinari. La RAL considera solo la parte fissa.']
  ],
  sources: [SRC.tuir13, SRC.inps6, SRC.cnel],
  body: () => `
<h2>Cosa comprende la RAL</h2>
${table(['Compreso nella RAL', 'Non compreso'], [
  ['Paga base (minimo tabellare)', 'TFR (trattamento di fine rapporto)'],
  ['Indennità di contingenza ed EDR', 'Straordinari e maggiorazioni variabili'],
  ['Scatti di anzianità', 'Buoni pasto, auto aziendale, welfare'],
  ['Superminimo individuale', 'Rimborsi spese e trasferte'],
  ['Tredicesima e quattordicesima', 'Bonus non garantiti e premi di risultato'],
  ['Indennità di funzione (quadri)', 'Contributi INPS a carico dell\'azienda']
])}
<h2>RAL, lordo mensile e costo azienda</h2>
<p>Un errore comune è confondere la RAL con il <strong>costo aziendale</strong>: per l'azienda un dipendente costa circa il 30-32% in più della RAL per contributi INPS e INAIL a suo carico, più la quota TFR. Una RAL di 30.000 € costa all'azienda circa 40.000 €, mentre il dipendente ne riceve ${eur(netto(30000).nettoAnnuo, 0)} netti.</p>
<div class="formula">Costo azienda ≈ RAL × 1,30 + TFR (RAL ÷ 13,5)
Lordo mensile = RAL ÷ mensilità (13 o 14)
Netto annuo ≈ RAL − INPS − IRPEF − addizionali</div>
<h2>Tabella RAL netto 2026</h2>
<p>Netto annuo e mensile per le RAL più comuni. Le righe con il link aprono la pagina di dettaglio con il calcolo completo, il confronto regionale e il part-time.</p>
${ralTable(HUB_RALS, { links: RAL_PAGES })}
<div class="cards">${RAL_PAGES.map(r => `<a class="card" href="/ral/${r}/"><span class="num">${eur(r, 0)}</span><b>${eur(netto(r).nettoMensile, 0)} netti/mese</b><span>13 mensilità · ${eur(netto(r).nettoAnnuo, 0)} l'anno</span></a>`).join('')}</div>
<h2>Come leggere la RAL in un'offerta di lavoro</h2>
<ul>
<li><strong>"RAL 30k"</strong> = 30.000 € lordi l'anno, tredicesima inclusa. Chiedi sempre su quante mensilità.</li>
<li><strong>"RAL + bonus"</strong>: il bonus non è garantito. Valuta l'offerta sulla RAL fissa.</li>
<li><strong>"Pacchetto retributivo"</strong>: può includere welfare, buoni pasto, auto: utili, ma non sono RAL e non fanno TFR né pensione.</li>
<li><strong>"Lordo mensile"</strong>: moltiplica per 13 o 14 per ottenere la RAL e confrontare offerte diverse.</li>
</ul>
<p>Per trattare la cifra giusta parti dal netto che ti serve: il <a href="/calcolo-ral-da-netto/">calcolo RAL da netto</a> ti dice quanto chiedere.</p>
`
},

/* ============================== RAL DA NETTO ============================== */
{
  path: '/calcolo-ral-da-netto/', priority: '0.9', changefreq: 'monthly',
  title: 'Calcolo RAL da Stipendio Netto 2026: Quanto Chiedere',
  description: 'Calcola la RAL partendo dal netto mensile che vuoi: il calcolatore inverso 2026 ti dice quanto lordo chiedere al colloquio per 1.500, 1.800, 2.000 o 2.500 € netti.',
  h1: 'Calcolo RAL da stipendio netto', short: 'Calcolo RAL da netto',
  appName: 'Calcolatore RAL da netto (calcolo inverso)',
  lead: 'Il calcolo inverso: inserisci il netto mensile che vuoi in busta e scopri la retribuzione annua lorda da chiedere, con i parametri fiscali 2026 e le addizionali della tua regione.',
  tool: { type: 'ralDaNetto', defaults: { netto: 1800, mensilita: 13 } },
  answer: (() => { const r = x => eur(CR.calcolaRalDaNetto({ nettoMensile: x, mensilita: 13, regione: 'lombardia' }).ral, 0); return `Per avere <strong>1.500 € netti</strong> al mese su 13 mensilità servono circa <strong>${r(1500)} di RAL</strong>; per <strong>1.800 €</strong> circa ${r(1800)}; per <strong>2.000 €</strong> circa ${r(2000)}; per <strong>2.500 €</strong> circa ${r(2500)}; per <strong>3.000 €</strong> circa ${r(3000)} (Lombardia, 2026).`; })(),
  section: 'Calcolatori', about: ['RAL', 'Stipendio netto', 'Colloquio di lavoro'],
  howto: { name: 'Come calcolare la RAL da chiedere partendo dal netto', steps: [
    ['Decidi il netto mensile', 'Parti dal netto di cui hai bisogno ogni mese, al netto di bonus e straordinari.'],
    ['Scegli le mensilità', 'Verifica se il CCNL dell\'azienda prevede 13 o 14 mensilità: a parità di netto mensile la RAL cambia.'],
    ['Indica regione e comune', 'Le addizionali cambiano il risultato di alcune centinaia di euro l\'anno.'],
    ['Arrotonda verso l\'alto', 'Chiedi una RAL leggermente superiore: nei colloqui si tratta su cifre tonde.']
  ] },
  related: ['/', '/ral/', '/lordo-netto/', '/ral/30000/', '/ral/40000/'],
  faq: [
    ['1.800 euro netti quanto sono lordi?', `Circa ${eur(CR.calcolaRalDaNetto({ nettoMensile: 1800, mensilita: 13, regione: 'lombardia' }).ral, 0)} di RAL su 13 mensilità (${eur(CR.calcolaRalDaNetto({ nettoMensile: 1800, mensilita: 14, regione: 'lombardia' }).ral, 0)} su 14), cioè ${eur(CR.calcolaRalDaNetto({ nettoMensile: 1800, mensilita: 13, regione: 'lombardia' }).ral / 13, 0)} lordi al mese.`],
    ['2.000 euro netti al mese quanto sono di RAL?', `Circa ${eur(CR.calcolaRalDaNetto({ nettoMensile: 2000, mensilita: 13, regione: 'lombardia' }).ral, 0)} su 13 mensilità e ${eur(CR.calcolaRalDaNetto({ nettoMensile: 2000, mensilita: 14, regione: 'lombardia' }).ral, 0)} su 14.`],
    ['1.500 euro netti quanto sono di RAL?', `Circa ${eur(CR.calcolaRalDaNetto({ nettoMensile: 1500, mensilita: 13, regione: 'lombardia' }).ral, 0)} su 13 mensilità. In questa fascia il netto è sostenuto dal cuneo fiscale, quindi la RAL necessaria è relativamente bassa.`],
    ['Perché per 500 € netti in più servono quasi 1.000 € lordi?', 'Per effetto della progressività: su un reddito tra 28.000 e 50.000 € ogni euro lordo in più paga il 9,19% di INPS, il 33% di IRPEF, le addizionali e la perdita progressiva delle detrazioni. Resta in tasca circa il 50-55%.'],
    ['Come si calcola la RAL dal netto in busta paga?', 'Il calcolo diretto non ha una formula chiusa, perché IRPEF e detrazioni dipendono dal reddito stesso. Il nostro calcolatore prova migliaia di RAL finché il netto corrisponde a quello richiesto.'],
    ['Il risultato vale anche per gli apprendisti?', 'Seleziona "Apprendista" nelle opzioni avanzate: i contributi INPS scendono al 5,84% e a parità di netto serve una RAL più bassa.']
  ],
  sources: [SRC.bilancio2026, SRC.l207, SRC.tuir13, SRC.mef],
  body: () => {
    const rows = [1200, 1300, 1400, 1500, 1600, 1700, 1800, 1900, 2000, 2200, 2500, 2800, 3000, 3500, 4000, 5000].map(n => {
      const a = CR.calcolaRalDaNetto({ nettoMensile: n, mensilita: 13, regione: 'lombardia' }), b = CR.calcolaRalDaNetto({ nettoMensile: n, mensilita: 14, regione: 'lombardia' });
      return [eur(n, 0), eur(a.ral, 0), eur(a.ral / 13, 0), eur(b.ral, 0), eur(b.ral / 14, 0)];
    });
    return `
<h2>Tabella netto → RAL 2026</h2>
<p>Quanto chiedere di RAL per ottenere un certo netto mensile. Valori per la Lombardia con addizionale comunale 0,8%: in regioni con addizionali più alte (Lazio, Campania, Piemonte, Molise) serve qualche centinaio di euro in più.</p>
${table(['Netto mensile', 'RAL (13 mensilità)', 'Lordo mensile (13)', 'RAL (14 mensilità)', 'Lordo mensile (14)'], rows, { num: [1, 2, 3, 4], hl: [6] })}
<h2>Come si usa il risultato in un colloquio</h2>
<ol>
<li><strong>Parla sempre di RAL</strong>, mai di netto: l'azienda ragiona in lordo annuo e il netto dipende da variabili che non controlla (regione, familiari, altri redditi).</li>
<li><strong>Chiedi su quante mensilità</strong> è spalmata la RAL e se esiste una parte variabile garantita.</li>
<li><strong>Arrotonda verso l'alto</strong>: se il calcolo dà 29.957 €, chiedi 31.000 €. Il margine copre addizionali più alte e lascia spazio alla trattativa.</li>
<li><strong>Considera il pacchetto</strong>: buoni pasto (fino a 8 € al giorno esentasse), welfare e smart working valgono netto, ma non fanno TFR né pensione.</li>
</ol>
<h2>Perché il calcolo inverso non è una semplice proporzione</h2>
<p>Tra netto e lordo non c'è un rapporto fisso. Al crescere del reddito aumenta l'aliquota IRPEF marginale, scendono le detrazioni per lavoro dipendente e, tra 32.000 e 40.000 €, si perde gradualmente l'ulteriore detrazione del cuneo fiscale. Per questo il nostro calcolatore procede per <strong>approssimazioni successive</strong>: parte da una RAL ipotetica, calcola il netto con il <a href="/">motore completo 2026</a> e corregge finché la differenza è inferiore a un euro.</p>
<h2>Esempi pratici</h2>
<ul>
<li><strong>Neolaureato</strong> che punta a 1.500 € netti: RAL di circa ${eur(CR.calcolaRalDaNetto({ nettoMensile: 1500, mensilita: 14, regione: 'lombardia' }).ral, 0)} su 14 mensilità (commercio).</li>
<li><strong>Impiegato</strong> che vuole 1.800 € netti: RAL di circa ${eur(CR.calcolaRalDaNetto({ nettoMensile: 1800, mensilita: 13, regione: 'lombardia' }).ral, 0)} su 13 mensilità (metalmeccanico).</li>
<li><strong>Quadro</strong> che vuole 2.500 € netti a Roma (addizionale comunale 0,9%, Lazio): RAL di circa ${eur(CR.calcolaRalDaNetto({ nettoMensile: 2500, mensilita: 14, regione: 'lazio', comunale: 0.9 }).ral, 0)} su 14 mensilità.</li>
<li><strong>Manager</strong> che vuole 4.000 € netti a Milano: RAL di circa ${eur(CR.calcolaRalDaNetto({ nettoMensile: 4000, mensilita: 13, regione: 'lombardia', comunale: 0.8 }).ral, 0)}.</li>
</ul>
`; }
},

/* ============================== RAL SIGNIFICATO ============================== */
{
  path: '/ral/significato/', priority: '0.6',
  title: 'RAL Significato: Cosa Vuol Dire e Differenza con Netto, RGA e Costo Azienda',
  description: 'RAL significato in busta paga e nei contratti: cosa vuol dire retribuzione annua lorda, cosa comprende, differenze con RGA, lordo mensile, netto e costo aziendale, con esempi.',
  h1: 'RAL: significato e differenze con netto, RGA e costo azienda', short: 'RAL: significato',
  lead: 'Una guida breve per chi incontra la sigla RAL per la prima volta in un contratto, in un annuncio o in un colloquio.',
  answer: '<strong>RAL</strong> vuol dire <strong>Retribuzione Annua Lorda</strong>: lo stipendio di un anno intero, comprese tredicesima e quattordicesima, prima che vengano tolti contributi INPS e tasse. Nel 2026 una RAL di 30.000 € corrisponde a circa ' + eur(netto(30000).nettoMensile, 0) + ' netti al mese su 13 mensilità.',
  section: 'Guide', about: ['RAL'], crumbs: [['Tabelle RAL', '/ral/'], ['Significato', '/ral/significato/']],
  related: ['/ral/', '/calcolo-ral-da-netto/', '/lordo-netto/', '/'],
  faq: [
    ['RAL è lordo o netto?', 'Lordo, sempre. La "L" sta proprio per lorda: è la cifra prima delle trattenute.'],
    ['Cosa vuol dire RAL 25k?', 'Una retribuzione annua lorda di 25.000 €, pari a circa ' + eur(netto(25000).nettoMensile, 0) + ' netti al mese su 13 mensilità nel 2026.'],
    ['RAL e stipendio annuo sono la stessa cosa?', 'Sì, se per stipendio annuo si intende il lordo. Se si intende il netto, no: il netto annuo è la RAL meno contributi, IRPEF e addizionali.'],
    ['Dove si trova la RAL in busta paga?', 'Non è scritta esplicitamente. Si ricava moltiplicando la retribuzione lorda mensile fissa per il numero di mensilità, oppure dalla Certificazione Unica (punto 1, redditi di lavoro dipendente, che però è già al netto dei contributi).'],
    ['La RAL si può trattare?', 'Sì, è l\'elemento centrale della negoziazione: i minimi del CCNL sono il pavimento, il superminimo individuale è la parte negoziabile.']
  ],
  sources: [SRC.tuir13, SRC.cnel],
  body: () => `
<h2>RAL, RGA, lordo mensile, netto, costo azienda</h2>
${table(['Sigla', 'Significato', 'Esempio (RAL 30.000 €, 13 mensilità)'], [
  ['RAL', 'Retribuzione annua lorda fissa', eur(30000)],
  ['RGA', 'Retribuzione globale annua: RAL + variabile (bonus, premi)', '30.000 € + 3.000 € di bonus = 33.000 €'],
  ['Lordo mensile', 'RAL ÷ mensilità', eur(30000 / 13)],
  ['Netto mensile', 'Quello che arriva sul conto', eur(netto(30000).nettoMensile)],
  ['Netto annuo', 'Netto mensile × mensilità', eur(netto(30000).nettoAnnuo)],
  ['Costo azienda', 'RAL + contributi datore (~30%) + TFR', '≈ ' + eur(30000 * 1.30 + 30000 / 13.5, 0)]
], { num: [2] })}
<h2>Da dove viene la sigla</h2>
<p>La RAL nasce come misura standard per confrontare le offerte di lavoro: dato che mensilità, CCNL e regioni cambiano, l'unico valore comparabile è il lordo annuo complessivo. Per questo gli annunci riportano "RAL 28-32k" e i contratti indicano la retribuzione annua lorda suddivisa in mensilità.</p>
<h2>Tre errori da evitare</h2>
<ol>
<li><strong>Dividere la RAL per 12</strong> quando il contratto prevede 13 o 14 mensilità: il lordo mensile sarà più basso di quanto pensi.</li>
<li><strong>Confrontare RAL e netto</strong> di due offerte: converti entrambe in netto con il <a href="/">calcolatore</a>.</li>
<li><strong>Contare i benefit nella RAL</strong>: buoni pasto e welfare sono netti ma non contribuiscono a TFR e pensione.</li>
</ol>
<p>Vai alla <a href="/ral/">guida completa alla RAL con la tabella netto 2026</a>.</p>
`
}
].concat(RAL_PAGES.map(ralPage));
