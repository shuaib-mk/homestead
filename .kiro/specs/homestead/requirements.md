# Requirements: Homestead

Format: user story, then acceptance criteria (AC).

## R1 Landing page
As a visitor, I want to feel the GeoCities story at once, so I want to claim an address.
- AC1: Hero tells the GeoCities story (1994-2009, shut down by Yahoo) with a live-feeling preview and a primary "Claim your address" button to `/new`.
- AC2: Six neighbourhood cards link into explore/neighbourhood views.
- AC3: A strip of real sample homesteads opens each page.
- AC4: Webring explainer, the "This time, your page is yours" export promise, and a footer.

## R2 Claim an address
As a creator, I want to pick a neighbourhood and name and see if it is free.
- AC1: Neighbourhood chosen via cards; name field with live address preview `/<neighbourhood>/<name>`.
- AC2: Name rules: 3-24 chars, a-z 0-9 hyphen, no leading/trailing hyphen; reserved: admin, root, support, homestead, explore, new, build, api, www.
- AC3: Live availability check while typing; errors in plain words, e.g. "That name is taken in SoHo, try another, or pick a different neighbourhood".
- AC4: Claim creates the homestead with a starter template (header, about text, guestbook, hit counter), shows a small celebration, then opens the builder.

## R3 Visual builder
As an owner, I want to build my page with blocks, no code.
- AC1: Palette adds any of 11 block types: header, text, image, gallery (2-6), link list, guestbook, hit counter, webring badge, divider, under construction, stamps wall (~12 stamps).
- AC2: Drag to reorder (and keyboard-operable move up/down); edit in a side panel; delete with confirm.
- AC3: Live preview identical to public page (shared renderer).
- AC4: Theme controls: background pattern (starfield, tiles, clouds, grid, plain) tinted per neighbourhood; 2-3 font pairs; accent from neighbourhood palette.
- AC5: Save/publish to localStorage (demo) or database; visible Published state, "View page" link, animated autosave indicator.
- AC6: Blocks animate in when added and glide on reorder.

## R4 Public page
- AC1: Renders at `/:neighbourhood/:name` with the owner's theme; header shows a vintage street sign address.
- AC2: Guestbook signable; hit counter increments per real view; webring badge works.
- AC3: Footer "A Homestead page - build yours" link. Per-page title like "Adam's page · SoHo · Homestead".

## R5 Guestbook
- AC1: Name <= 50, message <= 500, plain text only (HTML stripped/escaped), no clickable links.
- AC2: Newest first, friendly timestamps; new entries stamp in.
- AC3: Owner can delete entries (builder, or own page locally).
- AC4: Empty state "No one has signed yet - be the first." Client cooldown in demo mode.

## R6 Hit counter
- AC1: Real persisted count per homestead; digits animate on change; never reset by edits or theme changes.
- AC2: Demo: localStorage. Supabase: `page_views` table + `increment_page_views` RPC.

## R7 Webring
- AC1: Per neighbourhood Previous / Random / Next across published homesteads (seeded + user).
- AC2: Never links to an empty set; with one page links to itself and says so.

## R8 Explore
- AC1: Neighbourhood cards with live counts; newest homesteads across all; Surprise me with a "travelling..." transition.

## R9 Export
- AC1: Builder button downloads ONE self-contained HTML file (inline CSS, images by URL) that renders faithfully offline.

## R10 Sample data
- AC1: 5 seeded homesteads across >= 4 neighbourhoods with guestbook entries and non-zero hit counts.

## R11 Demo mode and backend
- AC1: Without Supabase env vars the app runs fully on localStorage with zero errors.
- AC2: With env vars, a Supabase repository is used; migrations in `supabase/migrations/` with RLS and length checks.

## R12 Quality
- AC1: `npm run build` clean (strict TS); no console errors.
- AC2: Accessible (labels, alt, keyboard), touch targets >= 44px, 390px and 1440px layouts.
- AC3: SEO: title, description, Open Graph, house favicon; `vercel.json` SPA fallback.
- AC4: Themed 404 "This homestead hasn't been built yet" with claim and explore links.
- AC5: Loading skeletons, empty states, inline validation; motion respects reduced-motion.
