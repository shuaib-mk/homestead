import { Check, Loader2, X } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { NEIGHBOURHOODS, getNeighbourhood } from '../data/neighbourhoods'
import { RepoError, repo } from '../lib/repo'
import { useMeta } from '../lib/useMeta'
import { NAME_MAX, validateName } from '../lib/validateName'
import type { NeighbourhoodSlug } from '../types'

type Avail = { s: 'idle' } | { s: 'checking' } | { s: 'invalid'; error: string } | { s: 'taken' } | { s: 'free' }

export default function Claim() {
  useMeta('Claim your address · Homestead', 'Pick a neighbourhood and a name, and claim your own address on Homestead.')
  const navigate = useNavigate()
  const [slug, setSlug] = useState<NeighbourhoodSlug>('soho')
  const [name, setName] = useState('')
  const [avail, setAvail] = useState<Avail>({ s: 'idle' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState<{ slug: NeighbourhoodSlug; name: string } | null>(null)
  const hood = getNeighbourhood(slug)!

  useEffect(() => {
    if (!name) { setAvail({ s: 'idle' }); return }
    const v = validateName(name)
    if (!v.ok) { setAvail({ s: 'invalid', error: v.error }); return }
    setAvail({ s: 'checking' })
    let live = true
    const t = setTimeout(() => {
      repo.isNameAvailable(slug, name).then((ok) => live && setAvail(ok ? { s: 'free' } : { s: 'taken' }))
        .catch(() => live && setAvail({ s: 'invalid', error: 'Could not check that name. Please try again.' }))
    }, 200)
    return () => { live = false; clearTimeout(t) }
  }, [name, slug])

  useEffect(() => {
    if (!done) return
    const t = setTimeout(() => navigate(`/build/${done.slug}/${done.name}`), 1800)
    return () => clearTimeout(t)
  }, [done, navigate])

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (avail.s !== 'free' || busy) return
    setBusy(true); setError('')
    try {
      const h = await repo.createHomestead(slug, name)
      setDone({ slug: h.neighbourhood, name: h.name })
    } catch (err) {
      setError(err instanceof RepoError ? err.message : 'Something went wrong. Please try again.')
      setAvail({ s: 'taken' })
    } finally { setBusy(false) }
  }

  const message =
    avail.s === 'invalid' ? avail.error :
    avail.s === 'taken' ? `That name is taken in ${hood.name}. Try another, or pick a different neighbourhood.` :
    avail.s === 'free' ? `Good news: /${slug}/${name} is free.` :
    avail.s === 'checking' ? 'Checking the address book...' : `${3}-${NAME_MAX} characters: lowercase letters, numbers and hyphens.`
  const bad = avail.s === 'invalid' || avail.s === 'taken'

  return (
    <section className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl uppercase sm:text-4xl">Claim your address</h1>
      <p className="mt-1">Pick a neighbourhood, pick a name. It takes ten seconds and costs nothing.</p>

      <form onSubmit={submit} className="mt-8 grid gap-8" noValidate>
        <fieldset>
          <legend className="mb-3 font-display text-sm uppercase">1. Choose a neighbourhood</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {NEIGHBOURHOODS.map((n) => (
              <label key={n.slug} className={`card relative flex min-h-11 cursor-pointer flex-col gap-1 p-3 transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0.5 has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 ${slug === n.slug ? 'bg-sun' : ''}`}>
                <input type="radio" name="hood" value={n.slug} checked={slug === n.slug} onChange={() => setSlug(n.slug)} className="sr-only" />
                <span className="flex items-center justify-between gap-2">
                  <span className="font-display uppercase">{n.name}</span>
                  <span className="flex gap-1" aria-hidden>
                    {n.palette.slice(0, 3).map((c) => <span key={c} className="h-4 w-4 rounded-full border-2 border-ink" style={{ background: c }} />)}
                  </span>
                </span>
                <span className="text-sm">{n.tagline}</span>
                {slug === n.slug && <Check aria-hidden size={18} className="absolute bottom-2 right-2" />}
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor="name" className="mb-2 block font-display text-sm uppercase">2. Choose a name</label>
          <input id="name" className="field" value={name} onChange={(e) => setName(e.target.value)} autoComplete="off" autoCapitalize="none" spellCheck={false}
            aria-invalid={bad} aria-describedby="name-help" maxLength={40} />
          <p id="name-help" role="status" className={`mt-2 flex items-start gap-2 text-sm font-medium ${bad ? 'text-red-700' : avail.s === 'free' ? 'text-emerald-800' : 'text-neutral-700'}`}>
            {avail.s === 'checking' && <Loader2 aria-hidden size={18} className="mt-0.5 shrink-0 animate-spin" />}
            {avail.s === 'free' && <Check aria-hidden size={18} className="mt-0.5 shrink-0" />}
            {bad && <X aria-hidden size={18} className="mt-0.5 shrink-0" />}
            <span>{message}</span>
          </p>
        </div>

        <div className="rounded-chunk border-[3px] border-ink p-4 text-center" style={{ background: hood.palette[3], color: '#fff' }}>
          <p className="text-xs uppercase opacity-80">Your address</p>
          <p className="break-all font-display text-lg sm:text-2xl">homestead.app/{slug}/{name || 'your-name'}</p>
        </div>

        <div>
          <button type="submit" className="btn btn-brick" disabled={avail.s !== 'free' || busy}>
            {busy ? 'Claiming...' : 'Claim this address'}
          </button>
          {error && <p role="alert" className="mt-3 font-medium text-red-700">{error}</p>}
        </div>
      </form>

      {done && (
        <div role="status" className="fixed inset-0 z-50 flex items-center justify-center bg-ink/90 p-6 anim-pop">
          {Array.from({ length: 36 }, (_, i) => (
            <span key={i} className="confetti" style={{ left: `${(i * 29) % 100}%`, background: hood.palette[i % 3], animationDelay: `${(i % 9) * 90}ms` }} />
          ))}
          <div className="card anim-stamp max-w-md p-8 text-center">
            <p className="font-display text-sm uppercase">Welcome home</p>
            <h2 className="my-2 break-all text-2xl uppercase">{done.name}</h2>
            <p>Your address is yours. Unpacking the starter boxes and opening the builder...</p>
          </div>
        </div>
      )}
    </section>
  )
}
