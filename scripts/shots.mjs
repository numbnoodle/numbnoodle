// Quick visual QA: node scripts/shots.mjs [url] [outDir] [--viewport] [--reduced]
// Screenshots desktop (1440) + mobile (390) in light + dark.
import { chromium } from '@playwright/test';
import fs from 'node:fs';

const args = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const url = args[0] ?? 'http://localhost:4321/';
const out = args[1] ?? 'shots';
const reduced = process.argv.includes('--reduced');
const viewportOnly = process.argv.includes('--viewport');
const onlyMobile = process.argv.includes('--mobile');
const onlyDesktop = process.argv.includes('--desktop');
fs.mkdirSync(out, { recursive: true });

const executablePath = fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined;
const browser = await chromium.launch({ executablePath });
let configs = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
];
if (onlyMobile) configs = configs.filter((c) => c.name === 'mobile');
if (onlyDesktop) configs = configs.filter((c) => c.name === 'desktop');
const slug = new URL(url).pathname.replace(/\W+/g, '-').replace(/^-|-$/g, '') || 'home';
for (const c of configs) {
  for (const theme of ['light', 'dark']) {
    const ctx = await browser.newContext({
      viewport: { width: c.width, height: c.height },
      deviceScaleFactor: c.deviceScaleFactor ?? 1,
      isMobile: c.isMobile ?? false,
      hasTouch: c.hasTouch ?? false,
      colorScheme: theme,
      reducedMotion: reduced ? 'reduce' : 'no-preference',
    });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    await page.goto(url, { waitUntil: 'networkidle' });
    if (!viewportOnly) {
      await page.evaluate(async () => {
        const step = innerHeight * 0.5;
        for (let y = 0; y < document.body.scrollHeight; y += step) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 150)); }
        scrollTo(0, document.body.scrollHeight); await new Promise((r) => setTimeout(r, 300));
      });
    }
    await page.waitForTimeout(viewportOnly ? 1500 : 800);
    const sw = await page.evaluate(() => document.documentElement.scrollWidth);
    const file = `${out}/${slug}-${c.name}-${theme}${reduced ? '-reduced' : ''}.png`;
    await page.screenshot({ path: file, fullPage: !viewportOnly });
    console.log(file, `scrollWidth=${sw}/${c.width}`, errors.length ? `ERRORS: ${errors.join(' | ')}` : '');
    await ctx.close();
  }
}
await browser.close();
