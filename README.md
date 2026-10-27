# calcoloral.com

Calcolatori gratuiti per stipendio netto, RAL, busta paga, TFR e IRPEF (Italia, parametri 2026).

- Sito statico: l'HTML generato vive nella root del repo e viene servito così com'è (Cloudways → `public_html`).
- Sorgenti in `_build/` (bloccata dal web tramite `.htaccess`):
  - `_build/src/assets/engine.js` — motore di calcolo e **tutti i parametri fiscali** (unico punto da aggiornare ogni anno)
  - `_build/src/assets/ui.js` — interfaccia dei calcolatori (usata anche in build per il pre-render)
  - `_build/src/pages/*.js` — contenuti delle pagine
  - `_build/build.js` — generatore (sitemap, robots, llms.txt, schema, .htaccess)

## Build

```bash
node _build/make_assets.js   # solo se cambia il logo (richiede Playwright)
node _build/build.js         # rigenera il sito nella root
node _build/tests/check.js   # test del motore
node _build/tests/qa.js      # QA con browser headless
```

## Deploy

Push su `main` → Cloudways git pull (manuale dal pannello, oppure automatico via GitHub Actions se sono impostati i secrets `CLOUDWAYS_EMAIL`, `CLOUDWAYS_API_KEY`, `CLOUDWAYS_SERVER_ID`, `CLOUDWAYS_APP_ID`).
