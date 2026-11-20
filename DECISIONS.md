# Decisions

- Stack as specified: React + Vite + TS strict + Tailwind v4 (`@tailwindcss/vite`), because it is the fastest setup with CSS-variable tokens.
- Pixel font: Silkscreen, headings/labels only; body Space Grotesk, as it keeps content pages readable.
- Drag and drop: @dnd-kit (core + sortable) with keyboard sensor, because it gives accessible reorder for free. Move up/down buttons are the fallback.
- No Supabase MCP is configured in this workspace, so the schema is written as SQL in `supabase/migrations/` instead of applied through MCP.
- Data access through one `Repo` interface with `localRepo` and `supabaseRepo`, switched by `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`, so pages never know which backend they use.
- Supabase RLS is demo-grade with no auth: public read, public insert, update allowed; documented in design.md because the prompt asks for simple, and real ownership would need Supabase Auth.
- In Supabase mode, an empty database is seeded with the 5 sample homesteads on first load (guestbook entries and seed hit counts are demo-mode only, since anon cannot insert page_views by design).
- "Owner" in both modes means "this browser created it" (ids in localStorage `owned`), because there are no accounts.
- Guestbook sanitising strips tags and renders as text; links are never clickable, so no autolinking.
- Guestbook cooldown is 30s in demo mode via localStorage.
- Sample images use picsum.photos seeded URLs (free, no key); the renderer will degrade gracefully if offline.
- Vitest covers pure logic only (name validation, guestbook, later webring and export).
- Block ids and homestead ids use `crypto.randomUUID`, so ids are valid for the uuid column.
