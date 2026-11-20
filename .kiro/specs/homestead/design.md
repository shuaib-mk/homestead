# Design: Homestead

## Architecture
Single-page React app (Vite, TS strict, Tailwind v4). All data goes through an async `Repo` interface (`src/lib/repo/types.ts`). `getRepo()` returns `supabaseRepo` when `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set, otherwise `localRepo`. Pages never touch storage directly.

## Data model
```
Homestead { id, neighbourhood, name, title, theme, blocks, published, createdAt }
Theme { pattern: starfield|tiles|clouds|grid|plain, fontPair: 'press'|'zine'|'typewriter', accent: palette index }
Block = { id, type, ...props } discriminated union:
  header{title,subtitle} text{body} image{url,alt,caption} gallery{images[{url,alt}]}
  linklist{heading,links[{label,url}]} guestbook{heading} counter{label} webring{}
  divider{style: line|dots|rainbow|zigzag} construction{message} stamps{stamps: string[]}
GuestbookEntry { id, homesteadId, author, message, createdAt }
page_views { homestead_id, count }
```
Supabase tables: `homesteads` (unique `(neighbourhood_slug, name)`), `guestbook_entries`, `page_views`, RPCs `increment_page_views(hid uuid) returns bigint`, `update_homestead`, `delete_guestbook_entry`, `seed_page_views`. Neighbourhoods are static in `src/data/neighbourhoods.ts`.

localStorage keys (prefix `homestead:v1:`): `homesteads`, `guestbook`, `views`, `owned` (ids this browser created), `seeded`, `lastSign`.

## Row Level Security (decision)
Migration `20250102000000_owner_edit_token.sql` replaces the open update/delete policies with an owner edit token that works with the anon key and no sign-in.

- At claim, the browser makes a random 256-bit token, stores it in localStorage (`homestead:v1:tokens`, keyed by homestead id) and inserts only `edit_token_hash` (SHA-256 hex) with the new row.
- `anon` has no `update` or `delete` privilege on any table. It cannot select `edit_token_hash` (column-level grant), so the client lists explicit columns and never uses `select('*')` on homesteads.
- Saves call `update_homestead(hid, token, title, theme, blocks, published)`. Guestbook deletes call `delete_guestbook_entry(entry_id, token)`. Both are `security definer`, hash the token with `sha256` and compare it to the stored hash, and raise `42501` on mismatch. Rows with a null hash (sample pages, pages made before this migration) cannot be edited by anyone through the API.
- Still open: reads (`select`), claiming an address (`insert`), length-checked guestbook inserts, and the `increment_page_views` counter RPC. `seed_page_views` can set a first counter only on pages with no hash and no counter yet.
- `node scripts/migration-test.mjs` applies both migrations to an in-process Postgres (PGlite) and checks these rules as the `anon` role.

What this cannot protect:
- Clearing localStorage, using another browser or device, or private mode loses the token, and the page can then no longer be edited. There is no recovery. Export the page as HTML to keep a copy.
- Anyone who obtains the token (malware, a shared computer, an XSS bug) is the owner. The token is sent to the server on each save, so it relies on HTTPS.
- Anyone can still claim any free address, spam guestbooks within the length limits (the cooldown is client-side only and can be bypassed), and inflate counters by calling the RPC.
- Drafts are readable by anyone who knows the address; `published` only hides pages in the app. Production would use Supabase Auth with `owner_id = auth.uid()`, and server-side rate limits.

## Routing
`/` Landing, `/explore`, `/new`, `/build/:neighbourhood/:name`, `/:neighbourhood/:name` (Homestead page; unknown neighbourhood or name renders themed 404), `*` 404. Static routes are declared before the dynamic one; reserved names prevent clashes.

## Component tree
```
App > Shell(Nav, Footer) > routes
 Landing(Hero, NeighbourhoodCards, SampleStrip, WebringExplainer, OwnershipPromise)
 Explore(NeighbourhoodCards, NewestList, SurpriseButton)
 Claim(NeighbourhoodPicker, NameField, AddressPreview, Celebration)
 Builder(Toolbar(SaveState, Publish, Export), Palette, SortableList, BlockEditorPanel, ThemePanel, Preview)
 PublicPage(Sign, PageBody)
 shared: PageBody > BlockRenderer > blocks/*, GuestbookView, HitCounter, WebringBadge
```
`PageBody` takes `{homestead, mode: 'preview'|'public'}` so the preview matches the public page exactly.

## State and persistence
Builder keeps a local draft in React state; changes debounce (600ms) to `repo.saveHomestead`; the indicator cycles Saving / Saved just now. Publish sets `published=true`. Hit counter increments once per page load on the public route (session guard against StrictMode double-fire), never in the builder preview.

## Export
`src/lib/exportHtml.ts` renders the same model to static HTML string with inline CSS (tokens, patterns as CSS, fonts via Google Fonts link with system fallback), snapshotting guestbook entries and count at export time. Guestbook form is replaced by a note.

## Error handling
Repo methods return typed results or throw `RepoError` with a plain-words message; pages show inline messages. Supabase failures surface as an error banner; no silent failures. localStorage access is wrapped (quota/private mode falls back to in-memory).
