'use strict';
const { CR, eur, fmt, pct, SRC, netto, table } = require('../lib/h.js');

function ccnlRows(key) {
  const c = CR.P.ccnl[key];
  return c.livelli.map(l => {
    const mens = l.minimo + (l.contingenza || 0) + (l.indennita || 0);
    const ral = mens * c.mensilita;
    const n = netto(ral, { mensilita: c.mensilita });
    return [l.nome, eur(mens), eur(ral, 0), eur(n.nettoMensile, 0), eur(n.nettoAnnuo, 0)];
  });
}

module.exports = [
{
  path: '/ccnl/commercio/', priority: '0.8',
  title: 'CCNL Commercio 2026: Stipendio Netto per Livello (Tabella Minimi)',
  description: 'Stipendio netto CCNL Commercio e Terziario Confcommercio 2026 per livello: minimi tabellari dal 1° novembre 2026 (Quadro, 1°-7° livello), lordo mensile su 14 mensilità e netto in busta. Calcolatore e tabella.',
  h1: 'CCNL Commercio: stipendio netto per livello 2026', short: 'CCNL Commercio: netto per livello',
  appName: 'Calcolatore netto CCNL Commercio per livello',
  lead: 'I minimi retributivi del Terziario Confcommercio aggiornati all\'ultima tranche e il netto corrispondente per ogni livello, con 14 mensilità.',
  tool: { type: 'ccnl', defaults: { ccnl: 'commercio', livello: '4' } },
  answer: (() => { const r = ccnlRows('commercio'); return `Nel <strong>CCNL Commercio</strong> (Terziario, Distribuzione e Servizi — Confcommercio) il <strong>IV livello</strong>, il più diffuso, ha un minimo di ${r[4][1]} lordi al mese (paga base + contingenza) per 14 mensilità, pari a una RAL di ${r[4][2]} e a circa <strong>${r[4][3]} netti al mese</strong>. Il III livello arriva a ${r[3][3]} netti, il II a ${r[2][3]}, il Quadro a ${r[0][3]}.`; })(),
  crumbs: [['CCNL', '/ccnl/commercio/'], ['Commercio', '/ccnl/commercio/']],
  section: 'CCNL', about: ['CCNL Commercio', 'CCNL Terziario Confcommercio', 'Livelli retributivi'],
  related: ['/ccnl/metalmeccanico/', '/calcolo-quattordicesima/', '/part-time/', '/ral/25000/', '/calcolo-busta-paga/'],
  faq: [
    ['Quanto guadagna un 4° livello commercio nel 2026?', (() => { const r = ccnlRows('commercio')[4]; return `${r[1]} lordi al mese dal 1° novembre 2026 (minimo tabellare 1.292,46 € + contingenza 524,22 €), cioè ${r[2]} di RAL su 14 mensilità e circa ${r[3]} netti al mese al minimo contrattuale, senza scatti né superminimo.`; })()],
    ['Quanto guadagna un 3° livello commercio?', (() => { const r = ccnlRows('commercio')[3]; return `${r[1]} lordi al mese, ${r[2]} di RAL e circa ${r[3]} netti al mese su 14 mensilità.`; })()],
    ['Quanto guadagna un 5° livello commercio?', (() => { const r = ccnlRows('commercio')[5]; return `${r[1]} lordi al mese, ${r[2]} di RAL e circa ${r[3]} netti al mese su 14 mensilità.`; })()],
    ['Quando aumentano gli stipendi del CCNL Commercio?', 'Il rinnovo del 22 marzo 2024 prevede aumenti in più tranche: aprile 2023, aprile 2024, marzo 2025, novembre 2025, novembre 2026 e febbraio 2027. La tranche del 1° novembre 2026 porta il IV livello a 1.292,46 € di minimo tabellare.'],
    ['Il CCNL Commercio ha la quattordicesima?', 'Sì, il contratto prevede 14 mensilità: la tredicesima a dicembre e la quattordicesima entro il 1° luglio, maturata dal 1° luglio al 30 giugno.'],
    ['Quanti scatti di anzianità prevede?', 'Fino a 10 scatti triennali, con importi che vanno da 25,46 € (7° livello) a 36,15 € (1° livello) e 37,21 € (Quadro) al mese per ogni scatto. Chi ha 30 anni nello stesso livello ha 10 scatti.'],
    ['Che mansioni ha il 4° livello?', 'Commessi di vendita, impiegati d\'ordine, magazzinieri, cassieri, addetti alla contabilità semplice, operatori di call center. Il 3° livello comprende commessi specializzati e impiegati di concetto; il 2° livello coordinatori e impiegati con mansioni di responsabilità.']
  ],
  sources: [SRC.ccnlComm, SRC.cnel, SRC.tuir13],
  body: () => {
    const c = CR.P.ccnl.commercio;
    const rows = c.livelli.map(l => [l.nome, eur(l.minimo), eur(l.contingenza), l.indennita ? eur(l.indennita) : '—', eur(l.minimo + l.contingenza + (l.indennita || 0))]);
    return `
<h2>Minimi tabellari CCNL Commercio dal 1° novembre 2026</h2>
${table(['Livello', 'Paga base', 'Contingenza', 'Indennità di funzione', 'Totale lordo mensile'], rows, { num: [1, 2, 3, 4], caption: 'Tranche del 1° novembre 2026 del rinnovo Confcommercio 22 marzo 2024. Esclusi scatti di anzianità, terzo elemento (6,20 €) e superminimi. Prossimo aumento: 1° febbraio 2027.' })}
<h2>Stipendio netto per livello (14 mensilità, 2026)</h2>
${table(['Livello', 'Lordo mensile', 'RAL', 'Netto mensile', 'Netto annuo'], ccnlRows('commercio'), { num: [1, 2, 3, 4], caption: 'Netto in Lombardia, addizionale comunale 0,8%, INPS 9,19%, nessun familiare a carico.' })}
<p>Usa il calcolatore in alto per aggiungere scatti e superminimo, scegliere la regione o simulare un part-time.</p>
<h2>I livelli del CCNL Commercio</h2>
${table(['Livello', 'Figure tipiche'], [
  ['Quadro', 'Responsabili di funzione con autonomia e potere decisionale'],
  ['I livello', 'Responsabili di reparto, direttori di negozio, capi area, analisti senior'],
  ['II livello', 'Impiegati con mansioni di concetto e responsabilità, coordinatori, programmatori, buyer'],
  ['III livello', 'Commessi specializzati, impiegati di concetto, contabili, segretarie di direzione, grafici'],
  ['IV livello', 'Commessi, cassieri, impiegati d\'ordine, magazzinieri qualificati, addetti call center'],
  ['V livello', 'Addetti alle vendite non specializzati, autisti, operai qualificati'],
  ['VI livello', 'Operai comuni, addetti alla pulizia, aiutanti'],
  ['VII livello', 'Lavori di semplice manovalanza, addetti alle pulizie senza qualifica']
])}
<h2>Le tranche di aumento del rinnovo 2024-2027</h2>
<p>Il rinnovo firmato il 22 marzo 2024 (vigenza 2023-2027) ha previsto per il IV livello aumenti complessivi di 240 € a regime: 30 € dal 1° aprile 2023, 30 € dal 1° aprile 2024, 70 € dal 1° marzo 2025, 35 € dal 1° novembre 2025, 35 € dal 1° novembre 2026 e 40 € dal 1° febbraio 2027, oltre a 350 € una tantum pagati a luglio 2024 e luglio 2025. Gli importi per gli altri livelli sono riparametrati.</p>
<h2>Part-time nel commercio</h2>
<p>Il commercio è il settore con più contratti part-time. Un IV livello a 20 ore (50%) ha una RAL di ${eur((c.livelli[4].minimo + c.livelli[4].contingenza) * 14 / 2, 0)} e circa ${eur(netto((c.livelli[4].minimo + c.livelli[4].contingenza) * 14 / 2, { mensilita: 14 }).nettoMensile, 0)} netti al mese; a 30 ore (75%) circa ${eur(netto((c.livelli[4].minimo + c.livelli[4].contingenza) * 14 * 0.75, { mensilita: 14 }).nettoMensile, 0)}. Dettagli nel <a href="/part-time/">calcolatore part-time</a>.</p>
`; }
},

{
  path: '/ccnl/metalmeccanico/', priority: '0.8',
  title: 'CCNL Metalmeccanici 2026: Stipendio Netto per Livello (Minimi da Giugno)',
  description: 'Stipendio netto CCNL Metalmeccanici industria 2026 per livello: minimi Federmeccanica dal 1° giugno 2026 (D1-A1, ex 1ª-8ª categoria), lordo su 13 mensilità e netto in busta paga.',
  h1: 'CCNL Metalmeccanici: stipendio netto per livello 2026', short: 'CCNL Metalmeccanico: netto per livello',
  appName: 'Calcolatore netto CCNL Metalmeccanico per livello',
  lead: 'I minimi tabellari Federmeccanica-Assistal in vigore dal 1° giugno 2026 e il netto in busta paga per ogni livello della classificazione D1-A1.',
  tool: { type: 'ccnl', defaults: { ccnl: 'metalmeccanico', livello: 'c3' } },
  answer: (() => { const r = ccnlRows('metalmeccanico'); return `Nel <strong>CCNL Metalmeccanici industria</strong> il livello <strong>C3 (ex 5ª categoria)</strong>, tipico degli operai specializzati, ha un minimo di ${r[4][1]} lordi al mese dal 1° giugno 2026 per 13 mensilità: RAL ${r[4][2]} e circa <strong>${r[4][3]} netti al mese</strong>. Il D1 (ex 2ª) parte da ${r[0][3]} netti, il B2 (ex 6ª) arriva a ${r[6][3]}, l'A1 (ex 8ª Quadri) a ${r[8][3]}.`; })(),
  crumbs: [['CCNL', '/ccnl/commercio/'], ['Metalmeccanico', '/ccnl/metalmeccanico/']],
  section: 'CCNL', about: ['CCNL Metalmeccanici', 'Federmeccanica', 'Livelli retributivi'],
  related: ['/ccnl/commercio/', '/calcolo-tredicesima/', '/ral/30000/', '/calcolo-busta-paga/'],
  faq: [
    ['Quanto guadagna un metalmeccanico di 5° livello (C3) nel 2026?', (() => { const r = ccnlRows('metalmeccanico')[4]; return `${r[1]} lordi al mese dal 1° giugno 2026, ${r[2]} di RAL su 13 mensilità e circa ${r[3]} netti al mese al minimo, senza superminimi e straordinari.`; })()],
    ['Quanto guadagna un 3° livello metalmeccanico (D2)?', (() => { const r = ccnlRows('metalmeccanico')[1]; return `${r[1]} lordi al mese, RAL ${r[2]}, circa ${r[3]} netti al mese.`; })()],
    ['Il CCNL metalmeccanico ha la quattordicesima?', 'No: prevede 13 mensilità. In compenso prevede un elemento perequativo (485 € a giugno per chi non ha premi aziendali), welfare contrattuale (200 € l\'anno in flexible benefit) e la previdenza integrativa Cometa.'],
    ['Come sono cambiati i livelli dal 2021?', 'Il rinnovo del 5 febbraio 2021 ha sostituito le categorie 1ª-8ª con 9 livelli in 4 gruppi: D1-D2 (ruoli operativi), C1-C3 (ruoli tecnico-specifici), B1-B3 (ruoli specialistici e gestionali), A1 (ruoli di gestione e cambiamento, quadri).'],
    ['Come si calcola l\'aumento IPCA?', 'Dal 2021 i minimi si adeguano ogni giugno all\'inflazione IPCA al netto degli energetici importati, certificata dall\'ISTAT. L\'adeguamento del giugno 2026 è dell\'1,9%: +53,17 € al mese per il C3.'],
    ['Quali contributi INPS pagano i metalmeccanici?', 'Il 9,19% nelle aziende fino a 15 dipendenti e il 9,49% in quelle oltre 15 dipendenti (0,30% di contributo CIGS). Il calcolatore usa il 9,19%: seleziona "Industria" nelle opzioni avanzate per il 9,49%.']
  ],
  sources: [SRC.ccnlMet, SRC.cnel, SRC.inps6],
  body: () => {
    const c = CR.P.ccnl.metalmeccanico;
    const old = { d1: '1.742,03', d2: '1.931,78', c1: '1.973,51', c2: '2.015,24', c3: '2.158,26', b1: '2.313,34', b2: '2.481,84', b3: '2.770,74', a1: '2.837,12' };
    const rows = c.livelli.map(l => [l.nome, old[l.id] + ' €', eur(l.minimo), eur(l.minimo * 13, 0)]);
    const rows949 = c.livelli.map(l => { const n = netto(l.minimo * 13, { mensilita: 13, inps: 'industria' }); return [l.nome, eur(l.minimo), eur(n.nettoMensile, 0), eur(n.nettoAnnuo, 0)]; });
    return `
<h2>Minimi tabellari dal 1° giugno 2026 (Federmeccanica-Assistal)</h2>
${table(['Livello', 'Minimo giugno 2025', 'Minimo giugno 2026', 'RAL (13 mensilità)'], rows, { num: [1, 2, 3], caption: 'Adeguamento IPCA-NEI 2026 dell\'1,9%. Esclusi scatti, superminimi, premi di risultato ed elemento perequativo.' })}
<h2>Stipendio netto per livello (13 mensilità, INPS 9,19%)</h2>
${table(['Livello', 'Lordo mensile', 'RAL', 'Netto mensile', 'Netto annuo'], ccnlRows('metalmeccanico'), { num: [1, 2, 3, 4], caption: 'Lombardia, addizionale comunale 0,8%, nessun familiare a carico.' })}
<h2>Netto con contributo CIGS (aziende oltre 15 dipendenti, 9,49%)</h2>
${table(['Livello', 'Lordo mensile', 'Netto mensile', 'Netto annuo'], rows949, { num: [1, 2, 3] })}
<h2>La classificazione D1–A1</h2>
${table(['Livello', 'Ex categoria', 'Ruoli'], [
  ['D1', '2ª', 'Operai comuni, addetti a lavori semplici'],
  ['D2', '3ª', 'Operai qualificati, addetti a macchine, impiegati d\'ordine'],
  ['C1', '3ª super', 'Operai qualificati con autonomia, montatori, impiegati esecutivi'],
  ['C2', '4ª', 'Operai specializzati, manutentori, impiegati tecnici'],
  ['C3', '5ª', 'Operai specializzati provetti, capi squadra, impiegati di concetto'],
  ['B1', '5ª super', 'Tecnici specializzati, programmatori CNC esperti, impiegati con autonomia'],
  ['B2', '6ª', 'Impiegati direttivi, progettisti, capi reparto'],
  ['B3', '7ª', 'Responsabili di area tecnica, impiegati con elevata responsabilità'],
  ['A1', '8ª Quadri', 'Quadri: responsabili di funzione']
])}
<h2>Oltre il minimo: le voci che alzano lo stipendio</h2>
<ul>
<li><strong>Elemento perequativo</strong>: 485 € a giugno per chi lavora in aziende senza contrattazione di secondo livello.</li>
<li><strong>Flexible benefit</strong>: 200 € l'anno in welfare, esenti da tasse.</li>
<li><strong>Premio di risultato</strong>: contrattato in azienda, con tassazione agevolata al 5% fino a 3.000 €.</li>
<li><strong>Straordinario</strong>: maggiorazioni dal 25% (feriale) al 50% (festivo) e 55% (notturno festivo).</li>
<li><strong>Scatti di anzianità</strong>: 5 scatti biennali, dai 18 ai 36 € circa al mese secondo il livello.</li>
<li><strong>Cometa</strong>: fondo pensione di categoria con contributo aziendale del 2% in aggiunta a quello del lavoratore.</li>
</ul>
<p>Per confrontare con un altro settore vedi il <a href="/ccnl/commercio/">netto per livello del CCNL Commercio</a>.</p>
`; }
}
];
