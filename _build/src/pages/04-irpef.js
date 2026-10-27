'use strict';
const { CR, eur, fmt, pct, SRC, netto, table, scaglioniTable } = require('../lib/h.js');

const regioni = CR.P.regioni;
function regRow(k) {
  const r = regioni[k];
  const sc = r.scaglioni.map(([lim, al]) => (lim === Infinity ? 'oltre' : '≤ ' + fmt(lim, 0)) + ': ' + fmt(al, 2) + '%').join(' · ');
  const note = [];
  if (r.ridotta) note.push(`${fmt(r.ridotta.aliquota, 2)}% su tutto il reddito fino a ${fmt(r.ridotta.finoReddito, 0)} €`);
  if (r.esenteFino) note.push(`esenti fino a ${fmt(r.esenteFino, 0)} €`);
  if (r.detrazione) note.push(`detrazione ${fmt(r.detrazione.importo, 2)} € ${r.detrazione.daReddito ? 'tra ' + fmt(r.detrazione.daReddito, 0) + ' e ' : 'fino a '}${fmt(r.detrazione.finoReddito, 0)} €`);
  return [r.nome, r.scaglioni.length === 1 && !r.ridotta ? fmt(r.scaglioni[0][1], 2) + '% unica' : sc, note.join('; ') || '—', eur(CR.addizionaleRegionale(20000, k), 0), eur(CR.addizionaleRegionale(30000, k), 0), eur(CR.addizionaleRegionale(45000, k), 0)];
}
const sorted = Object.keys(regioni).sort((a, b) => regioni[a].nome.localeCompare(regioni[b].nome, 'it'));
const byCost = Object.keys(regioni).map(k => [k, CR.addizionaleRegionale(30000, k)]).sort((a, b) => a[1] - b[1]);

