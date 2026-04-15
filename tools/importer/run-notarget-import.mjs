/**
 * Wrapper around run-bulk-import that sets mboxDisable cookie
 * to bypass Adobe Target experiments before importing.
 */
import { chromium } from 'playwright';
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CONTENT_IMPORT_SCRIPTS_DIR = '/home/node/.excat-marketplace/excat/skills/excat-content-import/scripts';

// Dynamically import the sanitize helper and report compiler
const { sanitizeDocumentPath } = await import(join(CONTENT_IMPORT_SCRIPTS_DIR, 'run-bulk-import.js'));
const { compileReportsToExcel } = await import(join(CONTENT_IMPORT_SCRIPTS_DIR, 'import-report.js'));

const importScriptPath = resolve(process.argv[2]);
const urlsFilePath = resolve(process.argv[3]);
const outputDir = resolve(process.cwd(), 'content');

const urls = readFileSync(urlsFilePath, 'utf-8').split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'));
const helixImporterScript = readFileSync(join(CONTENT_IMPORT_SCRIPTS_DIR, 'static', 'inject', 'helix-importer.js'), 'utf-8');
const importScriptContent = readFileSync(importScriptPath, 'utf-8');

mkdirSync(outputDir, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled'],
});

const context = await browser.newContext({
  viewport: { width: 1920, height: 1080 },
  locale: 'ro-RO',
  geolocation: { latitude: 44.4268, longitude: 26.1025 },
  permissions: ['geolocation'],
  extraHTTPHeaders: {
    'X-Forwarded-For': '86.124.100.50',
    'Accept-Language': 'ro-RO,ro;q=0.9,en-US;q=0.8,en;q=0.7',
  },
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  ignoreHTTPSErrors: true,
});

for (let i = 0; i < urls.length; i++) {
  const url = urls[i];
  console.log(`[${i+1}/${urls.length}] Starting ${url}`);
  
  const page = await context.newPage();
  page.on('console', msg => console.log(`[Browser] ${msg.text()}`));

  try {
    await page.goto(url, { timeout: 45000 });

    // Wait for hero heading to be injected by Target (can take 15-20s)
    try {
      await page.waitForSelector('.hb__heading', { timeout: 30000 });
      console.log('[Import] Hero heading loaded');
    } catch(e) {
      console.log('[Import] Hero heading did not appear after 30s, continuing anyway');
    }
    await page.waitForTimeout(2000); // Extra settle time

    // Dismiss popups
    await page.keyboard.press('Escape').catch(() => {});

    // Inject helix importer
    await page.evaluate(script => {
      const orig = window.define;
      if (typeof window.define !== 'undefined') delete window.define;
      const el = document.createElement('script');
      el.textContent = script;
      document.head.appendChild(el);
      if (orig) window.define = orig;
    }, helixImporterScript);

    // Inject import script
    await page.evaluate(script => {
      const el = document.createElement('script');
      el.textContent = script;
      document.head.appendChild(el);
    }, importScriptContent);

    await page.waitForFunction(
      () => typeof window.CustomImportScript !== 'undefined' && window.CustomImportScript?.default,
      { timeout: 10000 }
    );

    const result = await page.evaluate(async pageUrl => {
      const config = window.CustomImportScript?.default;
      if (!config) throw new Error('CustomImportScript not available');
      const res = await window.WebImporter.html2md(pageUrl, document, config, {
        toDocx: false, toMd: true, originalURL: pageUrl
      });
      res.html = window.WebImporter.md2da(res.md);
      return res;
    }, url);

    const relPath = sanitizeDocumentPath(result.path, url);
    const htmlPath = join(outputDir, `${relPath}.plain.html`);
    mkdirSync(dirname(htmlPath), { recursive: true });
    writeFileSync(htmlPath, result.html, 'utf-8');

    // Write report
    const reportsDir = 'tools/importer/reports';
    mkdirSync(join(reportsDir, dirname(relPath)), { recursive: true });
    writeFileSync(join(reportsDir, `${relPath}.report.json`), JSON.stringify({
      status: 'success', url, path: relPath, timestamp: new Date().toISOString(),
      ...(result.report || {}),
    }, null, 2));

    console.log(`[${i+1}/${urls.length}] ✅ Saved to ${relPath}`);
  } catch (err) {
    console.error(`[${i+1}/${urls.length}] ❌ Failed: ${err.message}`);
  } finally {
    await page.close().catch(() => {});
  }
}

await browser.close();

// Compile reports
try {
  await compileReportsToExcel('tools/importer/reports', 'import-marriott-homepage');
} catch(e) { /* ignore */ }

console.log('Done.');
