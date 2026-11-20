import { Check } from 'lucide-react'
import type { FontPair, Neighbourhood, Pattern, Theme } from '../../types'
import { FONT_PAIRS, patternStyle, readableOn } from '../../lib/theme'

const PATTERNS: { id: Pattern; label: string }[] = [
  { id: 'starfield', label: 'Starfield' }, { id: 'tiles', label: 'Tiles' }, { id: 'clouds', label: 'Clouds' }, { id: 'grid', label: 'Grid' }, { id: 'plain', label: 'Plain' },
]
const ACCENT_NAMES = ['Main', 'Second', 'Third']

const choice = (on: boolean) =>
  `relative rounded-chunk border-[3px] border-ink transition-[transform,box-shadow] duration-150 hover:-translate-y-px hover:shadow-hard-sm active:translate-y-0.5 active:shadow-none ${on ? 'shadow-hard-sm outline outline-[3px] outline-offset-2 outline-sun' : ''}`

export default function ThemePanel({ theme, hood, title, onTheme, onTitle }: {
  theme: Theme; hood: Neighbourhood; title: string; onTheme: (t: Theme) => void; onTitle: (t: string) => void
}) {
  return (
    <section aria-label="Theme settings" className="grid gap-5">
      <h3 className="text-lg uppercase">Theme</h3>
      <div>
        <label htmlFor="page-title" className="mb-1 block font-display text-xs uppercase">Page title</label>
        <input id="page-title" className="field" value={title} maxLength={80} onChange={(e) => onTitle(e.target.value)} />
        <p className="mt-1 text-sm text-neutral-700">Shown in the browser tab and in search results.</p>
      </div>

      <fieldset>
        <legend className="mb-2 font-display text-xs uppercase">Background pattern</legend>
        <div className="grid grid-cols-3 gap-2">
          {PATTERNS.map((p) => (
            <button key={p.id} type="button" aria-pressed={theme.pattern === p.id} onClick={() => onTheme({ ...theme, pattern: p.id })} className={`${choice(theme.pattern === p.id)} min-h-11 overflow-hidden`}>
              <span className="block h-12" style={patternStyle(p.id, hood.palette)} aria-hidden />
              <span className="block border-t-[3px] border-ink bg-white px-1 py-1 text-xs font-bold">{p.label}</span>
              {theme.pattern === p.id && <Check aria-hidden size={16} strokeWidth={3} className="absolute right-1 top-1 rounded-full border-2 border-ink bg-sun p-px" />}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-2 font-display text-xs uppercase">Font pairing</legend>
        <div className="grid gap-2">
          {(Object.keys(FONT_PAIRS) as FontPair[]).map((f) => {
            const on = theme.fontPair === f
            return (
              <button key={f} type="button" aria-pressed={on} onClick={() => onTheme({ ...theme, fontPair: f })} className={`${choice(on)} min-h-11 bg-white p-3 text-left`}>
                <span className="block text-xl uppercase" style={{ fontFamily: FONT_PAIRS[f].heading }}>{FONT_PAIRS[f].label}</span>
                <span className="block text-sm" style={{ fontFamily: FONT_PAIRS[f].body }}>The quick brown fox moves in next door.</span>
                {on && <Check aria-hidden size={16} strokeWidth={3} className="absolute right-2 top-2 rounded-full border-2 border-ink bg-sun p-px" />}
              </button>
            )
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-2 font-display text-xs uppercase">Accent colour</legend>
        <div className="flex gap-3">
          {[0, 1, 2].map((i) => {
            const on = theme.accent === i
            return (
              <button key={i} type="button" aria-pressed={on} aria-label={`${ACCENT_NAMES[i]} accent ${hood.palette[i]}`} onClick={() => onTheme({ ...theme, accent: i })}
                className={`${choice(on)} flex size-14 items-center justify-center`} style={{ background: hood.palette[i] }}>
                {on && <Check aria-hidden size={24} strokeWidth={3} color={readableOn(hood.palette[i])} />}
              </button>
            )
          })}
        </div>
        <p className="mt-2 text-sm text-neutral-700">Colours come from the {hood.name} palette.</p>
      </fieldset>
    </section>
  )
}
