#!/usr/bin/env node
/*
 * Renders assets/og.png — the card every LinkedIn/X/Slack/Discord share shows.
 *
 * Generated rather than hand-made so it can't quietly go stale: the numbers
 * come from the constants below and the whole thing is one `npm run build`
 * away from being correct again.
 *
 * If Chromium isn't available the existing PNG is left alone with a warning,
 * so the build still works on a machine without browsers installed.
 */
import { writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'assets/og.png');

const NAME = 'Ishfaq Ahmad Bhat';
const TITLE = 'Sr. Application Security Engineer';
const LINE = 'Sr. Application Security Engineer at R1RCM. Offensive research, AI/LLM security, and KashSec Academy — a free cybersecurity course.';
const STATS = [
  ['5+', 'years in AppSec'],
  ['675+', 'CVEs resolved'],
  ['150+', 'logic flaws found'],
  ['20+', 'teams covered'],
];

const ROWS = STATS.map(function (s) {
  return '<div><b>' + s[0] + '</b><span>' + s[1] + '</span></div>';
}).join('');

const html = `<!doctype html><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600&display=swap">
<style>
  * { box-sizing: border-box; margin: 0; }
  body {
    width: 1200px; height: 630px; background: #f2efe8; color: #14130f;
    font-family: Inter, system-ui, sans-serif; padding: 58px 66px 52px;
    display: flex; flex-direction: column; justify-content: space-between;
  }
  .top { display: flex; justify-content: space-between; align-items: baseline;
         border-bottom: 1px solid #14130f; padding-bottom: 15px; }
  .mono { font-family: ui-monospace, Menlo, monospace; font-size: 14px;
          letter-spacing: .16em; text-transform: uppercase; color: #6b6759; }
  h1 { font-family: "Instrument Serif", Georgia, serif; font-weight: 400;
       font-size: 78px; line-height: .98; letter-spacing: -.02em; max-width: 17ch; }
  h1 .it { font-style: italic; color: #1f3bd6; }
  p.lede { font-size: 20px; line-height: 1.45; color: #3a382f; max-width: 56ch; margin-top: 20px; }
  .stats { display: flex; border-top: 1px solid #14130f; }
  .stats div { flex: 1; padding: 18px 18px 0 0; border-right: 1px solid #d5cfc0; }
  .stats div:last-child { border-right: 0; }
  .stats b { display: block; font-family: "Instrument Serif", Georgia, serif;
             font-weight: 400; font-size: 40px; line-height: 1; margin-bottom: 5px; }
  .stats span { font-family: ui-monospace, Menlo, monospace; font-size: 12px;
                letter-spacing: .12em; text-transform: uppercase; color: #6b6759; }
</style>
<div class="top">
  <span class="mono">${NAME}</span>
  <span class="mono">${TITLE}</span>
</div>
<div>
  <h1>I break software, <span class="it">then teach the fix.</span></h1>
  <p class="lede">${LINE}</p>
</div>
<div class="stats">${ROWS}</div>
`;



let chromium;
try {
  ({ chromium } = await import('playwright'));
} catch {
  console.warn('! playwright not installed — leaving assets/og.png as-is');
  process.exit(existsSync(out) ? 0 : 0);
}

/* Playwright's bundled browser is pinned to the exact package version, which
 * breaks whenever the machine has a Chromium from a different install. Fall
 * back to any browser we're pointed at before giving up. */
const candidates = [
  undefined,
  process.env.CHROME_PATH,
  '/opt/pw-browsers/chromium',
  '/usr/bin/chromium',
  '/usr/bin/google-chrome',
].filter((p, i) => i === 0 || (p && existsSync(p)));

let browser, lastErr;
for (const executablePath of candidates) {
  try {
    browser = await chromium.launch(executablePath ? { executablePath } : {});
    break;
  } catch (err) {
    lastErr = err;
  }
}
if (!browser) {
  console.warn('! chromium unavailable (' + lastErr.message.split('\n')[0] + ') — leaving assets/og.png as-is');
  process.exit(0);
}

const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.setContent(html, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
writeFileSync(out, await page.screenshot({ type: 'png' }));
await browser.close();
console.log('assets/og.png written (1200x630)');
