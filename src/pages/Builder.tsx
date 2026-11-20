import { useParams } from 'react-router-dom'

export default function Builder() {
  const { neighbourhood, name } = useParams()
  return (
    <section className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl uppercase">Builder</h1>
      <p>{neighbourhood}/{name}</p>
    </section>
  )
}
