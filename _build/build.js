#!/usr/bin/env node
/* CalcoloRAL — generatore statico. Uso: node _build/build.js  (scrive il sito nella root del repo) */
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const REPO = path.resolve(__dirname, '..');
const ROOT = path.join(REPO, 'public');   // webroot (Cloudways: webroot = /public)
const SRC = path.join(__dirname, 'src');
const CR = require('./src/assets/engine.js');
const UI = require('./src/assets/ui.js');

const SITE = 'https://www.calcoloral.com';
const BRAND = 'CalcoloRAL';
const ADSENSE = 'ca-pub-8301212931863478';
const EMAIL = 'contatti@calcoloral.com';
const UPDATED = CR.P.aggiornato;          // 2026-10-27
const UPDATED_IT = '27 ottobre 2026';

/* ---------- carica pagine ---------- */
const pages = [];
fs.readdirSync(path.join(SRC, 'pages')).filter(f => f.endsWith('.js')).sort().forEach(f => {
  const mod = require(path.join(SRC, 'pages', f));
  (Array.isArray(mod) ? mod : mod.pages).forEach(p => pages.push(p));
});
const byPath = Object.fromEntries(pages.map(p => [p.path, p]));

/* ---------- asset con hash ---------- */
function hashed(name, content) {
  const h = crypto.createHash('md5').update(content).digest('hex').slice(0, 8);
  const ext = path.extname(name), base = path.basename(name, ext);
  return { file: `/assets/${base}.${h}${ext}`, content };
}
const css = hashed('site.css', fs.readFileSync(path.join(SRC, 'assets/site.css'), 'utf8'));
const engineSrc = fs.readFileSync(path.join(SRC, 'assets/engine.js'), 'utf8');
const uiSrc = fs.readFileSync(path.join(SRC, 'assets/ui.js'), 'utf8');
const js = hashed('app.js', engineSrc + '\n' + uiSrc);

/* ---------- helpers ---------- */
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const slugify = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/<[^>]+>/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
const stripTags = s => String(s).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const abs = p => SITE + p;

const LOGO_SVG = '<svg viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="8" fill="#0b6e4f"/><path d="M8 22V10h5.2c2.6 0 4.2 1.4 4.2 3.6 0 1.6-.9 2.8-2.4 3.3L18 22h-3l-2.6-4.7H11V22H8zm3-7h2c1 0 1.5-.5 1.5-1.3S14 12.4 13 12.4h-2V15z" fill="#fff"/><circle cx="23" cy="21" r="3" fill="#f2b84b"/></svg>';

const NAV = [
  ['/', 'Stipendio netto'], ['/calcolo-ral-da-netto/', 'RAL da netto'], ['/calcolo-busta-paga/', 'Busta paga'],
  ['/calcolo-tfr/', 'TFR'], ['/calcolo-irpef/', 'IRPEF'], ['/ral/', 'Tabelle RAL']
];

const TOOLS_BOX = [
  ['/', 'Calcolo stipendio netto'], ['/stipendio-netto-2026/', 'Stipendio netto 2026'], ['/calcolo-ral-da-netto/', 'Calcolo RAL da netto'],
  ['/calcolo-busta-paga/', 'Simulatore busta paga'], ['/calcolo-tredicesima/', 'Calcolo tredicesima'], ['/calcolo-quattordicesima/', 'Calcolo quattordicesima'],
  ['/calcolo-tfr/', 'Calcolo TFR'], ['/calcolo-naspi/', 'Calcolo NASpI'], ['/calcolo-pensione-netta/', 'Pensione netta'],
  ['/calcolo-irpef/', 'Calcolo IRPEF'], ['/part-time/', 'Netto part-time'], ['/partita-iva-o-dipendente/', 'Partita IVA o dipendente']
];

function headingIds(html) {
  const toc = [], used = new Set();
  const out = html.replace(/<h2>([\s\S]*?)<\/h2>/g, (m, inner) => {
    let id = slugify(inner); while (used.has(id)) id += '-2'; used.add(id);
    toc.push([id, stripTags(inner)]);
    return `<h2 id="${id}">${inner}</h2>`;
  });
  return { html: out, toc };
}

