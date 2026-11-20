# Homestead

**GeoCities, resurrected.** Claim an address in a themed neighbourhood, build a personal homepage with a visual editor, get a guestbook and a hit counter, hop a webring, and export your page as a single HTML file.

## The story

From 1994 to 2009 GeoCities gave millions of people their first home on the web: an address in a neighbourhood like `/SunsetStrip/`, a page full of personality, a guestbook and a hit counter. In 2009 Yahoo shut it down and those pages vanished. Today most online identity is a uniform profile. Homestead brings the personal homepage back and fixes the part that hurt: **this time, your page is yours.** Export it at any time and host it anywhere.

![Landing](docs/screenshots/landing-1440.png)

## Features

- Landing page that tells the story, six neighbourhoods and sample homesteads
- Claim an address `/<neighbourhood>/<name>` with live availability and plain-word rules
- Visual builder with 11 blocks: header, text, image, gallery, link list, guestbook, hit counter, webring badge, divider, under construction, stamp wall
- Drag to reorder, keyboard move buttons, side-panel editing, delete with confirm
- Theme: 5 background patterns tinted per neighbourhood, 3 font pairs, neighbourhood accents
- Autosave and publish, with a live preview that uses the same renderer as the public page
- Public page with a vintage street sign, guestbook (plain text, owner delete) and animated hit counter
- Per-neighbourhood webring: previous, random, next, with a single-page fallback
- Explore with live counts, newest pages and Surprise me
- Export to one self-contained HTML file that renders offline
- Five seeded sample homesteads, themed 404, SEO tags, favicon, 390px and 1440px layouts

![Builder](docs/screenshots/builder-1440.png)
![Published page on mobile](docs/screenshots/published-390.png)

## Tech stack

React, Vite, TypeScript (strict), Tailwind CSS v4, React Router, dnd-kit, lucide-react, Supabase (optional), Vitest, Playwright for QA.

Data goes through one `Repo` interface with two implementations: `localRepo` (localStorage, demo mode) and `supabaseRepo`. Blocks are a discriminated union stored as `jsonb`, so one renderer serves the builder preview, the public page and the exporter.

## How Kiro was used

- **Specs:** `.kiro/specs/homestead/` holds `requirements.md` (user stories with acceptance criteria), `design.md` and `tasks.md`, the build order ticked off as work landed.
- **Steering:** `.kiro/steering/product.md`, `design.md` and `tech.md` keep product voice, design rules (no emoji icons, pixel font for headings and labels only) and stack conventions consistent.
- **Hook:** `.kiro/hooks/spec-task-build.kiro.hook` runs `npm run build` whenever a task in `tasks.md` is ticked.
- **MCP:** none configured, so the database schema is written as SQL in `supabase/migrations/` instead of being applied through an MCP server. See `DECISIONS.md`.

## Run locally

```bash
npm install
npm run dev           # http://localhost:5173
npm run build         # type-check and production build
npm test              # unit tests
node scripts/qa.mjs   # after build: end-to-end flow and screenshots (needs `npx playwright install chromium`)
```

With no env vars the app runs entirely on localStorage. Everything works, per browser.

## Environment variables (optional)

| Name | Purpose |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon public key |

Set both to switch to the Supabase repository. Apply `supabase/migrations/20250101000000_init.sql` first. RLS is demo-grade (no auth). See `.env.example`.

## Deploy to Vercel

1. Push the repo to GitHub and import it in Vercel (framework preset: Vite).
2. Build command `npm run build`, output directory `dist`.
3. Optionally add the two env vars above.
4. Deploy. `vercel.json` rewrites every path to `index.html` so deep links work.

## Going public + submission checklist

- [ ] Flip the GitHub repo to public
- [ ] Confirm `LICENSE` (MIT) shows on the repo page
- [ ] Confirm the live URL works, including a deep link such as `/soho/lenses-by-mara` and the 404 page
- [ ] Demo video notes: land, claim an address, add and reorder blocks, change the theme, publish, sign the guestbook, watch the counter tick, hop the webring, export and open the file; mention the Kiro specs, steering and hook
- [ ] Add the live URL and video link to this README

## More

`QA.md` (checklist), `DECISIONS.md`, `STATUS.md`, `BLOCKERS.md`.

## License

MIT
