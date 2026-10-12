import fs from 'node:fs';
import { defineConfig } from '@playwright/test';

/**
 * E2E + visual capture for numbnoodle.com.
 *
 *   npm run test:e2e                      builds, previews on :4322, runs everything
 *   BASE_URL=http://localhost:4321 \
 *     npx playwright test                 runs against a server you already have
 *                                         (e.g. `npm run dev`), no build
 */
const PORT = 4322;
const BASE_URL = process.env.BASE_URL;

// The cloud sandbox ships its own Chromium. Anywhere else, use Playwright's
// (`npx playwright install chromium` once).
const SANDBOX_CHROMIUM = '/opt/pw-browsers/chromium';
const executablePath = fs.existsSync(SANDBOX_CHROMIUM) ? SANDBOX_CHROMIUM : undefined;

export default defineConfig({
  testDir: 'tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: BASE_URL ?? `http://localhost:${PORT}`,
    browserName: 'chromium',
    trace: 'retain-on-failure',
    launchOptions: executablePath ? { executablePath } : {},
  },
  projects: [
    {
      name: 'desktop',
      use: { viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'mobile',
      use: {
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
  // With BASE_URL set we test whatever is already running there.
  webServer: BASE_URL
    ? undefined
    : {
        command: `npm run build && npm run preview -- --port ${PORT}`,
        url: `http://localhost:${PORT}`,
        reuseExistingServer: true,
        timeout: 180_000,
      },
});
