import { ArrowRight, Car, Shuffle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { NEIGHBOURHOODS, getNeighbourhood } from '../data/neighbourhoods'
import { friendlyTime } from '../lib/guestbook'
import { readableOn } from '../lib/theme'
import { repo } from '../lib/repo'
import { useMeta } from '../lib/useMeta'
import type { Homestead } from '../types'

export default function Explore() {
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const active = getNeighbourhood(params.get('hood') ?? '')
  const [all, setAll] = useState<Homestead[] | null>(null)
  const [travelTo, setTravelTo] = useState<Homestead | null>(null)

  useMeta(active ? `${active.name} · Explore · Homestead` : 'Explore · Homestead', 'Wander six neighbourhoods of personal homepages, see the newest homesteads, or hop somewhere random.')

  useEffect(() => {
    let live = true
    repo.listHomesteads({ publishedOnly: true }).then((h) => live && setAll(h))
    return () => { live = false }
  }, [])

  const reduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  useEffect(() => {
    if (!travelTo) return
    const t = setTimeout(() => navigate(`/${travelTo.neighbourhood}/${travelTo.name}`), reduced ? 300 : 1400)
    return () => clearTimeout(t)
  }, [travelTo, navigate, reduced])

  const counts = (slug: string) => all?.filter((h) => h.neighbourhood === slug).length ?? 0
  const list = (all ?? []).filter((h) => !active || h.neighbourhood === active.slug)
  const surprise = () => {
    if (!all?.length) return
    setTravelTo(all[Math.floor(Math.random() * all.length)])
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl uppercase sm:text-4xl">Explore</h1>
          <p className="mt-1 max-w-xl">Six neighbourhoods, one front door each. Pick a street or let fate drive.</p>
        </div>
        <button type="button" className="btn btn-brick" onClick={surprise} disabled={!all?.length}>
          <Shuffle aria-hidden size={18} /> Surprise me
        </button>
      </div>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {NEIGHBOURHOODS.map((n) => {
          const on = active?.slug === n.slug
          return (
            <li key={n.slug}>
              <button type="button" aria-pressed={on} onClick={() => setParams(on ? {} : { hood: n.slug })}
                className="card block min-h-11 w-full overflow-hidden p-0 text-left transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0.5 focus-visible:-translate-y-0.5">
                <span className="block h-3" style={{ background: `linear-gradient(90deg, ${n.palette[0]} 0 33%, ${n.palette[1]} 33% 66%, ${n.palette[2]} 66%)` }} />
                <span className={`block p-4 ${on ? 'bg-sun' : ''}`}>
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="font-display text-lg uppercase">{n.name}</span>
                    <span className="chip bg-white">{all ? `${counts(n.slug)} ${counts(n.slug) === 1 ? 'page' : 'pages'}` : '...'}</span>
                  </span>
                  <span className="mt-1 block">{n.tagline}</span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>

      <div className="mt-10 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-2xl uppercase">{active ? `Newest in ${active.name}` : 'Newest homesteads'}</h2>
        {active && <button type="button" className="btn btn-paper" onClick={() => setParams({})}>Show all</button>}
      </div>

      {all === null && (
        <div className="mt-4 grid gap-4 sm:grid-cols-2" role="status" aria-label="Loading homesteads">
          <div className="skeleton h-28" /><div className="skeleton h-28" /><div className="skeleton h-28" /><div className="skeleton h-28" />
        </div>
      )}
      {all !== null && list.length === 0 && (
        <div className="card mt-4 p-6 text-center">
          <p className="mb-4">No one lives in {active?.name} yet. The best lots are still free.</p>
          <Link to="/new" className="btn btn-brick">Claim the first address</Link>
        </div>
      )}
      {list.length > 0 && (
        <ul className="mt-4 grid gap-4 sm:grid-cols-2">
          {list.map((h) => {
            const n = getNeighbourhood(h.neighbourhood)!
            return (
              <li key={h.id}>
                <Link to={`/${h.neighbourhood}/${h.name}`} className="card flex min-h-11 flex-col gap-1 p-4 no-underline transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0.5">
                  <span className="flex flex-wrap items-center justify-between gap-2">
                    <span className="chip" style={{ background: n.palette[2], color: readableOn(n.palette[2]) }}>{n.name}</span>
                    <span className="text-sm text-neutral-700">{friendlyTime(h.createdAt)}</span>
                  </span>
                  <span className="text-xl font-bold">{h.title}</span>
                  <span className="flex items-center justify-between gap-2 break-all font-display text-xs uppercase">
                    /{h.neighbourhood}/{h.name} <ArrowRight aria-hidden size={18} className="shrink-0" />
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      )}

      {travelTo && (
        <div role="status" className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-ink/95 p-6 text-center text-paper anim-pop">
          <p className="font-display text-2xl uppercase">Travelling...</p>
          <div className="w-72 max-w-full overflow-hidden">
            <div className="driver flex justify-center"><Car aria-hidden size={48} className="text-sun" /></div>
            <div className="road mt-1" />
          </div>
          <p className="break-all">Next stop: <span className="font-display uppercase text-sun">/{travelTo.neighbourhood}/{travelTo.name}</span></p>
        </div>
      )}
    </section>
  )
}
