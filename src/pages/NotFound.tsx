import { MapPinOff } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useMeta } from '../lib/useMeta'

export default function NotFound({ address }: { address?: string }) {
  useMeta('Not built yet · Homestead', "This homestead hasn't been built yet. Claim the address or explore the neighbourhoods.")
  return (
    <section className="mx-auto max-w-2xl px-4 py-16 text-center">
      <div className="card p-6 sm:p-8">
        <MapPinOff aria-hidden size={44} className="mx-auto mb-3" />
        <p className="inline-block break-all rounded-chunk border-[3px] border-ink bg-ink px-3 py-1 font-display text-sm uppercase text-paper">{address ?? '404'}</p>
        <h1 className="my-3 text-2xl uppercase sm:text-3xl">This homestead hasn't been built yet</h1>
        <p className="mb-6">Nobody lives at this address. Claim it, or wander the neighbourhoods and find a home that does exist.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/new" className="btn btn-brick">Claim an address</Link>
          <Link to="/explore" className="btn btn-paper">Explore</Link>
        </div>
      </div>
    </section>
  )
}
