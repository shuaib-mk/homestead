---
inclusion: always
---
# Design direction
Retro-modern, not retro-costume and not SaaS. Chunky borders, hard offset shadows, bright neighbourhood colour. Pixel display font (Silkscreen) ONLY for headings, signs and labels. Body font Space Grotesk. Content pages stay readable.

## Hard rules
- NO default blue-purple linear gradients. NO generic startup-template look ("cover the name" test).
- NO emoji as UI icons: lucide-react only (emoji/stamps allowed as user content).
- Tokens: spacing, radius (`rounded-chunk`), shadows (`shadow-hard`, `shadow-hard-sm`) defined in `src/index.css`; use them consistently.
- Every interactive element has hover, active and focus-visible states. Touch targets >= 44px.
- Must work at 390px and 1440px.
- Motion 150-300ms with real easing; respect `prefers-reduced-motion`. Counter digits tick, guestbook entries stamp in, blocks animate in, claim celebration, Surprise me travelling state.
- Loading skeletons / "under construction" shimmer, empty states with a next action, inline plain-words validation.
- Accessibility: semantic HTML, labelled inputs, alt text, keyboard-operable builder, sufficient contrast.
