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
const LINE = 'Application security, offensive research, AI/LLM testing — and KashSec Academy.';
const STATS = [
  ['5+', 'years in AppSec'],
  ['675+', 'CVEs resolved'],
  ['150+', 'logic flaws found'],
];

const html = `<!doctype html><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap">
<style>
  * { box-sizing: border-box; margin: 0; }
  body {
    width: 1200px; height: 630px; background: #080a0f; color: #eaeff5;
    font-family: Inter, system-ui, sans-serif; position: relative; overflow: hidden;
    padding: 74px 78px; display: flex; flex-direction: column; justify-content: center;
  }
  .glow {
    position: absolute; inset: -34% -14% auto -14%; height: 900px; filter: blur(54px); opacity: .85;
    background:
      radial-gradient(40% 46% at 16% 46%, rgba(239,164,58,.55) 0%, transparent 66%),
      radial-gradient(36% 42% at 84% 22%, rgba(63,182,168,.42) 0%, transparent 68%);
  }
  .in { position: relative; }
  .mark {
    width: 62px; height: 62px; border-radius: 17px; display: grid; place-items: center;
    background: linear-gradient(150deg, #f5b152, #c77f1e); color: #0a0d13;
    font-weight: 800; font-size: 24px; margin-bottom: 30px;
    box-shadow: 0 0 0 1px rgba(255,255,255,.12) inset;
  }
  h1 { font-size: 76px; font-weight: 800; letter-spacing: -.034em; line-height: 1.02; }
  h2 {
    font-size: 38px; font-weight: 700; margin-top: 10px; letter-spacing: -.022em;
    background: linear-gradient(100deg,#efa43a 0%,#f0b968 46%,#57d1c2 100%);
    -webkit-background-clip: text; color: transparent;
  }
  p { font-size: 23px; color: #94a3b2; margin-top: 26px; max-width: 46ch; line-height: 1.45; }
  .stats { display: flex; gap: 46px; margin-top: 42px; }
  .stats b { display: block; font-size: 42px; font-weight: 750; color: #efa43a; letter-spacing: -.02em; }
  .stats span { font-size: 17px; color: #8593a4; }
  .url {
    position: absolute; right: 78px; bottom: 62px; font-size: 20px;
    color: #8593a4; font-weight: 550; letter-spacing: -.005em;
  }
</style>
<div class="glow"></div>
<div class="in">
  <div class="mark">IB</div>
  <h1>${NAME}</h1>
  <h2>${TITLE}</h2>
  <p>${LINE}</p>
  <div class="stats">
    ${STATS.map(([n, l]) => `<div><b>${n}</b><span>${l}</span></div>`).join('')}
  </div>
</div>
<div class="url">ishfaqbhat.vercel.app</div>
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