function faqHtml(faq) {
  if (!faq || !faq.length) return '';
  return '<h2>Domande frequenti</h2><div class="faq">' + faq.map(([q, a]) => `<details><summary>${esc(q)}</summary><div class="a"><p>${a}</p></div></details>`).join('') + '</div>';
}

function sourcesHtml(src) {
  if (!src || !src.length) return '';
  return '<h2>Fonti ufficiali</h2><ul class="sources">' + src.map(([t, u]) => `<li><a href="${u}" rel="noopener" target="_blank">${esc(t)}</a></li>`).join('') + '</ul>';
}

function relatedBox(p) {
  const rel = (p.related || []).map(r => byPath[r]).filter(Boolean);
  if (!rel.length) return '';
  return '<div class="box"><h3>Leggi anche</h3><ul>' + rel.map(r => `<li><a href="${r.path}">${esc(r.short || r.h1)}</a></li>`).join('') + '</ul></div>';
}

function schemaGraph(p, toc) {
  const url = abs(p.path);
  const graph = [
    { '@type': 'Organization', '@id': SITE + '/#org', name: BRAND, url: SITE + '/', logo: { '@type': 'ImageObject', url: SITE + '/assets/logo-512.png', width: 512, height: 512 }, email: EMAIL,
      parentOrganization: { '@type': 'Organization', name: 'Omnia Ventures' } },
    { '@type': 'WebSite', '@id': SITE + '/#website', url: SITE + '/', name: BRAND, inLanguage: 'it-IT', publisher: { '@id': SITE + '/#org' } },
    { '@type': 'WebPage', '@id': url + '#webpage', url, name: p.title, description: p.description, inLanguage: 'it-IT', isPartOf: { '@id': SITE + '/#website' },
      datePublished: p.published || UPDATED, dateModified: UPDATED, breadcrumb: { '@id': url + '#breadcrumb' },
      primaryImageOfPage: { '@type': 'ImageObject', url: SITE + '/assets/og.png' },
      speakable: { '@type': 'SpeakableSpecification', cssSelector: ['.answer'] } }
  ];
  const crumbs = [['Home', '/']].concat(p.crumbs || []);
  graph.push({ '@type': 'BreadcrumbList', '@id': url + '#breadcrumb', itemListElement: crumbs.map(([n, u], i) => ({ '@type': 'ListItem', position: i + 1, name: n, item: abs(u) })) });
  if (p.tool) {
    graph.push({ '@type': 'SoftwareApplication', '@id': url + '#app', name: p.appName || p.h1, applicationCategory: 'FinanceApplication', operatingSystem: 'Web', inLanguage: 'it-IT', url,
      description: p.description, offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' }, publisher: { '@id': SITE + '/#org' }, isAccessibleForFree: true });
  }
  if (p.article !== false) {
    graph.push({ '@type': 'Article', '@id': url + '#article', headline: p.h1, description: p.description, inLanguage: 'it-IT', mainEntityOfPage: { '@id': url + '#webpage' },
      datePublished: p.published || UPDATED, dateModified: UPDATED, author: { '@type': 'Organization', name: 'Redazione ' + BRAND, url: SITE + '/chi-siamo/' }, publisher: { '@id': SITE + '/#org' },
      image: SITE + '/assets/og.png', articleSection: p.section || 'Stipendi e fisco', about: (p.about || []).map(a => ({ '@type': 'Thing', name: a })) });
  }
  if (p.faq && p.faq.length) {
    graph.push({ '@type': 'FAQPage', '@id': url + '#faq', mainEntity: p.faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: stripTags(a) } })) });
  }
  if (p.howto) {
    graph.push({ '@type': 'HowTo', '@id': url + '#howto', name: p.howto.name, totalTime: 'PT2M', step: p.howto.steps.map((s, i) => ({ '@type': 'HowToStep', position: i + 1, name: s[0], text: s[1] })) });
  }
  if (p.dataset) graph.push(Object.assign({ '@type': 'Dataset', '@id': url + '#dataset', license: 'https://creativecommons.org/licenses/by/4.0/', creator: { '@id': SITE + '/#org' }, dateModified: UPDATED, inLanguage: 'it-IT' }, p.dataset));
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph });
}

