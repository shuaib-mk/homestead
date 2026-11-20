# QA

## Re-run after review fixes
Run against code commit `4bbc293d092295548aac1e1707aa757506081d12` (the review-fix commit; branch `chore/qa-rerun`, same code as `feat/homestead` and `main`). Demo mode: no `VITE_SUPABASE_*` variables in the shell, no `.env` file.

| Check | Result |
|---|---|
| `npm run build` | PASS |
| `npm test` | PASS, 5 files, 28 tests |
| `scripts/smoke.mjs` | PASS, `console errors: []` |
| `scripts/e2e-public.mjs` | PASS, `console errors: []` |
| `scripts/e2e-builder.mjs` | PASS, `console errors: []` (webring buttons measured mid-animation as under 44px, as before) |
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
| `vercel.json` SPA fallback | PASS | Rewrite `/(.*)` to `/index.html`; deep links load under `vite preview` |
| Supabase code path | PASS (static) | Build type-checks `supabaseRepo`; columns, check constraints, RPC `increment_page_views(hid)` and RLS in the migration match its queries. Not run against a live project, see BLOCKERS.md |
| A11y: labels, alt, keyboard, focus, reduced motion, lang | PASS | Inputs located by label in every script, keyboard reorder works, `lang="en"`, one `h1` per page, reduced-motion rules in `index.css` |
| Touch targets >= 44px at 390px | PASS | e2e-public reports none except webring buttons measured mid pop-in animation (about 42.7px); they settle at 44px |
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
