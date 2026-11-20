# Blockers

No QA item is failing. One limitation:

- **Supabase mode was not run against a live project.** No Supabase project or credentials exist in this sandbox, and no Supabase MCP is configured. The code path is verified by strict type-check and by reading `supabase/migrations/20250101000000_init.sql` against `src/lib/repo/supabaseRepo.ts`. Before launch, apply the migration to a project, set the two env vars and click through the core flow once.
