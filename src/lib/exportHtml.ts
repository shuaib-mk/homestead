import { Dices, ChevronLeft, ChevronRight, ExternalLink, HardHat, ImageOff, Link2, type LucideIcon } from 'lucide-react'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { getStamp } from '../components/blocks/stamps'
import type { Block, GuestbookEntry, Homestead, Neighbourhood } from '../types'
import { safeUrl } from './safeUrl'
import { pageStyle } from './theme'
import { ringLinks } from './webring'

export interface ExportOptions {
  homestead: Homestead
  hood: Neighbourhood
  guestbook: GuestbookEntry[]
  views: number
  /** Other published pages in the neighbourhood ring (may include the page itself). */
  ring: Homestead[]
  /** Compiled site stylesheet, inlined so the file works offline. */
  css: string
  /** Where the live site lives, used for webring and "sign the live guestbook" links. */
  origin: string
}

export function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}

/** Safe to embed inside a <style> element. */
function safeCss(css: string): string {
  return css.replace(/<\/(style)/gi, '<\\/$1')
}

function icon(Icon: LucideIcon, size: number, extra: Record<string, unknown> = {}): string {
  return renderToStaticMarkup(createElement(Icon, { size, 'aria-hidden': true, ...extra }))
}

const kebab = (k: string) => (k.startsWith('--') ? k : k.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase()))
export function styleToCss(style: Record<string, unknown>): string {
  return Object.entries(style).filter(([, v]) => v !== undefined && v !== null).map(([k, v]) => `${kebab(k)}:${String(v)}`).join(';')
}

function img(url: string, alt: string): string {
  const src = safeUrl(url)
  if (!src) {
    return `<div class="flex min-h-32 flex-col items-center justify-center gap-2 bg-neutral-100 p-4 text-center text-sm text-neutral-600" role="img" aria-label="${esc(alt || 'Image unavailable')}">${icon(ImageOff, 28)}<span>No image yet.</span></div>`
  }
  return `<img src="${esc(src)}" alt="${esc(alt)}" loading="lazy" class="block h-full w-full object-cover">`
}

const DIVIDERS: Record<string, string> = { line: 'hs-div-line', dots: 'hs-div-dots', rainbow: 'hs-div-rainbow', zigzag: 'hs-div-zigzag' }
const H = 'style="font-family:var(--hs-heading)"'

