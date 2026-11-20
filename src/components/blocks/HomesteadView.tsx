import { Link } from 'react-router-dom'
import { Hammer } from 'lucide-react'
import { pageStyle } from '../../lib/theme'
import type { Homestead, Neighbourhood } from '../../types'
import BlockRenderer from './BlockRenderer'
import StreetSign from './StreetSign'

/** The themed page: street sign, blocks, footer. Used by the public route and the builder preview. */
export default function HomesteadView({ homestead, hood, views }: { homestead: Homestead; hood: Neighbourhood; views: number | null }) {
  const firstHeaderId = homestead.blocks.find((b) => b.type === 'header')?.id
  const ctx = { homestead, hood, views, firstHeaderId }
  return (
    <div className="hs-page px-4 py-8 sm:py-12" style={pageStyle(hood, homestead.theme)}>
      <div className="mx-auto grid max-w-2xl gap-5">
        <StreetSign hood={hood} name={homestead.name} />
        {!firstHeaderId && <h1 className="sr-only">{homestead.title}</h1>}
        {homestead.blocks.map((b, i) => (
          <div key={b.id} className="anim-pop" style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}>
            <BlockRenderer block={b} ctx={ctx} />
          </div>
        ))}
        {homestead.blocks.length === 0 && (
          <div className="hs-card bg-white p-6 text-center">This page has no blocks yet.</div>
        )}
        <p className="pb-2 text-center">
          <Link to="/new" className="hs-pill"><Hammer aria-hidden size={16} /> A Homestead page. Build yours</Link>
        </p>
      </div>
    </div>
  )
}
