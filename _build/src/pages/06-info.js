'use strict';
const { CR, eur, SRC, table } = require('../lib/h.js');

module.exports = [
{
  path: '/metodologia/', priority: '0.5', utility: true,
  title: 'Metodologia e Fonti: Come Calcoliamo lo Stipendio Netto 2026',
  description: 'Come funziona il motore di calcolo di CalcoloRAL: parametri 2026, formule, fonti ufficiali (Legge di Bilancio, TUIR, circolari INPS, Dipartimento delle Finanze), limiti e data di aggiornamento.',
  h1: 'Metodologia e fonti dei calcoli', short: 'Come calcoliamo',
  lead: 'Ogni numero del sito è prodotto da un unico motore di calcolo con parametri pubblici e verificabili. Qui trovi formule, fonti e limiti.',
  answer: 'I calcoli di CalcoloRAL usano i parametri fiscali e contributivi in vigore per il periodo d\'imposta 2026, presi da fonti ufficiali e aggiornati il 27 ottobre 2026. Il motore è codice aperto e gira nel tuo browser: i dati inseriti non lasciano mai il tuo dispositivo.',
  crumbs: [['Metodologia', '/metodologia/']], section: 'Informazioni',
  related: ['/', '/irpef/scaglioni-2026/', '/irpef/addizionale-regionale-2026/'],
  sources: [SRC.bilancio2026, SRC.l207, SRC.tuir13, SRC.dl3, SRC.inps6, SRC.inps4, SRC.mef, SRC.cc2120, SRC.forf, SRC.ccnlComm, SRC.ccnlMet],
  body: () => `
<h2>Parametri 2026 in uso</h2>
${table(['Parametro', 'Valore', 'Fonte'], [
  ['Scaglioni IRPEF', '23% ≤ 28.000 · 33% ≤ 50.000 · 43% oltre', 'Legge di Bilancio 2026, art. 1 c. 3-4'],
  ['Detrazione lavoro dipendente', '1.955 € ≤ 15.000; formule art. 13 TUIR; +65 € tra 25.000 e 35.000', 'TUIR art. 13'],
  ['Detrazione pensione', '1.955 € ≤ 8.500; formule art. 13 c. 3; +50 € tra 25.000 e 29.000', 'TUIR art. 13'],
  ['Somma esente cuneo fiscale', '7,1% ≤ 8.500 · 5,3% ≤ 15.000 · 4,8% ≤ 20.000 (reddito complessivo ≤ 20.000)', 'L. 207/2024 art. 1 c. 4-5'],
  ['Ulteriore detrazione', '1.000 € tra 20.000 e 32.000; 1.000 × (40.000 − R) / 8.000 fino a 40.000', 'L. 207/2024 art. 1 c. 6'],
  ['Trattamento integrativo', '1.200 € ≤ 15.000 (con IRPEF > detrazione − 75); incapienza fino a 28.000', 'DL 3/2020 art. 1'],
  ['Contributi INPS dipendente', '9,19% · 9,49% industria >15 dip. · 5,84% apprendisti · +1% oltre 56.224 €', 'Circolare INPS 6/2026'],
  ['Massimale contributivo', '122.295 €', 'Circolare INPS 6/2026'],
  ['Addizionali regionali', 'Tabelle 2026 per 21 regioni/province', 'Dipartimento delle Finanze'],
  ['Addizionale comunale', '0,8% predefinita, modificabile', 'Dipartimento delle Finanze'],
  ['NASpI', '75% ≤ 1.456,72 · +25% oltre · max 1.584,70 · −3%/mese dal 6° (8° over 55)', 'Circolare INPS 4/2026'],
  ['TFR', 'RAL/13,5 − 0,5%; rivalutazione 1,5% + 75% FOI; 17% su rivalutazioni; tassazione separata', 'C.c. art. 2120; TUIR artt. 17, 19'],
  ['Gestione separata', '26,07%; minimale 18.808 €; massimale 122.295 €', 'INPS 2026'],
  ['Forfettario', 'Coefficienti ATECO; 15% (5% start-up)', 'L. 190/2014'],
  ['CCNL Commercio', 'Minimi dal 1° novembre 2026, 14 mensilità', 'Confcommercio rinnovo 22/03/2024'],
  ['CCNL Metalmeccanici', 'Minimi dal 1° giugno 2026 (IPCA 1,9%), 13 mensilità', 'Federmeccanica-Assistal']
])}
<p>Tutti i parametri sono pubblicati in formato aperto: <a href="/dati/parametri-2026.json">parametri-2026.json</a> (licenza CC BY 4.0). Puoi citarli e riutilizzarli indicando la fonte.</p>
<h2>Ordine delle operazioni</h2>
<ol>
<li>Contributi INPS sul lordo (fino al massimale), con l'1% aggiuntivo oltre la prima fascia.</li>
<li>Reddito imponibile = lordo − contributi (+ eventuali altri redditi).</li>
<li>IRPEF lorda per scaglioni.</li>
<li>Detrazione per lavoro dipendente (o pensione) e ulteriore detrazione, fino a capienza dell'imposta.</li>
<li>Trattamento integrativo e somma esente, se spettanti.</li>
<li>Addizionale regionale (scaglioni, aliquote ridotte, esenzioni e detrazioni regionali) e comunale, solo se è dovuta l'IRPEF.</li>
<li>Netto annuo e divisione per le mensilità.</li>
</ol>
<h2>Cosa non consideriamo (e perché)</h2>
<ul>
<li><strong>Familiari a carico</strong>: le detrazioni per coniuge e figli over 21 dipendono da situazioni individuali; il risultato è quindi quello di un lavoratore senza carichi.</li>
<li><strong>Oneri detraibili e deducibili</strong> (spese mediche, mutuo, previdenza complementare, ristrutturazioni): vengono recuperati con il 730, non in busta.</li>
<li><strong>Conguagli e rateizzazioni</strong>: in busta le addizionali si pagano l'anno successivo; noi le imputiamo all'anno di competenza per mostrare il netto reale.</li>
<li><strong>Fringe benefit, welfare, premi detassati</strong>: hanno regole proprie e di norma aumentano il netto rispetto al nostro calcolo.</li>
<li><strong>Pubblico impiego</strong>: aliquote contributive diverse (8,80% + 0,35% fondo credito).</li>
</ul>
<h2>Verifica e aggiornamento</h2>
<p>Il motore è testato su casi noti e confrontato con i risultati di almeno tre simulatori indipendenti. I parametri sono aggiornati a ogni Legge di Bilancio, circolare INPS di gennaio e pubblicazione delle tabelle regionali. Ultimo aggiornamento: <strong>27 ottobre 2026</strong>. Hai trovato una discrepanza? <a href="/contatti/">Scrivici</a> indicando i dati inseriti.</p>
`
},
{
  path: '/chi-siamo/', priority: '0.3', utility: true,
  title: 'Chi Siamo | CalcoloRAL',
  description: 'CalcoloRAL è un progetto indipendente di Omnia Ventures: calcolatori gratuiti per stipendio netto, RAL, busta paga, TFR e IRPEF, aggiornati alle norme fiscali italiane.',
  h1: 'Chi siamo', short: 'Chi siamo',
  lead: 'Un progetto indipendente nato per rendere trasparente il passaggio dal lordo al netto.',
  crumbs: [['Chi siamo', '/chi-siamo/']], section: 'Informazioni', article: false,
  related: ['/metodologia/', '/contatti/'],
  body: () => `
<h2>Il progetto</h2>
<p>CalcoloRAL nasce da una constatazione semplice: la maggior parte delle persone firma un contratto di lavoro senza sapere esattamente quanto riceverà ogni mese. Le regole fiscali italiane cambiano quasi ogni anno — scaglioni, detrazioni, cuneo fiscale, addizionali — e i calcolatori disponibili spesso restano fermi a parametri vecchi.</p>
<p>Il nostro obiettivo è offrire strumenti <strong>gratuiti, aggiornati e verificabili</strong>: ogni formula è pubblicata nella pagina di <a href="/metodologia/">metodologia</a>, ogni parametro ha la sua fonte ufficiale, e il motore di calcolo gira interamente nel tuo browser senza raccogliere dati.</p>
<h2>Chi c'è dietro</h2>
<p>CalcoloRAL è sviluppato e mantenuto da <strong>Omnia Ventures</strong>, che realizza strumenti digitali di pubblica utilità. La redazione aggiorna i parametri a ogni novità normativa e risponde alle segnalazioni degli utenti.</p>
<h2>Indipendenza e pubblicità</h2>
<p>Il sito è sostenuto da inserzioni pubblicitarie (Google AdSense). Non vendiamo consulenze, non raccogliamo contatti per terzi e non abbiamo accordi con CAF, consulenti o software paghe. I risultati dei calcolatori sono indipendenti dagli annunci mostrati.</p>
<h2>Limiti</h2>
<p>I calcolatori forniscono stime a scopo informativo. Per la tua situazione specifica (familiari a carico, più datori di lavoro, redditi esteri, regimi speciali) rivolgiti a un consulente del lavoro, a un commercialista o a un CAF.</p>
`
},
{
  path: '/contatti/', priority: '0.3', utility: true,
  title: 'Contatti | CalcoloRAL',
  description: 'Contatta la redazione di CalcoloRAL per segnalare un errore nei calcoli, proporre un nuovo calcolatore o richieste relative alla privacy.',
  h1: 'Contatti', short: 'Contatti',
  lead: 'Segnalazioni, correzioni e proposte sono benvenute.',
  crumbs: [['Contatti', '/contatti/']], section: 'Informazioni', article: false,
  related: ['/metodologia/', '/chi-siamo/'],
  body: () => `
<h2>Scrivici</h2>
<p>Email: <a href="mailto:contatti@calcoloral.com">contatti@calcoloral.com</a></p>
<p>Rispondiamo di norma entro 3 giorni lavorativi. Per segnalare un risultato che ritieni errato, indica il calcolatore usato, i valori inseriti e il risultato atteso: così possiamo verificare rapidamente.</p>
<h2>Cosa possiamo fare</h2>
<ul>
<li>Correggere parametri o formule non aggiornati.</li>
<li>Aggiungere un calcolatore o un CCNL che ti serve.</li>
<li>Gestire richieste relative ai tuoi dati personali (vedi <a href="/privacy/">privacy</a>).</li>
</ul>
<h2>Cosa non possiamo fare</h2>
<p>Non forniamo consulenza fiscale o del lavoro individuale, non interveniamo su buste paga o pratiche INPS e non rispondiamo a richieste di calcolo personalizzato: usa i calcolatori, che coprono la quasi totalità dei casi.</p>
<p><strong>Titolare</strong>: Omnia Ventures — Tando Adam, Sindh, Pakistan. Sito operato in lingua italiana per utenti residenti in Italia.</p>
`
},
{
  path: '/privacy/', priority: '0.2', utility: true,
  title: 'Informativa Privacy | CalcoloRAL',
  description: 'Informativa sulla privacy di CalcoloRAL ai sensi del GDPR: dati trattati, cookie, pubblicità Google AdSense, diritti dell\'utente.',
  h1: 'Informativa sulla privacy', short: 'Privacy',
  crumbs: [['Privacy', '/privacy/']], section: 'Informazioni', article: false,
  related: ['/cookie/', '/contatti/'],
  body: () => `
<h2>1. Titolare del trattamento</h2>
<p>Omnia Ventures, 16 Phase 1, Green City, Tando Adam 68160, Sindh, Pakistan — email <a href="mailto:contatti@calcoloral.com">contatti@calcoloral.com</a>.</p>
<h2>2. Dati inseriti nei calcolatori</h2>
<p>I valori che inserisci (RAL, regione, ore, ecc.) vengono elaborati <strong>esclusivamente nel tuo browser</strong> e non vengono trasmessi né memorizzati dai nostri server. La funzione "Copia link al risultato" inserisce i valori nell'indirizzo della pagina solo sul tuo dispositivo.</p>
<h2>3. Dati di navigazione</h2>
<p>Il server di hosting registra automaticamente, nei log, indirizzo IP, data e ora, pagina richiesta e browser, per finalità di sicurezza e statistica aggregata. I log sono conservati per un massimo di 30 giorni. Base giuridica: legittimo interesse (art. 6.1.f GDPR).</p>
<h2>4. Pubblicità e cookie</h2>
<p>Il sito ospita annunci di Google AdSense. Google, in qualità di titolare autonomo, può utilizzare cookie e identificatori per mostrare annunci personalizzati in base alle tue visite su questo e altri siti. Per gli utenti nello Spazio Economico Europeo e nel Regno Unito, gli annunci personalizzati vengono mostrati solo previo consenso tramite il banner conforme al TCF di IAB Europe; in assenza di consenso vengono mostrati annunci non personalizzati. Puoi modificare le tue scelte in qualsiasi momento dalla <a href="/cookie/">pagina cookie</a> e disattivare la personalizzazione su <a href="https://adssettings.google.com" rel="noopener">adssettings.google.com</a>. Informativa Google: <a href="https://policies.google.com/technologies/partner-sites" rel="noopener">policies.google.com/technologies/partner-sites</a>.</p>
<h2>5. Diritti dell'interessato</h2>
<p>Ai sensi degli artt. 15-22 GDPR puoi chiedere accesso, rettifica, cancellazione, limitazione, portabilità e opporti al trattamento scrivendo a <a href="mailto:contatti@calcoloral.com">contatti@calcoloral.com</a>. Hai diritto di proporre reclamo al Garante per la protezione dei dati personali (www.garanteprivacy.it).</p>
<h2>6. Trasferimenti extra-UE</h2>
<p>I servizi Google possono comportare trasferimenti verso gli Stati Uniti sulla base del Data Privacy Framework UE-USA e delle clausole contrattuali standard. Il titolare ha sede in Pakistan: i dati di log sono trattati su server situati nell'Unione Europea.</p>
<h2>7. Minori</h2>
<p>Il sito non è rivolto a minori di 16 anni e non raccoglie consapevolmente loro dati.</p>
<h2>8. Modifiche</h2>
<p>Ultimo aggiornamento: 27 ottobre 2026. Le modifiche saranno pubblicate in questa pagina.</p>
`
},
{
  path: '/cookie/', priority: '0.2', utility: true,
  title: 'Cookie Policy | CalcoloRAL',
  description: 'Cookie policy di CalcoloRAL: cookie tecnici, cookie pubblicitari di Google AdSense, come gestire il consenso e disattivarli.',
  h1: 'Cookie policy', short: 'Cookie',
  crumbs: [['Cookie', '/cookie/']], section: 'Informazioni', article: false,
  related: ['/privacy/', '/contatti/'],
  body: () => `
<h2>Cookie tecnici</h2>
<p>Il sito non utilizza cookie tecnici propri né strumenti di analisi che installano cookie. Nessuna preferenza viene salvata sul tuo dispositivo da CalcoloRAL.</p>
<h2>Cookie di terze parti (pubblicità)</h2>
<p>Google AdSense e i suoi partner certificati possono installare cookie e utilizzare identificatori per: mostrare annunci, misurarne l'efficacia, limitare la frequenza, prevenire frodi e — solo con il tuo consenso — personalizzare gli annunci. L'elenco dei partner pubblicitari e le loro informative sono disponibili nel banner di consenso e nella pagina <a href="https://support.google.com/admanager/answer/9012903" rel="noopener">fornitori di tecnologia pubblicitaria di Google</a>.</p>
<h2>Gestire il consenso</h2>
<ul>
<li>Al primo accesso dallo Spazio Economico Europeo, dal Regno Unito o dalla Svizzera compare il banner di consenso: puoi accettare, rifiutare o personalizzare le scelte.</li>
<li>Puoi riaprire le impostazioni in qualsiasi momento tramite il link "Impostazioni privacy e cookie" presente nel banner di Google o cancellando i cookie dal browser.</li>
<li>Puoi disattivare la personalizzazione degli annunci su <a href="https://adssettings.google.com" rel="noopener">adssettings.google.com</a> e tramite <a href="https://www.youronlinechoices.com/it/" rel="noopener">youronlinechoices.com</a>.</li>
</ul>
<h2>Disattivare i cookie dal browser</h2>
<p>Tutti i browser consentono di bloccare o eliminare i cookie dalle impostazioni (Chrome, Firefox, Safari, Edge). Bloccando i cookie di terze parti il sito continua a funzionare normalmente: i calcolatori non ne hanno bisogno.</p>
<p>Ultimo aggiornamento: 27 ottobre 2026.</p>
`
}
];
