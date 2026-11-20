# Tasks: Homestead (build order)

## Foundations (FEAT-001)
- [x] 1. Kiro structure: specs, steering, hook, DECISIONS.md, STATUS.md, LICENSE, vercel.json
- [x] 2. Scaffold Vite + React + TS strict + Tailwind v4, tokens, fonts, favicon, SEO meta
- [x] 3. Neighbourhood data (6) and block/theme types
- [x] 4. Name validation + Vitest tests
- [x] 5. Repo interface, localStorage repo, Supabase repo, env switch, guestbook sanitising/cooldown
- [x] 6. Seed data: 5 homesteads, guestbook entries, hit counts
- [x] 7. Supabase migrations: tables, RLS, length checks, increment RPC
- [x] 8. Routes and app shell (nav, footer, placeholder-free route stubs)

## Public pages (FEAT-002)
- [x] 9. BlockRenderer and all 11 block components, theme patterns and font pairs
- [x] 10. HitCounter with digit tick animation
- [x] 11. Guestbook view + sign form + owner delete + stamp-in animation
- [x] 12. Webring badge (prev/random/next, single-page fallback)
- [x] 13. Public homestead page with street sign, SEO title, 404
- [x] 14. Landing page
- [x] 15. Explore page + Surprise me travelling state
- [x] 16. Claim page with live availability, celebration, starter template

## Builder and export (FEAT-003)
- [x] 17. Builder shell, palette, add block, delete with confirm
- [x] 18. dnd-kit reorder + keyboard move, glide animation
- [x] 19. Block editor side panel for every block type
- [x] 20. Theme panel (pattern, font pair, accent)
- [x] 21. Autosave indicator, publish state, View page link
- [x] 22. Export to standalone HTML + tests

## QA and docs (FEAT-004)
- [ ] 23. Playwright flow: land, claim, build, publish, sign, counter, webring, export, zero console errors
- [ ] 24. Screenshots at 1440 and 390 (landing, builder, published page); fix visual defects
- [ ] 25. QA.md checklist, BLOCKERS.md if any
- [ ] 26. README.md complete (story, features, Kiro usage, env vars, Vercel, submission checklist)
- [ ] 27. Final commit: "feat: Homestead complete - QA passed"
