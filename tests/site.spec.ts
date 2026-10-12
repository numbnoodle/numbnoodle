import { expect, test, type Page } from '@playwright/test';
import { pipeline } from '../src/content/site';

/**
 * Behaviour + content guardrails for numbnoodle.com.
 *
 * Links and names are hardcoded on purpose: if site.ts drifts (a typo in a
 * URL, a renamed handle), these should fail loudly rather than follow along.
 */

const PAGES = ['/', '/work/coins-me', '/work/p2p-me', '/404'] as const;

/**
 * Wait until every island that hydrates on its own (client:load, client:idle)
 * has hydrated. Astro removes the `ssr` attribute from <astro-island> once
 * it has. client:visible islands are left alone: they wait for the viewport.
 */
async function waitForHydration(page: Page) {
  await expect(page.locator('astro-island[ssr]:not([client="visible"])')).toHaveCount(0);
}

/** Walk the whole page so lazy islands and scroll effects get their turn. */
async function scrollThrough(page: Page) {
  await page.evaluate(async () => {
    const step = Math.max(innerHeight * 0.6, 200);
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      scrollTo({ top: y, behavior: 'instant' });
      await new Promise((r) => setTimeout(r, 60));
    }
    scrollTo({ top: 0, behavior: 'instant' });
  });
}

test.describe('home', () => {
  test('has exactly one h1, and it says 0, 1 and 250K', async ({ page }) => {
    await page.goto('/');
    const h1 = page.locator('h1');
    await expect(h1).toHaveCount(1);
    await expect(h1).toBeVisible();
    // In order, as the accessible name a screen reader gets (noodle arrows are decorative).
    await expect(h1).toHaveAccessibleName(/\b0\b[\s\S]*\b1\b[\s\S]*\b250K\b/);
  });

  test('hat switcher is keyboard operable', async ({ page }) => {
    await page.goto('/');
    await waitForHydration(page);

    const founder = page.getByRole('tab', { name: 'Founder' });
    const designer = page.getByRole('tab', { name: 'Designer' });
    await expect(founder).toHaveAttribute('aria-selected', 'true');

    await founder.focus();
    await page.keyboard.press('ArrowRight');

    await expect(designer).toHaveAttribute('aria-selected', 'true');
    await expect(designer).toBeFocused();
    await expect(founder).toHaveAttribute('aria-selected', 'false');
    await expect(page.locator('section#top')).toHaveAttribute('data-hat', 'designer');
  });

  test('live links point at the real places', async ({ page }) => {
    await page.goto('/');
    const hrefs = [
      'https://app.coins.me',
      'https://p2p.me',
      'https://github.com/numbnoodle',
      'https://www.linkedin.com/in/gaurav-9b1655198',
      'https://x.com/numbnoodlee',
    ];
    for (const href of hrefs) {
      await expect(page.locator(`a[href="${href}"]`).first(), href).toBeAttached();
    }
    // the mailto may carry a ?subject=, so match the start
    await expect(page.locator('a[href^="mailto:gauravpawar3102@gmail.com"]').first()).toBeAttached();
  });

  test('P2P.me card frames its numbers as company outcomes', async ({ page }) => {
    await page.goto('/');
    const card = page.getByRole('article', { name: 'P2P.me' });
    await expect(card).toBeVisible();
    await expect(card).toContainText('the team I helped build');
  });

  test('JSON-LD describes Gaurav Pawar as a Person', async ({ page }) => {
    await page.goto('/');
    const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
    expect(blocks.length).toBeGreaterThan(0);
    const items = blocks.flatMap((text) => {
      const data: unknown = JSON.parse(text);
      if (Array.isArray(data)) return data as Record<string, unknown>[];
      const obj = data as Record<string, unknown>;
      return Array.isArray(obj['@graph']) ? (obj['@graph'] as Record<string, unknown>[]) : [obj];
    });
    const person = items.find((item) => item['@type'] === 'Person');
    expect(person, 'a schema.org Person block').toBeTruthy();
    expect(person?.name).toBe('Gaurav Pawar');
  });
});

