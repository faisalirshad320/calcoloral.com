// Genera og.png, logo-512.png, apple-touch-icon.png, favicon.ico con Playwright
const { chromium } = require('playwright');
const fs = require('fs'); const path = require('path');
const out = path.join(__dirname, 'src/assets/img'); fs.mkdirSync(out, { recursive: true });
const logo = fs.readFileSync(path.join(__dirname, 'src/assets/favicon.svg'), 'utf8');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  // OG
  await p.setViewportSize({ width: 1200, height: 630 });
  await p.setContent(`<html><body style="margin:0;width:1200px;height:630px;background:#10232f;font-family:ui-sans-serif,Segoe UI,Roboto,Arial;color:#fff;display:flex;flex-direction:column;justify-content:center;padding:70px;box-sizing:border-box">
  <div style="display:flex;align-items:center;gap:18px;font-size:34px;font-weight:800"><span style="width:56px;height:56px">${logo.replace('<svg', '<svg width="56" height="56"')}</span>Calcolo<span style="color:#f2b84b">RAL</span></div>
  <div style="font-size:66px;font-weight:800;line-height:1.1;margin-top:34px;letter-spacing:-.02em">Calcolo stipendio netto 2026<br><span style="color:#8fd3b7">da RAL a netto in un secondo</span></div>
  <div style="font-size:28px;color:#bccbc7;margin-top:28px">IRPEF 23·33·43% · INPS · cuneo fiscale · addizionali di tutte le regioni</div>
  <div style="margin-top:auto;font-size:24px;color:#f2b84b;font-weight:700">www.calcoloral.com</div></body></html>`);
  await p.screenshot({ path: path.join(out, 'og.png') });
  // icons
  for (const [size, name] of [[512, 'logo-512.png'], [180, 'apple-touch-icon.png'], [32, 'favicon-32.png']]) {
    await p.setViewportSize({ width: size, height: size });
    await p.setContent(`<html><body style="margin:0">${logo.replace('<svg', `<svg width="${size}" height="${size}"`)}</body></html>`);
    await p.screenshot({ path: path.join(out, name), omitBackground: true });
  }
  await b.close();
  // favicon.ico from 32px PNG (ICO wrapper with PNG payload)
  const png = fs.readFileSync(path.join(out, 'favicon-32.png'));
  const hdr = Buffer.alloc(6); hdr.writeUInt16LE(0, 0); hdr.writeUInt16LE(1, 2); hdr.writeUInt16LE(1, 4);
  const ent = Buffer.alloc(16); ent[0] = 32; ent[1] = 32; ent[2] = 0; ent[3] = 0; ent.writeUInt16LE(1, 4); ent.writeUInt16LE(32, 6); ent.writeUInt32LE(png.length, 8); ent.writeUInt32LE(22, 12);
  fs.writeFileSync(path.join(out, 'favicon.ico'), Buffer.concat([hdr, ent, png]));
  console.log('assets ok');
})();
