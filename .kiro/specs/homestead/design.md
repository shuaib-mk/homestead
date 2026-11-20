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
Supabase tables: `homesteads` (unique `(neighbourhood_slug, name)`), `guestbook_entries`, `page_views`, RPC `increment_page_views(hid uuid) returns bigint`. Neighbourhoods are static in `src/data/neighbourhoods.ts`.

localStorage keys (prefix `homestead:v1:`): `homesteads`, `guestbook`, `views`, `owned` (ids this browser created), `seeded`, `lastSign`.

## Row Level Security (decision)
Demo-grade, no auth: anyone may `select` published homesteads and all guestbook entries/page_views. Anyone may `insert` a homestead and `insert` guestbook entries (length checks in CHECK constraints). Homestead `update`/`delete` is allowed for anon only through the client holding the row id (policy `using (true)` on update, no delete policy). This means a determined visitor could edit others' pages; accepted for the hackathon demo and documented. Production would add Supabase Auth and `owner_id = auth.uid()`. Guestbook delete is permitted for anon so the owner UI works (same trade-off). Page views change only through the security-definer RPC.

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
