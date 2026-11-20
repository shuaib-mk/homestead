# STATUS

Last updated: end of FEAT-003 (builder and export).

## Done
- Kiro structure: `.kiro/specs/homestead/{requirements,design,tasks}.md`, `.kiro/steering/{product,design,tech}.md`, hook `.kiro/hooks/spec-task-build.kiro.hook`.
- Scaffold: Vite + React + TS strict + Tailwind v4, tokens in `src/index.css`, favicon, SEO/OG meta, `vercel.json`, LICENSE (MIT).
- Data: `src/types.ts`, `src/data/neighbourhoods.ts`, `src/data/seeds.ts` (5 homesteads, 12 entries, view counts).
- Repo layer `src/lib/repo/` (local + supabase, env switch), `src/lib/guestbook.ts`, `src/lib/validateName.ts`, `src/lib/starter.ts` (starter template + `newBlock`).
- `supabase/migrations/20250101000000_init.sql` (tables, RLS, `increment_page_views`).
- Public pages: Landing, Explore (+ Surprise me), Claim (live availability, celebration, starter template), themed 404, public homestead page with street sign, guestbook (sign/delete), animated hit counter, webring, all 11 block renderers in `src/components/blocks`. Tests: webring, safeUrl.
- Builder `/build/:hood/:name` (palette, dnd-kit reorder + move buttons, editors for all 11 blocks, theme panel, autosave, publish/unpublish, owner-only), Export my page (`src/lib/exportHtml.ts`). Verified by `scripts/e2e-builder.mjs` incl. offline file:// render.
- Vitest: name validation, guestbook, webring, safeUrl, export.

## Next (see .kiro/specs/homestead/tasks.md, tasks 9 onward)
- FEAT-004: Playwright flow, screenshots, QA.md, README.md, final commit.

## Blockers
None.

## Notes for resuming
- Commands: `npm run dev`, `npm run build`, `npm test`.
- Branch `feat/homestead`; no push available to sub-agent.
- Stamp ids used in seeds: house, star, heart, floppy, bolt, music, skull, leaf, sun, flame, moon (plus more to make ~12 in the stamps block).
