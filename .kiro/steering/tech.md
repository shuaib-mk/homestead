---
inclusion: always
---
# Tech
React + Vite + TypeScript (strict) + Tailwind CSS v4 (`@tailwindcss/vite`), React Router, lucide-react, @dnd-kit for builder drag and drop, Supabase JS client (optional), Vitest for pure logic.

## Rules
- `npm run build` (tsc strict + vite build) must pass; `npm test` must pass.
- Data access only through `src/lib/repo` (`Repo` interface). Two implementations: `localRepo` (demo) and `supabaseRepo`; chosen by `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`. Without them the app runs 100% on localStorage with seeded data and zero errors.
- Blocks are a discriminated union (`src/types.ts`) stored as jsonb. One `BlockRenderer` is shared by builder preview, public page; export serialises the same model to standalone HTML.
- Guestbook text is plain text only: sanitise on write, render as text, never as links.
- No paid APIs, no keys for core features, no own backend.
- Secrets never in code. SQL lives in `supabase/migrations/`.
- Small commits with `feat:`/`fix:`/`chore:`/`docs:` prefixes. Update `STATUS.md` every session and tick `.kiro/specs/homestead/tasks.md`.
