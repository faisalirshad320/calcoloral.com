const CR = require('../src/assets/engine.js');
const show = (o) => console.log(JSON.stringify(o));
// Hand-check case: RAL 30000 Lombardia 0.8% -> expected net ≈ 23,425.52 (/13 = 1,801.96)
show(CR.calcolaNetto({ral:30000, mensilita:13, regione:'lombardia', comunale:0.8}));
// Low income: RAL 15000 -> cuneo bonus + TI
show(CR.calcolaNetto({ral:15000, mensilita:13, regione:'lombardia', comunale:0.8}));
// 20k boundary and 22k
for (const r of [18000,20000,22000,22100,35000,45000,50000,60000,80000,100000]) {
  const x = CR.calcolaNetto({ral:r, mensilita:13, regione:'lombardia', comunale:0.8});
  console.log(r, x.nettoAnnuo, x.nettoMensile, 'bonus', x.bonusCuneo, 'TI', x.trattamentoIntegrativo, 'ult', x.ulterioreDetrazione, 'media%', x.aliquotaMedia);
}
// Monotonic check: net must rise with RAL (note: cliff at 20k cuneo is real, flag it)
let prev=0, drops=[];
for (let r=5000;r<=150000;r+=100){ const n=CR.calcolaNetto({ral:r,regione:'lombardia'}).nettoAnnuo; if(n<prev) drops.push([r,prev,n]); prev=n;}
console.log('drops', drops.length, drops.slice(0,8));
show(CR.calcolaRalDaNetto({nettoMensile:1800, mensilita:13, regione:'lombardia'}));
show(CR.calcolaMensilitaAggiuntiva({lordoMensile:2300, mesi:12, ral:30000}));
show(CR.calcolaTfr({ral:30000, anni:10, inflazione:1.7}));
show(CR.calcolaNaspi({retribuzioneMedia:2000, settimane:208}));
show(CR.calcolaPensioneNetta({lordoMensile:1500, regione:'lazio', comunale:0.9}));
show(CR.calcolaIrpef({reddito:40000, tipo:'dipendente'}));
show(CR.calcolaForfettario({ricavi:40000, coefficiente:78}));
for (const reg of Object.keys(CR.P.regioni)) process.stdout.write(reg+':'+CR.addizionaleRegionale(30000,reg).toFixed(2)+'  ');
console.log();
