import type { CSSProperties } from 'react'
import type { FontPair, Neighbourhood, Pattern, Theme } from '../types'

export function readableOn(hex: string): string {
  const n = parseInt(hex.slice(1), 16)
  const lin = (v: number) => { const c = v / 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4 }
  const l = 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255)
  return l > 0.28 ? '#1a1a1a' : '#ffffff'
}

export function patternStyle(pattern: Pattern, p: Neighbourhood['palette']): CSSProperties {
  const tint = p[4]
  const mark = p[0]
  switch (pattern) {
    case 'starfield':
      return { backgroundColor: p[3], backgroundImage: `radial-gradient(${tint} 1.5px, transparent 1.6px), radial-gradient(${p[2]} 1px, transparent 1.2px)`, backgroundSize: '64px 64px, 37px 37px', backgroundPosition: '0 0, 18px 22px' }
    case 'tiles':
      return { backgroundColor: tint, backgroundImage: `linear-gradient(45deg, ${mark}22 25%, transparent 25% 75%, ${mark}22 75%), linear-gradient(45deg, ${mark}22 25%, transparent 25% 75%, ${mark}22 75%)`, backgroundSize: '48px 48px', backgroundPosition: '0 0, 24px 24px' }
    case 'clouds':
      return { backgroundColor: tint, backgroundImage: `radial-gradient(ellipse 60px 24px at 30px 30px, #ffffffcc 98%, transparent), radial-gradient(ellipse 80px 28px at 110px 90px, #ffffffcc 98%, transparent)`, backgroundSize: '160px 120px' }
    case 'grid':
      return { backgroundColor: tint, backgroundImage: `linear-gradient(${mark}33 1px, transparent 1px), linear-gradient(90deg, ${mark}33 1px, transparent 1px)`, backgroundSize: '28px 28px' }
    default:
      return { backgroundColor: tint }
  }
}

export const FONT_PAIRS: Record<FontPair, { label: string; heading: string; body: string }> = {
  press: { label: 'Printing press', heading: 'var(--font-display)', body: 'var(--font-body)' },
  zine: { label: 'Zine', heading: '"Lora", Georgia, serif', body: '"Lora", Georgia, serif' },
  typewriter: { label: 'Typewriter', heading: '"Courier Prime", "Courier New", monospace', body: '"Courier Prime", "Courier New", monospace' },
}

/** Page wrapper style: pattern background plus CSS variables the block components read. */
export function pageStyle(hood: Neighbourhood, theme: Theme): CSSProperties {
  const p = hood.palette
  const accent = p[Math.min(2, Math.max(0, theme.accent))]
  const fonts = FONT_PAIRS[theme.fontPair] ?? FONT_PAIRS.press
  return {
    ...patternStyle(theme.pattern, p),
    '--hs-main': p[0], '--hs-second': p[1], '--hs-third': p[2], '--hs-dark': p[3], '--hs-tint': p[4],
    '--hs-accent': accent, '--hs-on-accent': readableOn(accent),
    '--hs-heading': fonts.heading, '--hs-body': fonts.body,
    color: '#1a1a1a',
    fontFamily: fonts.body,
  } as CSSProperties
}
