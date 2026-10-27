'use strict';
const { CR, eur, fmt, pct, SRC, netto, table, ralTable, regionTable, scaglioniTable } = require('../lib/h.js');

/* Calcolo con le regole 2025 (secondo scaglione al 35%) per i confronti */
function netto2025(ral, extra) {
  const old = CR.P.irpef[1].aliquota;
  CR.P.irpef[1].aliquota = 0.35;
  try { return netto(ral, extra); } finally { CR.P.irpef[1].aliquota = old; }
}

const R30 = netto(30000), R30_14 = netto(30000, { mensilita: 14 });
const RALS_HOME = [20000, 22000, 25000, 28000, 30000, 32000, 35000, 38000, 40000, 45000, 50000, 55000, 60000, 70000, 80000, 90000, 100000];
const RAL_PAGES = [25000, 28000, 30000, 35000, 40000, 45000, 50000, 60000, 70000, 80000];

function regionExtremes(ral) {
  const all = Object.keys(CR.P.regioni).map(k => [k, netto(ral, { regione: k })]).sort((a, b) => b[1].nettoAnnuo - a[1].nettoAnnuo);
  return { best: all[0], worst: all[all.length - 1] };
}
const EX40 = regionExtremes(40000);

module.exports = [
/* ============================== HOMEPAGE ============================== */
{
  path: '/', priority: '1.0', changefreq: 'weekly',
  title: 'Calcolo Stipendio Netto 2026 da RAL e Lordo | CalcoloRAL',
  description: 'Calcola lo stipendio netto 2026 dalla RAL: IRPEF 23-33-43%, INPS, addizionali regionali e cuneo fiscale aggiornati. Netto mensile su 12, 13 o 14 mensilità.',
  h1: 'Calcolo stipendio netto 2026 dalla RAL', short: 'Calcolo stipendio netto',
  appName: 'Calcolatore stipendio netto 2026',
  lead: 'Inserisci la RAL o il lordo annuo e scopri subito quanto ti resta in busta paga ogni mese, con le nuove aliquote IRPEF 2026, i contributi INPS, le addizionali della tua regione e il cuneo fiscale.',
  tool: { type: 'netto', defaults: { ral: 30000, mensilita: 13 } },
  answer: `Con una <strong>RAL di 30.000 €</strong> lo stipendio netto 2026 è di circa <strong>${eur(R30.nettoMensile, 0)} al mese su 13 mensilità</strong> (${eur(R30_14.nettoMensile, 0)} su 14), pari a ${eur(R30.nettoAnnuo, 0)} netti all'anno in Lombardia. Le trattenute totali valgono il ${pct(R30.aliquotaMedia)} della RAL.`,
  about: ['Stipendio netto', 'Retribuzione annua lorda', 'IRPEF', 'Busta paga'],
  howto: { name: 'Come calcolare lo stipendio netto dalla RAL', steps: [
    ['Sottrai i contributi INPS', 'Togli dalla RAL il 9,19% di contributi previdenziali a carico del dipendente: ottieni il reddito imponibile.'],
    ['Calcola l\'IRPEF lorda', 'Applica al reddito imponibile le aliquote 2026: 23% fino a 28.000 €, 33% fino a 50.000 €, 43% oltre.'],
    ['Togli le detrazioni', 'Sottrai la detrazione per lavoro dipendente e, tra 20.000 e 40.000 €, l\'ulteriore detrazione del cuneo fiscale.'],
    ['Sottrai le addizionali', 'Togli l\'addizionale regionale e comunale del luogo in cui risiedi.'],
    ['Dividi per le mensilità', 'Dividi il netto annuo per 12, 13 o 14 in base al tuo contratto.']
  ] },
  related: ['/stipendio-netto-2026/', '/calcolo-ral-da-netto/', '/ral/', '/calcolo-busta-paga/', '/lordo-netto/', '/irpef/scaglioni-2026/'],
  faq: [
    ['Quanto è lo stipendio netto con una RAL di 30.000 euro nel 2026?', `Circa ${eur(R30.nettoMensile, 0)} al mese su 13 mensilità, ${eur(R30_14.nettoMensile, 0)} su 14, per un netto annuo di ${eur(R30.nettoAnnuo, 0)} (Lombardia, addizionale comunale 0,8%). Trovi il dettaglio nella pagina <a href="/ral/30000/">RAL 30.000 € netto</a>.`],
    ['Come si calcola lo stipendio netto dal lordo?', 'Dal lordo annuo (RAL) si tolgono i contributi INPS (9,19%), poi si calcola l\'IRPEF sugli scaglioni 2026 e si sottraggono le detrazioni per lavoro dipendente. Infine si tolgono le addizionali regionale e comunale e si divide per il numero di mensilità.'],
    ['Quanto si toglie dal lordo per avere il netto?', `Dipende dalla RAL: le trattenute pesano circa il ${pct(netto(20000).aliquotaMedia)} su una RAL di 20.000 €, il ${pct(R30.aliquotaMedia)} su 30.000 €, il ${pct(netto(50000).aliquotaMedia)} su 50.000 € e il ${pct(netto(100000).aliquotaMedia)} su 100.000 €.`],
    ['La RAL comprende tredicesima e quattordicesima?', 'Sì. La RAL è la somma di tutte le mensilità lorde dell\'anno, comprese tredicesima e, se prevista dal CCNL, quattordicesima. Per questo, a parità di RAL, con 14 mensilità il netto di ogni mese è più basso ma il totale annuo è uguale.'],
    ['Perché il netto cambia da regione a regione?', `Ogni regione applica la propria addizionale IRPEF, dall'1,23% al 3,63%. Con una RAL di 40.000 € il netto annuo più alto si ha in ${CR.P.regioni[EX40.best[0]].nome} (${eur(EX40.best[1].nettoAnnuo, 0)}) e il più basso in ${CR.P.regioni[EX40.worst[0]].nome} (${eur(EX40.worst[1].nettoAnnuo, 0)}).`],
    ['Cosa cambia nel 2026 per lo stipendio netto?', 'La Legge di Bilancio 2026 ha ridotto la seconda aliquota IRPEF dal 35% al 33% per i redditi tra 28.000 e 50.000 €. Restano strutturali le misure del cuneo fiscale: somma esente fino a 20.000 € e ulteriore detrazione da 1.000 € tra 20.000 e 40.000 €.'],
    ['Il calcolo è affidabile?', 'Usiamo gli stessi parametri della busta paga: aliquote di legge, circolari INPS 2026 e tabelle ufficiali delle addizionali regionali del Dipartimento delle Finanze. Il risultato può differire di pochi euro per scatti, superminimi, familiari a carico o conguagli.'],
    ['I miei dati vengono salvati?', 'No. Il calcolo avviene interamente nel tuo browser: nessun dato viene inviato ai nostri server.']
  ],
  sources: [SRC.bilancio2026, SRC.l207, SRC.tuir13, SRC.inps6, SRC.mef],
  body: () => `
<h2>Come si calcola lo stipendio netto dalla RAL</h2>
<p>La RAL (retribuzione annua lorda) è la cifra scritta nel contratto. Per arrivare al netto che ricevi in busta il calcolo segue sempre la stessa sequenza, la stessa usata dal software paghe del tuo datore di lavoro.</p>
<ol>
<li><strong>Contributi INPS</strong>: il 9,19% della RAL va alla tua pensione (9,49% nell'industria oltre 15 dipendenti). Sopra 56.224 € annui si aggiunge l'1%.</li>
<li><strong>IRPEF lorda</strong>: sul reddito rimasto si applicano gli scaglioni 2026 — 23% fino a 28.000 €, 33% da 28.000 a 50.000 €, 43% oltre.</li>
<li><strong>Detrazioni</strong>: dall'imposta si toglie la detrazione per lavoro dipendente (fino a 1.955 €) e, tra 20.000 e 40.000 € di reddito, l'ulteriore detrazione di 1.000 € del cuneo fiscale.</li>
<li><strong>Addizionali</strong>: si sottraggono l'addizionale regionale (dall'1,23% al 3,63%) e quella comunale (di solito tra 0,5% e 0,9%).</li>
<li><strong>Bonus</strong>: fino a 15.000 € spetta il trattamento integrativo di 1.200 €; fino a 20.000 € la somma esente del cuneo fiscale.</li>
</ol>
<div class="formula">Netto annuo = RAL − INPS − (IRPEF lorda − detrazioni) − addizionali + bonus
Netto mensile = Netto annuo ÷ numero di mensilità</div>
<h3>Esempio con RAL 30.000 € (Lombardia, 13 mensilità)</h3>
${table(['Voce', 'Importo annuo'], [
  ['RAL', eur(30000)], ['Contributi INPS 9,19%', '− ' + eur(R30.inps)], ['Reddito imponibile', eur(R30.imponibile)],
  ['IRPEF lorda (23%)', eur(R30.irpefLorda)], ['Detrazione lavoro dipendente (+65 € tra 25 e 35 mila)', '− ' + eur(R30.detrazioneLavoro)],
  ['Ulteriore detrazione cuneo fiscale', '− ' + eur(R30.ulterioreDetrazione)], ['IRPEF netta', '− ' + eur(R30.irpefNetta)],
  ['Addizionale regionale Lombardia', '− ' + eur(R30.addizionaleRegionale)], ['Addizionale comunale 0,8%', '− ' + eur(R30.addizionaleComunale)],
  ['<strong>Netto annuo</strong>', '<strong>' + eur(R30.nettoAnnuo) + '</strong>'], ['<strong>Netto mensile (÷13)</strong>', '<strong>' + eur(R30.nettoMensile) + '</strong>']
], { num: [1] })}

<h2>Tabella RAL netto 2026: da 20.000 a 100.000 euro</h2>
<p>Ecco quanto resta in tasca per le RAL più cercate. Clicca su una RAL per vedere il calcolo completo, il confronto tra regioni e il netto part-time.</p>
${ralTable(RALS_HOME, { links: RAL_PAGES, hl: 30000 })}
<p>Le RAL intermedie seguono lo stesso andamento: usa il calcolatore in alto per la cifra esatta del tuo contratto, oppure parti dal netto che desideri con il <a href="/calcolo-ral-da-netto/">calcolo RAL da netto</a>.</p>

<h2>Cosa cambia nel 2026</h2>
<p>Dal 1° gennaio 2026 la <strong>seconda aliquota IRPEF scende dal 35% al 33%</strong> per la parte di reddito tra 28.000 e 50.000 €. Il risparmio massimo è di 440 € l'anno e riguarda chi ha un reddito imponibile pari o superiore a 50.000 €, cioè una RAL di circa 55.000 €.</p>
${table(['RAL', 'Netto annuo 2025', 'Netto annuo 2026', 'Guadagno annuo', 'Guadagno al mese (13)'],
  [30000, 35000, 40000, 45000, 50000, 55000, 60000, 80000].map(r => { const a = netto2025(r), b = netto(r); return [eur(r, 0), eur(a.nettoAnnuo, 0), eur(b.nettoAnnuo, 0), '+ ' + eur(b.nettoAnnuo - a.nettoAnnuo, 0), '+ ' + eur((b.nettoAnnuo - a.nettoAnnuo) / 13, 0)]; }),
  { num: [1, 2, 3, 4], caption: 'Confronto a parità di RAL, Lombardia, addizionale comunale 0,8%. Il guadagno comprende il minore effetto sulle addizionali, calcolate sullo stesso imponibile.' })}
<p>Sotto i 30.000 € di RAL il reddito imponibile resta nel primo scaglione al 23%, quindi il netto non cambia. Per tutti restano in vigore le misure del cuneo fiscale introdotte nel 2025 e rese strutturali dalla Legge 207/2024. Approfondisci nella guida agli <a href="/irpef/scaglioni-2026/">scaglioni IRPEF 2026</a>.</p>

<h2>Le trattenute in busta paga, una per una</h2>
<h3>Contributi INPS</h3>
<p>Sono la prima voce che si toglie dal lordo e finanziano la tua pensione. Per la maggior parte dei dipendenti privati valgono il 9,19% della retribuzione; nelle aziende industriali con più di 15 dipendenti salgono al 9,49% per il contributo CIGS. Gli apprendisti pagano il 5,84%. Superata la prima fascia di retribuzione pensionabile (56.224 € nel 2026) si aggiunge l'1%.</p>
<h3>IRPEF e detrazioni</h3>
<p>L'IRPEF si calcola per scaglioni: ogni aliquota si applica solo alla parte di reddito che rientra in quello scaglione. La <a href="/irpef/detrazioni-lavoro-dipendente-2026/">detrazione per lavoro dipendente</a> riduce l'imposta di 1.955 € fino a 15.000 € di reddito e si azzera a 50.000 €. Tra 20.000 e 32.000 € il cuneo fiscale aggiunge 1.000 € di ulteriore detrazione, che cala fino a zero a 40.000 €.</p>
<h3>Addizionali regionale e comunale</h3>
<p>Si calcolano sullo stesso reddito imponibile IRPEF. Nella busta paga reale le addizionali dell'anno precedente vengono trattenute in 11 rate da gennaio a novembre; nel nostro calcolo le includiamo nell'anno in corso per mostrarti il netto effettivo. Consulta le <a href="/irpef/addizionale-regionale-2026/">aliquote di tutte le regioni</a>.</p>

<h2>13 o 14 mensilità: quale netto è più alto?</h2>
<p>A parità di RAL il <strong>netto annuo è identico</strong>: cambia solo come viene suddiviso. Con 14 mensilità ogni mese ricevi meno, ma a luglio arriva la quattordicesima e a dicembre la tredicesima. Con una RAL di 30.000 €:</p>
${table(['Mensilità', 'Lordo mensile', 'Netto mensile medio', 'Netto annuo'], [12, 13, 14].map(m => { const n = netto(30000, { mensilita: m }); return [m + ' mensilità', eur(30000 / m, 0), eur(n.nettoMensile, 0), eur(n.nettoAnnuo, 0)]; }), { num: [1, 2, 3] })}
<p>Le mensilità aggiuntive sono tassate senza detrazioni, quindi il loro netto è proporzionalmente più basso: puoi stimarlo con il <a href="/calcolo-tredicesima/">calcolo della tredicesima</a> e della <a href="/calcolo-quattordicesima/">quattordicesima</a>.</p>

<h2>Quanto pesa la regione di residenza</h2>
<p>A parità di RAL il netto cambia in base all'addizionale regionale e comunale. Con 40.000 € lordi la differenza tra la regione più conveniente (${CR.P.regioni[EX40.best[0]].nome}) e la più cara (${CR.P.regioni[EX40.worst[0]].nome}) è di ${eur(EX40.best[1].nettoAnnuo - EX40.worst[1].nettoAnnuo, 0)} l'anno.</p>
${regionTable(40000)}

<h2>Attenzione ai "salti" del netto</h2>
<p>Alcune soglie di legge funzionano a gradino: superarle di poco può ridurre il netto invece di aumentarlo. Il calcolatore ne tiene conto automaticamente.</p>
<ul>
<li><strong>Reddito di 20.000 €</strong> (RAL circa 22.020 €): si passa dalla somma esente del cuneo, che vale circa 960 €, all'ulteriore detrazione di 1.000 €. Il passaggio è quasi neutro.</li>
<li><strong>Reddito di 15.000 €</strong> (RAL circa 16.520 €): finisce il trattamento integrativo automatico da 1.200 € e la percentuale della somma esente scende dal 5,3% al 4,8%.</li>
<li><strong>Reddito di 35.000 €</strong> (RAL circa 38.540 €): si perde la maggiorazione di 65 € della detrazione per lavoro dipendente.</li>
</ul>
`
},

/* ============================== 2026 ============================== */
{
  path: '/stipendio-netto-2026/', priority: '0.9', changefreq: 'monthly',
  title: 'Stipendio Netto 2026: Calcolo Mensile con le Nuove Aliquote',
  description: 'Calcolo dello stipendio netto mensile 2026 con IRPEF al 33%, cuneo fiscale e addizionali aggiornate. Confronto con il 2025 e quanto aumenta la busta paga.',
  h1: 'Calcolo stipendio netto mensile 2026', short: 'Stipendio netto 2026',
  appName: 'Calcolatore stipendio netto mensile 2026',
  lead: 'Il calcolatore aggiornato a tutte le novità fiscali 2026: secondo scaglione IRPEF al 33%, cuneo fiscale strutturale, contributi e addizionali regionali dell\'anno.',
  tool: { type: 'netto', defaults: { ral: 35000, mensilita: 13 } },
  answer: (() => { const a = netto2025(40000), b = netto(40000); return `Nel 2026 lo stipendio netto aumenta solo per chi ha un reddito imponibile oltre 28.000 € (RAL sopra 30.800 € circa). Con una <strong>RAL di 40.000 €</strong> il netto passa da ${eur(a.nettoAnnuo, 0)} a <strong>${eur(b.nettoAnnuo, 0)} l'anno</strong>: ${eur((b.nettoAnnuo - a.nettoAnnuo) / 13, 0)} in più al mese su 13 mensilità.`; })(),
  section: 'Novità 2026', about: ['Legge di Bilancio 2026', 'IRPEF 2026', 'Stipendio netto'],
  related: ['/', '/irpef/scaglioni-2026/', '/irpef/detrazioni-lavoro-dipendente-2026/', '/irpef/addizionale-regionale-2026/', '/calcolo-busta-paga/'],
  faq: [
    ['Quando arriva in busta paga il taglio IRPEF 2026?', 'Il nuovo scaglione al 33% si applica dal periodo d\'imposta 2026. I datori di lavoro lo hanno applicato dalle buste paga di inizio anno o, se in ritardo, con il conguaglio dei mesi arretrati nei primi mesi del 2026.'],
    ['Chi non ha vantaggi dal taglio al 33%?', 'Chi ha un reddito imponibile fino a 28.000 €, cioè una RAL fino a circa 30.800 €, perché il suo reddito è tutto nel primo scaglione al 23%, che non cambia.'],
    ['Il cuneo fiscale c\'è ancora nel 2026?', 'Sì. La Legge 207/2024 ha reso strutturali la somma esente per i redditi fino a 20.000 € e l\'ulteriore detrazione di 1.000 € tra 20.000 e 32.000 €, decrescente fino a 40.000 €. Sono valide anche nel 2026.'],
    ['Quanto vale al massimo il taglio IRPEF 2026?', '440 € l\'anno: il 2% di risparmio sui 22.000 € di reddito compresi tra 28.000 e 50.000 €. Lo ottiene per intero chi ha un reddito imponibile di almeno 50.000 €.'],
    ['Perché a gennaio lo stipendio netto può essere più basso?', 'A gennaio iniziano le trattenute delle addizionali regionale e comunale dell\'anno precedente (in 11 rate) e l\'acconto dell\'addizionale comunale. Inoltre a gennaio non ci sono ratei di tredicesima.'],
    ['Cosa succede ai redditi oltre 200.000 €?', 'Per neutralizzare il vantaggio dell\'aliquota al 33%, la Legge di Bilancio 2026 riduce di 440 € le detrazioni al 19% (escluse le spese sanitarie) per chi supera 200.000 € di reddito complessivo.']
  ],
  sources: [SRC.bilancio2026, SRC.l207, SRC.ade, SRC.inps6, SRC.mef],
  body: () => `
<h2>Le novità fiscali del 2026 in busta paga</h2>
${table(['Novità', 'Cosa prevede', 'Chi ne beneficia'], [
  ['Secondo scaglione IRPEF', 'Aliquota dal 35% al 33% sul reddito tra 28.000 e 50.000 €', 'Redditi oltre 28.000 €'],
  ['Cuneo fiscale — somma esente', '7,1%, 5,3% o 4,8% del reddito da lavoro, esente da tasse', 'Redditi fino a 20.000 €'],
  ['Cuneo fiscale — ulteriore detrazione', '1.000 € l\'anno, decrescente tra 32.000 e 40.000 €', 'Redditi tra 20.000 e 40.000 €'],
  ['Trattamento integrativo', '1.200 € l\'anno', 'Redditi fino a 15.000 € (fino a 28.000 € in casi particolari)'],
  ['Prima fascia pensionabile INPS', '56.224 € (+1% di contributi oltre la soglia)', 'RAL oltre 56.224 €'],
  ['Redditi oltre 200.000 €', 'Detrazioni al 19% ridotte di 440 €', 'Redditi molto alti']
])}
<h2>Confronto netto 2025 e 2026</h2>
<p>La tabella mostra quanto cambia il netto a parità di RAL. Il guadagno cresce fino a una RAL di circa 55.000 € e poi resta stabile.</p>
${table(['RAL', 'Netto mensile 2025', 'Netto mensile 2026', 'Differenza al mese', 'Differenza all\'anno'],
  [25000, 30000, 32000, 35000, 38000, 40000, 45000, 50000, 55000, 60000, 70000, 100000].map(r => { const a = netto2025(r), b = netto(r); return [eur(r, 0), eur(a.nettoMensile, 0), eur(b.nettoMensile, 0), '+ ' + eur(b.nettoMensile - a.nettoMensile, 0), '+ ' + eur(b.nettoAnnuo - a.nettoAnnuo, 0)]; }),
  { num: [1, 2, 3, 4], caption: '13 mensilità, Lombardia, addizionale comunale 0,8%.' })}
<h2>Parametri 2026 usati nel calcolo</h2>
${table(['Parametro', 'Valore 2026', 'Fonte'], [
  ['Aliquote IRPEF', '23% · 33% · 43%', 'Legge di Bilancio 2026'],
  ['Contributi INPS dipendente', '9,19% (9,49% industria >15 dip.)', 'Normativa FPLD'],
  ['Soglia contributo aggiuntivo 1%', '56.224 €', 'Circolare INPS 6/2026'],
  ['Massimale contributivo', '122.295 €', 'Circolare INPS 6/2026'],
  ['Detrazione lavoro dipendente', 'max 1.955 €, zero oltre 50.000 €', 'Art. 13 TUIR'],
  ['Cuneo fiscale', 'somma esente fino a 20.000 €; 1.000 € tra 20.000 e 32.000 €', 'L. 207/2024'],
  ['Addizionali regionali', 'dall\'1,23% al 3,63%', 'Dipartimento delle Finanze']
])}
<p>Tutti i parametri sono anche scaricabili in formato aperto: <a href="/dati/parametri-2026.json">parametri-2026.json</a>.</p>
<h2>Il calendario della busta paga nel 2026</h2>
<ul>
<li><strong>Gennaio – novembre</strong>: trattenute in 11 rate dell'addizionale regionale e del saldo comunale 2025.</li>
<li><strong>Marzo – novembre</strong>: acconto dell'addizionale comunale 2026 (30%) in 9 rate.</li>
<li><strong>Luglio</strong>: quattordicesima per chi la prevede il CCNL (commercio, turismo, alimentaristi).</li>
<li><strong>Luglio – agosto</strong>: rimborsi o trattenute del modello 730.</li>
<li><strong>Dicembre</strong>: tredicesima e conguaglio fiscale di fine anno.</li>
</ul>
`
},

/* ============================== LORDO NETTO ============================== */
{
  path: '/lordo-netto/', priority: '0.7',
  title: 'Lordo e Netto: Differenza e Come Calcolare lo Stipendio',
  description: 'Differenza tra stipendio lordo e netto spiegata semplice: cosa si toglie dal lordo, percentuali per fascia di RAL e come passare dal lordo al netto e viceversa.',
  h1: 'Stipendio lordo e netto: differenza e come calcolarlo', short: 'Lordo e netto: la differenza',
  lead: 'Lordo, netto, RAL, imponibile: cosa significano le voci della busta paga e quanto si perde davvero tra la cifra del contratto e quella sul conto.',
  answer: `Lo <strong>stipendio lordo</strong> è la retribuzione prima di contributi e tasse; il <strong>netto</strong> è ciò che ricevi sul conto. La differenza è fatta di contributi INPS (circa 9,19%), IRPEF e addizionali: in media il netto vale il ${pct(100 - netto(25000).aliquotaMedia)} del lordo con una RAL di 25.000 €, il ${pct(100 - netto(40000).aliquotaMedia)} con 40.000 € e il ${pct(100 - netto(70000).aliquotaMedia)} con 70.000 €.`,
  section: 'Guide', about: ['Stipendio lordo', 'Stipendio netto', 'Busta paga'],
  tool: { type: 'netto', defaults: { ral: 25000, mensilita: 13 } }, appName: 'Calcolatore da lordo a netto',
  related: ['/', '/calcolo-ral-da-netto/', '/ral/', '/calcolo-busta-paga/'],
  faq: [
    ['Quanto togliere dal lordo per avere il netto?', 'Una regola pratica: togli circa il 20-25% fino a 30.000 € di RAL, il 30-35% tra 40.000 e 50.000 €, il 38-43% sopra 60.000 €. Per la cifra esatta usa il calcolatore, che applica gli scaglioni IRPEF e le addizionali della tua regione.'],
    ['Lo stipendio indicato negli annunci di lavoro è lordo o netto?', 'Quasi sempre lordo e annuo (RAL). Quando un annuncio indica una cifra mensile, di solito è il lordo mensile: verifica sempre su quante mensilità è calcolato.'],
    ['Che differenza c\'è tra lordo e imponibile?', 'L\'imponibile fiscale è il lordo meno i contributi INPS a carico del dipendente. È la base su cui si calcolano IRPEF e addizionali.'],
    ['Come passare dal netto al lordo?', 'Il calcolo inverso richiede di provare diverse RAL fino a trovare quella che dà il netto voluto. Il nostro <a href="/calcolo-ral-da-netto/">calcolo RAL da netto</a> lo fa automaticamente.'],
    ['Il netto in busta paga è sempre uguale ogni mese?', 'No: cambia con straordinari, ferie non godute, malattia, conguagli di fine anno, rate delle addizionali e rimborsi del 730.']
  ],
  sources: [SRC.tuir13, SRC.inps6, SRC.ade],
  body: () => `
<h2>Le parole della busta paga</h2>
${table(['Termine', 'Significato'], [
  ['<strong>RAL</strong>', 'Retribuzione annua lorda: tutto lo stipendio lordo di un anno, comprese 13ª e 14ª. È la cifra del contratto.'],
  ['<strong>Lordo mensile</strong>', 'RAL divisa per il numero di mensilità (12, 13 o 14).'],
  ['<strong>Imponibile previdenziale</strong>', 'La base su cui si calcolano i contributi INPS.'],
  ['<strong>Imponibile fiscale</strong>', 'Lordo meno contributi INPS: la base dell\'IRPEF.'],
  ['<strong>IRPEF lorda</strong>', 'Imposta calcolata sugli scaglioni, prima delle detrazioni.'],
  ['<strong>IRPEF netta</strong>', 'Imposta effettiva dopo le detrazioni.'],
  ['<strong>Netto in busta</strong>', 'Quello che arriva sul conto corrente.']
])}
<h2>Quanto vale il netto in percentuale del lordo</h2>
${table(['RAL', 'Netto annuo', 'Netto in % del lordo', 'Trattenute in % del lordo'],
  [15000, 20000, 25000, 30000, 35000, 40000, 50000, 60000, 70000, 80000, 100000].map(r => { const n = netto(r); return [eur(r, 0), eur(n.nettoAnnuo, 0), pct(100 - n.aliquotaMedia), pct(n.aliquotaMedia)]; }),
  { num: [1, 2, 3], caption: 'Lombardia, addizionale comunale 0,8%, nessun familiare a carico. Sotto i 20.000 € il netto beneficia del cuneo fiscale e del trattamento integrativo.' })}
<p>La percentuale di trattenute cresce con la RAL perché l'IRPEF è progressiva e le detrazioni diminuiscono man mano che il reddito sale. È il motivo per cui un aumento lordo di 1.000 € non si traduce mai in 1.000 € netti: dipende dalla tua <strong>aliquota marginale</strong>.</p>
<h2>Quanto netto resta di un aumento</h2>
<p>Per stimare quanto vale un aumento, guarda l'aliquota marginale complessiva: contributi INPS + IRPEF dello scaglione + addizionali + eventuale perdita di detrazioni.</p>
${table(['RAL di partenza', 'Aumento lordo annuo', 'Aumento netto annuo', 'Quota che resta a te'],
  [[25000, 2000], [30000, 2000], [35000, 3000], [45000, 3000], [55000, 5000], [70000, 5000]].map(([r, a]) => { const x = netto(r), y = netto(r + a); return [eur(r, 0), '+ ' + eur(a, 0), '+ ' + eur(y.nettoAnnuo - x.nettoAnnuo, 0), pct((y.nettoAnnuo - x.nettoAnnuo) / a * 100)]; }),
  { num: [1, 2, 3] })}
<h2>Dal netto al lordo</h2>
<p>Se conosci il netto che vuoi ricevere e devi trattare la RAL in un colloquio, usa il <a href="/calcolo-ral-da-netto/">calcolatore inverso</a>. Ad esempio, per avere 2.000 € netti al mese su 13 mensilità in Lombardia serve una RAL di circa ${eur(CR.calcolaRalDaNetto({ nettoMensile: 2000, mensilita: 13, regione: 'lombardia' }).ral, 0)}.</p>
`
}
];
