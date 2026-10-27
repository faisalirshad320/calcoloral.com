// QA: server locale, apre ogni pagina, controlla errori JS, calcolatori interattivi, link interni, JSON-LD
const http = require('http'), fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const ROOT = path.resolve(__dirname, '../..');
const mime = { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json', '.xml': 'application/xml', '.txt': 'text/plain', '.ico': 'image/x-icon' };
const srv = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html';
  const f = path.join(ROOT, p);
  if (fs.existsSync(f) && fs.statSync(f).isFile()) { res.writeHead(200, { 'content-type': mime[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res); }
  else { res.writeHead(404); res.end('404'); }
}).listen(8765);
const pages = JSON.parse(fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8').match(/<loc>([^<]+)<\/loc>/g).map(s => s.replace(/<\/?loc>/g, '')).map(u => JSON.stringify(u.replace('https://www.calcoloral.com', ''))).join(',').replace(/^/, '[').replace(/$/, ']'));
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const page = await ctx.newPage();
  const errors = [], broken = new Set(), summary = [];
  page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  for (const u of pages) {
    const r = await page.goto('http://localhost:8765' + u, { waitUntil: 'load' });
    if (r.status() !== 200) { errors.push('HTTP ' + r.status() + ' ' + u); continue; }
    // JSON-LD valid
    const ld = await page.$$eval('script[type="application/ld+json"]', s => s.map(x => x.textContent));
    ld.forEach(t => { try { JSON.parse(t); } catch (e) { errors.push('JSON-LD invalid on ' + u); } });
    // internal links
    const links = await page.$$eval('a[href^="/"]', a => a.map(x => x.getAttribute('href')));
    links.forEach(l => { const clean = l.split('#')[0].split('?')[0]; const f = path.join(ROOT, clean.endsWith('/') ? clean + 'index.html' : clean); if (!fs.existsSync(f)) broken.add(u + ' -> ' + l); });
    // tool interaction
    const hasTool = await page.$('[data-tool]');
    let toolOk = 'no-tool';
    if (hasTool) {
      const before = await page.$eval('.tool-out .out', e => e.textContent.trim());
      const inp = await page.$('.tool-form input[type=number]');
      if (inp) { const v = await inp.inputValue(); await inp.fill(String(Math.round((+v || 1000) * 1.37))); await page.waitForTimeout(150); }
      const after = await page.$eval('.tool-out .out', e => e.textContent.trim());
      toolOk = before !== after ? 'ok' : 'NO-CHANGE';
      if (toolOk !== 'ok') errors.push('Tool did not update on ' + u);
    }
    const h1 = await page.$eval('h1', e => e.textContent.trim());
    const title = await page.title();
    const desc = await page.$eval('meta[name=description]', e => e.content);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
    if (overflow) errors.push('Horizontal overflow (mobile) on ' + u);
    summary.push([u, title.length, desc.length, toolOk, overflow ? 'OVERFLOW' : 'fit'].join(' | '));
  }
  // screenshots of 3 pages for visual check
  await page.setViewportSize({ width: 1280, height: 900 });
  for (const [u, n] of [['/', 'home'], ['/ral/30000/', 'ral30'], ['/calcolo-naspi/', 'naspi']]) { await page.goto('http://localhost:8765' + u); await page.screenshot({ path: `/tmp/shot-${n}.png`, fullPage: false }); }
  await page.setViewportSize({ width: 390, height: 844 }); await page.goto('http://localhost:8765/'); await page.screenshot({ path: '/tmp/shot-mobile.png', fullPage: false });
  await b.close(); srv.close();
  console.log(summary.join('\n'));
  console.log('\nBROKEN LINKS:', broken.size ? [...broken].join('\n') : 'none');
  console.log('ERRORS:', errors.length ? errors.join('\n') : 'none');
  process.exit(errors.length || broken.size ? 1 : 0);
})();