module.exports = [
/* ============================== SCAGLIONI ============================== */
{
  path: '/irpef/scaglioni-2026/', priority: '0.8',
  title: 'Scaglioni IRPEF 2026: Nuove Aliquote 23%, 33%, 43% e Tabella',
  description: 'Scaglioni e aliquote IRPEF 2026 dopo la Legge di Bilancio: 23% fino a 28.000 €, 33% fino a 50.000 €, 43% oltre. Tabella, esempi di calcolo, confronto con il 2025 e chi risparmia.',
  h1: 'Scaglioni IRPEF 2026: aliquote, tabella ed esempi', short: 'Scaglioni IRPEF 2026',
  lead: 'Le tre aliquote in vigore dal 1° gennaio 2026, cosa è cambiato rispetto al 2025 e quanto paga ogni fascia di reddito, con il calcolo per scaglioni spiegato.',
  answer: 'Gli <strong>scaglioni IRPEF 2026</strong> sono tre: <strong>23%</strong> fino a 28.000 €, <strong>33%</strong> da 28.000 a 50.000 € e <strong>43%</strong> oltre 50.000 €. La novità è la seconda aliquota, scesa dal 35% al 33%: un risparmio fino a 440 € l\'anno per chi ha un reddito di almeno 50.000 €.',
  crumbs: [['IRPEF', '/calcolo-irpef/'], ['Scaglioni 2026', '/irpef/scaglioni-2026/']],
  section: 'Guide IRPEF', about: ['IRPEF', 'Scaglioni IRPEF', 'Legge di Bilancio 2026'],
  tool: { type: 'irpef', defaults: { reddito: 40000, tipo: 'dipendente' } }, appName: 'Calcolatore IRPEF per scaglioni 2026',
  related: ['/calcolo-irpef/', '/irpef/detrazioni-lavoro-dipendente-2026/', '/stipendio-netto-2026/', '/irpef/addizionale-regionale-2026/'],
  faq: [
    ['Quanti sono gli scaglioni IRPEF nel 2026?', 'Tre, come nel 2024 e 2025: fino a 28.000 €, da 28.000 a 50.000 €, oltre 50.000 €. Fino al 2023 erano quattro (con il 25% tra 15.000 e 28.000 €).'],
    ['Chi risparmia con l\'IRPEF 2026?', 'Tutti i contribuenti con reddito imponibile superiore a 28.000 €. Il risparmio è del 2% sulla parte di reddito tra 28.000 e 50.000 €: 40 € con 30.000 €, 240 € con 40.000 €, 440 € da 50.000 € in su.'],
    ['Il 33% si applica a tutto il reddito?', 'No. Si applica solo alla quota tra 28.000 e 50.000 €. I primi 28.000 € pagano sempre il 23%.'],
    ['Cosa succede sopra 200.000 €?', 'La Legge di Bilancio 2026 riduce di 440 € le detrazioni al 19% (escluse le spese sanitarie) per neutralizzare il vantaggio del nuovo scaglione.'],
    ['Gli scaglioni valgono anche per le addizionali?', 'No: regioni e comuni hanno propri scaglioni e aliquote, che spesso ricalcano le soglie 15.000 / 28.000 / 50.000 €.'],
    ['Le aliquote 2026 valgono anche per le pensioni?', 'Sì, gli scaglioni sono uguali per tutti i redditi soggetti a IRPEF: lavoro dipendente, pensione, autonomo in regime ordinario, affitti non in cedolare secca.']
  ],
  sources: [SRC.bilancio2026, SRC.ade],
  body: () => {
    const rows = [15000, 20000, 25000, 28000, 30000, 35000, 40000, 45000, 50000, 60000, 80000, 100000].map(r => {
      const l26 = CR.irpefLorda(r), l25 = r <= 28000 ? l26 : 6440 + Math.min(r - 28000, 22000) * 0.35 + Math.max(0, r - 50000) * 0.43;
      return [eur(r, 0), eur(l25, 0), eur(l26, 0), eur(l25 - l26, 0), pct(l26 / r * 100)];
    });
    return `
<h2>Tabella scaglioni IRPEF 2026</h2>
${scaglioniTable()}
<h2>Come funziona il calcolo per scaglioni</h2>
<p>L'IRPEF è un'imposta <strong>progressiva per scaglioni</strong>: il reddito viene "tagliato a fette" e ogni fetta paga la propria aliquota. Chi guadagna 35.000 € non paga il 33% su tutto, ma il 23% sui primi 28.000 € e il 33% solo sui 7.000 € successivi.</p>
<div class="formula">Reddito 35.000 €:
28.000 × 23% = 6.440 €
 7.000 × 33% = 2.310 €
IRPEF lorda   = 8.750 €  (aliquota media 25%)</div>
<h2>IRPEF lorda 2025 e 2026 a confronto</h2>
${table(['Reddito imponibile', 'IRPEF lorda 2025', 'IRPEF lorda 2026', 'Risparmio', 'Aliquota media 2026'], rows, { num: [1, 2, 3, 4], caption: 'Imposta lorda, prima delle detrazioni. Il risparmio massimo di 440 € si raggiunge a 50.000 € di reddito.' })}
<h2>Dalla lorda alla netta: le detrazioni</h2>
<p>L'imposta che paghi davvero è più bassa della lorda grazie alle <a href="/irpef/detrazioni-lavoro-dipendente-2026/">detrazioni per lavoro dipendente</a> (fino a 1.955 €), per pensione, per familiari a carico e per oneri. Tra 20.000 e 40.000 € di reddito si aggiunge l'ulteriore detrazione del cuneo fiscale (1.000 €, decrescente da 32.000 €). Nel 2026 il quadro completo per un dipendente è questo:</p>
${table(['Reddito', 'IRPEF lorda', 'Detrazione lavoro', 'Ulteriore detrazione', 'IRPEF netta'], [15000, 20000, 25000, 30000, 35000, 40000, 50000, 60000].map(r => { const i = CR.calcolaIrpef({ reddito: r, tipo: 'dipendente' }); return [eur(r, 0), eur(i.lorda, 0), eur(i.detrazione, 0), eur(i.ulteriore, 0), eur(i.netta, 0)]; }), { num: [1, 2, 3, 4] })}
<h2>La storia recente degli scaglioni</h2>
${table(['Anno', 'Scaglioni e aliquote'], [
  ['Fino al 2021', '5 scaglioni: 23% · 27% · 38% · 41% · 43%'],
  ['2022–2023', '4 scaglioni: 23% fino a 15.000 · 25% fino a 28.000 · 35% fino a 50.000 · 43% oltre'],
  ['2024–2025', '3 scaglioni: 23% fino a 28.000 · 35% fino a 50.000 · 43% oltre'],
  ['<strong>2026</strong>', '<strong>3 scaglioni: 23% fino a 28.000 · 33% fino a 50.000 · 43% oltre</strong>']
])}
`; }
},

/* ============================== DETRAZIONI ============================== */
{
  path: '/irpef/detrazioni-lavoro-dipendente-2026/', priority: '0.7',
  title: 'Detrazioni Lavoro Dipendente 2026: Importi, Formula e Calcolo',
  description: 'Detrazioni per lavoro dipendente 2026: 1.955 € fino a 15.000 €, formule per le fasce 15-28.000 e 28-50.000 €, maggiorazione di 65 €, ulteriore detrazione cuneo fiscale da 1.000 €. Calcolo ed esempi.',
  h1: 'Detrazioni lavoro dipendente 2026: importi e calcolo', short: 'Detrazioni lavoro dipendente',
  lead: 'Quanto vale la detrazione che riduce l\'IRPEF di ogni dipendente, come si calcola per fascia di reddito e come si combina con il cuneo fiscale.',
  answer: 'La <strong>detrazione per lavoro dipendente 2026</strong> (art. 13 TUIR) è di <strong>1.955 €</strong> fino a 15.000 € di reddito, scende gradualmente tra 15.000 e 50.000 € e si azzera oltre. Tra 25.000 e 35.000 € si aggiungono 65 €. Tra 20.000 e 40.000 € spetta inoltre l\'<strong>ulteriore detrazione di 1.000 €</strong> del cuneo fiscale (piena fino a 32.000 €, decrescente fino a 40.000 €).',
  crumbs: [['IRPEF', '/calcolo-irpef/'], ['Detrazioni lavoro dipendente', '/irpef/detrazioni-lavoro-dipendente-2026/']],
  section: 'Guide IRPEF', about: ['Detrazioni fiscali', 'Lavoro dipendente', 'Art. 13 TUIR'],
  related: ['/calcolo-irpef/', '/irpef/trattamento-integrativo-2026/', '/irpef/scaglioni-2026/', '/calcolo-busta-paga/'],
  faq: [
    ['Come si calcola la detrazione per lavoro dipendente?', 'Fino a 15.000 €: 1.955 €. Tra 15.000 e 28.000 €: 1.910 + 1.190 × (28.000 − reddito) / 13.000. Tra 28.000 e 50.000 €: 1.910 × (50.000 − reddito) / 22.000. Oltre 50.000 €: zero. Il risultato va rapportato ai giorni di lavoro nell\'anno.'],
    ['Cos\'è la maggiorazione di 65 euro?', 'Un importo fisso aggiunto alla detrazione per i redditi tra 25.000 e 35.000 €, introdotto con la riforma 2022 per evitare perdite nel passaggio ai nuovi scaglioni.'],
    ['La detrazione dipende dai giorni lavorati?', 'Sì: si calcola in base ai giorni di lavoro dell\'anno (365 per un anno intero). Chi lavora 6 mesi ha metà detrazione, ma esiste un minimo di 690 € (1.380 € per i contratti a tempo indeterminato) nella fascia fino a 28.000 €.'],
    ['Cosa succede se la detrazione supera l\'imposta?', 'La parte eccedente si perde (incapienza), tranne che per il trattamento integrativo, che viene pagato come bonus in busta paga.'],
    ['L\'ulteriore detrazione del cuneo fiscale è strutturale?', 'Sì, la Legge 207/2024 la ha introdotta "a decorrere dal 2025" senza scadenza, e la Legge di Bilancio 2026 non l\'ha modificata.'],
    ['Le detrazioni per figli a carico sono comprese?', 'No, sono separate: dal 2022 i figli fino a 21 anni sono coperti dall\'Assegno Unico; per i figli dai 21 ai 30 anni a carico resta una detrazione di 950 € (ridotta in base al reddito). Il nostro calcolatore non le considera.']
  ],
  sources: [SRC.tuir13, SRC.l207, SRC.ade],
  body: () => {
    const rows = [8000, 10000, 15000, 18000, 20000, 22000, 25000, 28000, 30000, 32000, 35000, 38000, 40000, 45000, 50000].map(r => [eur(r, 0), eur(CR.detrazioneLavoro(r), 0), eur(CR.ulterioreDetrazioneCuneo(r), 0), eur(CR.detrazioneLavoro(r) + CR.ulterioreDetrazioneCuneo(r), 0)]);
    return `
<h2>Formula della detrazione (art. 13 TUIR)</h2>
<div class="formula">Reddito ≤ 15.000 €           →  1.955 € (minimo 690 €, o 1.380 € a tempo indeterminato)
15.000 < reddito ≤ 28.000 €  →  1.910 + 1.190 × (28.000 − reddito) / 13.000
28.000 < reddito ≤ 50.000 €  →  1.910 × (50.000 − reddito) / 22.000
Reddito > 50.000 €           →  0
25.000 < reddito ≤ 35.000 €  →  + 65 €</div>
<h2>Ulteriore detrazione del cuneo fiscale (L. 207/2024)</h2>
<div class="formula">20.000 < reddito ≤ 32.000 €  →  1.000 €
32.000 < reddito ≤ 40.000 €  →  1.000 × (40.000 − reddito) / 8.000
Reddito ≤ 20.000 €           →  nessuna detrazione, ma somma esente del 7,1% / 5,3% / 4,8%</div>
<h2>Tabella detrazioni 2026 per reddito</h2>
${table(['Reddito imponibile', 'Detrazione lavoro dipendente', 'Ulteriore detrazione cuneo', 'Totale detrazioni'], rows, { num: [1, 2, 3], caption: 'Anno intero di lavoro, nessun familiare a carico.' })}
<h2>Come si applica in busta paga</h2>
<p>Il datore di lavoro calcola la detrazione sul reddito <strong>presunto</strong> dell'anno e la riconosce in quote mensili; a dicembre (o alla cessazione) fa il conguaglio sul reddito effettivo. Se hai due datori di lavoro, chiedi la detrazione a uno solo, altrimenti dovrai restituirla con il 730. Lo stesso vale per il trattamento integrativo.</p>
<h2>Detrazione e trattamento integrativo</h2>
<p>Quando la detrazione supera l'IRPEF lorda (incapienza), fino a 15.000 € di reddito scatta il <a href="/irpef/trattamento-integrativo-2026/">trattamento integrativo di 1.200 €</a>, pagato in busta. Tra 15.000 e 28.000 € il trattamento spetta solo se la somma delle detrazioni (lavoro, familiari, mutuo, spese sanitarie, ristrutturazioni) supera l'imposta lorda, nel limite della differenza.</p>
`; }
},

/* ============================== TRATTAMENTO INTEGRATIVO ============================== */
{
  path: '/irpef/trattamento-integrativo-2026/', priority: '0.7',
  title: 'Trattamento Integrativo 2026 (ex Bonus 100 Euro): a Chi Spetta e Calcolo',
  description: 'Trattamento integrativo 2026: 1.200 € l\'anno (100 € al mese) per redditi fino a 15.000 €, e fino a 28.000 € in caso di incapienza. Requisiti, calcolo, quando si restituisce.',
  h1: 'Trattamento integrativo 2026: a chi spetta e come si calcola', short: 'Trattamento integrativo',
  lead: 'Il "bonus 100 euro" in busta paga esiste ancora: ecco chi lo riceve nel 2026, quanto vale e perché a volte viene chiesto indietro.',
  answer: 'Il <strong>trattamento integrativo 2026</strong> vale <strong>1.200 € l\'anno</strong> (100 € al mese) e spetta ai lavoratori dipendenti con <strong>reddito fino a 15.000 €</strong>, a condizione che l\'IRPEF lorda superi la detrazione per lavoro dipendente ridotta di 75 €. Tra <strong>15.000 e 28.000 €</strong> spetta solo se le detrazioni superano l\'imposta lorda, per un importo pari alla differenza. Non spetta a pensionati e autonomi.',
  crumbs: [['IRPEF', '/calcolo-irpef/'], ['Trattamento integrativo', '/irpef/trattamento-integrativo-2026/']],
  section: 'Guide IRPEF', about: ['Trattamento integrativo', 'Bonus 100 euro', 'DL 3/2020'],
  related: ['/irpef/detrazioni-lavoro-dipendente-2026/', '/part-time/', '/', '/calcolo-busta-paga/'],
  faq: [
    ['Quanto è il trattamento integrativo al mese?', '100 € per ogni mese di lavoro, 1.200 € l\'anno. Per chi lavora meno di 12 mesi è proporzionale ai giorni.'],
    ['Chi lo perde nel 2026?', 'Chi supera 15.000 € di reddito complessivo e ha un\'imposta lorda superiore alle detrazioni. In pratica, sopra 15.000 € lo riceve solo chi ha molte detrazioni (figli dai 21 anni, mutuo, spese sanitarie, ristrutturazioni).'],
    ['Perché il 730 mi chiede di restituire il trattamento integrativo?', 'Perché il datore di lavoro lo ha anticipato in base al reddito presunto, ma il reddito effettivo (con altri redditi, secondo lavoro, premi) ha superato le soglie. Il recupero avviene in un\'unica soluzione se inferiore a 60 €, altrimenti in 8 rate.'],
    ['Si somma al cuneo fiscale?', 'Sì: fino a 15.000 € un dipendente riceve sia il trattamento integrativo (1.200 €) sia la somma esente del cuneo fiscale (7,1% o 5,3% del reddito). Con 15.000 € di RAL sono circa ' + eur(netto(15000).trattamentoIntegrativo + netto(15000).bonusCuneo, 0) + ' l\'anno in più in busta.'],
    ['Il trattamento integrativo è tassato?', 'No, non concorre a formare il reddito ed è esente da IRPEF e contributi.'],
    ['Spetta ai lavoratori part-time?', 'Sì, se il reddito annuo rientra nelle soglie. È uno dei motivi per cui il netto part-time è più della metà del full-time.']
  ],
  sources: [SRC.dl3, SRC.tuir13, SRC.l207],
  body: () => {
    const rows = [8000, 10000, 12000, 14000, 15000, 16000, 20000, 25000, 28000].map(r => { const n = CR.calcolaNetto({ ral: r / (1 - 0.0919), regione: 'lombardia' }); return [eur(r, 0), eur(CR.irpefLorda(r), 0), eur(CR.detrazioneLavoro(r), 0), eur(n.trattamentoIntegrativo, 0), eur(n.bonusCuneo, 0)]; });
    return `
<h2>Le due condizioni</h2>
<ol>
<li><strong>Reddito fino a 15.000 €</strong>: spetta per intero (1.200 €) se l'IRPEF lorda è maggiore della detrazione per lavoro dipendente meno 75 €. Chi ha un reddito sotto circa 8.200 € è "incapiente" e non lo riceve, perché non paga IRPEF.</li>
<li><strong>Reddito tra 15.000 e 28.000 €</strong>: spetta solo se la somma di detrazione per lavoro, detrazioni per familiari, interessi del mutuo (contratto entro il 2021), spese sanitarie, ristrutturazioni (entro il 2021) supera l'IRPEF lorda. L'importo è la differenza, fino a 1.200 €.</li>
</ol>
<h2>Tabella per reddito imponibile 2026</h2>
${table(['Reddito imponibile', 'IRPEF lorda', 'Detrazione lavoro', 'Trattamento integrativo', 'Somma esente cuneo'], rows, { num: [1, 2, 3, 4], caption: 'Lavoratore senza altre detrazioni. Sopra 15.000 € il trattamento spetta solo in caso di incapienza.' })}
<h2>Il salto a 15.000 euro</h2>
<p>Superare i 15.000 € di reddito (circa 16.520 € di RAL) fa perdere 1.200 € di trattamento integrativo. Il taglio del cuneo fiscale attenua il problema con la somma esente, ma resta uno scalino: con 16.000 € di reddito il netto può essere inferiore a quello con 14.900 €. Il nostro <a href="/">calcolatore stipendio netto</a> lo mostra in modo trasparente.</p>
<h2>Storia: dal bonus Renzi al trattamento integrativo</h2>
${table(['Periodo', 'Misura', 'Importo'], [
  ['2014–2020', 'Bonus Renzi (bonus 80 euro)', '960 € l\'anno fino a 26.600 € di reddito'],
  ['Luglio 2020–2021', 'Trattamento integrativo + ulteriore detrazione', '1.200 € fino a 28.000 €; detrazione decrescente fino a 40.000 €'],
  ['2022–2024', 'Trattamento integrativo', '1.200 € fino a 15.000 €; fino a 28.000 € se incapienti'],
  ['<strong>2025–2026</strong>', 'Trattamento integrativo + cuneo fiscale (L. 207/2024)', '1.200 € fino a 15.000 €; somma esente fino a 20.000 €; ulteriore detrazione 1.000 € fino a 40.000 €']
])}
`; }
},

/* ============================== ADDIZIONALI REGIONALI ============================== */
{
  path: '/irpef/addizionale-regionale-2026/', priority: '0.8',
  title: 'Addizionale Regionale IRPEF 2026: Aliquote di Tutte le Regioni (Tabella)',
  description: 'Aliquote addizionale regionale IRPEF 2026 per tutte le 21 regioni e province autonome, dal Dipartimento delle Finanze: scaglioni, esenzioni, detrazioni e quanto si paga con 20, 30 e 45 mila euro.',
  h1: 'Addizionale regionale IRPEF 2026: aliquote per regione', short: 'Addizionali regionali 2026',
  lead: 'La tabella ufficiale delle aliquote 2026 di ogni regione, con esenzioni e detrazioni, e il calcolatore per sapere quanto paghi tu.',
  answer: `L'<strong>addizionale regionale IRPEF 2026</strong> va dall'<strong>1,23%</strong> (aliquota minima: Veneto, Sicilia, Sardegna, Basilicata, Valle d'Aosta, Lombardia e Marche nel primo scaglione) al <strong>3,63%</strong> del Molise oltre 28.000 €. Con 30.000 € di reddito si pagano ${eur(byCost[0][1], 0)} in ${regioni[byCost[0][0]].nome} e ${eur(byCost[byCost.length - 1][1], 0)} in ${regioni[byCost[byCost.length - 1][0]].nome}. Si calcola sul reddito imponibile IRPEF e si paga l'anno successivo in 11 rate in busta paga.`,
  crumbs: [['IRPEF', '/calcolo-irpef/'], ['Addizionale regionale 2026', '/irpef/addizionale-regionale-2026/']],
  section: 'Guide IRPEF', about: ['Addizionale regionale IRPEF', 'Regioni'],
  tool: { type: 'regionale', defaults: { reddito: 30000, regione: 'lazio' } }, appName: 'Calcolatore addizionale regionale IRPEF 2026',
  dataset: { name: 'Aliquote addizionale regionale IRPEF 2026', description: 'Aliquote per scaglione, esenzioni e detrazioni dell\'addizionale regionale IRPEF 2026 per le 21 regioni e province autonome italiane.', keywords: ['addizionale regionale', 'IRPEF', '2026'], distribution: [{ '@type': 'DataDownload', encodingFormat: 'application/json', contentUrl: 'https://www.calcoloral.com/dati/parametri-2026.json' }] },
  related: ['/', '/calcolo-irpef/', '/calcolo-pensione-netta/', '/ral/30000/'],
  faq: [
    ['Qual è la regione con l\'addizionale IRPEF più bassa?', 'Veneto, Sicilia, Sardegna, Basilicata e Valle d\'Aosta applicano l\'aliquota minima dell\'1,23% su tutto il reddito; la Valle d\'Aosta esenta i redditi fino a 15.000 € e Trento esenta fino a 30.000 €.'],
    ['Qual è la regione con l\'addizionale più alta?', 'Il Molise (3,63% oltre 28.000 €), seguito da Lazio, Campania, Piemonte, Umbria, Abruzzo ed Emilia-Romagna, che arrivano al 3,33% nello scaglione più alto.'],
    ['Quando si paga l\'addizionale regionale?', 'Per i dipendenti viene trattenuta in busta paga l\'anno successivo, in 11 rate da gennaio a novembre. Per gli autonomi con la dichiarazione dei redditi.'],
    ['Su quale reddito si calcola?', 'Sul reddito complessivo IRPEF al netto degli oneri deducibili, lo stesso imponibile dell\'IRPEF nazionale. È dovuta solo se è dovuta l\'IRPEF: chi è nella no tax area non la paga.'],
    ['Conta la residenza o il luogo di lavoro?', 'La residenza (domicilio fiscale) al 1° gennaio dell\'anno di riferimento. Se ti trasferisci a febbraio, per quell\'anno paghi l\'addizionale della vecchia regione.'],
    ['Le aliquote 2026 sono definitive?', 'Le regioni possono deliberare entro il termine per il bilancio; i valori riportati sono quelli pubblicati dal Dipartimento delle Finanze tra gennaio e giugno 2026. Molise e Puglia hanno aggiornato le aliquote a giugno e maggio 2026 per il disavanzo sanitario.']
  ],
  sources: [SRC.mef, SRC.mefCom],
  body: () => `
<h2>Tabella aliquote addizionale regionale 2026</h2>
${table(['Regione', 'Aliquote per scaglione di reddito (€)', 'Esenzioni e detrazioni', '20.000 €', '30.000 €', '45.000 €'], sorted.map(regRow), { num: [3, 4, 5], caption: 'Fonte: Dipartimento delle Finanze, tabelle pubblicate gennaio–giugno 2026. Le ultime tre colonne mostrano l\'importo annuo dovuto per un reddito imponibile di 20.000, 30.000 e 45.000 €, senza detrazioni per figli.' })}
<h2>Classifica: quanto costa la regione con 30.000 € di reddito</h2>
${table(['Posizione', 'Regione', 'Addizionale annua', 'Al mese'], byCost.map(([k, v], i) => [i + 1, regioni[k].nome, eur(v, 0), eur(v / 12, 0)]), { num: [2, 3] })}
<h2>Come si calcola</h2>
<p>L'addizionale regionale si calcola sul reddito imponibile IRPEF. Nella maggior parte delle regioni funziona <strong>per scaglioni</strong>, come l'IRPEF: ogni aliquota si applica solo alla quota di reddito dello scaglione. Alcune regioni (Friuli Venezia Giulia, Lazio, Umbria) prevedono invece un'aliquota ridotta che si applica <strong>sull'intero reddito</strong> se non supera una soglia: superarla di un euro fa scattare le aliquote piene su tutto.</p>
<div class="formula">Esempio Lombardia, reddito 30.000 €:
15.000 × 1,23% = 184,50 €
13.000 × 1,58% = 205,40 €
 2.000 × 1,72% =  34,40 €
Totale          = 424,30 €</div>
<h2>Addizionale comunale</h2>
<p>A quella regionale si somma l'<strong>addizionale comunale</strong>, decisa da ogni comune fino a un massimo dello 0,8% (0,9% per Roma, che può arrivare all'1,2%). Molti comuni prevedono una soglia di esenzione (tipicamente tra 8.000 e 15.000 €). Si paga a saldo l'anno successivo (da gennaio a novembre) e in acconto del 30% nell'anno in corso (da marzo a novembre). Il nostro calcolatore usa lo 0,8% come valore predefinito: inserisci quello del tuo comune per il netto esatto.</p>
<h2>Note per regione</h2>
<ul>
<li><strong>Bolzano</strong>: detrazione di 430,50 € per redditi fino a 90.000 €, più 340 € per figlio a carico — nella pratica l'addizionale si azzera fino a circa 35.000 €.</li>
<li><strong>Trento</strong>: deduzione di 30.000 € per redditi fino a 30.000 €: chi non supera la soglia non paga nulla.</li>
<li><strong>Valle d'Aosta</strong>: esenzione totale fino a 15.000 €.</li>
<li><strong>Lazio</strong>: 1,73% sull'intero reddito fino a 28.000 €; detrazione di 60 € tra 28.001 e 30.000 €; 3,33% oltre.</li>
<li><strong>Umbria</strong>: 1,23% sull'intero reddito fino a 28.000 €; detrazione di 150 € tra 28.001 e 50.000 €.</li>
<li><strong>Friuli Venezia Giulia</strong>: 0,70% fino a 15.000 €, poi 1,23% sull'intero reddito.</li>
<li><strong>Veneto</strong>: 0,90% per disabili e famiglie con disabili a carico, fino a 50.000 €.</li>
<li><strong>Piemonte, Puglia, Campania, Sardegna, Marche</strong>: detrazioni o aliquote ridotte per figli a carico o con disabilità.</li>
</ul>
`
}
];
