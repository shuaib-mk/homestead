# STATUS

Complete and live at https://homestead-seven-gray.vercel.app. The repo is public (MIT). All earlier PRs are merged into `main`. Branch `fix/final-polish` holds the last polish pass (placeholder links, security headers, social meta, URL-safety tests, docs); see `QA.md` for the run.

## Done
- Kiro specs, steering, hook; scaffold; data and repo layers (local and Supabase); migrations.
- Landing, Explore, Claim, public page, guestbook, hit counter, webring, 404.
- Builder with 11 blocks, reorder, theme, autosave, publish, export.
- Owner edit-token RLS, Supabase seeding, signing cooldown.
- Security headers in `vercel.json`, absolute Open Graph tags, no placeholder domains in user-facing code.
- QA: `scripts/qa.mjs`, `e2e-public.mjs`, `e2e-builder.mjs`, `smoke.mjs`, `migration-test.mjs`; 31 Vitest tests.
- README, QA.md, BLOCKERS.md, DECISIONS.md, screenshots in `docs/screenshots/`.

## Open
- Supabase mode has never run against a live project. The live site runs in demo mode (browser localStorage). Apply both migrations to a project and click through the core flow before relying on it (BLOCKERS.md).
- Demo video and its link in the README, if the submission needs one.

## Commands
`npm run dev`, `npm run build`, `npm test`, `node scripts/qa.mjs` (after build), `node scripts/migration-test.mjs`.