function renderBlock(b: Block, o: ExportOptions, firstHeaderId: string | undefined): string {
  const { homestead, hood } = o
  const live = `${o.origin}/${hood.slug}/${homestead.name}`
  switch (b.type) {
    case 'header': {
      const tag = b.id === firstHeaderId ? 'h1' : 'h2'
      return `<div class="hs-card hs-accent p-6 text-center sm:p-8"><${tag} class="text-2xl uppercase leading-tight sm:text-4xl" ${H}>${esc(b.title)}</${tag}>${b.subtitle ? `<p class="mt-2 text-lg opacity-90">${esc(b.subtitle)}</p>` : ''}</div>`
    }
    case 'text': {
      const paras = b.body.split(/\n{2,}/).filter((p) => p.trim())
      const inner = paras.length === 0
        ? '<p class="text-neutral-600">Nothing written here yet.</p>'
        : paras.map((p) => `<p class="whitespace-pre-line text-lg leading-relaxed [&:not(:first-child)]:mt-4">${esc(p)}</p>`).join('')
      return `<div class="hs-card bg-white p-5 sm:p-6">${inner}</div>`
    }
    case 'image':
      return `<figure class="hs-card overflow-hidden bg-white"><div class="aspect-[16/10] bg-neutral-100">${img(b.url, b.alt)}</div>${b.caption ? `<figcaption class="border-t-[3px] border-ink p-3 text-center">${esc(b.caption)}</figcaption>` : ''}</figure>`
    case 'gallery':
      return `<div class="hs-card grid grid-cols-2 gap-3 bg-white p-3 sm:grid-cols-3">${b.images.slice(0, 6).map((i) => `<div class="aspect-square overflow-hidden rounded-chunk border-[3px] border-ink">${img(i.url, i.alt)}</div>`).join('')}</div>`
    case 'linklist': {
      const items = b.links.map((l) => {
        const href = safeUrl(l.url)
        return href
          ? `<li><a href="${esc(href)}" target="_blank" rel="noopener noreferrer" class="hs-link group"><span class="min-w-0 flex-1 break-words">${esc(l.label || href)}</span>${icon(ExternalLink, 18, { className: 'shrink-0' })}<span class="sr-only">(opens in a new tab)</span></a></li>`
          : `<li><span class="hs-link opacity-60"><span class="flex-1">${esc(l.label || 'Link needs a web address')}</span></span></li>`
      })
      if (items.length === 0) items.push('<li class="text-neutral-600">No links yet.</li>')
      return `<div class="hs-card bg-white p-5 sm:p-6"><h2 class="mb-3 text-xl uppercase" ${H}>${esc(b.heading)}</h2><ul class="grid gap-2">${items.join('')}</ul></div>`
    }
    case 'guestbook': {
      const id = `gb-${b.id}`
      const list = o.guestbook.length === 0
        ? '<p class="rounded-chunk bg-neutral-100 p-4 text-center">No one has signed yet.</p>'
        : `<ul class="grid gap-3">${o.guestbook.map((e) => `<li class="rounded-chunk border-[3px] border-ink bg-[var(--hs-tint)] p-3"><div class="flex flex-wrap items-baseline justify-between gap-x-3"><p class="font-display text-sm uppercase break-all">${esc(e.author)}</p><time datetime="${esc(e.createdAt)}" class="text-sm text-neutral-700">${esc(e.createdAt.slice(0, 10))}</time></div><p class="mt-1 whitespace-pre-line break-words">${esc(e.message)}</p></li>`).join('')}</ul>`
      return `<section aria-labelledby="${id}" class="hs-card bg-white p-5 sm:p-6"><h2 id="${id}" class="mb-4 text-xl uppercase" ${H}>${esc(b.heading)}</h2><p class="mb-4 rounded-chunk border-[3px] border-dashed border-ink p-3 text-sm">This is a saved copy of the guestbook. To sign it, visit <a class="underline font-bold" href="${esc(live)}">the live page</a>.</p>${list}</section>`
    }
    case 'counter': {
      const text = String(o.views).padStart(6, '0')
      const digits = text.split('').map((d) => `<span class="hs-digit" aria-hidden="true"><span class="hs-digit-strip" style="transform:translateY(-${Number(d) * 10}%)">${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => `<span>${n}</span>`).join('')}</span></span>`).join('')
      return `<div class="hs-card flex flex-col items-center gap-3 p-5 text-center" style="background:var(--hs-dark);color:#fff"><p class="font-display text-sm uppercase">${esc(b.label)}</p><p aria-label="${o.views.toLocaleString('en')}" class="flex gap-1">${digits}</p></div>`
    }
    case 'webring': {
      const ring = o.ring.some((h) => h.id === homestead.id) ? o.ring : [...o.ring, homestead]
      const links = ringLinks(ring, homestead.id)
      const addr = (h: Homestead) => esc(`${o.origin}/${h.neighbourhood}/${h.name}`)
      const note = links.alone
        ? `This is the only homestead in ${esc(hood.name)} so far.`
        : `${links.size} homesteads in this ring. Next stop: ${esc(links.next.title)}.`
      return `<nav aria-label="${esc(hood.name)} webring" class="hs-card bg-white p-5 text-center"><p class="mb-1 inline-flex items-center gap-2 font-display text-sm uppercase">${icon(Link2, 18)} ${esc(hood.name)} webring</p><div class="mt-3 flex flex-wrap justify-center gap-2"><a href="${addr(links.prev)}" class="btn btn-paper">${icon(ChevronLeft, 18)} Previous</a><a href="${esc(`${o.origin}/explore?hood=${hood.slug}`)}" class="btn btn-paper">${icon(Dices, 18)} Random</a><a href="${addr(links.next)}" class="btn btn-paper">Next ${icon(ChevronRight, 18)}</a></div><p class="mt-3 text-sm text-neutral-700">${note}</p></nav>`
    }
    case 'divider':
      return `<div role="separator" class="h-4 ${DIVIDERS[b.style] ?? DIVIDERS.line}"></div>`
    case 'construction':
      return `<div class="hs-card hs-hazard flex items-center justify-center gap-3 p-4 text-center">${icon(HardHat, 28, { className: 'shrink-0' })}<p class="font-display text-sm uppercase sm:text-base">${esc(b.message)}</p></div>`
    case 'stamps': {
      const stamps = b.stamps.map(getStamp).filter((s): s is NonNullable<typeof s> => !!s)
      const inner = stamps.length === 0
        ? '<p class="text-neutral-600">The stamp wall is empty.</p>'
        : stamps.map(({ label, Icon }, i) => `<span title="${esc(label)}" role="img" aria-label="${esc(label)}" class="hs-stamp" style="transform:rotate(${((i * 37) % 9) - 4}deg)">${icon(Icon, 28, { strokeWidth: 2.5 })}</span>`).join('')
      return `<div class="hs-card flex flex-wrap justify-center gap-3 bg-white p-4">${inner}</div>`
    }
  }
}

