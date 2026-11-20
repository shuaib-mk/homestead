import { ArrowRight, Download, Link2, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { NEIGHBOURHOODS, getNeighbourhood } from '../data/neighbourhoods'
import { SEED_HOMESTEADS } from '../data/seeds'
import { readableOn } from '../lib/theme'
import { repo } from '../lib/repo'
import { useMeta } from '../lib/useMeta'
import type { Homestead } from '../types'

function HeroPreview() {
  const p = getNeighbourhood('sunsetstrip')!.palette
  return (
    <div aria-hidden className="card overflow-hidden rotate-1 transition-transform duration-300 hover:rotate-0">
      <div className="flex items-center gap-2 border-b-[3px] border-ink bg-sun px-3 py-2">
        <span className="h-3 w-3 rounded-full border-2 border-ink bg-brick" /><span className="h-3 w-3 rounded-full border-2 border-ink bg-white" /><span className="h-3 w-3 rounded-full border-2 border-ink bg-moss" />
        <span className="ml-2 truncate rounded-chunk border-2 border-ink bg-white px-2 font-display text-xs">/sunsetstrip/the-static-hearts</span>
      </div>
      <div className="grid gap-3 p-4" style={{ background: p[3] }}>
        <div className="rounded-chunk border-[3px] border-ink p-4 text-center text-white" style={{ background: p[0] }}>
          <p className="font-display text-xl uppercase">The Static Hearts</p>
          <p className="text-sm">Loud guitars. Tiny rooms. Tour dates inside.</p>
        </div>
        <div className="rounded-chunk border-[3px] border-ink bg-white p-3 text-sm">
          <p className="mb-2 font-display text-xs uppercase">Guestbook</p>
          <p className="rounded-chunk border-2 border-ink p-2" style={{ background: p[4] }}>Saw you at the Roxy, still ringing. - Dee</p>
        </div>
        <p className="mx-auto flex gap-1 font-display text-xl text-sun">
          {'004217'.split('').map((d, i) => <span key={i} className="w-7 rounded border-2 border-sun bg-black text-center">{d}</span>)}
        </p>
      </div>
    </div>
  )
}

export default function Landing() {
  useMeta('Homestead · Your page, your address, your home online', 'GeoCities, resurrected. Claim an address in a themed neighbourhood, build a personal homepage, get a guestbook and hit counter, and export your page any time.')
  const [samples, setSamples] = useState<Homestead[] | null>(null)
  useEffect(() => {
    let live = true
    const ids = new Set(SEED_HOMESTEADS.map((h) => h.id))
    repo.listHomesteads({ publishedOnly: true }).then((all) => live && setSamples(all.filter((h) => ids.has(h.id))))
    return () => { live = false }
  }, [])

  return (
    <>
      <section className="border-b-4 border-ink bg-paper">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 lg:grid-cols-2 lg:py-20">
          <div>
            <p className="chip bg-sun">1994 to 2009, and back again</p>
            <h1 className="mt-4 text-4xl uppercase leading-tight sm:text-5xl">Your first home on the web is back.</h1>
            <p className="mt-4 text-lg">GeoCities gave millions of people their first home online. In 2009 Yahoo shut it down and those pages vanished. Today every profile looks the same. Homestead brings the personal homepage back, with a guestbook, a hit counter and neighbours down the street.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/new" className="btn btn-brick">Claim your address <ArrowRight aria-hidden size={18} /></Link>
              <Link to="/explore" className="btn btn-paper">Explore homesteads</Link>
            </div>
          </div>
          <HeroPreview />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14" aria-labelledby="hoods">
        <h2 id="hoods" className="text-2xl uppercase sm:text-3xl">Pick a neighbourhood</h2>
        <p className="mt-1">Six places to settle, each with its own colours and character.</p>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {NEIGHBOURHOODS.map((n) => (
            <li key={n.slug}>
              <Link to={`/explore?hood=${n.slug}`} className="card block h-full overflow-hidden no-underline transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0.5">
                <span className="flex h-4">{n.palette.slice(0, 3).map((c) => <span key={c} className="flex-1" style={{ background: c }} />)}</span>
                <span className="block p-4">
                  <span className="block font-display text-lg uppercase">{n.name}</span>
                  <span className="block font-medium">{n.tagline}</span>
                  <span className="mt-1 block text-sm text-neutral-700">{n.vibe}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-y-4 border-ink bg-sun" aria-labelledby="samples">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <h2 id="samples" className="text-2xl uppercase sm:text-3xl">Drop in on the neighbours</h2>
          <p className="mt-1">A few homesteads you can visit right now.</p>
          {samples === null ? (
            <div className="mt-6 flex gap-4 overflow-hidden" role="status" aria-label="Loading sample homesteads"><div className="skeleton h-32 w-64 shrink-0" /><div className="skeleton h-32 w-64 shrink-0" /><div className="skeleton h-32 w-64 shrink-0" /></div>
          ) : samples.length === 0 ? (
            <p className="mt-6">No sample pages are around right now. <Link to="/new" className="font-bold underline">Be the first on the street.</Link></p>
          ) : (
            <ul className="mt-6 flex snap-x gap-4 overflow-x-auto pb-4">
              {samples.map((h) => {
                const n = getNeighbourhood(h.neighbourhood)!
                return (
                  <li key={h.id} className="w-64 shrink-0 snap-start">
                    <Link to={`/${h.neighbourhood}/${h.name}`} className="card flex h-full flex-col gap-2 p-4 no-underline transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0.5">
                      <span className="chip self-start" style={{ background: n.palette[2], color: readableOn(n.palette[2]) }}>{n.name}</span>
                      <span className="text-lg font-bold leading-snug">{h.title}</span>
                      <span className="mt-auto break-all font-display text-xs uppercase">/{h.neighbourhood}/{h.name}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-14 md:grid-cols-2">
        <div className="card p-6">
          <Link2 aria-hidden size={32} />
          <h2 className="mt-3 text-2xl uppercase">Webrings, the original social network</h2>
          <p className="mt-2">Every page can carry a webring badge. Hit Previous, Random or Next to hop between neighbours in the same neighbourhood. No feed, no algorithm, just doors to knock on.</p>
        </div>
        <div className="card p-6" style={{ background: 'var(--color-moss)', color: '#fff' }}>
          <Download aria-hidden size={32} />
          <h2 className="mt-3 text-2xl uppercase">This time, your page is yours</h2>
          <p className="mt-2">Export your homestead as a single HTML file at any time. Host it anywhere, keep it forever. Nobody can switch it off on you.</p>
        </div>
      </section>

      <section className="border-t-4 border-ink bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-14 text-center">
          <Users aria-hidden size={36} />
          <h2 className="text-2xl uppercase sm:text-3xl">Find your corner of the web</h2>
          <Link to="/new" className="btn btn-brick">Claim your address <ArrowRight aria-hidden size={18} /></Link>
        </div>
      </section>
    </>
  )
}
