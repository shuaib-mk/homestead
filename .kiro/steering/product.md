---
inclusion: always
---
# Product: Homestead

**One line:** GeoCities, resurrected. Claim an address in a themed neighbourhood, build a personal homepage with a visual editor (no code), get a guestbook and hit counter, wander to neighbours through a webring, and export your page as HTML any time.

**Story:** GeoCities (1994-2009) gave millions their first home online. Yahoo shut it down in 2009 and those pages vanished. Today every profile looks identical. Homestead brings the personal homepage back: old soul, modern tech, fast, mobile-friendly, accessible, and you own your page.

## Scope
- Six neighbourhoods exactly: siliconvalley, heartland, soho, sunsetstrip, enchantedforest, motorcity.
- Routes: `/`, `/explore`, `/new`, `/build/:neighbourhood/:name`, `/:neighbourhood/:name`, themed 404.
- Block builder: header, text, image, gallery, link list, guestbook, hit counter, webring badge, divider, under construction, stamps wall.
- Guestbook, hit counter, webring (prev/random/next), explore + Surprise me, claim flow, HTML export, 5 seeded sample homesteads.
- Demo mode (localStorage) is mandatory when Supabase env vars are absent.

## Out of scope
Accounts/auth, paid APIs, our own backend server, custom code/HTML editing, image uploads, comments moderation tooling beyond owner delete.
