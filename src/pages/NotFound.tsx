import { Link } from 'react-router-dom'
import { useEffect } from 'react'

export default function NotFound({ address }: { address?: string }) {
  useEffect(() => { document.title = 'Not built yet · Homestead' }, [])
  return (
    <section className="mx-auto max-w-2xl px-4 py-16 text-center">
      <div className="card p-8">
        <p className="font-display text-sm uppercase">{address ?? '404'}</p>
        <h1 className="my-3 text-3xl uppercase">This homestead hasn't been built yet</h1>
        <p className="mb-6">Nobody lives at this address. Claim it, or wander the neighbourhoods and find a home that does exist.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/new" className="btn btn-brick">Claim an address</Link>
          <Link to="/explore" className="btn btn-paper">Explore</Link>
        </div>
      </div>
    </section>
  )
}
