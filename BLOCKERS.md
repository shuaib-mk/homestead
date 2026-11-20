# Blockers

No QA item is failing. Two review issues were left unfixed on purpose, and one limitation remains.

## Unfixed review issues

1. **Anyone can edit or delete anyone else's data when Supabase is used (functional).**
   The database rules for updating and deleting homesteads and guestbook entries allow every request (`using (true)`). The "only the owner can delete" controls exist only in the page UI. Anyone holding the public anon key could wipe a guestbook or replace another person's page. It does not affect demo mode, which stores everything in the visitor's own browser. Fixing it needs an edit token or real sign-in. Until then, treat Supabase mode as demo-grade.

2. **Supabase starts out emptier than demo mode (functional, but only for first-run content).**
   On an empty Supabase database the app seeds the five sample homesteads only. It adds no sample guestbook entries, the hit counters start at 0 (anonymous clients cannot write counts), and there is no cooldown between guestbook signatures. Demo mode has all three. Nothing breaks. The sample pages look less lived-in until real visitors sign them.

## Limitation

- **Supabase mode was not run against a live project.** No Supabase project or credentials exist in this sandbox, and no Supabase MCP is configured. The code path is verified by strict type-check and by reading `supabase/migrations/20250101000000_init.sql` against `src/lib/repo/supabaseRepo.ts`. Before launch, apply the migration to a project, set the two env vars and click through the core flow once.
