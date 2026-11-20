import { useEffect } from 'react'

export default function Claim() {
  useEffect(() => { document.title = 'Claim · Homestead' }, [])
  return (
    <section className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl uppercase">Claim</h1>
    </section>
  )
}
