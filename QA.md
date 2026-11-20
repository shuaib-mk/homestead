# QA

## Final polish run (current)
Date 2026-11-20. Code commit `39902bff6c2e81ffdcf1159a642acfed2c3907df` on branch `fix/final-polish`, branched from `main` at `2f864d5`. Demo mode: no `VITE_SUPABASE_*` variables, no `.env`. Headless Chromium via Playwright against a production build (`npm run build`, then `vite preview`). `vite preview` now serves the headers from `vercel.json` (see `vite.config.ts`), so every browser script runs under the real Content-Security-Policy.

| Check | Result |
|---|---|
| `npm run build` | PASS (strict `tsc -b`, then vite build) |
| `npm test` | PASS, 5 files, 31 tests (3 new: safeUrl scheme bypasses, safeUrl output encoding, exported HTML with hostile input) |
| `node scripts/migration-test.mjs` | PASS, 20 of 20 checks |
| `scripts/smoke.mjs` | PASS, `console errors: []`. Also asserts the five security headers are present, no `securitypolicyviolation` events fire, no seeded link points at example.com, internal seeded links return 200, and a hostile guestbook message renders as text with 0 injected elements and no script execution |
| `scripts/e2e-public.mjs` | PASS, `console errors: []` |
| `scripts/e2e-builder.mjs` | PASS, `console errors: []` (viewports 1440 and 390; webring buttons 44.3px tall) |
| `scripts/qa.mjs` | PASS, `console errors: []` |

What this pass changed, and how it was checked:
- **Placeholder links.** The new link-list block now defaults to "Explore Homestead" (`/explore` on the live site). Sample pages link to other sample pages, Explore and Claim. Links are absolute `https://homestead-seven-gray.vercel.app/...` URLs because `safeUrl` only allows http(s). smoke.mjs lists the rendered hrefs and requests each internal one.
- **Security headers** in `vercel.json`: CSP (`default-src 'self'`, scripts from self only, Google Fonts, https images, Supabase connect, `frame-ancestors 'self'`, `object-src 'none'`), `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` with camera, microphone and geolocation off. Not verified on Vercel itself, only under `vite preview` with the same values.
- **Social meta.** `og:image` is the absolute `https://homestead-seven-gray.vercel.app/og.svg` and `og:url` is added.
- **URL safety.** `safeUrl` already rejected everything below; tests now pin it: mixed-case and upper-case `javascript:`, leading spaces, newlines, tabs, NUL and C0 control characters and no-break space, tabs and newlines inside the scheme, `vbscript:`, `data:` (also upper case), protocol-relative `//` and `///`, backslashes, relative paths, `file:`, `blob:`, `ftp:`, `mailto:`, `about:`, bare `https` and `http:`. No code change was needed. The exported HTML goes through the same function and the same escaping; a unit test feeds it hostile titles, text, alt text, link labels, `javascript:` and `//` URLs, a quote-breaking URL and a hostile guestbook entry, and finds no script tags, event-handler attributes or unsafe hrefs.
- **Guestbook and text.** There is no raw-HTML block in this app. All user text is rendered by React (escaped) or by `esc()` in the exporter, and guestbook input also has well-formed tags stripped on entry.

Limits: CSP and headers were checked locally only. Supabase was not run against a live project (BLOCKERS.md). Some tests below are history from earlier runs and cite earlier counts (28 tests).

## Earlier run (owner-token RLS, Supabase seeding, visual review)
Date 2026-11-20. Code commit `4c44ac1b95e136bfb2b8c9eb20ae6719fd7c3e89` on branch `chore/finish` (docs-only commits follow it). Demo mode: no `VITE_SUPABASE_*` variables in the shell, no `.env` file. Headless Chromium via Playwright.

