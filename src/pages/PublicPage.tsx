import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getNeighbourhood } from '../data/neighbourhoods'
import { repo } from '../lib/repo'
import type { Homestead } from '../types'
import NotFound from './NotFound'

export default function PublicPage() {
  const { neighbourhood = '', name = '' } = useParams()
  const [state, setState] = useState<'loading' | 'missing' | Homestead>('loading')
  const hood = getNeighbourhood(neighbourhood)

  useEffect(() => {
    let live = true
    setState('loading')
    if (!hood) { setState('missing'); return }
    repo.getHomestead(neighbourhood, name).then((h) => live && setState(h && h.published ? h : 'missing'))
    return () => { live = false }
  }, [neighbourhood, name, hood])

  if (state === 'loading') return <div className="mx-auto max-w-3xl p-8"><div className="skeleton h-40" role="status" aria-label="Loading page" /></div>
  if (state === 'missing') return <NotFound address={`/${neighbourhood}/${name}`} />
  return (
    <section className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl uppercase">{state.title}</h1>
      <p>{hood?.name} / {state.name}</p>
    </section>
  )
}
