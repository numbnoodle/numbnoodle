// node scripts/scrollshot.mjs <url> <out.png> <selector> <fractionIntoSection> [width] [height] [theme]
import { chromium } from '@playwright/test';
import fs from 'node:fs';
const [url, out, sel, frac = '0', w = '1440', h = '900', theme = 'light'] = process.argv.slice(2);
const browser = await chromium.launch({ executablePath: fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined });
const mobile = Number(w) < 600;
const ctx = await browser.newContext({ viewport: { width: Number(w), height: Number(h) }, colorScheme: theme, deviceScaleFactor: mobile ? 2 : 1, isMobile: mobile, hasTouch: mobile });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await page.goto(url, { waitUntil: 'networkidle' });
await page.evaluate(async ([sel, frac]) => {
  const el = document.querySelector(sel);
  const top = el.getBoundingClientRect().top + scrollY;
  const span = Math.max(el.offsetHeight - innerHeight, 0);
  const target = top + span * Number(frac);
  for (let y = scrollY; y < target; y += 200) { scrollTo(0, y); await new Promise(r => setTimeout(r, 16)); }
  scrollTo(0, target);
}, [sel, frac]);
await page.waitForTimeout(900);
await page.screenshot({ path: out });
console.log(out, errors.join(' | '));
await browser.close();
