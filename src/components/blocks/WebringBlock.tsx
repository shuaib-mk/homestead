import { ChevronLeft, ChevronRight, Dices, Link2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { repo } from '../../lib/repo'
import { buildRing, pickRandom, ringLinks } from '../../lib/webring'
import type { Homestead } from '../../types'
import type { BlockCtx } from './types'

export default function WebringBlock({ ctx }: { ctx: BlockCtx }) {
  const { homestead, hood } = ctx
  const navigate = useNavigate()
  const [ring, setRing] = useState<Homestead[] | null>(null)

  useEffect(() => {
    let live = true
    repo.listHomesteads({ publishedOnly: true }).then((all) => live && setRing(buildRing(all, homestead)))
    return () => { live = false }
  }, [homestead.id, homestead.neighbourhood])

  const addr = (h: Homestead) => `/${h.neighbourhood}/${h.name}`
  return (
    <nav aria-label={`${hood.name} webring`} className="hs-card bg-white p-5 text-center">
      <p className="mb-1 inline-flex items-center gap-2 font-display text-sm uppercase"><Link2 aria-hidden size={18} /> {hood.name} webring</p>
      {ring === null ? (
        <div className="skeleton mx-auto mt-3 h-11 max-w-sm" role="status" aria-label="Loading webring" />
      ) : (() => {
        const links = ringLinks(ring, homestead.id)
        return (
          <>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              <Link to={addr(links.prev)} className="btn btn-paper"><ChevronLeft aria-hidden size={18} /> Previous</Link>
              <button type="button" className="btn btn-paper" onClick={() => navigate(addr(pickRandom(ring, homestead.id)))}>
                <Dices aria-hidden size={18} /> Random
              </button>
              <Link to={addr(links.next)} className="btn btn-paper">Next <ChevronRight aria-hidden size={18} /></Link>
            </div>
            <p className="mt-3 text-sm text-neutral-700">
              {links.alone
                ? `This is the only homestead in ${hood.name} so far, so every link leads back here. Claim a neighbouring address to grow the ring.`
                : `${links.size} homesteads in this ring. Next stop: ${links.next.title}.`}
            </p>
          </>
        )
      })()}
    </nav>
  )
}
