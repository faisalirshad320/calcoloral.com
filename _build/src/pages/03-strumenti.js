'use strict';
const { CR, eur, fmt, pct, SRC, netto, table } = require('../lib/h.js');

const B28 = CR.calcolaBustaPaga({ ral: 28000, mensilita: 14, regione: 'lombardia', comunale: 0.8 });
const T30 = CR.calcolaTfr({ ral: 30000, anni: 10, inflazione: 1.7 });
const TR = CR.calcolaMensilitaAggiuntiva({ lordoMensile: 1800, mesi: 12, mensilita: 13 });
const NA = CR.calcolaNaspi({ retribuzioneMedia: 1800, settimane: 208 });
const PE = CR.calcolaPensioneNetta({ lordoMensile: 1500, regione: 'lombardia', comunale: 0.8 });
const IR = CR.calcolaIrpef({ reddito: 35000, tipo: 'dipendente' });
const FO = CR.calcolaForfettario({ ricavi: 40000, coefficiente: 78 });
const PT = netto(15000, { mensilita: 14 }), PTF = netto(30000, { mensilita: 14 });

module.exports = [
/* ============================== BUSTA PAGA ============================== */
{
  path: '/calcolo-busta-paga/', priority: '0.8',
  title: 'Calcolo Busta Paga 2026: Simulatore dal Lordo al Netto Mensile',
  description: 'Simulatore busta paga 2026: inserisci il lordo e vedi tutte le voci del cedolino — contributi INPS, IRPEF, detrazioni, addizionali — fino al netto mensile. Gratis e senza registrazione.',
  h1: 'Calcolo busta paga 2026: simulatore dal lordo al netto', short: 'Simulatore busta paga',
  appName: 'Simulatore busta paga 2026',
  lead: 'Ricostruisci il tuo cedolino voce per voce: dalla retribuzione lorda ai contributi, dall\'IRPEF alle detrazioni, fino al netto che trovi sul conto.',
  tool: { type: 'busta', defaults: { ral: 28000, mensilita: 14 } },
  answer: `Con una <strong>RAL di 28.000 € su 14 mensilità</strong> la busta paga 2026 di un mese ordinario riporta ${eur(28000 / 14)} di lordo, ${eur(B28.annuale.inps / 14)} di contributi INPS, ${eur(B28.annuale.irpefNetta / 14)} di IRPEF netta e ${eur((B28.annuale.addizionaleRegionale + B28.annuale.addizionaleComunale) / 14)} di addizionali: il <strong>netto è di circa ${eur(B28.annuale.nettoMensile)}</strong>.`,
  section: 'Calcolatori', about: ['Busta paga', 'Cedolino', 'Trattenute'],
  howto: { name: 'Come leggere la busta paga', steps: [
    ['Parte alta: dati e inquadramento', 'Controlla CCNL, livello, qualifica, data di assunzione e il numero di mensilità: determinano i minimi retributivi.'],
    ['Corpo: competenze e trattenute', 'Le competenze sommano paga base, contingenza, scatti e superminimo; le trattenute sono contributi INPS, IRPEF e addizionali.'],
    ['Parte bassa: imponibili e netto', 'Imponibile previdenziale, imponibile fiscale, imposta lorda, detrazioni e infine il netto da pagare. Confronta con il simulatore.']
  ] },
  related: ['/', '/calcolo-tredicesima/', '/calcolo-tfr/', '/irpef/detrazioni-lavoro-dipendente-2026/', '/lordo-netto/'],
  faq: [
    ['Quali sono le trattenute in busta paga nel 2026?', 'Contributi INPS a carico del lavoratore (9,19%, 9,49% nell\'industria), IRPEF per scaglioni (23%, 33%, 43%) al netto delle detrazioni, addizionale regionale e comunale. Possono aggiungersi quote sindacali, fondi di previdenza complementare, cessioni del quinto e pignoramenti.'],
    ['Perché la busta paga di gennaio è più bassa?', 'A gennaio partono le rate delle addizionali dell\'anno precedente e, se la RAL è cambiata, il nuovo calcolo delle detrazioni. A dicembre invece c\'è il conguaglio, che può essere a credito o a debito.'],
    ['Cos\'è l\'imponibile previdenziale?', 'È la retribuzione su cui si calcolano i contributi INPS: lordo meno eventuali somme esenti (es. quota di welfare, trasferte entro i limiti). Di norma coincide con il lordo.'],
    ['Cos\'è il conguaglio di fine anno?', 'A dicembre il datore di lavoro ricalcola IRPEF e detrazioni sull\'intero anno. Se durante l\'anno ha trattenuto troppo, restituisce la differenza; se ha trattenuto poco, la recupera.'],
    ['Come si calcola il netto di un mese con straordinari?', 'Gli straordinari si sommano al lordo del mese e sono tassati con la stessa aliquota marginale: su 100 € lordi di straordinario a un reddito di 30.000 € restano circa 65-68 € netti.'],
    ['Il simulatore vale per la pubblica amministrazione?', 'La logica fiscale è la stessa, ma i dipendenti pubblici hanno aliquote contributive diverse (8,80% + 0,35%); usa l\'opzione standard per una stima indicativa.']
  ],
  sources: [SRC.tuir13, SRC.inps6, SRC.l207, SRC.mef],
  body: () => `
<h2>Esempio di busta paga: RAL 28.000 €, 14 mensilità, Lombardia</h2>
${table(['Voce del cedolino', 'Importo mensile', 'Note'], [
  ['Retribuzione lorda', eur(B28.voci[0].importo), 'RAL ÷ 14'],
  ['Contributi INPS 9,19%', '− ' + eur(B28.voci[1].importo), 'A carico del dipendente'],
  ['<strong>Imponibile fiscale</strong>', eur(B28.voci[2].importo), 'Base IRPEF'],
  ['IRPEF lorda', '− ' + eur(B28.voci[3].importo), '23% fino a 28.000 € di reddito'],
  ['Detrazione lavoro dipendente', '+ ' + eur(B28.voci[4].importo), 'Art. 13 TUIR, +65 € tra 25 e 35 mila'],
  ['Ulteriore detrazione cuneo', '+ ' + eur(B28.voci[5].importo), '1.000 € l\'anno ÷ 14'],
  ['Addizionale regionale', '− ' + eur(B28.voci[6].importo), 'Lombardia, scaglioni'],
  ['Addizionale comunale', '− ' + eur(B28.voci[7].importo), '0,8%'],
  ['<strong>Netto in busta</strong>', '<strong>' + eur(B28.annuale.nettoMensile) + '</strong>', '']
], { num: [1] })}
<h2>Le sezioni del cedolino spiegate</h2>
<h3>Competenze</h3>
<p>Sono le voci che compongono il lordo: <strong>paga base</strong> (il minimo tabellare del livello), <strong>contingenza</strong> ed <strong>EDR</strong> (elementi fissi previsti dal CCNL), <strong>scatti di anzianità</strong>, <strong>superminimo</strong> (la parte negoziata individualmente), più le voci variabili del mese: straordinari, maggiorazioni per festivi e notturni, indennità, premi.</p>
<h3>Trattenute previdenziali</h3>
<p>I contributi INPS si calcolano sull'imponibile previdenziale e vengono versati dal datore di lavoro insieme alla sua quota (circa il 30%). In busta vedi solo la tua parte: 9,19% o 9,49%. Dal 2026 la prima fascia di retribuzione pensionabile è 56.224 €: oltre questa soglia si paga l'1% in più.</p>
<h3>Trattenute fiscali</h3>
<p>L'IRPEF si calcola mese per mese sull'imponibile fiscale usando gli scaglioni annui divisi per 12 (o per il numero di mensilità); le detrazioni vengono riconosciute in quota mensile. Le addizionali dell'anno precedente si pagano da gennaio a novembre; a marzo parte l'acconto comunale per l'anno in corso.</p>
<h3>Mensilità aggiuntive e TFR</h3>
<p>Nella busta di dicembre compare la <a href="/calcolo-tredicesima/">tredicesima</a>, a giugno o luglio la <a href="/calcolo-quattordicesima/">quattordicesima</a> dove prevista. Il <a href="/calcolo-tfr/">TFR</a> non è una trattenuta: è un accantonamento che il datore di lavoro fa per te, indicato di solito in fondo al cedolino con il progressivo maturato.</p>
<h2>Verifica la tua busta paga in 3 controlli</h2>
<ol>
<li><strong>Minimo contrattuale</strong>: confronta la paga base con la tabella del tuo CCNL (<a href="/ccnl/commercio/">commercio</a>, <a href="/ccnl/metalmeccanico/">metalmeccanico</a>).</li>
<li><strong>Detrazioni</strong>: se hai comunicato familiari a carico, le detrazioni devono essere più alte di quelle del nostro simulatore (che considera solo il lavoratore).</li>
<li><strong>Addizionali</strong>: regione e comune devono essere quelli del tuo domicilio fiscale al 1° gennaio.</li>
</ol>
`
},

/* ============================== TFR ============================== */
{
  path: '/calcolo-tfr/', priority: '0.8',
  title: 'Calcolo TFR 2026: Netto, Rivalutazione e Tassazione (Calcolatore)',
  description: 'Calcola il TFR lordo e netto: quota annua (RAL ÷ 13,5), rivalutazione 1,5% + 75% dell\'inflazione, imposta sostitutiva 17% e tassazione separata. Esempi per anni di servizio.',
  h1: 'Calcolo TFR: quanto spetta lordo e netto', short: 'Calcolo TFR',
  appName: 'Calcolatore TFR netto',
  lead: 'Quanto trattamento di fine rapporto hai maturato e quanto ne riceverai netto: il calcolatore applica la quota annua, la rivalutazione ISTAT e la tassazione separata prevista dal TUIR.',
  tool: { type: 'tfr', defaults: { ral: 30000, anni: 10, inflazione: 1.7 } },
  answer: `Il <strong>TFR</strong> si calcola accantonando ogni anno la retribuzione annua lorda <strong>divisa per 13,5</strong> (circa il 7,41%), meno lo 0,50% versato al fondo pensioni INPS, e rivalutando il fondo dell'1,5% fisso più il 75% dell'inflazione. Con una <strong>RAL di 30.000 € per 10 anni</strong> il TFR lordo è di circa <strong>${eur(T30.lordo, 0)}</strong> e il netto di circa <strong>${eur(T30.netto, 0)}</strong>.`,
  section: 'Calcolatori', about: ['TFR', 'Trattamento di fine rapporto', 'Tassazione separata'],
  howto: { name: 'Come si calcola il TFR', steps: [
    ['Quota annua', 'Dividi la retribuzione utile dell\'anno per 13,5 e sottrai lo 0,50% della retribuzione (contributo al fondo di garanzia INPS).'],
    ['Rivalutazione', 'Ogni 31 dicembre il TFR accantonato negli anni precedenti si rivaluta dell\'1,5% fisso più il 75% dell\'aumento dell\'indice ISTAT FOI.'],
    ['Tassazione', 'Sulle rivalutazioni si paga un\'imposta sostitutiva del 17%; sul resto l\'IRPEF a tassazione separata, con l\'aliquota media degli ultimi anni.']
  ] },
  related: ['/calcolo-busta-paga/', '/calcolo-naspi/', '/ral/', '/calcolo-tredicesima/'],
  faq: [
    ['Quanto TFR si matura in un anno?', 'Circa il 6,91% della retribuzione lorda annua: la RAL divisa per 13,5 (7,41%) meno lo 0,50% del contributo al fondo di garanzia. Con 30.000 € di RAL sono circa ' + eur(T30.quotaAnnua, 0) + ' l\'anno.'],
    ['Come viene tassato il TFR?', 'Con la tassazione separata: l\'aliquota si calcola dividendo il TFR per gli anni di servizio e moltiplicando per 12, poi applicando gli scaglioni IRPEF a quel reddito di riferimento. L\'Agenzia delle Entrate poi riliquida l\'imposta con l\'aliquota media del quinquennio precedente se più favorevole. Le rivalutazioni pagano invece il 17%.'],
    ['Il TFR è compreso nella RAL?', 'No. È un accantonamento del datore di lavoro, in aggiunta alla RAL, e non ha contributi INPS.'],
    ['Quando viene pagato il TFR?', 'Alla cessazione del rapporto, di norma con l\'ultima busta paga o entro 30-45 giorni. Durante il rapporto si può chiedere un anticipo (fino al 70%) dopo 8 anni di anzianità per spese sanitarie o acquisto della prima casa.'],
    ['TFR in azienda o nel fondo pensione?', 'Il TFR in azienda si rivaluta con la formula di legge; nel fondo pensione segue i rendimenti del comparto e ha una tassazione più favorevole al momento della prestazione (dal 15% al 9%). La scelta va fatta entro 6 mesi dall\'assunzione.'],
    ['Il TFR si matura anche in malattia e maternità?', 'Sì, per i periodi di sospensione retribuiti (malattia, maternità, infortunio, CIG) la quota TFR si calcola sulla retribuzione che si sarebbe percepita.']
  ],
  sources: [SRC.cc2120, SRC.tuir19, SRC.inps6],
  body: () => {
    const rows = [1, 3, 5, 10, 15, 20, 25, 30].map(a => { const t = CR.calcolaTfr({ ral: 30000, anni: a, inflazione: 1.7 }); return [a + (a === 1 ? ' anno' : ' anni'), eur(t.capitale, 0), eur(t.rivalutazioni, 0), eur(t.lordo, 0), eur(t.netto, 0)]; });
    const rows2 = [20000, 25000, 30000, 35000, 40000, 50000, 60000].map(r => { const t = CR.calcolaTfr({ ral: r, anni: 10, inflazione: 1.7 }); return [eur(r, 0), eur(t.quotaAnnua, 0), eur(t.lordo, 0), eur(t.netto, 0)]; });
    return `
<h2>La formula del TFR (art. 2120 c.c.)</h2>
<div class="formula">Quota annua = Retribuzione utile ÷ 13,5 − 0,50% × Retribuzione
Rivalutazione annua = TFR accantonato × (1,5% + 75% × inflazione ISTAT FOI)
TFR lordo = somma delle quote + rivalutazioni</div>
<p>La <strong>retribuzione utile</strong> comprende tutte le somme corrisposte a titolo non occasionale: paga base, contingenza, scatti, superminimo, tredicesima e quattordicesima, straordinario continuativo, indennità fisse. Sono esclusi i rimborsi spese e, di norma, le somme occasionali.</p>
<h2>Esempio: RAL 30.000 €, inflazione 1,7%</h2>
${table(['Anni di servizio', 'Quote accantonate', 'Rivalutazioni', 'TFR lordo', 'TFR netto stimato'], rows, { num: [1, 2, 3, 4] })}
<h2>TFR dopo 10 anni per diverse RAL</h2>
${table(['RAL', 'Quota annua', 'TFR lordo (10 anni)', 'TFR netto stimato'], rows2, { num: [1, 2, 3] })}
<h2>Come funziona la tassazione separata</h2>
<p>Il TFR non si somma agli altri redditi dell'anno (sarebbe penalizzante): è tassato <strong>separatamente</strong>. Il datore di lavoro calcola un reddito di riferimento = TFR × 12 ÷ anni di servizio, applica gli scaglioni IRPEF e ottiene un'aliquota media che applica all'intero TFR (al netto delle rivalutazioni, già tassate al 17%). Entro pochi anni l'Agenzia delle Entrate riliquida l'imposta usando l'aliquota media dei 5 anni precedenti la cessazione, se più favorevole, e rimborsa o richiede la differenza.</p>
<div class="callout">Con RAL 30.000 € e 10 anni di servizio il reddito di riferimento è ${eur(T30.capitale * 12 / 10, 0)}: l'aliquota media risultante è del ${pct(T30.aliquotaMedia)} e l'imposta di circa ${eur(T30.imposta, 0)}, più ${eur(T30.impostaRivalutazioni, 0)} sulle rivalutazioni.</div>
<h2>Anticipo del TFR</h2>
<p>Dopo 8 anni di servizio presso lo stesso datore puoi chiedere, una sola volta, un anticipo fino al 70% del TFR maturato per spese sanitarie straordinarie, acquisto della prima casa per sé o per i figli, o congedi parentali e formativi. L'azienda può accogliere le richieste entro il 10% degli aventi diritto e il 4% dei dipendenti ogni anno.</p>
`; }
},

/* ============================== TREDICESIMA ============================== */
{
  path: '/calcolo-tredicesima/', priority: '0.8',
  title: 'Calcolo Tredicesima 2026: Lordo, Netto e Mesi Maturati',
  description: 'Calcola la tredicesima netta 2026: come si matura (1/12 per mese), quando arriva, perché è tassata di più e quanto riceverai con il tuo stipendio lordo mensile.',
  h1: 'Calcolo tredicesima: lordo, netto e mesi maturati', short: 'Calcolo tredicesima',
  appName: 'Calcolatore tredicesima netta',
  lead: 'Quanto vale la tua tredicesima e perché il netto è più basso di una mensilità normale: calcolo con i ratei maturati, i contributi INPS e l\'IRPEF all\'aliquota marginale.',
  tool: { type: 'mensilita', defaults: { tipo: 'tredicesima', lordoMensile: 1800, mesi: 12, mensilita: 13 } },
  answer: `La <strong>tredicesima</strong> è pari a una mensilità lorda per chi ha lavorato tutto l'anno (1/12 per ogni mese o frazione superiore a 15 giorni). Con un <strong>lordo mensile di 1.800 €</strong> la tredicesima lorda è di 1.800 € e il netto di circa <strong>${eur(TR.netto, 0)}</strong>: è tassata di più perché non gode delle detrazioni, già utilizzate nei 12 mesi ordinari.`,
  section: 'Calcolatori', about: ['Tredicesima', 'Gratifica natalizia'],
  related: ['/calcolo-quattordicesima/', '/calcolo-busta-paga/', '/', '/irpef/detrazioni-lavoro-dipendente-2026/'],
  faq: [
    ['Quando viene pagata la tredicesima?', 'Entro il 24 dicembre nella maggior parte dei CCNL, insieme o separatamente dallo stipendio di dicembre. I pensionati la ricevono con la rata di dicembre dell\'INPS.'],
    ['Come si calcola la tredicesima se ho lavorato solo alcuni mesi?', 'Si moltiplica il lordo mensile per i mesi lavorati e si divide per 12. Un mese conta se hai lavorato almeno 15 giorni. Esempio: 1.800 € × 7 ÷ 12 = 1.050 € lordi.'],
    ['Perché la tredicesima netta è più bassa dello stipendio?', 'Perché le detrazioni per lavoro dipendente e quelle per familiari sono già state applicate sulle 12 mensilità ordinarie: sulla tredicesima si paga l\'IRPEF piena all\'aliquota del tuo scaglione, oltre ai contributi INPS.'],
    ['La tredicesima matura durante malattia, maternità e ferie?', 'Sì per malattia (entro il periodo di comporto), infortunio, maternità obbligatoria, ferie e permessi retribuiti. Non matura durante aspettativa non retribuita, sciopero e assenze ingiustificate.'],
    ['La tredicesima spetta anche a part-time, apprendisti e colf?', 'Sì a tutti i lavoratori dipendenti, in proporzione all\'orario per i part-time. Per colf e badanti è prevista dal CCNL del lavoro domestico.'],
    ['Tredicesima e cuneo fiscale: cambia qualcosa nel 2026?', 'La somma esente del cuneo fiscale (redditi fino a 20.000 €) si calcola sul reddito annuo, tredicesima compresa, e viene riconosciuta nei mesi ordinari; non modifica la tassazione della tredicesima in sé.']
  ],
  sources: [SRC.tuir13, SRC.cnel, SRC.inps6],
  body: () => {
    const rows = [1200, 1400, 1600, 1800, 2000, 2300, 2600, 3000, 3500].map(l => { const t = CR.calcolaMensilitaAggiuntiva({ lordoMensile: l, mesi: 12, mensilita: 13 }); return [eur(l, 0), eur(l * 13, 0), eur(t.inps, 0), eur(t.irpef, 0) + ' (' + pct(t.aliquota) + ')', eur(t.netto, 0)]; });
    return `
<h2>Come si calcola la tredicesima</h2>
<div class="formula">Tredicesima lorda = Retribuzione lorda mensile × mesi maturati ÷ 12
Tredicesima netta = Lorda − contributi INPS (9,19%) − IRPEF all'aliquota marginale</div>
<p>La retribuzione di riferimento è quella in vigore a dicembre e comprende paga base, contingenza, scatti e superminimo; sono esclusi straordinari e indennità occasionali. Se durante l'anno hai cambiato livello, molti CCNL prevedono il calcolo sui ratei maturati mese per mese.</p>
<h2>Tabella tredicesima netta 2026</h2>
${table(['Lordo mensile', 'RAL (13 mens.)', 'INPS 9,19%', 'IRPEF (aliquota marginale)', 'Tredicesima netta'], rows, { num: [1, 2, 3, 4], caption: 'Anno intero (12 ratei). L\'aliquota marginale è quella dello scaglione del reddito annuo: 23% fino a 28.000 € di imponibile, 33% fino a 50.000 €, 43% oltre.' })}
<h2>I ratei: quanto matura ogni mese</h2>
${table(['Mesi lavorati', 'Quota maturata', 'Esempio con 1.800 € lordi'], [1, 3, 6, 9, 11, 12].map(m => [m, m + '/12 = ' + pct(m / 12 * 100), eur(1800 * m / 12, 0)]), { num: [2] })}
<h2>Chi ha diritto alla tredicesima</h2>
<ul>
<li>Tutti i lavoratori dipendenti, pubblici e privati, a tempo determinato e indeterminato.</li>
<li>Part-time: in proporzione all'orario.</li>
<li>Apprendisti, lavoratori domestici, lavoratori agricoli.</li>
<li>Pensionati INPS: con la rata di dicembre.</li>
<li>Non spetta a collaboratori a partita IVA, co.co.co. e stagisti (salvo accordo).</li>
</ul>
<h2>Tredicesima e TFR</h2>
<p>La tredicesima concorre alla retribuzione utile per il <a href="/calcolo-tfr/">TFR</a> e per la pensione. Per questo motivo anche la tredicesima ha i contributi INPS al 9,19%.</p>
`; }
},

/* ============================== QUATTORDICESIMA ============================== */
{
  path: '/calcolo-quattordicesima/', priority: '0.7',
  title: 'Calcolo Quattordicesima 2026: a Chi Spetta, Quando e Quanto Netto',
  description: 'Calcolo quattordicesima: quali CCNL la prevedono (commercio, turismo, alimentaristi, chimici), come matura da luglio a giugno, quando viene pagata e quanto è netta.',
  h1: 'Calcolo quattordicesima: a chi spetta, quando arriva e quanto è netta', short: 'Calcolo quattordicesima',
  appName: 'Calcolatore quattordicesima netta',
  lead: 'La quattordicesima non è prevista dalla legge ma dai contratti collettivi: ecco chi la riceve, come si calcola sul periodo luglio-giugno e quanto resta netto.',
  tool: { type: 'mensilita', defaults: { tipo: 'quattordicesima', lordoMensile: 1800, mesi: 12, mensilita: 14 } },
  answer: `La <strong>quattordicesima</strong> spetta solo se prevista dal CCNL (commercio e terziario, turismo, alimentaristi, chimici, farmacie, pulizie, logistica, autotrasporto) e matura dal 1° luglio al 30 giugno. Viene pagata a <strong>giugno o luglio</strong> ed è pari a una mensilità lorda: con 1.800 € lordi il netto è di circa <strong>${eur(CR.calcolaMensilitaAggiuntiva({ lordoMensile: 1800, mesi: 12, mensilita: 14 }).netto, 0)}</strong>. Non la prevedono i CCNL metalmeccanici, edili, della scuola e del pubblico impiego.`,
  section: 'Calcolatori', about: ['Quattordicesima', 'CCNL commercio'],
  related: ['/calcolo-tredicesima/', '/ccnl/commercio/', '/calcolo-busta-paga/', '/'],
  faq: [
    ['Quali contratti prevedono la quattordicesima?', 'Terziario e commercio (Confcommercio e Confesercenti), turismo e pubblici esercizi, industria alimentare, chimico-farmaceutico, farmacie private, autotrasporto e logistica, pulizie e multiservizi, telecomunicazioni, studi professionali (in parte), vigilanza privata, lavoro domestico (no). Non la prevedono metalmeccanici, edili, tessili, scuola, sanità e pubblico impiego.'],
    ['Quando si paga la quattordicesima?', 'Di norma con la retribuzione di giugno o entro il 15 luglio, secondo il CCNL. Il periodo di maturazione va dal 1° luglio dell\'anno precedente al 30 giugno.'],
    ['Come si calcola la quattordicesima per chi è stato assunto a gennaio?', 'Si contano i mesi dal 1° gennaio al 30 giugno: 6/12 della mensilità lorda. Con 1.800 € lordi: 900 € lordi.'],
    ['La quattordicesima è tassata come la tredicesima?', 'Sì: contributi INPS e IRPEF all\'aliquota marginale senza detrazioni, quindi il netto è più basso di una mensilità ordinaria.'],
    ['La quattordicesima spetta ai pensionati?', 'Esiste una "quattordicesima" INPS per i pensionati con almeno 64 anni e reddito fino a circa 2 volte il trattamento minimo, pagata a luglio: è una somma aggiuntiva con importi fissi, non una mensilità.'],
    ['La quattordicesima matura durante le ferie e la malattia?', 'Sì, come la tredicesima: matura nei periodi retribuiti, non nelle assenze non retribuite.']
  ],
  sources: [SRC.ccnlComm, SRC.cnel, SRC.tuir13],
  body: () => {
    const rows = [1300, 1500, 1700, 1800, 2000, 2250, 2500, 3000].map(l => { const t = CR.calcolaMensilitaAggiuntiva({ lordoMensile: l, mesi: 12, mensilita: 14 }); return [eur(l, 0), eur(l * 14, 0), eur(t.inps, 0), eur(t.irpef, 0), eur(t.netto, 0)]; });
    return `
<h2>Periodo di maturazione: luglio – giugno</h2>
<p>A differenza della tredicesima, la quattordicesima si matura a cavallo di due anni: ogni mese lavorato tra il 1° luglio e il 30 giugno vale 1/12. Chi inizia a lavorare in un'azienda a ottobre riceve a luglio 9/12 della mensilità.</p>
<div class="formula">Quattordicesima lorda = Retribuzione lorda mensile × mesi maturati (luglio–giugno) ÷ 12</div>
<h2>Tabella quattordicesima netta 2026</h2>
${table(['Lordo mensile', 'RAL (14 mens.)', 'INPS 9,19%', 'IRPEF marginale', 'Quattordicesima netta'], rows, { num: [1, 2, 3, 4] })}
<h2>CCNL con e senza quattordicesima</h2>
${table(['Con quattordicesima', 'Senza quattordicesima'], [
  ['Terziario, distribuzione e servizi (commercio)', 'Metalmeccanici industria e PMI'],
  ['Turismo, pubblici esercizi, alberghi', 'Edilizia'],
  ['Industria alimentare', 'Tessile e abbigliamento'],
  ['Chimico-farmaceutico', 'Scuola e università'],
  ['Autotrasporto, logistica e spedizioni', 'Sanità pubblica e privata (ARIS/AIOP no)'],
  ['Pulizie e multiservizi', 'Pubblico impiego'],
  ['Farmacie private, studi professionali', 'Lavoro domestico (colf e badanti)'],
  ['Telecomunicazioni, vigilanza privata', 'Agricoltura (solo alcuni contratti provinciali)']
])}
<h2>13 o 14 mensilità: cosa cambia</h2>
<p>A parità di RAL il netto annuo è lo stesso. Con 14 mensilità ogni stipendio ordinario è più basso del 7% circa, ma ricevi due mensilità extra. Nel <a href="/ccnl/commercio/">CCNL Commercio</a> la RAL del IV livello (${eur((CR.P.ccnl.commercio.livelli[4].minimo + CR.P.ccnl.commercio.livelli[4].contingenza) * 14, 0)}) si divide in 14: ${eur(CR.P.ccnl.commercio.livelli[4].minimo + CR.P.ccnl.commercio.livelli[4].contingenza, 0)} lordi al mese.</p>
`; }
},

/* ============================== NASPI ============================== */
{
  path: '/calcolo-naspi/', priority: '0.8',
  title: 'Calcolo NASpI 2026: Importo, Durata e Simulazione Mese per Mese',
  description: 'Simulatore NASpI 2026: importo mensile (75% della retribuzione fino a 1.456,72 €), massimale 1.584,70 €, durata in base alle settimane contribuite e riduzione del 3% dal 6° mese.',
  h1: 'Calcolo NASpI 2026: importo, durata e simulazione', short: 'Calcolo NASpI',
  appName: 'Simulatore NASpI 2026',
  lead: 'Quanta indennità di disoccupazione ti spetta e per quanti mesi: il calcolatore applica la circolare INPS n. 4/2026 con soglia, massimale e décalage.',
  tool: { type: 'naspi', defaults: { retribuzioneMedia: 1800, settimane: 208 } },
  answer: `La <strong>NASpI 2026</strong> è pari al <strong>75% della retribuzione media mensile</strong> degli ultimi 4 anni fino a <strong>1.456,72 €</strong>, più il 25% della parte eccedente, con un <strong>massimo di 1.584,70 € al mese</strong>. Con una retribuzione media di 1.800 € l'importo iniziale è di circa <strong>${eur(NA.mensileIniziale, 0)}</strong> lordi. Dal 6° mese (8° per gli over 55) l'importo si riduce del 3% ogni mese. Dura la metà delle settimane contribuite negli ultimi 4 anni, fino a 24 mesi.`,
  section: 'Calcolatori', about: ['NASpI', 'Indennità di disoccupazione', 'INPS'],
  howto: { name: 'Come calcolare la NASpI', steps: [
    ['Retribuzione media', 'Somma gli imponibili previdenziali degli ultimi 4 anni, dividi per le settimane e moltiplica per 4,33.'],
    ['Importo base', 'Se la media è fino a 1.456,72 €: 75%. Se è superiore: 1.092,54 € + 25% della differenza, fino a 1.584,70 €.'],
    ['Durata', 'Metà delle settimane di contribuzione degli ultimi 4 anni (escluse quelle già usate per precedenti NASpI), massimo 104 settimane.'],
    ['Décalage', 'Dal primo giorno del 6° mese l\'importo cala del 3% al mese (dall\'8° mese per chi ha compiuto 55 anni).']
  ] },
  related: ['/calcolo-tfr/', '/calcolo-busta-paga/', '/', '/calcolo-pensione-netta/'],
  faq: [
    ['Chi ha diritto alla NASpI?', 'I lavoratori dipendenti che perdono involontariamente il lavoro (licenziamento, scadenza del contratto, dimissioni per giusta causa o durante la maternità, risoluzione consensuale in conciliazione) con almeno 13 settimane di contributi nei 4 anni precedenti. Non spetta per dimissioni volontarie.'],
    ['Quanto dura la NASpI?', 'La metà delle settimane contribuite negli ultimi 4 anni, al massimo 104 settimane (24 mesi). Con 4 anni pieni di lavoro: 24 mesi.'],
    ['Entro quando fare domanda?', 'Entro 68 giorni dalla cessazione, online sul sito INPS o tramite patronato. La NASpI decorre dall\'8° giorno dopo la cessazione se la domanda è presentata entro 8 giorni, altrimenti dal giorno successivo alla domanda.'],
    ['La NASpI è tassata?', 'Sì, è reddito da lavoro dipendente: l\'INPS applica IRPEF e detrazioni. Non ci sono contributi a carico del lavoratore, ma i periodi sono coperti da contribuzione figurativa per la pensione.'],
    ['Si può lavorare mentre si percepisce la NASpI?', 'Sì, entro 8.500 € l\'anno di reddito da lavoro dipendente (l\'indennità si riduce dell\'80% del reddito) o 5.500 € da lavoro autonomo. Oltre questi limiti la NASpI decade. Va comunicato all\'INPS entro 30 giorni.'],
    ['Si può chiedere la NASpI anticipata in un\'unica soluzione?', 'Sì, per avviare un\'attività autonoma o una partita IVA: si incassa tutto il residuo in un\'unica soluzione, perdendo però la contribuzione figurativa e con l\'obbligo di restituzione se si torna dipendenti prima della fine del periodo.']
  ],
  sources: [SRC.inps4, SRC.naspi],
  body: () => {
    const rows = [1000, 1200, 1456.72, 1600, 1800, 2000, 2500, 3000, 3500].map(r => { const n = CR.calcolaNaspi({ retribuzioneMedia: r, settimane: 208 }); return [eur(r), eur(n.mensileIniziale), eur(n.piano[5].importo), eur(n.piano[11].importo), eur(n.piano[23].importo)]; });
    const dur = [[26, 13], [52, 26], [78, 39], [104, 52], [156, 78], [208, 104]].map(([s, p]) => [s + ' settimane (' + fmt(s / 52, 1).replace(',0', '') + ' anni)', p + ' settimane', fmt(p / 4.345, 1) + ' mesi']);
    return `
<h2>Formula NASpI 2026 (circolare INPS n. 4/2026)</h2>
<div class="formula">Retribuzione media ≤ 1.456,72 €  →  NASpI = 75% × retribuzione media
Retribuzione media > 1.456,72 €  →  NASpI = 1.092,54 € + 25% × (retribuzione − 1.456,72 €)
Importo massimo 2026 = 1.584,70 € lordi al mese</div>
<h2>Tabella NASpI 2026 per retribuzione media</h2>
${table(['Retribuzione media mensile', 'NASpI 1°–5° mese', '6° mese', '12° mese', '24° mese'], rows, { num: [1, 2, 3, 4], caption: 'Importi lordi. Dal 6° mese riduzione del 3% mensile (dall\'8° per gli over 55).' })}
<h2>Durata in base ai contributi</h2>
${table(['Settimane contribuite (ultimi 4 anni)', 'Settimane di NASpI', 'Durata'], dur, { num: [1, 2] })}
<h2>Il décalage: perché l'importo scende</h2>
<p>Dal primo giorno del sesto mese di fruizione l'indennità si riduce del 3% al mese, in modo cumulativo: al 12° mese vale circa l'81% dell'importo iniziale, al 24° mese circa il 56%. Per chi ha compiuto 55 anni alla data della domanda la riduzione parte dall'ottavo mese. Nel caso del nostro esempio (1.800 € di media) il totale lordo percepibile in 24 mesi è di circa ${eur(NA.totaleLordo, 0)}.</p>
<h2>NASpI e altri redditi</h2>
<ul>
<li><strong>Lavoro dipendente</strong> fino a 8.500 € l'anno: NASpI ridotta dell'80% del reddito previsto.</li>
<li><strong>Lavoro autonomo</strong> fino a 5.500 € l'anno: stessa riduzione.</li>
<li><strong>Pensione</strong>: la NASpI è incompatibile con la pensione di vecchiaia o anticipata.</li>
<li><strong>TFR</strong>: compatibile, si incassa a parte. Calcolalo con il <a href="/calcolo-tfr/">calcolo TFR</a>.</li>
</ul>
`; }
},

/* ============================== PENSIONE NETTA ============================== */
{
  path: '/calcolo-pensione-netta/', priority: '0.8',
  title: 'Calcolo Pensione Netta 2026 dal Lordo: Calcolatore con IRPEF e Addizionali',
  description: 'Calcola la pensione netta mensile 2026 dalla lorda: IRPEF a scaglioni, detrazione per redditi da pensione (fino a 1.955 €), addizionali regionale e comunale. Tabella da 800 a 4.000 €.',
  h1: 'Calcolo pensione netta 2026 dal lordo', short: 'Calcolo pensione netta',
  appName: 'Calcolatore pensione netta',
  lead: 'Dalla pensione lorda del cedolino INPS al netto che arriva sul conto: il calcolatore applica le aliquote IRPEF 2026, la detrazione per pensionati e le addizionali della tua regione.',
  tool: { type: 'pensione', defaults: { lordoMensile: 1500 } },
  answer: `Una <strong>pensione lorda di 1.500 € al mese</strong> (13 mensilità) vale nel 2026 circa <strong>${eur(PE.nettoMensile, 0)} netti</strong> in Lombardia: si pagano ${eur(PE.irpef, 0)} di IRPEF l'anno dopo la detrazione per redditi da pensione di ${eur(PE.detrazione, 0)}, più ${eur(PE.addizionaleRegionale + PE.addizionaleComunale, 0)} di addizionali. Sulla pensione <strong>non si pagano contributi INPS</strong>.`,
  section: 'Calcolatori', about: ['Pensione netta', 'IRPEF pensionati'],
  related: ['/calcolo-irpef/', '/irpef/addizionale-regionale-2026/', '/calcolo-naspi/', '/calcolo-tfr/'],
  faq: [
    ['Come si calcola la pensione netta dalla lorda?', 'Si moltiplica la lorda mensile per 13, si calcola l\'IRPEF sugli scaglioni 2026 (23%, 33%, 43%), si sottrae la detrazione per redditi da pensione, poi si tolgono le addizionali regionale e comunale e si divide per 13.'],
    ['Quanto vale la detrazione per i pensionati nel 2026?', '1.955 € fino a 8.500 € di reddito; tra 8.500 e 28.000 €: 700 + 1.255 × (28.000 − reddito) / 19.500; tra 28.000 e 50.000 €: 700 × (50.000 − reddito) / 22.000. Tra 25.000 e 29.000 € si aggiungono 50 €.'],
    ['Le pensioni minime pagano l\'IRPEF?', 'No: fino a circa 8.500 € l\'anno (654 € al mese per 13 mensilità) la detrazione azzera l\'imposta. Molte regioni esentano anche dall\'addizionale.'],
    ['Perché la pensione di gennaio è diversa?', 'A gennaio l\'INPS applica la perequazione (rivalutazione all\'inflazione) e ricalcola IRPEF e addizionali sull\'anno nuovo; le addizionali dell\'anno precedente si trattengono in 11 rate da gennaio a novembre.'],
    ['Il calcolo vale anche per la pensione di reversibilità?', 'Sì, la tassazione è la stessa. Se però il titolare ha altri redditi, l\'aliquota può aumentare e la pensione di reversibilità può essere ridotta per cumulo.'],
    ['I pensionati hanno il taglio del cuneo fiscale?', 'No: la somma esente e l\'ulteriore detrazione 2025-2026 riguardano solo i lavoratori dipendenti. I pensionati beneficiano della riduzione dell\'aliquota al 33% e di detrazioni specifiche.']
  ],
  sources: [SRC.tuir13, SRC.bilancio2026, SRC.mef],
  body: () => {
    const rows = [700, 800, 1000, 1200, 1500, 1800, 2000, 2500, 3000, 3500, 4000, 5000].map(l => { const p = CR.calcolaPensioneNetta({ lordoMensile: l, regione: 'lombardia', comunale: 0.8 }); return [eur(l, 0), eur(p.lordoAnnuo, 0), eur(p.irpef, 0), eur(p.addizionaleRegionale + p.addizionaleComunale, 0), eur(p.nettoMensile, 0)]; });
    return `
<h2>Tabella pensione lorda → netta 2026</h2>
${table(['Lorda mensile', 'Lorda annua (13)', 'IRPEF netta annua', 'Addizionali annue', 'Netta mensile'], rows, { num: [1, 2, 3, 4], caption: 'Lombardia, addizionale comunale 0,8%, nessun familiare a carico, nessun altro reddito.' })}
<h2>Le differenze rispetto alla busta paga</h2>
<ul>
<li><strong>Niente contributi INPS</strong>: la pensione è già al netto della previdenza.</li>
<li><strong>Detrazione specifica</strong> per redditi da pensione, leggermente diversa da quella dei dipendenti.</li>
<li><strong>Niente cuneo fiscale</strong>: somma esente e ulteriore detrazione spettano solo ai lavoratori.</li>
<li><strong>13 mensilità</strong> sempre: la tredicesima arriva a dicembre ed è tassata senza detrazioni, come per i dipendenti.</li>
</ul>
<h2>Detrazione per redditi da pensione 2026</h2>
<div class="formula">Reddito ≤ 8.500 €            →  1.955 €
8.500 < reddito ≤ 28.000 €  →  700 + 1.255 × (28.000 − reddito) / 19.500
28.000 < reddito ≤ 50.000 € →  700 × (50.000 − reddito) / 22.000
Reddito tra 25.000 e 29.000 € →  + 50 €</div>
<h2>Addizionali: la regione conta</h2>
<p>Con 1.500 € lordi al mese le addizionali vanno da ${eur(CR.calcolaPensioneNetta({ lordoMensile: 1500, regione: 'veneto', comunale: 0.8 }).addizionaleRegionale, 0)} l'anno in Veneto a ${eur(CR.calcolaPensioneNetta({ lordoMensile: 1500, regione: 'molise', comunale: 0.8 }).addizionaleRegionale, 0)} in Molise. Alcune regioni prevedono esenzioni per i redditi bassi: vedi le <a href="/irpef/addizionale-regionale-2026/">aliquote regionali 2026</a>.</p>
`; }
},

/* ============================== IRPEF ============================== */
{
  path: '/calcolo-irpef/', priority: '0.8',
  title: 'Calcolo IRPEF 2026 Online: Imposta per Scaglioni e Aliquota Media',
  description: 'Calcolo IRPEF 2026 con le nuove aliquote 23%, 33% e 43%: imposta lorda per scaglioni, detrazioni per lavoro dipendente o pensione, IRPEF netta, aliquota media e marginale.',
  h1: 'Calcolo IRPEF 2026: imposta per scaglioni e aliquota media', short: 'Calcolo IRPEF',
  appName: 'Calcolatore IRPEF 2026',
  lead: 'Inserisci il reddito imponibile e ottieni IRPEF lorda per scaglione, detrazioni e imposta netta con le aliquote in vigore dal 1° gennaio 2026.',
  tool: { type: 'irpef', defaults: { reddito: 35000, tipo: 'dipendente' } },
  answer: `Su un <strong>reddito imponibile di 35.000 €</strong> l'IRPEF lorda 2026 è di <strong>${eur(IR.lorda, 0)}</strong>: 6.440 € sui primi 28.000 € (23%) più ${eur((35000 - 28000) * 0.33, 0)} sui restanti 7.000 € (33%). Per un dipendente, tolte le detrazioni (${eur(IR.detrazione + IR.ulteriore, 0)}), l'imposta netta è di <strong>${eur(IR.netta, 0)}</strong>: aliquota media ${pct(IR.aliquotaMedia)}, marginale 33%.`,
  section: 'Calcolatori', about: ['IRPEF', 'Scaglioni IRPEF 2026'],
  related: ['/irpef/scaglioni-2026/', '/irpef/detrazioni-lavoro-dipendente-2026/', '/irpef/trattamento-integrativo-2026/', '/irpef/addizionale-regionale-2026/', '/'],
  faq: [
    ['Quali sono le aliquote IRPEF 2026?', '23% fino a 28.000 €, 33% da 28.000 a 50.000 €, 43% oltre 50.000 €. La seconda aliquota è scesa dal 35% al 33% con la Legge di Bilancio 2026.'],
    ['Come si calcola l\'IRPEF per scaglioni?', 'Ogni aliquota si applica solo alla parte di reddito compresa nello scaglione. Con 35.000 €: 28.000 × 23% + 7.000 × 33% = 8.750 €. Non si applica il 33% a tutto il reddito.'],
    ['Qual è la differenza tra aliquota media e marginale?', 'L\'aliquota marginale è quella dell\'ultimo scaglione (quanto paghi su 1 € in più); l\'aliquota media è l\'imposta netta divisa per il reddito (quanto paghi in media). Con 35.000 € di reddito da dipendente la marginale è 33% e la media circa ' + pct(IR.aliquotaMedia) + '.'],
    ['Cos\'è la no tax area?', 'La soglia sotto la quale le detrazioni azzerano l\'IRPEF: circa 8.500 € per dipendenti e pensionati, 5.500 € per gli autonomi. Con il trattamento integrativo e il cuneo fiscale i dipendenti fino a 15.000 € ricevono di fatto un rimborso.'],
    ['L\'IRPEF si calcola sulla RAL?', 'No: sul reddito imponibile, cioè la RAL meno i contributi INPS a carico del dipendente. Per calcolare dalla RAL usa il <a href="/">calcolatore stipendio netto</a>.'],
    ['Le addizionali sono comprese nel calcolo?', 'No, questo calcolatore mostra solo l\'IRPEF nazionale. Le addizionali regionale e comunale si aggiungono: vedi la <a href="/irpef/addizionale-regionale-2026/">tabella per regione</a>.']
  ],
  sources: [SRC.bilancio2026, SRC.ade, SRC.tuir13],
  body: () => {
    const rows = [10000, 15000, 20000, 25000, 28000, 30000, 35000, 40000, 45000, 50000, 60000, 75000, 100000, 150000].map(r => { const i = CR.calcolaIrpef({ reddito: r, tipo: 'dipendente' }), a = CR.calcolaIrpef({ reddito: r, tipo: 'altro' }); return [eur(r, 0), eur(a.lorda, 0), eur(i.netta, 0), pct(i.aliquotaMedia), pct(i.aliquotaMarginale)]; });
    return `
<h2>Scaglioni IRPEF 2026</h2>
${table(['Reddito imponibile', 'Aliquota', 'Imposta sullo scaglione', 'Imposta cumulata'], [
  ['Fino a 28.000 €', '23%', 'fino a 6.440 €', '6.440 €'], ['28.000 – 50.000 €', '<strong>33%</strong>', 'fino a 7.260 €', '13.700 €'], ['Oltre 50.000 €', '43%', '43% dell\'eccedenza', '—']], { num: [2, 3] })}
<h2>Tabella IRPEF 2026 per reddito</h2>
${table(['Reddito imponibile', 'IRPEF lorda', 'IRPEF netta (dipendente)', 'Aliquota media', 'Aliquota marginale'], rows, { num: [1, 2, 3, 4], caption: 'IRPEF netta con detrazione per lavoro dipendente e ulteriore detrazione del cuneo fiscale; senza familiari a carico e senza addizionali.' })}
<h2>Dall'IRPEF lorda alla netta</h2>
<p>L'imposta lorda si riduce con le <strong>detrazioni</strong>: per tipo di reddito (lavoro dipendente, pensione, autonomo), per familiari a carico, per oneri (spese mediche, mutuo, ristrutturazioni al 19-50%). Le detrazioni non possono generare un credito, salvo il trattamento integrativo. Dal 2025 le detrazioni per oneri sono limitate per i redditi oltre 75.000 € e dal 2026 ridotte di 440 € oltre 200.000 €.</p>
<h2>Chi paga l'IRPEF e come</h2>
<ul>
<li><strong>Dipendenti e pensionati</strong>: trattenuta mensile dal sostituto d'imposta (datore di lavoro, INPS), con conguaglio a dicembre.</li>
<li><strong>Autonomi e imprese individuali</strong>: saldo e acconti con il modello Redditi (30 giugno e 30 novembre).</li>
<li><strong>Forfettari</strong>: niente IRPEF, ma imposta sostitutiva del 15% (5% per i primi 5 anni). Confronta con il <a href="/partita-iva-o-dipendente/">calcolatore forfettario</a>.</li>
</ul>
`; }
},

/* ============================== PART-TIME ============================== */
{
  path: '/part-time/', priority: '0.7',
  title: 'Stipendio Netto Part-Time 2026: Calcolo per 20, 25, 30 Ore',
  description: 'Calcolo stipendio netto part-time 2026: quanto si prende con 20, 24, 30 o 36 ore a settimana. Perché il netto part-time è più del 50% del full-time e tabelle per RAL.',
  h1: 'Calcolo stipendio netto part-time 2026', short: 'Netto part-time',
  appName: 'Calcolatore stipendio netto part-time',
  lead: 'Quanto resta netto con un contratto a orario ridotto: inserisci la RAL del tuo livello a tempo pieno e la percentuale di orario.',
  tool: { type: 'parttime', defaults: { ralFull: 30000, perc: 50, mensilita: 14 } },
  answer: `Un <strong>part-time al 50%</strong> (20 ore) su una RAL full-time di 30.000 € dà una RAL di 15.000 € e un netto di circa <strong>${eur(PT.nettoMensile, 0)} al mese su 14 mensilità</strong> (${eur(PT.nettoAnnuo, 0)} l'anno), contro ${eur(PTF.nettoMensile, 0)} del tempo pieno: il netto è il <strong>${pct(PT.nettoAnnuo / PTF.nettoAnnuo * 100)}</strong> di quello full-time, non il 50%, grazie a IRPEF progressiva, trattamento integrativo e cuneo fiscale.`,
  section: 'Calcolatori', about: ['Part-time', 'Stipendio netto'],
  related: ['/', '/ral/25000/', '/ccnl/commercio/', '/calcolo-tredicesima/'],
  faq: [
    ['Quanto si prende con un part-time di 20 ore?', 'Dipende dal livello: nel CCNL Commercio IV livello (RAL full-time circa 25.000 €) un part-time di 20 ore su 40 vale 12.500 € di RAL e circa ' + eur(netto(12500, { mensilita: 14 }).nettoMensile, 0) + ' netti al mese su 14 mensilità.'],
    ['Quanto si prende con un part-time di 30 ore?', 'Il 75% della RAL del livello. Su 30.000 € di RAL full-time: 22.500 € lordi e circa ' + eur(netto(22500, { mensilita: 14 }).nettoMensile, 0) + ' netti al mese su 14 mensilità.'],
    ['Perché il netto part-time è più della metà del full-time?', 'Perché le tasse sono progressive: un reddito più basso paga un\'aliquota media più bassa, mantiene le detrazioni piene e, sotto 20.000 €, riceve il bonus del cuneo fiscale e fino a 15.000 € il trattamento integrativo.'],
    ['Il part-time ha tredicesima e quattordicesima?', 'Sì, in proporzione all\'orario, come tutte le voci retributive.'],
    ['Le detrazioni si riducono con il part-time?', 'No: la detrazione per lavoro dipendente dipende dal reddito annuo, non dall\'orario. Si riduce solo per i periodi di lavoro inferiori all\'anno.'],
    ['Part-time verticale e orizzontale: cambia il netto?', 'No, a parità di ore annue il netto è identico. Cambia solo la distribuzione dei giorni lavorati.']
  ],
  sources: [SRC.tuir13, SRC.l207, SRC.dl3],
  body: () => {
    const rows = [[20, 50], [24, 60], [25, 62.5], [28, 70], [30, 75], [32, 80], [36, 90], [40, 100]].map(([h, p]) => {
      const n25 = netto(25000 * p / 100, { mensilita: 14 }), n30 = netto(30000 * p / 100, { mensilita: 14 }), n40 = netto(40000 * p / 100, { mensilita: 14 });
      return [h + ' ore', pct(p), eur(n25.nettoMensile, 0), eur(n30.nettoMensile, 0), eur(n40.nettoMensile, 0)];
    });
    return `
<h2>Tabella netto part-time 2026 (14 mensilità)</h2>
${table(['Ore/settimana', '% orario', 'RAL full-time 25.000 €', 'RAL full-time 30.000 €', 'RAL full-time 40.000 €'], rows, { num: [2, 3, 4], caption: 'Netto mensile in Lombardia, addizionale comunale 0,8%. Orario pieno di 40 ore.' })}
<h2>Come si calcola la RAL part-time</h2>
<div class="formula">RAL part-time = RAL full-time × ore settimanali ÷ ore contrattuali (40, o 38 in alcuni CCNL)</div>
<p>Tutte le voci — paga base, contingenza, scatti, superminimo, 13ª e 14ª, TFR — si riducono nella stessa proporzione. I buoni pasto spettano solo nei giorni con pausa pranzo prevista.</p>
<h2>L'effetto fiscale del part-time</h2>
<p>Su 30.000 € di RAL a tempo pieno le trattenute pesano il ${pct(PTF.aliquotaMedia)}; sul part-time al 50% solo il ${pct(PT.aliquotaMedia)}. Tre meccanismi lavorano a favore dell'orario ridotto:</p>
<ol>
<li><strong>Progressività</strong>: il reddito resta nel primo scaglione al 23%.</li>
<li><strong>Detrazioni piene</strong>: la detrazione per lavoro dipendente è di 1.955 € fino a 15.000 € di reddito.</li>
<li><strong>Bonus</strong>: trattamento integrativo (1.200 €) fino a 15.000 € e somma esente del cuneo (fino al 7,1%) fino a 20.000 €.</li>
</ol>
<div class="callout warn">Attenzione: il part-time riduce in proporzione anche i contributi versati, quindi la pensione futura, e il TFR. Con orari sotto le 24 ore settimanali potrebbero non maturare tutte le settimane utili per la pensione (il minimo settimanale 2026 è 232,52 € di retribuzione).</div>
`; }
},

/* ============================== PARTITA IVA ============================== */
{
  path: '/partita-iva-o-dipendente/', priority: '0.7',
  title: 'Partita IVA Forfettaria o Dipendente: Calcolo Netto a Confronto 2026',
  description: 'Calcola il netto di una partita IVA forfettaria 2026 (coefficiente, INPS 26,07%, imposta 15% o 5%) e confrontalo con la RAL da dipendente che darebbe lo stesso netto.',
  h1: 'Partita IVA forfettaria o dipendente: quanto resta netto', short: 'Partita IVA o dipendente',
  appName: 'Calcolatore netto partita IVA forfettaria',
  lead: 'Il confronto che serve a chi riceve una proposta "a partita IVA": quanto resta dei ricavi dopo INPS e imposta sostitutiva, e quale RAL da dipendente equivale.',
  tool: { type: 'forfettario', defaults: { ricavi: 40000, coefficiente: 78 } },
  answer: `Con <strong>40.000 € di fatturato</strong> e coefficiente del 78% (professionisti), nel 2026 un forfettario in Gestione separata paga circa ${eur(FO.inps, 0)} di INPS e ${eur(FO.imposta, 0)} di imposta sostitutiva al 15%: restano <strong>${eur(FO.nettoAnnuo, 0)} netti</strong> (${eur(FO.nettoMensile, 0)} al mese). Per lo stesso netto da dipendente servirebbe una <strong>RAL di circa ${eur(CR.calcolaRalDaNetto({ nettoAnnuo: FO.nettoAnnuo, mensilita: 13, regione: 'lombardia' }).ral, 0)}</strong>, che però includerebbe TFR, ferie e malattia.`,
  section: 'Calcolatori', about: ['Regime forfettario', 'Partita IVA', 'Gestione separata'],
  related: ['/calcolo-ral-da-netto/', '/calcolo-irpef/', '/', '/calcolo-tfr/'],
  faq: [
    ['Quanto si paga di tasse con la partita IVA forfettaria?', 'Un\'imposta sostitutiva del 15% (5% per i primi 5 anni di una nuova attività) sul reddito forfettario, cioè i ricavi moltiplicati per il coefficiente di redditività del codice ATECO, al netto dei contributi INPS versati.'],
    ['Quanto costa l\'INPS a un forfettario?', 'Professionisti senza cassa: 26,07% del reddito nella Gestione separata 2026 (minimo 4.903 € l\'anno circa, sul minimale di 18.808 €). Artigiani e commercianti: circa il 24% con contributi minimi fissi anche senza reddito, riducibili del 35% su richiesta.'],
    ['Qual è il limite del regime forfettario?', '85.000 € di ricavi o compensi l\'anno. Superando i 100.000 € si esce subito; tra 85.000 e 100.000 si esce dall\'anno successivo. Non si può accedere con redditi da lavoro dipendente superiori a 35.000 € nell\'anno precedente.'],
    ['Partita IVA a 1.500 € al mese conviene?', 'No, in genere. 18.000 € di fatturato con coefficiente 78% lasciano circa ' + eur(CR.calcolaForfettario({ ricavi: 18000, coefficiente: 78 }).nettoAnnuo, 0) + ' netti l\'anno, senza ferie, malattia, TFR né tredicesima: meno di un contratto da ' + eur(CR.calcolaRalDaNetto({ nettoAnnuo: CR.calcolaForfettario({ ricavi: 18000, coefficiente: 78 }).nettoAnnuo, mensilita: 13, regione: 'lombardia' }).ral, 0) + ' di RAL.'],
    ['Quale fatturato equivale a una RAL di 30.000 €?', 'Un dipendente con RAL 30.000 € porta a casa circa ' + eur(netto(30000).nettoAnnuo, 0) + ' netti più TFR (' + eur(CR.calcolaTfr({ ral: 30000, anni: 1 }).quotaAnnua, 0) + ' l\'anno) e ferie pagate. Per lo stesso netto un forfettario al 78% deve fatturare circa 36.000 € e per compensare TFR e ferie almeno 42-45.000 €.'],
    ['Cosa cambia tra forfettario e regime ordinario?', 'Nell\'ordinario si pagano IRPEF per scaglioni, addizionali e IVA, ma si deducono i costi reali e si detraggono le spese. Conviene quando i costi superano quelli forfettari del coefficiente o quando si superano gli 85.000 €.']
  ],
  sources: [SRC.forf, SRC.gs, SRC.bilancio2026],
  body: () => {
    const rows = [20000, 25000, 30000, 35000, 40000, 50000, 60000, 70000, 85000].map(r => { const f = CR.calcolaForfettario({ ricavi: r, coefficiente: 78 }), s = CR.calcolaForfettario({ ricavi: r, coefficiente: 78, startup: true }); const eq = CR.calcolaRalDaNetto({ nettoAnnuo: f.nettoAnnuo, mensilita: 13, regione: 'lombardia' }); return [eur(r, 0), eur(f.inps, 0), eur(f.imposta, 0), eur(f.nettoAnnuo, 0), eur(s.nettoAnnuo, 0), eur(eq.ral, 0)]; });
    return `
<h2>Tabella fatturato → netto forfettario 2026 (coefficiente 78%)</h2>
${table(['Fatturato', 'INPS 26,07%', 'Imposta 15%', 'Netto (15%)', 'Netto start-up (5%)', 'RAL equivalente'], rows, { num: [1, 2, 3, 4, 5], caption: 'Gestione separata INPS, nessuna cassa professionale. La RAL equivalente è quella che darebbe lo stesso netto da dipendente in Lombardia su 13 mensilità, senza contare TFR e ferie.' })}
<h2>Come si calcola il netto forfettario</h2>
<div class="formula">Reddito forfettario = Ricavi × coefficiente di redditività
Contributi INPS = Reddito × 26,07% (Gestione separata)
Imposta sostitutiva = (Reddito − contributi) × 15% (o 5%)
Netto = Ricavi − contributi − imposta − costi reali</div>
<p>I costi reali (software, attrezzature, auto, formazione) non si deducono: sono "forfettizzati" nel coefficiente. Un professionista con il 78% ha costi forfettari del 22%: se spende meno, ci guadagna; se spende di più, il regime ordinario può convenire.</p>
<h2>Quello che il netto non dice</h2>
${table(['Dipendente', 'Partita IVA forfettaria'], [
  ['TFR: circa 7% della RAL accantonato', 'Nessun TFR'],
  ['Ferie e permessi pagati (circa 5-6 settimane)', 'Non si fattura quando non si lavora'],
  ['Malattia e maternità coperte', 'Indennità INPS ridotte (ISCRO, maternità gestione separata)'],
  ['Contributi al 33% (9,19% + 24% azienda)', 'Contributi al 26,07% tutti a proprio carico'],
  ['NASpI in caso di licenziamento', 'Nessun ammortizzatore (salvo ISCRO)'],
  ['Mutuo e affitto più facili', 'Serve storico di fatturato'],
  ['Orario e luogo definiti', 'Autonomia su clienti, orari e tariffe']
])}
<h2>Il coefficiente di redditività per attività</h2>
${table(['Attività (gruppi ATECO)', 'Coefficiente'], [
  ['Commercio alimentare e bevande, ristorazione', '40%'], ['Commercio ambulante di altri prodotti', '54%'], ['Commercio ambulante alimentare', '40%'], ['Costruzioni e attività immobiliari', '86%'], ['Intermediari del commercio', '62%'], ['Servizi di alloggio e ristorazione', '40%'], ['Attività professionali, scientifiche, tecniche, sanitarie, istruzione, finanziarie', '78%'], ['Altre attività economiche', '67%']], { num: [1] })}
`; }
}
];
