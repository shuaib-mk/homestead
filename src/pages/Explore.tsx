import { useEffect } from 'react'

export default function Explore() {
  useEffect(() => { document.title = 'Explore · Homestead' }, [])
  return (
    <section className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl uppercase">Explore</h1>
    </section>
  )
}
