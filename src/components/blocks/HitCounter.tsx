import { useEffect, useState } from 'react'

function Digit({ value, delay }: { value: number; delay: number }) {
  // Start at 0 then roll to the real digit so the counter visibly ticks into place.
  const [shown, setShown] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => setShown(value), 30 + delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return (
    <span className="hs-digit" aria-hidden>
      <span className="hs-digit-strip" style={{ transform: `translateY(-${shown * 10}%)` }}>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => <span key={n}>{n}</span>)}
      </span>
    </span>
  )
}

export default function HitCounter({ label, views }: { label: string; views: number | null }) {
  const text = String(views ?? 0).padStart(6, '0')
  return (
    <div className="hs-card flex flex-col items-center gap-3 p-5 text-center" style={{ background: 'var(--hs-dark)', color: '#fff' }}>
      <p className="font-display text-sm uppercase">{label}</p>
      {views === null ? (
        <div className="skeleton h-12 w-52" role="status" aria-label="Loading visitor count" />
      ) : (
        <p aria-label={`${views.toLocaleString('en')}`} className="flex gap-1">
          {text.split('').map((d, i) => <Digit key={i} value={Number(d)} delay={i * 40} />)}
        </p>
      )}
    </div>
  )
}
