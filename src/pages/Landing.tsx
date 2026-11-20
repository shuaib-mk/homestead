import { useEffect } from 'react'

export default function Landing() {
  useEffect(() => { document.title = 'Landing · Homestead' }, [])
  return (
    <section className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl uppercase">Landing</h1>
    </section>
  )
}
