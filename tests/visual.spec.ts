import path from 'node:path';
import { test } from '@playwright/test';

/**
 * Visual capture, not visual regression. Saves full-page screenshots to
 * test-results/screens/<page>-<project>-<theme>.png for a human to look at.
 * No baselines: the grain, rotations and springy motion would make pixel
 * diffs flaky for no real gain.
 *
 * Captured with reduced motion by default: the pipeline is a pinned,
 * scroll-driven section, and a full-page shot of it in motion mode is mostly
 * empty paper. Reduced motion gives the complete static layout. Set MOTION=1
 * to capture the motion version anyway (or use scripts/scrollshot.mjs to
 * shoot one scroll position).
 *
 * Note: Playwright empties test-results/ at the start of every run.
 */

const PAGES: Array<[string, string]> = [
  ['home', '/'],
  ['coins-me', '/work/coins-me'],
  ['p2p-me', '/work/p2p-me'],
  ['404', '/404'],
];

test.use({ reducedMotion: process.env.MOTION ? 'no-preference' : 'reduce' });

for (const theme of ['light', 'dark'] as const) {
  test.describe(`${theme} theme`, () => {
    test.use({ colorScheme: theme });

    for (const [name, url] of PAGES) {
      test(`capture ${name}`, async ({ page }, testInfo) => {
        test.setTimeout(90_000);
        await page.goto(url);

        // Walk the page so client:visible islands hydrate and reveals play, then settle at the top.
        await page.evaluate(async () => {
          const step = Math.max(innerHeight * 0.5, 200);
          for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
            scrollTo({ top: y, behavior: 'instant' });
            await new Promise((r) => setTimeout(r, 120));
          }
          scrollTo({ top: 0, behavior: 'instant' });
          await document.fonts.ready;
        });
        await page.waitForTimeout(800);

        const file = path.join(testInfo.project.outputDir, 'screens', `${name}-${testInfo.project.name}-${theme}.png`);
        await page.screenshot({ path: file, fullPage: true });
        await testInfo.attach(`${name}-${theme}`, { path: file, contentType: 'image/png' });
      });
    }
  });
}