function layout(p) {
  const body = typeof p.body === 'function' ? p.body({ CR, UI, byPath }) : (p.body || '');
  const { html: bodyHtml, toc } = headingIds(body + faqHtml(p.faq) + sourcesHtml(p.sources));
  const crumbs = [['Home', '/']].concat(p.crumbs || []);
  const crumbHtml = p.path === '/' ? '' : '<nav class="crumbs" aria-label="Percorso"><ol>' + crumbs.map(([n, u], i) => i === crumbs.length - 1 ? `<li aria-current="page">${esc(n)}</li>` : `<li><a href="${u}">${esc(n)}</a></li>`).join('') + '</ol></nav>';
  const tool = p.tool ? UI.toolHtml(p.tool.type, p.tool.defaults || {}) : '';
  const tocHtml = toc.length > 2 ? '<div class="box toc"><h3>In questa pagina</h3><ol>' + toc.map(([id, t]) => `<li><a href="#${id}">${esc(t)}</a></li>`).join('') + '</ol></div>' : '';
  const toolsBox = '<div class="box"><h3>Calcolatori</h3><ul>' + TOOLS_BOX.filter(t => t[0] !== p.path).slice(0, 9).map(([u, n]) => `<li><a href="${u}">${n}</a></li>`).join('') + '</ul></div>';
  const navHtml = NAV.map(([u, n]) => `<a href="${u}"${u === p.path ? ' aria-current="page"' : ''}>${n}</a>`).join('');
  const robots = p.noindex ? 'noindex,follow' : 'index,follow,max-image-preview:large,max-snippet:-1';
  return `<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(p.title)}</title>
<meta name="description" content="${esc(p.description)}">
<link rel="canonical" href="${abs(p.path)}">
<link rel="alternate" hreflang="it-IT" href="${abs(p.path)}">
<link rel="alternate" hreflang="x-default" href="${abs(p.path)}">
<meta name="robots" content="${robots}">
<meta name="theme-color" content="#10232f">
<meta property="og:type" content="${p.tool ? 'website' : 'article'}">
<meta property="og:locale" content="it_IT">
<meta property="og:site_name" content="${BRAND}">
<meta property="og:title" content="${esc(p.ogTitle || p.h1)}">
<meta property="og:description" content="${esc(p.description)}">
<meta property="og:url" content="${abs(p.path)}">
<meta property="og:image" content="${SITE}/assets/og.png">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta property="article:modified_time" content="${UPDATED}T09:00:00+01:00">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
<link rel="stylesheet" href="${css.file}">
<script type="application/ld+json">${schemaGraph(p, toc)}</script>
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE}" crossorigin="anonymous"></script>
</head>
<body>
<a class="skip" href="#main">Vai al contenuto</a>
<header class="site-head"><div class="wrap">
<a class="logo" href="/" aria-label="${BRAND} — home">${LOGO_SVG}<span>Calcolo<b>RAL</b></span></a>
<button class="menu-btn" aria-expanded="false" aria-controls="nav">Menu</button>
<nav class="nav" id="nav" aria-label="Principale">${navHtml}</nav>
</div></header>
<main id="main" class="wrap">
${crumbHtml}
<div class="hero">
<h1>${p.h1}</h1>
${p.lead ? `<p class="lead">${p.lead}</p>` : ''}
<div class="meta"><span class="pill">✓ Parametri ${CR.P.anno} verificati</span><span>Aggiornato il <time datetime="${UPDATED}">${UPDATED_IT}</time></span><span>Redazione ${BRAND}</span></div>
</div>
${tool}
<div class="layout">
<article class="content">
${p.answer ? `<p class="answer">${p.answer}</p>` : ''}
${bodyHtml}
<div class="byline"><div class="av">CR</div><div><strong>Redazione ${BRAND}</strong> — calcoli verificati sui testi di legge, sulle circolari INPS e sulle tabelle del Dipartimento delle Finanze. Ultimo controllo: ${UPDATED_IT}. <a href="/metodologia/">Come calcoliamo</a> · Le informazioni hanno scopo informativo e non sostituiscono la consulenza di un professionista.</div></div>
</article>
<aside class="side">${tocHtml}${relatedBox(p)}${toolsBox}</aside>
</div>
</main>
<footer class="site-foot"><div class="wrap">
<div class="foot-grid">
<div><a class="logo" href="/">${LOGO_SVG}<span>Calcolo<b>RAL</b></span></a><p>Calcolatori gratuiti per stipendio netto, RAL, busta paga, TFR e IRPEF con i parametri fiscali ${CR.P.anno}. Nessuna registrazione, nessun dato salvato: i calcoli avvengono nel tuo browser.</p></div>
<div><h4>Calcolatori</h4><ul>${TOOLS_BOX.slice(0, 6).map(([u, n]) => `<li><a href="${u}">${n}</a></li>`).join('')}</ul></div>
<div><h4>Guide</h4><ul><li><a href="/irpef/scaglioni-2026/">Scaglioni IRPEF 2026</a></li><li><a href="/irpef/addizionale-regionale-2026/">Addizionali regionali 2026</a></li><li><a href="/irpef/detrazioni-lavoro-dipendente-2026/">Detrazioni lavoro dipendente</a></li><li><a href="/irpef/trattamento-integrativo-2026/">Trattamento integrativo</a></li><li><a href="/lordo-netto/">Lordo e netto</a></li><li><a href="/ral/">Cos'è la RAL</a></li></ul></div>
<div><h4>Informazioni</h4><ul><li><a href="/chi-siamo/">Chi siamo</a></li><li><a href="/metodologia/">Metodologia e fonti</a></li><li><a href="/contatti/">Contatti</a></li><li><a href="/privacy/">Privacy</a></li><li><a href="/cookie/">Cookie</a></li></ul></div>
</div>
<p class="legal">© 2026 ${BRAND} · Un progetto Omnia Ventures · Strumenti di stima a scopo informativo: per decisioni fiscali rivolgiti a un CAF, a un consulente del lavoro o a un commercialista.</p>
</div></footer>
<script src="${js.file}" defer></script>
</body>
</html>`;
}