/** Serialises the page into ONE standalone HTML document: inline CSS, inline SVG icons, images by URL, no scripts. */
export function exportHtml(o: ExportOptions): string {
  const { homestead, hood } = o
  const firstHeaderId = homestead.blocks.find((b) => b.type === 'header')?.id
  const blocks = homestead.blocks.map((b) => `<div>${renderBlock(b, o, firstHeaderId)}</div>`).join('\n')
  const empty = homestead.blocks.length === 0 ? '<div class="hs-card bg-white p-6 text-center">This page has no blocks yet.</div>' : ''
  const sign = `<div class="mx-auto flex max-w-full flex-col items-stretch" aria-label="Address: ${esc(hood.name)}, ${esc(homestead.name)}"><div class="hs-sign" style="background:${esc(hood.palette[3])};color:#fff"><span class="text-xs uppercase opacity-80">Neighbourhood</span><span class="font-display text-xl uppercase sm:text-2xl">${esc(hood.name)}</span></div><div class="hs-sign hs-sign-2" style="background:#fff;color:#1a1a1a"><span class="text-xs uppercase opacity-70">Homestead</span><span class="font-display break-all text-lg sm:text-xl">/${esc(hood.slug)}/${esc(homestead.name)}</span></div></div>`
  const pageCss = styleToCss(pageStyle(hood, homestead.theme) as Record<string, unknown>)
  const title = `${homestead.title} · ${hood.name} · Homestead`
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(homestead.title)}, a saved copy of a Homestead page from ${esc(hood.name)}.">
<style>
/* Fonts: system fallbacks keep the layout intact offline. */
:root{--font-display:"Silkscreen","Courier New",monospace;--font-body:"Space Grotesk",system-ui,sans-serif}
${safeCss(o.css)}
</style>
</head>
<body>
<main>
<div class="hs-page px-4 py-8 sm:py-12" style="${esc(pageCss)}">
<div class="mx-auto grid max-w-2xl gap-5">
${sign}
${firstHeaderId ? '' : `<h1 class="sr-only">${esc(homestead.title)}</h1>`}
${blocks}
${empty}
<p class="pb-2 text-center text-sm">Saved copy of <a class="underline font-bold" href="${esc(`${o.origin}/${hood.slug}/${homestead.name}`)}">/${esc(hood.slug)}/${esc(homestead.name)}</a> on Homestead.</p>
</div>
</div>
</main>
</body>
</html>
`
}

export function downloadHtml(filename: string, html: string): void {
  const url = URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url; a.download = filename
  document.body.appendChild(a); a.click(); a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