| Check | Result |
|---|---|
| `npm run build` | PASS (exit 0, strict `tsc -b` then vite build) |
| `npm test` | PASS, 5 files, 28 tests |
| `node scripts/migration-test.mjs` | PASS, 20 of 20 checks (anon cannot update, delete, read the hash or write counters; RPCs reject a wrong token and token-less pages; right token saves and deletes; migration re-runs cleanly) |
| `scripts/smoke.mjs` | PASS, `console errors: []` |
| `scripts/e2e-public.mjs` | PASS, `console errors: []` |
| `scripts/e2e-builder.mjs` | PASS, `console errors: []`, webring buttons 44.3px tall at 1440 and 390 |
| `scripts/qa.mjs` | PASS, `console errors: []` |
| Visual review at 1440 and 390: landing, explore, claim, 404, published page, builder | PASS. No horizontal overflow and no interactive element under 44px once animations settle (a 43px reading on the builder preview's sign button came from the 220ms entrance scale, not the layout). No visual defects found, so no CSS changes. Screenshots refreshed in `docs/screenshots/`. |
| Supabase path against a live project | NOT RUN (no project available). SQL tested on PGlite only. See BLOCKERS.md. |

The scripts regenerated `docs/exported-sample.html` and some screenshots.

## Re-run after review fixes
Run against code commit `4bbc293d092295548aac1e1707aa757506081d12` (the review-fix commit; branch `chore/qa-rerun`, same code as `feat/homestead` and `main`). Demo mode: no `VITE_SUPABASE_*` variables in the shell, no `.env` file.

| Check | Result |
|---|---|
| `npm run build` | PASS |
| `npm test` | PASS, 5 files, 28 tests |
| `scripts/smoke.mjs` | PASS, `console errors: []` |
| `scripts/e2e-public.mjs` | PASS, `console errors: []` |
| `scripts/e2e-builder.mjs` | PASS, `console errors: []` (webring buttons now measured after animations settle and asserted >= 44px; no small targets reported) |
| `scripts/qa.mjs` | PASS, `console errors: []` |

Nothing failed, so no code changes were needed. The run regenerated `docs/exported-sample.html`. The sections below are the original QA from before the review fixes.

Run on branch `feat/homestead`, demo mode (no env vars), headless Chromium via Playwright.
Commands: `npm run build`, `npm test` (28 tests), `node scripts/qa.mjs` (core flow + screenshots), `node scripts/e2e-public.mjs`, `node scripts/e2e-builder.mjs`, `node scripts/smoke.mjs`. All report `console errors: []`.

## Definition of done
| Item | Result | Evidence |
|---|---|---|
| `npm run build` | PASS | `tsc -b && vite build` exits 0, strict TS |
| Zero console errors | PASS | All four browser scripts print `console errors: []` (failed picsum image loads offline are filtered; the renderer shows a placeholder) |
| Core flow land, claim, build, publish, view, sign, counter, webring, export, open file | PASS | `scripts/qa.mjs` prints OK, covering every step; exported file opened via `file://` offline and shows the edited heading and the signed entry |

## Product spec
| Feature | Result | Evidence |
|---|---|---|
| Landing: story hero, 6 neighbourhood cards, sample strip, webring and export promise, footer | PASS | `landing-1440.png`, `landing-390.png`; e2e-public counts 6 hood links |
| Claim rules: 3-24 chars, a-z 0-9 hyphen, no edge hyphen, reserved names, live availability, plain-word errors | PASS | Unit tests for name validation; qa.mjs rejects `admin` and `-bad-`; e2e-public shows "taken in SoHo" |
| Claim creates starter page, celebration, opens builder | PASS | qa.mjs waits for `/build/motorcity/qa-garage`; builder lists 4 starter blocks |
| 11 block types (add, edit, render) | PASS | e2e-builder adds and edits all 11 types |
| Reorder: drag, keyboard drag, move buttons, glide | PASS | e2e-builder pointer, keyboard sensor and button reorder asserted |
| Delete with confirm | PASS | e2e-builder "Keep it" keeps, "Delete block" removes |
| Theme controls: 5 patterns tinted by neighbourhood, 3 font pairs, accents | PASS | e2e-builder; preview and public page have identical `--hs-*` style |
| Save and publish: autosave indicator, Published state, View page | PASS | "Saved just now" asserted; publish/unpublish toggles Published/Draft; draft gives 404 |
| Public page: street sign, theme, footer link, per-page title | PASS | Title `tester-one's page · SoHo · Homestead` asserted |
| Guestbook rules: 50/500 limits, plain text, no links, newest first, empty state, owner delete, cooldown | PASS | `<script>` input renders as text; second sign shows "sign again in"; empty state "No one has signed yet" |
| Hit counter: persisted, ticks per view, animated digits | PASS | qa.mjs: count +1 after reload; edits do not reset it |
| Webring: previous/random/next | PASS | qa.mjs hops via Next and Random from `/soho/lenses-by-mara` (ring of 2 after claiming a second SoHo page) |
| Webring single-page case | PASS | qa.mjs: MotorCity page shows "only homestead in MotorCity" and links to itself |
| Explore: counts, newest, Surprise me | PASS | e2e-public sees "Travelling..." overlay then lands on a page; `?hood=soho` shows "Newest in SoHo" |
| Export: one self-contained HTML, offline render | PASS | No `<script>` or stylesheet link; offline `file://` context renders; `export-offline-*.png` |
| 5 seeded samples with entries and counts | PASS | `src/data/seeds.ts`: 5 pages in 5 neighbourhoods, 12 entries; each opens in smoke.mjs |
| SEO, titles, favicon | PASS | `index.html` title, description, Open Graph, `favicon.svg`, `og.svg`; per-page titles via `useMeta` |
| Themed 404 | PASS | `/soho/nope` shows "This homestead hasn't been built yet" |
| `vercel.json` SPA fallback and security headers | PASS | Rewrite `/(.*)` to `/index.html`; deep links load under `vite preview`; headers section checked by smoke.mjs |
| Supabase code path | PASS (static) | Build type-checks `supabaseRepo`; columns, check constraints, RPC `increment_page_views(hid)` and RLS in the migration match its queries. Not run against a live project, see BLOCKERS.md |
| A11y: labels, alt, keyboard, focus, reduced motion, lang | PASS | Inputs located by label in every script, keyboard reorder works, `lang="en"`, one `h1` per page, reduced-motion rules in `index.css` |
| Touch targets >= 44px at 390px | PASS | e2e-builder measures webring buttons after animations finish at 1440px and 390px: Previous 148.2x44.3, Random 135.2x44.3, Next 109.2x44.3 px. The earlier 42.7px was a mid pop-in reading; no CSS change needed |
| 390px layout, no horizontal scroll | PASS | `scrollWidth <= innerWidth` asserted for landing, explore, claim, public pages, builder tabs, export |
| 1440px layout | PASS | Screenshots reviewed |

## Design hard rules
| Rule | Result | Evidence |
|---|---|---|
| No emoji as UI icons | PASS | Regex search of `src` and `index.html` for emoji ranges finds none; icons are lucide SVGs |
| No blue-purple gradients | PASS | Gradients are hard-stop patterns (hazard stripe, dots, grids), no blends |
| Pixel font only on headings and labels | PASS | Silkscreen via `font-display` on headings, chips, buttons and labels; body text uses Space Grotesk |

## Defects found and fixed during QA
- Builder at 390px scrolled sideways (953px wide) because implicit grid columns grew with palette and block rows. Fixed with `minmax(0,1fr)` columns in `Builder.tsx`, `Palette.tsx`, `BlockList.tsx`.
- Supabase `select` policy hid unpublished pages from their owner. Changed to `using (true)`; the app already hides drafts.

## Screenshots
`docs/screenshots/`: `landing-1440.png`, `landing-390.png`, `builder-1440.png`, `builder-390.png`, `published-1440.png`, `published-390.png`, plus `export-offline-1440.png` and `export-offline-390.png`.