/* ---------- scrittura ---------- */
function writeFile(rel, content) {
  const full = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content);
}
function clean() {
  fs.rmSync(ROOT, { recursive: true, force: true });
  fs.mkdirSync(ROOT, { recursive: true });
}

clean();
writeFile(css.file, css.content);
writeFile(js.file, js.content);

const sitemap = [];
pages.forEach(p => {
  const html = layout(p);
  const rel = p.path === '/' ? 'index.html' : p.path.replace(/^\//, '') + 'index.html';
  writeFile(rel, html);
  if (!p.noindex) sitemap.push(p);
});

/* 404 */
writeFile('404.html', layout({
  path: '/404/', title: 'Pagina non trovata | ' + BRAND, description: 'La pagina che cerchi non esiste.', h1: 'Pagina non trovata', noindex: true, article: false,
  lead: 'Il link potrebbe essere errato o la pagina spostata. Prova uno dei nostri calcolatori.',
  body: '<div class="cards">' + TOOLS_BOX.map(([u, n]) => `<a class="card" href="${u}"><b>${n}</b><span>Apri il calcolatore</span></a>`).join('') + '</div>'
}).replace('<link rel="canonical" href="https://www.calcoloral.com/404/">', ''));

/* sitemap */
writeFile('sitemap.xml', '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  sitemap.map(p => `  <url><loc>${abs(p.path)}</loc><lastmod>${UPDATED}</lastmod><changefreq>${p.changefreq || 'monthly'}</changefreq><priority>${p.priority || '0.7'}</priority></url>`).join('\n') + '\n</urlset>\n');

/* robots */
writeFile('robots.txt', `# ${BRAND} — accesso consentito a motori di ricerca e crawler AI
User-agent: *
Allow: /
Disallow: /_build/

User-agent: GPTBot
Allow: /
User-agent: OAI-SearchBot
Allow: /
User-agent: ChatGPT-User
Allow: /
User-agent: ClaudeBot
Allow: /
User-agent: Claude-User
Allow: /
User-agent: Claude-SearchBot
Allow: /
User-agent: PerplexityBot
Allow: /
User-agent: Perplexity-User
Allow: /
User-agent: Google-Extended
Allow: /
User-agent: Applebot-Extended
Allow: /
User-agent: CCBot
Allow: /
User-agent: Bingbot
Allow: /

Sitemap: ${SITE}/sitemap.xml
`);

/* ads.txt */
writeFile('ads.txt', `google.com, ${ADSENSE.replace('ca-', '')}, DIRECT, f08c47fec0942fa0\n`);

/* llms.txt + llms-full.txt */
const tools = pages.filter(p => p.tool && !p.noindex);
const guides = pages.filter(p => !p.tool && !p.noindex && !p.utility);
writeFile('llms.txt', `# ${BRAND}

> Calcolatori gratuiti e guide per lo stipendio netto in Italia con i parametri fiscali ${CR.P.anno}: da RAL a netto, da netto a RAL, busta paga, TFR, tredicesima, quattordicesima, NASpI, pensione netta, IRPEF e addizionali regionali. Parametri verificati il ${UPDATED_IT} su fonti ufficiali (Legge di Bilancio 2026, L. 207/2024, circolari INPS, Dipartimento delle Finanze).

Regole chiave 2026: IRPEF 23% fino a 28.000 €, 33% da 28.000 a 50.000 €, 43% oltre. Contributi INPS dipendente 9,19% (+1% oltre 56.224 €). Cuneo fiscale: somma esente 7,1%/5,3%/4,8% fino a 20.000 € di reddito; ulteriore detrazione 1.000 € tra 20.000 e 32.000 €, decrescente fino a 40.000 €. Esempio: RAL 30.000 € in Lombardia = circa 1.802 € netti al mese su 13 mensilità.

## Calcolatori
${tools.map(p => `- [${stripTags(p.h1)}](${abs(p.path)}): ${p.description}`).join('\n')}

## Guide
${guides.map(p => `- [${stripTags(p.h1)}](${abs(p.path)}): ${p.description}`).join('\n')}

## Dati
- [Parametri ${CR.P.anno} in JSON](${SITE}/dati/parametri-${CR.P.anno}.json): aliquote IRPEF, INPS, cuneo fiscale, detrazioni, addizionali regionali, NASpI, CCNL
- [Testo completo per LLM](${SITE}/llms-full.txt)
`);

const ralRows = [20000, 22000, 25000, 28000, 30000, 32000, 35000, 38000, 40000, 45000, 50000, 55000, 60000, 70000, 80000, 90000, 100000].map(r => {
  const n13 = CR.calcolaNetto({ ral: r, mensilita: 13, regione: 'lombardia' }), n14 = CR.calcolaNetto({ ral: r, mensilita: 14, regione: 'lombardia' });
  return `| ${UI.eur(r, 0)} | ${UI.eur(n13.nettoAnnuo, 0)} | ${UI.eur(n13.nettoMensile, 0)} | ${UI.eur(n14.nettoMensile, 0)} |`;
}).join('\n');
writeFile('llms-full.txt', `# ${BRAND} — parametri e metodo di calcolo ${CR.P.anno}

Fonte: ${SITE} · Aggiornato: ${UPDATED_IT}

## Metodo
Netto annuo = RAL − contributi INPS − IRPEF netta − addizionale regionale − addizionale comunale + trattamento integrativo + somma esente cuneo fiscale.
IRPEF netta = IRPEF lorda (scaglioni) − detrazione lavoro dipendente − ulteriore detrazione cuneo fiscale (fino a capienza).

## IRPEF ${CR.P.anno}
- fino a 28.000 €: 23%
- 28.000–50.000 €: 33% (era 35% nel 2025)
- oltre 50.000 €: 43%

## Detrazione lavoro dipendente (art. 13 TUIR)
- reddito fino a 15.000 €: 1.955 €
- 15.000–28.000 €: 1.910 + 1.190 × (28.000 − reddito) / 13.000
- 28.000–50.000 €: 1.910 × (50.000 − reddito) / 22.000
- +65 € se il reddito è tra 25.000 e 35.000 €

## Cuneo fiscale (L. 207/2024, art. 1 c. 4-6)
- reddito complessivo fino a 20.000 €: somma esente pari al 7,1% (reddito di lavoro fino a 8.500 €), 5,3% (fino a 15.000 €), 4,8% (oltre 15.000 €)
- 20.000–32.000 €: ulteriore detrazione 1.000 €
- 32.000–40.000 €: 1.000 × (40.000 − reddito) / 8.000

## Contributi INPS ${CR.P.anno}
- 9,19% dipendenti privati (9,49% industria oltre 15 dipendenti; 5,84% apprendisti)
- +1% sulla retribuzione annua oltre 56.224 €

## Trattamento integrativo
1.200 € annui se reddito fino a 15.000 € (con IRPEF lorda superiore alla detrazione lavoro meno 75 €); tra 15.000 e 28.000 € solo se le detrazioni superano l'imposta lorda.

## Addizionali regionali ${CR.P.anno} (Dipartimento delle Finanze)
${Object.values(CR.P.regioni).map(r => `- ${r.nome}: ${r.scaglioni.map(([lim, al]) => (lim === Infinity ? 'oltre' : 'fino a ' + UI.fmt(lim, 0) + ' €') + ' ' + UI.fmt(al, 2) + '%').join('; ')}${r.ridotta ? ` (aliquota ${UI.fmt(r.ridotta.aliquota, 2)}% su tutto il reddito se non supera ${UI.fmt(r.ridotta.finoReddito, 0)} €)` : ''}${r.esenteFino ? ` (esenti i redditi fino a ${UI.fmt(r.esenteFino, 0)} €)` : ''}`).join('\n')}

## NASpI ${CR.P.anno}
75% della retribuzione media fino a ${UI.eur(CR.P.naspi.soglia)} + 25% dell'eccedenza; massimo ${UI.eur(CR.P.naspi.massimo)} al mese; riduzione del 3% al mese dal 6° mese (dall'8° per chi ha almeno 55 anni).

## Tabella RAL → netto (Lombardia, addizionale comunale 0,8%)
| RAL | Netto annuo | Netto mensile (13) | Netto mensile (14) |
|---|---|---|---|
${ralRows}
`);

/* parametri JSON */
writeFile(`dati/parametri-${CR.P.anno}.json`, JSON.stringify(CR.P, (k, v) => v === Infinity ? null : v, 2));

/* .htaccess */
writeFile('.htaccess', `# ${BRAND}
Options -Indexes
DirectoryIndex index.html
ErrorDocument 404 /404.html

<IfModule mod_rewrite.c>
RewriteEngine On
# HTTPS + www
RewriteCond %{HTTPS} off [OR]
RewriteCond %{HTTP_HOST} !^www\\. [NC]
RewriteCond %{HTTP_HOST} ^(?:www\\.)?(.+)$ [NC]
RewriteRule ^ https://www.%1%{REQUEST_URI} [L,R=301]
# blocca sorgenti e file di servizio
RewriteRule ^(_build|\\.git|\\.github)(/|$) - [F,L]
RewriteRule ^(README\\.md|package(-lock)?\\.json)$ - [F,L]
# slash finale per le directory
RewriteCond %{REQUEST_FILENAME} -d
RewriteCond %{REQUEST_URI} !/$
RewriteRule ^(.*)$ /$1/ [L,R=301]
</IfModule>

<IfModule mod_headers.c>
Header always set X-Content-Type-Options "nosniff"
Header always set Referrer-Policy "strict-origin-when-cross-origin"
Header always set X-Frame-Options "SAMEORIGIN"
Header always set Permissions-Policy "geolocation=(), camera=(), microphone=()"
<FilesMatch "\\.(css|js|png|svg|ico|webp|woff2)$">
Header set Cache-Control "public, max-age=31536000, immutable"
</FilesMatch>
<FilesMatch "\\.(html|xml|txt|json)$">
Header set Cache-Control "public, max-age=3600"
</FilesMatch>
</IfModule>

<IfModule mod_deflate.c>
AddOutputFilterByType DEFLATE text/html text/css application/javascript text/plain application/xml application/json image/svg+xml
</IfModule>
AddType application/manifest+json .webmanifest
AddCharset utf-8 .html .css .js .txt .xml .json
`);

/* router PHP per lo stack Nginx di Cloudways */
fs.copyFileSync(path.join(SRC, 'index.php'), path.join(ROOT, 'index.php'));

/* favicon */
fs.copyFileSync(path.join(SRC, 'assets/favicon.svg'), path.join(ROOT, 'favicon.svg'));
['favicon.ico', 'og.png', 'logo-512.png', 'apple-touch-icon.png'].forEach(f => {
  const s = path.join(SRC, 'assets/img', f);
  if (fs.existsSync(s)) fs.copyFileSync(s, path.join(ROOT, f === 'favicon.ico' ? f : 'assets/' + f));
});

console.log(`OK — ${pages.length} pagine, sitemap ${sitemap.length} URL, css ${css.file}, js ${js.file}`);
