# Blockers

No QA item is failing. Both review issues from the earlier review are now addressed in code. What remains is below.

## Fixed

1. **Open update/delete rules (was functional).** `supabase/migrations/20250102000000_owner_edit_token.sql` removes the `using (true)` update and delete policies, revokes direct update/delete from `anon`, hides `edit_token_hash`, and routes saves and guestbook deletes through `update_homestead` and `delete_guestbook_entry`, which check an owner token. `supabaseRepo.ts` generates and stores the token and sends only its hash at claim. `node scripts/migration-test.mjs` checks the rules as the anon role on an in-process Postgres (PGlite): 20 checks pass.
2. **Thin Supabase seeding (was functional).** `supabaseRepo.ts` now inserts missing sample homesteads, the 12 sample guestbook entries (fixed ids, duplicates ignored) and starting counters (via `seed_page_views`, only for token-less pages with no counter). It is safe to run against an existing database. Supabase mode also has the same signing cooldown as demo mode.

## Remaining limitations

- **Lost token means lost editing.** The token lives in the browser's localStorage. Clearing storage, a new browser or device, or private mode loses edit access to that page, with no recovery. Export the page as HTML to keep a copy. Real recovery needs sign-in.
- **Pages claimed before the second migration become read-only,** because they have no token hash. Sample pages are read-only by design.
- **Still open to abuse without sign-in:** claiming free addresses, guestbook spam within the length limits (the cooldown is client-side only), and counter inflation through `increment_page_views`. Drafts are readable by anyone who knows the address. Fixing these needs Supabase Auth and server-side rate limits.
- **Supabase mode was not run against a live project.** No Supabase project or credentials exist in this sandbox, and no Supabase MCP is configured. The SQL was run on PGlite (real Postgres compiled to WASM) with `anon` and `authenticated` roles created by hand. PostgREST, `supabase-js` and the Supabase-specific schemas were not exercised, so the client calls are verified only by type-check and by reading the SQL. Before launch, apply both migrations to a project, set the two env vars and click through claim, edit, publish, sign, delete-entry once.
