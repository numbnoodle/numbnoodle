# numbnoodle.com

Gaurav Pawar's portfolio. The pitch is a **one-person founding team**: one human takes a product from idea to design, code, deployment and growth, with no handoffs. The **noodle** is the motif for that. It's one hand-drawn line that loops through every station: the logo, the hero arrows, the pipeline, the case-study margins and the 404 chart. One noodle, no handoffs.

Astro 7 (static), React 19 for a few islands, Tailwind v4 (CSS-first), TypeScript strict.

---

## Quick start

Needs **Node 22** (there's an `.nvmrc`, so `nvm use` works).

```sh
npm install
npm run dev        # http://localhost:4321, hot reload
npm run build      # astro check (types) + astro build -> dist/
npm run preview    # serves dist/ like production
```

`npm run build` type-checks first, so a type error fails the build on purpose. That check covers `tests/` and `playwright.config.ts` too.

---

## Editing content

**Everything is in [`src/content/site.ts`](src/content/site.ts).** Every word, number and link. Components only render what's in there, so you should almost never need to open a component to change copy.

House rule, also written at the top of the file: **every claim must be true.** P2P.me numbers are company outcomes ("the team I helped build"). Coins.me numbers are yours. If something's missing, leave a `todo` (see below). Don't write filler.

### The exports

| Export | What it drives |
| --- | --- |
| `flags.showTodoNotes` | Shows or hides every TODO note on the site. |
| `person` | Name, handle, role, location, time zone, summary. Used in meta tags, JSON-LD, the footer clock. `person.photo` is reserved and not rendered anywhere yet. |
| `links` | Email, GitHub, LinkedIn, X, resume, and the two live products. Used everywhere, including the command palette. |
| `seo` | `<title>`, description, OG card text, theme colors, `siteUrl`. |
| `nav` | Top-bar links (desktop) and the 404 "jump to" pills. |
| `hero` | Status chip, the `0 → 1 → 250K` headline (`headline.steps`), the footnote, CTAs, and `hero.hats`. |
| `hero.hats` | The four hat tabs. `id` must be `founder`, `designer`, `engineer` or `growth`: each has an icon in `src/lib/icons.ts` and an accent in `Hero.astro`. `line` is the sub-headline, `proof` the mono line under it. |
| `pipeline.stations` | Idea → Design → Code → Ship → Grow. The section title is built from the station `name`s. Each station has a `verb`, `what` and `proof`. The layout is tuned for five. |
| `projects` | The two case files (see below). |
| `shipped` | Section copy for the case files. |
| `earlier` | Earlier roles row (EatX, FITPEO). |
| `education` | Degree, school, years. |
| `toolbox.groups` | The sticker sheet. Four groups (`build`, `design`, `ship`, `grow`), each a list of stickers. If it's on there, you've shipped with it. |
| `manual` | "The founder operating manual": `principles` (title + body), the struck-out `removed` line, `revision`, `signature`. |
| `contact` | Contact poster copy and the copy-email labels. |
| `footer` | Version string and "built with". |
| `notFound` | 404 title and body. |
| `consoleMessage` | The lines printed in devtools. |

### Projects

Each entry in `projects` is a launch card on the homepage and a case study at `/work/<slug>`.

- `slug` is typed as `'coins-me' | 'p2p-me'`. Adding a third project means widening that type.
- `logo`: square app icon in `public/logos/`, shown as a tile on the launch card, the phone placeholder and the case header.
- `pitch`, `role`, `period`, `assembledBy`, `hats` (the pills), `accent` (`lime` or `tomato`).
- `metrics`: `{ value, prefix?, suffix?, label }`. The odometer rolls up to `value`, so `{ value: 60, prefix: '$', suffix: 'M+' }` renders `$60M+`. `metricsLabel` and `metricsNote` sit above them.
- `screenshot`: the phone on the launch card. See [Screenshots](#screenshots).
- `caseStudy`: the chapters. They always render in this order, whatever order you write them in: `problem`, `role`, `designed`, `built`, `shipped`, `grew`, `learned`. Each one has `title`, `body` (paragraphs), optional `points` (bullets), optional `images`, optional `todo`.

### TODO notes

Anything you still owe the site lives in a `todo` field: `pitchTodo`, `screenshot.todo`, `caseStudy[].todo`, `images[].todo`. While `flags.showTodoNotes` is `true`, each one renders as a loud striped sticky note that says **TODO(gaurav):**. The point is that you can't ship one by accident.

When you've filled them in, set `flags.showTodoNotes = false`. Then:

- TODO notes and empty image slots disappear.
- A launch card with no screenshot shows its URL on the phone instead.
- Case-study chapters with nothing in them (no body, points or images) are skipped, so nothing ships as a heading with no words under it.

To find what's left: `grep -n "todo" src/content/site.ts`.

### Screenshots

Put images in `public/work/` (create it if git didn't keep the empty folder), then point `src` at them:

```ts
screenshot: {
  src: '/work/coins-me-home.webp',   // uncomment / add this line
  alt: 'Coins.me app on a phone',
  todo: '…',
},
```

- **Launch card phones** are portrait. Use 1080×2340 (that's the aspect the frame reserves).
- **Case-study images** go in `caseStudy[].images` as `{ src, alt, todo }`. Any size works: the real width and height are read from the file at build time, so there's no layout shift.
- WebP, and write a real `alt`.

### Resume

It lives at **`public/gauravpawar-resume.pdf`**. The hero, the contact poster and the palette's `resume` command all link to it via `links.resume`, and the download buttons save it as `gauravpawar-resume.pdf`.

### Gotchas

- **No arrow glyphs in copy.** The self-hosted fonts are Latin subsets with no `→ ↗ ✓ ●`. Use `<Icon name="arrow-right" />` (Astro) or `<IconR />` (React) from `src/lib/icons.ts`. The one exception is `seo.ogTitle`: the share-card renderer splits it on `→` and draws noodle arrows there, so keep those.
- **Changing the domain?** Update `site` in `astro.config.mjs`, `seo.siteUrl` in `site.ts`, the `Sitemap:` line in `public/robots.txt`, and `PUBLIC_PLAUSIBLE_DOMAIN` if you use it.
- **Changing brand colors?** Update the tokens in `src/styles/global.css` and `BRAND` in `src/lib/raster.ts`. The OG card and icons are rasterised at build time and can't read CSS variables.
- **Changing your X handle?** `links.x` covers the links. The `twitter:site` and `twitter:creator` meta tags in `src/layouts/Base.astro` are hardcoded and need updating separately.

---

## Project structure

```
.
├── astro.config.mjs          site URL, React + sitemap integrations, Tailwind, self-hosted fonts
├── netlify.toml              Netlify build settings
├── playwright.config.ts      e2e config (desktop 1440 + mobile 390)
├── .env.example              optional analytics vars
├── public/
│   ├── _headers              security + cache headers (Cloudflare Pages and Netlify both read it)
│   ├── favicon.svg
│   ├── robots.txt
│   └── work/                 your screenshots go here
├── scripts/                  visual QA helpers (see below)
├── tests/
│   ├── site.spec.ts          behaviour + content guardrails
│   └── visual.spec.ts        full-page captures, no baselines
└── src/
    ├── content/site.ts       ALL the copy. Start here.
    ├── layouts/Base.astro    <head>, meta, JSON-LD, theme boot script, console message
    ├── pages/
    │   ├── index.astro               the homepage
    │   ├── work/[slug].astro         one case study per project
    │   ├── 404.astro                 "This page didn't find product-market fit."
    │   ├── og.png.ts                 1200×630 share card (satori + resvg, at build)
    │   ├── favicon.ico.ts            ┐
    │   ├── apple-touch-icon.png.ts   ├ icons, rasterised from the noodle mark at build
    │   ├── icon-512.png.ts           ┘
    │   └── site.webmanifest.ts       manifest, generated from site.ts
    ├── components/
    │   ├── global/     TopBar, CommandPalette, NoodleCursor, Icon/IconR, NoodleMark,
    │   │               NoodleArrow, SectionHead, TodoNote, Analytics
    │   ├── hero/       Hero + HatSwitcher
    │   ├── pipeline/   the noodle pipeline
    │   ├── shipped/    Shipped, LaunchCard (the product boxes), Ticker, EarlierRow
    │   ├── toolbox/    Toolbox + StickerSheet
    │   ├── manual/     the operating manual
    │   ├── contact/    Contact poster, CopyEmail, Footer
    │   └── case/       case-study parts: header, TOC, jump menu, chapters, image slots, next case
    ├── lib/
    │   ├── noodle.ts     noodleThrough(): the signature loop-noodle path
    │   ├── icons.ts      stroke icon paths shared by Astro and React
    │   ├── theme.ts      get/set/toggle theme
    │   ├── analytics.ts  track() shim
    │   ├── og-image.ts   the share card layout
    │   └── raster.ts     SVG → PNG/ICO helpers, brand colors for rasters
    └── styles/global.css   tokens, type scale, component classes
```

---

## Design system

Neo-brutalist meets zine. Warm paper with a faint grid and grain, ink type, thick borders, hard offset shadows (no blur), slightly rotated cards and stickers, hand-drawn noodles. It's all in [`src/styles/global.css`](src/styles/global.css).

**Tokens.** Brand colors stay the same in both themes: `--paper`, `--paper-hi`, `--paper-lo`, `--ink`, `--lime`, `--tomato`. Semantic tokens flip with the theme: `--bg`, `--surface`, `--sunken`, `--fg`, `--muted`, `--line`, `--shadow`, `--focus`. Geometry: `--bw` (border, 2.5px), `--radius`, `--sh-x/--sh-y` (shadow offset). Motion: `--ease-spring`, `--ease-snap`, `--ease-out`. They're all exposed to Tailwind, so `bg-surface`, `text-muted`, `border-line`, `bg-lime` work.

**Type.** Bricolage Grotesque 800 for display (`font-display`), Instrument Sans for body (`font-sans`), JetBrains Mono for labels and system text (`font-mono`). Scale utilities: `text-mega` (hero), `text-display` (section titles), `text-title`, `text-h3`, `text-lead`, `text-label`. All fluid with `clamp()` and tight tracking. There's an extra `xs:` breakpoint at 26rem.

**Component classes.** `.wrap` (page gutter), `.label` (mono caps), `.mono`, `.slab` (bordered card with hard shadow), `.btn` plus `.btn-lime`, `.btn-tomato`, `.btn-ink`, `.btn-sm`, `.link` (goes wavy on hover), `.pill`, `.sticker` (rotation via `--r`), `.kicker` + `.num` (the `[01] SECTION` header), `.noodle` (stroke styling for noodle paths), `.todo-note`, `.visually-hidden`.

**Accents are for hits, not wallpaper.** Lime and tomato text on paper fails contrast. Use them as a background behind ink text, or as text on ink only.

**Dark mode** is `data-theme="dark"` on `<html>`. It's an ink desk with paper type, not an inversion: same accents, warm shadows, stickers keep their colors. An inline script in `<head>` picks the theme before first paint (your saved choice in `localStorage['nn-theme']`, otherwise the OS setting), so there's no flash. Toggle it from the top bar or the palette. In Tailwind, `dark:` targets it.

**Motion** is snappy and springy, never floaty. Any animation goes inside `@media (prefers-reduced-motion: no-preference)` (or the `motion-ok:` variant), and there's a global clamp for reduced motion as a backstop. Nothing may depend on motion or JS to be readable. There's also a `fine:` variant for hover-capable fine pointers (mouse, trackpad).

---

## Easter eggs

- **Press `/` or `⌘K` / `Ctrl+K`** for the command palette, or use the ⌘ button in the top bar. Fuzzy matching, so `hg` finds "hire gaurav". Commands:
  - `hire gaurav`: copies the email and jumps to contact
  - `open coins.me`, `open p2p.me`: opens the live product
  - `resume`: opens the PDF
  - `email`: copies the address
  - `toggle theme`
  - `noodle mode`: your cursor trails a noodle (lazy-loaded, costs nothing until you ask)
  - plus jump-to items for every section, both case files and GitHub
- **Open devtools.** There's a console message for curious engineers.
- **Visit any URL that doesn't exist**: *"This page didn't find product-market fit."* A users-over-time chart climbs, wobbles and falls off a cliff.
- The toolbox stickers can be dragged around the laptop lid on desktop (double-click snaps one back). Keyboard works too: arrows move, Enter snaps back.

---

## Performance and accessibility

- **Static HTML first.** There are only four React islands: `HatSwitcher` (`client:load`), `StickerSheet` (`client:visible`), `CopyEmail` (`client:visible`) and `CommandPalette` (`client:idle`). Everything else is HTML plus small vanilla scripts for the theme toggle, pipeline scroll, metric tickers, case-study TOC and footer clock.
- **Works without JS.** All content renders. Tickers show their final numbers, every pipeline station is visible, and JS-only controls (palette button, theme toggle) hide themselves via `html:not(.js) .js-only`.
- **Fonts are self-hosted** through the Astro Fonts API, from the `@fontsource-variable` packages (Latin subset, woff2). Astro generates metric-matched fallbacks so text doesn't jump when the fonts land. Only the display font is preloaded.
- **Accessibility.** One `h1` per page and a real heading order. Skip link. Visible focus everywhere (3px ink ring, lime in dark mode). The hat switcher is a proper tablist (arrows, Home, End). The palette is a native `<dialog>` with a combobox. Decorative noodles are `aria-hidden`.

---

## Deploy

It's a static site: build with `npm run build`, serve `dist/`. `dist/404.html` is served for unknown paths on both hosts without any redirect rules, and `public/_headers` is picked up by both.

**Cloudflare Pages**

1. Connect the repo.
2. Framework preset **Astro** (or none). Build command `npm run build`. Output directory `dist`.
3. Environment variable `NODE_VERSION=22`, plus the analytics vars below if you want them.

**Netlify**

Connect the repo. `netlify.toml` already sets the build command, `dist` and `NODE_VERSION=22`. It also geo-routes `/go/p2p` (the P2P.me link): India goes to p2p.lol, everyone else to p2p.me. On hosts without country rules, `src/pages/go/p2p.astro` falls back to a time-zone guess.

Both hosts install devDependencies by default, and the build needs them (`astro check` type-checks the Playwright tests). Don't set `NODE_ENV=production` for the install step.

---

## Analytics (optional, off by default)

Nothing loads unless you set `PUBLIC_ANALYTICS` at **build time**, in `.env` locally or in your host's dashboard. See `.env.example`.

| Variable | Value |
| --- | --- |
| `PUBLIC_ANALYTICS` | `plausible` or `amplitude`. Empty or anything else means no analytics. |
| `PUBLIC_PLAUSIBLE_DOMAIN` | Your site as registered in Plausible. Defaults to `numbnoodle.com`. |
| `PUBLIC_AMPLITUDE_API_KEY` | Required for `amplitude`. Without it, analytics stays off. |

- **Plausible** loads `plausible.io/js/script.js` with your domain, which handles page views.
- **Amplitude** loads the Amplitude Browser SDK (2.11.1) from Amplitude's CDN and turns on page-view autocapture.
- Either one loads only once the browser is idle (`requestIdleCallback`, falling back to a 2s timeout), so it never blocks first paint.
- Custom events go through `track()` in `src/lib/analytics.ts`, which is a no-op when analytics is off. Current events: `palette_open`, `palette_command` (with the command `id`) and `copy_email`. In Plausible, add them as goals to see them.

---

## Visual QA and tests

First time on a new machine: `npx playwright install chromium`.

```sh
# screenshots at 1440 and 390, light and dark. Prints scrollWidth (catches
# horizontal overflow) and any console errors.
npm run shots -- http://localhost:4321/ shots
npm run shots -- http://localhost:4321/work/coins-me shots --mobile --viewport
#   flags: --viewport (first screen only) --mobile --desktop --reduced

# scroll a selector into view and shoot it: url out selector fraction [w] [h] [light|dark]
node scripts/scrollshot.mjs http://localhost:4321/ shots/pipeline.png '#pipeline' 0.5 1440 900 dark
WAIT=2000 node scripts/scrollshot.mjs …   # wait longer before the shot

# slice a tall screenshot into tiles (needs Pillow): png [tileHeight] [scale]
python3 scripts/tiles.py shots/home-desktop-light.png 1800 0.5
```

`shots/` is gitignored.

**End-to-end tests** (Playwright, desktop 1440×900 and mobile 390×844):

```sh
npm run test:e2e                                   # builds, previews on :4322, runs everything
BASE_URL=http://localhost:4321 npx playwright test # against your running dev server, no build
npm run test:visual                                # full-page captures only
```

`tests/site.spec.ts` checks:

- the homepage has exactly one `h1`, and it says 0, 1 and 250K
- every page has one `h1`, and none of them scroll sideways at 360px
- the hat switcher works from the keyboard
- the live links point at the right places
- the P2P.me card says "the team I helped build"
- with reduced motion, all pipeline stations are visible
- without JS, the content is all still there
- the theme toggle works and remembers your choice
- the command palette opens on `/`, `⌘K` and its button
- the JSON-LD Person is there
- `/og.png` and the icons are served

`tests/visual.spec.ts` saves full-page screenshots of every page to `test-results/screens/<page>-<project>-<theme>.png`, for a human to look at. There are no baselines, because grain and rotations make pixel diffs flaky. It captures with reduced motion so the pinned pipeline shows up in full; `MOTION=1` turns motion back on. Playwright clears `test-results/` at the start of each run.
