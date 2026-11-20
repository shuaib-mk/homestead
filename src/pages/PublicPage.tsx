import { Pencil } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import HomesteadView from '../components/blocks/HomesteadView'
import { getNeighbourhood } from '../data/neighbourhoods'
import { repo } from '../lib/repo'
import { useMeta } from '../lib/useMeta'
import type { Homestead } from '../types'
import NotFound from './NotFound'

// React StrictMode mounts effects twice in dev; share one increment per page load.
const recent = new Map<string, { at: number; p: Promise<number> }>()
function countView(id: string): Promise<number> {
  const hit = recent.get(id)
  if (hit && Date.now() - hit.at < 1500) return hit.p
  const p = repo.incrementViews(id)
  recent.set(id, { at: Date.now(), p })
  return p
}

export default function PublicPage() {
  const { neighbourhood = '', name = '' } = useParams()
  const [state, setState] = useState<'loading' | 'missing' | Homestead>('loading')
  const [views, setViews] = useState<number | null>(null)
  const hood = getNeighbourhood(neighbourhood)
  const page = typeof state === 'object' ? state : null

  useMeta(
    page && hood ? `${page.title} · ${hood.name} · Homestead` : state === 'missing' ? 'Not built yet · Homestead' : 'Loading · Homestead',
    page && hood ? `${page.title}, a homestead at /${hood.slug}/${page.name} in ${hood.name}. Sign the guestbook and wander the webring.` : 'This homestead has not been built yet.',
  )

  useEffect(() => {
    let live = true
    setState('loading'); setViews(null)
    if (!hood) { setState('missing'); return }
    repo.getHomestead(neighbourhood, name).then(async (h) => {
      if (!live) return
      if (!h || !h.published) { setState('missing'); return }
      setState(h)
      const n = await countView(h.id).catch(() => repo.getViews(h.id))
      if (live) setViews(n)
    }).catch(() => live && setState('missing'))
    return () => { live = false }
  }, [neighbourhood, name, hood])

  if (state === 'loading') {
    return (
      <div className="mx-auto grid max-w-2xl gap-4 px-4 py-10" role="status" aria-label="Loading page">
        <div className="skeleton h-24" /><div className="skeleton h-40" /><div className="skeleton h-32" />
      </div>
    )
  }
  if (state === 'missing' || !hood) return <NotFound address={`/${neighbourhood}/${name}`} />
  return (
    <>
      {repo.isOwner(state.id) && (
        <div className="border-b-4 border-ink bg-white px-4 py-2 text-center">
          <Link to={`/build/${state.neighbourhood}/${state.name}`} className="btn btn-paper"><Pencil aria-hidden size={16} /> Edit this page</Link>
        </div>
      )}
      <HomesteadView homestead={state} hood={hood} views={views} />
    </>
  )
}