test.describe('every page', () => {
  for (const path of PAGES) {
    test(`exactly one h1 on ${path}`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('h1')).toHaveCount(1);
    });
  }

  test.describe('at 360px wide', () => {
    test.use({ viewport: { width: 360, height: 780 } });

    for (const path of PAGES) {
      test(`no horizontal overflow on ${path}`, async ({ page }) => {
        await page.goto(path);
        await scrollThrough(page);
        await page.evaluate(() => document.fonts.ready);
        const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
        expect(scrollWidth, `documentElement.scrollWidth on ${path}`).toBeLessThanOrEqual(360);
      });
    }
  });
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('every pipeline station is visible', async ({ page }) => {
    await page.goto('/');
    await waitForHydration(page);
    const stations = page.locator('#pipeline [data-station]');
    await expect(stations).toHaveCount(pipeline.stations.length);

    for (const [i, station] of pipeline.stations.entries()) {
      const el = stations.nth(i);
      await el.scrollIntoViewIfNeeded();
      await expect(el).toBeVisible();
      await expect(el.getByRole('heading', { name: station.name, exact: true })).toBeVisible();
      // toBeVisible ignores opacity, so check what actually reaches the screen
      const opacity = await el.evaluate((node) => {
        let o = 1;
        for (let n: Element | null = node; n; n = n.parentElement) o *= Number(getComputedStyle(n).opacity);
        return o;
      });
      expect(opacity, `station ${station.name} effective opacity`).toBeGreaterThan(0.99);
    }
  });
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('the story still reads: headline, pipeline, case files, contact', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
    const stations = page.locator('#pipeline [data-station]');
    await expect(stations).toHaveCount(pipeline.stations.length);
    for (const station of pipeline.stations) {
      await expect(stations.getByRole('heading', { name: station.name, exact: true })).toBeVisible();
    }
    await expect(page.getByRole('article', { name: 'Coins.me' })).toBeVisible();
    await expect(page.getByRole('article', { name: 'P2P.me' })).toBeVisible();
    await expect(page.locator('a[href^="mailto:gauravpawar3102@gmail.com"]').first()).toBeVisible();
  });
});

test.describe('theme', () => {
  test.describe('first visit, OS in dark mode', () => {
    test.use({ colorScheme: 'dark' });
    test('follows the OS', async ({ page }) => {
      await page.goto('/');
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    });
  });

  test.describe('first visit, OS in light mode', () => {
    test.use({ colorScheme: 'light' });
    test('toggle flips html[data-theme] and remembers it', async ({ page }) => {
      await page.goto('/');
      const html = page.locator('html');
      const toggle = page.locator('[data-theme-toggle]');
      await expect(html).toHaveAttribute('data-theme', 'light');

      await toggle.click();
      await expect(html).toHaveAttribute('data-theme', 'dark');
      await expect(toggle).toHaveAttribute('aria-pressed', 'true');

      await page.reload();
      await expect(html).toHaveAttribute('data-theme', 'dark');

      await page.locator('[data-theme-toggle]').click();
      await expect(html).toHaveAttribute('data-theme', 'light');
    });
  });
});

/*
 * Command palette. These depend on src/components/global/CommandPalette.tsx
 * (a client:idle island in Base.astro). Contract: "/" or Cmd/Ctrl+K opens a
 * native <dialog aria-label="Command menu"> with a role="combobox" input; any
 * [data-palette-open] element opens it on click.
 */
test.describe('command palette', () => {
  const COMMANDS = ['hire gaurav', 'open coins.me', 'open p2p.me', 'resume', 'email', 'toggle theme', 'noodle mode'];

  test('opens on "/"', async ({ page }) => {
    await page.goto('/');
    await waitForHydration(page);
    await page.keyboard.press('/');
    const dialog = page.getByRole('dialog', { name: 'Command menu' });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('combobox')).toBeFocused();
  });

  test('opens on Cmd/Ctrl+K and closes on Escape', async ({ page }) => {
    await page.goto('/');
    await waitForHydration(page);
    const dialog = page.getByRole('dialog', { name: 'Command menu' });
    await page.keyboard.press('ControlOrMeta+K');
    await expect(dialog).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
  });

  test('opens from a [data-palette-open] trigger and lists the commands', async ({ page }) => {
    await page.goto('/');
    await waitForHydration(page);
    await page.locator('[data-palette-open]').first().click();
    const dialog = page.getByRole('dialog', { name: 'Command menu' });
    await expect(dialog).toBeVisible();
    const list = dialog.getByRole('listbox');
    for (const label of COMMANDS) await expect(list, label).toContainText(label);
  });
});

test.describe('assets', () => {
  test('/og.png is a 1200x630 PNG', async ({ request }) => {
    const res = await request.get('/og.png');
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toContain('image/png');
    const png = await res.body();
    expect(png.subarray(0, 8).toString('hex'), 'PNG signature').toBe('89504e470d0a1a0a');
    expect(png.readUInt32BE(16), 'width').toBe(1200);
    expect(png.readUInt32BE(20), 'height').toBe(630);
  });

  // Everything Base.astro links from <head>.
  const HEAD_ASSETS: Array<[string, RegExp]> = [
    ['/favicon.ico', /image\/(x-icon|vnd\.microsoft\.icon)/],
    ['/favicon.svg', /image\/svg\+xml/],
    ['/apple-touch-icon.png', /image\/png/],
    ['/icon-512.png', /image\/png/],
    ['/site.webmanifest', /application\/(manifest\+)?json/],
  ];
  for (const [path, type] of HEAD_ASSETS) {
    test(`${path} is served`, async ({ request }) => {
      const res = await request.get(path);
      expect(res.status()).toBe(200);
      expect(res.headers()['content-type']).toMatch(type);
    });
  }
});
