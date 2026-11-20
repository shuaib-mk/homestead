import { Trash2, PenLine } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { AUTHOR_MAX, MESSAGE_MAX, toPlainText, checkEntry, friendlyTime } from '../../lib/guestbook'
import { RepoError, repo } from '../../lib/repo'
import type { GuestbookEntry } from '../../types'
import type { BlockCtx } from './types'

export default function GuestbookBlock({ heading, ctx }: { heading: string; ctx: BlockCtx }) {
  const hid = ctx.homestead.id
  const owner = repo.isOwner(hid)
  const [entries, setEntries] = useState<GuestbookEntry[] | null>(null)
  const [freshId, setFreshId] = useState<string | null>(null)
  const [author, setAuthor] = useState('')
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState<{ author?: string; message?: string; form?: string }>({})
  const [busy, setBusy] = useState(false)
  const [thanks, setThanks] = useState(false)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  useEffect(() => {
    let live = true
    repo.listGuestbook(hid).then((e) => live && setEntries(e))
    return () => { live = false }
  }, [hid])

  async function submit(e: FormEvent) {
    e.preventDefault()
    setThanks(false)
    const check = checkEntry(author, message)
    if (!check.ok) { setErrors({ [check.field]: check.error }); return }
    setErrors({}); setBusy(true)
    try {
      const entry = await repo.signGuestbook(hid, author, message)
      setEntries((prev) => [entry, ...(prev ?? [])])
      setFreshId(entry.id); setMessage(''); setThanks(true)
    } catch (err) {
      setErrors({ form: err instanceof RepoError ? err.message : 'Something went wrong. Please try again.' })
    } finally { setBusy(false) }
  }

  async function remove(id: string) {
    try {
      await repo.deleteGuestbookEntry(id)
      setEntries((prev) => (prev ?? []).filter((x) => x.id !== id))
    } catch {
      setErrors({ form: 'Could not delete that entry. Please try again.' })
    }
    setConfirmId(null)
  }

  return (
    <section aria-labelledby={`gb-${ctx.homestead.id}`} className="hs-card bg-white p-5 sm:p-6">
      <h2 id={`gb-${ctx.homestead.id}`} className="mb-4 text-xl uppercase" style={{ fontFamily: 'var(--hs-heading)' }}>{heading}</h2>

      <form onSubmit={submit} noValidate className="grid gap-3 rounded-chunk border-[3px] border-dashed border-ink p-4">
        <div>
          <label htmlFor={`gb-a-${hid}`} className="mb-1 block font-display text-xs uppercase">Your name</label>
          <input id={`gb-a-${hid}`} className="field" value={author} maxLength={AUTHOR_MAX} autoComplete="nickname"
            onChange={(e) => setAuthor(e.target.value)} aria-invalid={!!errors.author} aria-describedby={errors.author ? `gb-ae-${hid}` : undefined} />
          {errors.author && <p id={`gb-ae-${hid}`} className="mt-1 text-sm font-medium text-red-700">{errors.author}</p>}
        </div>
        <div>
          <label htmlFor={`gb-m-${hid}`} className="mb-1 block font-display text-xs uppercase">Message</label>
          <textarea id={`gb-m-${hid}`} className="field min-h-24" rows={3} value={message}
            onChange={(e) => setMessage(e.target.value)} aria-invalid={!!errors.message} aria-describedby={errors.message ? `gb-me-${hid}` : undefined} />
          <div className="mt-1 flex justify-between gap-2 text-sm">
            <span id={`gb-me-${hid}`} className="font-medium text-red-700">{errors.message}</span>
            <span className={toPlainText(message).length > MESSAGE_MAX ? 'font-medium text-red-700' : 'text-neutral-600'}>{toPlainText(message).length}/{MESSAGE_MAX}</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" className="btn btn-brick" disabled={busy}><PenLine aria-hidden size={18} /> {busy ? 'Signing...' : 'Sign the guestbook'}</button>
          <p role="status" className="text-sm font-medium">
            {errors.form ? <span className="text-red-700">{errors.form}</span> : thanks ? 'Thanks for signing!' : ''}
          </p>
        </div>
      </form>

      <div className="mt-5" aria-live="polite">
        {entries === null && <div className="skeleton h-24" role="status" aria-label="Loading guestbook" />}
        {entries !== null && entries.length === 0 && (
          <p className="rounded-chunk bg-neutral-100 p-4 text-center">No one has signed yet. Be the first.</p>
        )}
        {entries !== null && entries.length > 0 && (
          <ul className="grid gap-3">
            {entries.map((en) => (
              <li key={en.id} className={`rounded-chunk border-[3px] border-ink bg-[var(--hs-tint)] p-3 ${en.id === freshId ? 'anim-stamp' : ''}`}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <p className="font-display text-sm uppercase break-all">{en.author}</p>
                  <time dateTime={en.createdAt} className="text-sm text-neutral-700">{friendlyTime(en.createdAt)}</time>
                </div>
                <p className="mt-1 whitespace-pre-line break-words">{en.message}</p>
                {owner && (
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {confirmId === en.id ? (
                      <>
                        <button type="button" className="btn btn-brick" onClick={() => remove(en.id)}>Yes, delete</button>
                        <button type="button" className="btn btn-paper" onClick={() => setConfirmId(null)}>Keep it</button>
                      </>
                    ) : (
                      <button type="button" className="btn btn-paper" onClick={() => setConfirmId(en.id)} aria-label={`Delete entry from ${en.author}`}>
                        <Trash2 aria-hidden size={16} /> Delete
                      </button>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
