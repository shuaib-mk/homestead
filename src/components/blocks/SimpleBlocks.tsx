import { ExternalLink, HardHat, ImageOff } from 'lucide-react'
import { useState } from 'react'
import { safeUrl } from '../../lib/safeUrl'
import type { Block } from '../../types'
import { getStamp } from './stamps'

type Of<T extends Block['type']> = Extract<Block, { type: T }>

export function HeaderBlock({ block, level }: { block: Of<'header'>; level: 1 | 2 }) {
  const H = level === 1 ? 'h1' : 'h2'
  return (
    <div className="hs-card hs-accent p-6 text-center sm:p-8">
      <H className="text-2xl uppercase leading-tight sm:text-4xl" style={{ fontFamily: 'var(--hs-heading)' }}>{block.title}</H>
      {block.subtitle && <p className="mt-2 text-lg opacity-90">{block.subtitle}</p>}
    </div>
  )
}

export function TextBlock({ block }: { block: Of<'text'> }) {
  const paras = block.body.split(/\n{2,}/).filter((p) => p.trim())
  return (
    <div className="hs-card bg-white p-5 sm:p-6">
      {paras.length === 0 && <p className="text-neutral-600">Nothing written here yet.</p>}
      {paras.map((p, i) => <p key={i} className="whitespace-pre-line text-lg leading-relaxed [&:not(:first-child)]:mt-4">{p}</p>)}
    </div>
  )
}

function SafeImg({ url, alt, className }: { url: string; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false)
  const src = safeUrl(url)
  if (!src || failed) {
    return (
      <div className={`flex min-h-32 flex-col items-center justify-center gap-2 bg-neutral-100 p-4 text-center text-sm text-neutral-600 ${className ?? ''}`} role="img" aria-label={alt || 'Image unavailable'}>
        <ImageOff aria-hidden size={28} />
        <span>{src ? 'This image could not be loaded.' : 'No image yet.'}</span>
      </div>
    )
  }
  return <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} className={`block h-full w-full object-cover ${className ?? ''}`} />
}

export function ImageBlock({ block }: { block: Of<'image'> }) {
  return (
    <figure className="hs-card overflow-hidden bg-white">
      <div className="aspect-[16/10] bg-neutral-100"><SafeImg url={block.url} alt={block.alt} /></div>
      {block.caption && <figcaption className="border-t-[3px] border-ink p-3 text-center">{block.caption}</figcaption>}
    </figure>
  )
}

export function GalleryBlock({ block }: { block: Of<'gallery'> }) {
  const images = block.images.slice(0, 6)
  return (
    <div className="hs-card grid grid-cols-2 gap-3 bg-white p-3 sm:grid-cols-3">
      {images.map((img, i) => (
        <div key={i} className="aspect-square overflow-hidden rounded-chunk border-[3px] border-ink"><SafeImg url={img.url} alt={img.alt} /></div>
      ))}
    </div>
  )
}

export function LinkListBlock({ block }: { block: Of<'linklist'> }) {
  return (
    <div className="hs-card bg-white p-5 sm:p-6">
      <h2 className="mb-3 text-xl uppercase" style={{ fontFamily: 'var(--hs-heading)' }}>{block.heading}</h2>
      <ul className="grid gap-2">
        {block.links.map((l, i) => {
          const href = safeUrl(l.url)
          return (
            <li key={i}>
              {href ? (
                <a href={href} target="_blank" rel="noopener noreferrer" className="hs-link group">
                  <span className="min-w-0 flex-1 break-words">{l.label || href}</span>
                  <ExternalLink aria-hidden size={18} className="shrink-0" />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              ) : (
                <span className="hs-link opacity-60"><span className="flex-1">{l.label || 'Link needs a web address'}</span></span>
              )}
            </li>
          )
        })}
        {block.links.length === 0 && <li className="text-neutral-600">No links yet.</li>}
      </ul>
    </div>
  )
}

const DIVIDERS: Record<Of<'divider'>['style'], string> = {
  line: 'hs-div-line', dots: 'hs-div-dots', rainbow: 'hs-div-rainbow', zigzag: 'hs-div-zigzag',
}
export function DividerBlock({ block }: { block: Of<'divider'> }) {
  return <div role="separator" className={`h-4 ${DIVIDERS[block.style] ?? DIVIDERS.line}`} />
}

export function ConstructionBlock({ block }: { block: Of<'construction'> }) {
  return (
    <div className="hs-card hs-hazard flex items-center justify-center gap-3 p-4 text-center">
      <HardHat aria-hidden size={28} className="shrink-0" />
      <p className="font-display text-sm uppercase sm:text-base">{block.message}</p>
    </div>
  )
}

export function StampsBlock({ block }: { block: Of<'stamps'> }) {
  const stamps = block.stamps.map(getStamp).filter((s): s is NonNullable<typeof s> => !!s)
  return (
    <div className="hs-card flex flex-wrap justify-center gap-3 bg-white p-4">
      {stamps.length === 0 && <p className="text-neutral-600">The stamp wall is empty.</p>}
      {stamps.map(({ id, label, Icon }, i) => (
        <span key={`${id}-${i}`} title={label} role="img" aria-label={label}
          className="hs-stamp" style={{ transform: `rotate(${((i * 37) % 9) - 4}deg)` }}>
          <Icon aria-hidden size={28} strokeWidth={2.5} />
        </span>
      ))}
    </div>
  )
}
