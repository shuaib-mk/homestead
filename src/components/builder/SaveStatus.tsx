import { Check, CircleAlert, LoaderCircle } from 'lucide-react'
import { useEffect, useState } from 'react'

export type SaveState =
  | { kind: 'idle' }
  | { kind: 'saving' }
  | { kind: 'saved'; at: number }
  | { kind: 'error'; message: string }

export function savedLabel(at: number, now: number): string {
  const s = Math.floor((now - at) / 1000)
  if (s < 10) return 'Saved just now'
  if (s < 60) return `Saved ${s} seconds ago`
  const m = Math.floor(s / 60)
  return m === 1 ? 'Saved a minute ago' : `Saved ${m} minutes ago`
}

export default function SaveStatus({ state, onRetry }: { state: SaveState; onRetry: () => void }) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (state.kind !== 'saved') return
    setNow(Date.now())
    const t = setInterval(() => setNow(Date.now()), 5000)
    return () => clearInterval(t)
  }, [state])

  return (
    <p role="status" aria-live="polite" className="inline-flex min-h-11 items-center gap-2 text-sm font-bold">
      {state.kind === 'saving' && <><LoaderCircle aria-hidden size={18} className="animate-spin" /> Saving...</>}
      {state.kind === 'saved' && (
        // Re-keyed on every save so the check pops each time.
        <span key={state.at} className="anim-saved inline-flex items-center gap-2 text-moss">
          <Check aria-hidden size={18} strokeWidth={3} /> <span className="text-ink">{savedLabel(state.at, now)}</span>
        </span>
      )}
      {state.kind === 'error' && (
        <span className="inline-flex flex-wrap items-center gap-2 text-red-700">
          <CircleAlert aria-hidden size={18} /> {state.message}
          <button type="button" className="btn btn-paper !min-h-11 !px-3 !text-xs" onClick={onRetry}>Try again</button>
        </span>
      )}
      {state.kind === 'idle' && <span className="text-neutral-700">All changes save automatically</span>}
    </p>
  )
}
