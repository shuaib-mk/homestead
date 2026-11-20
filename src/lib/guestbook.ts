export const AUTHOR_MAX = 50
export const MESSAGE_MAX = 500
export const COOLDOWN_MS = 30_000

/** Strip well-formed tags and control characters. A lone `<` or an entity like `&amp;` is kept as typed; every render path escapes. */
export function toPlainText(input: string): string {
  return input
    .replace(/<\/?[a-z][^>]*>/gi, '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim()
}

export type EntryCheck =
  | { ok: true; author: string; message: string }
  | { ok: false; field: 'author' | 'message'; error: string }

export function checkEntry(authorRaw: string, messageRaw: string): EntryCheck {
  const author = toPlainText(authorRaw).replace(/\s+/g, ' ')
  const message = toPlainText(messageRaw)
  if (!author) return { ok: false, field: 'author', error: 'Tell us your name so the owner knows who stopped by.' }
  if (author.length > AUTHOR_MAX) return { ok: false, field: 'author', error: `Names can be up to ${AUTHOR_MAX} characters.` }
  if (!message) return { ok: false, field: 'message', error: 'Write a short message before signing.' }
  if (message.length > MESSAGE_MAX) return { ok: false, field: 'message', error: `Messages can be up to ${MESSAGE_MAX} characters (yours is ${message.length}).` }
  return { ok: true, author, message }
}

export function friendlyTime(iso: string, now: number = Date.now()): string {
  const diff = Math.max(0, now - new Date(iso).getTime())
  const s = Math.floor(diff / 1000)
  if (s < 45) return 'just now'
  const m = Math.round(s / 60)
  if (m < 60) return m <= 1 ? 'a minute ago' : `${m} minutes ago`
  const h = Math.round(m / 60)
  if (h < 24) return h === 1 ? 'an hour ago' : `${h} hours ago`
  const d = Math.round(h / 24)
  if (d < 30) return d === 1 ? 'yesterday' : `${d} days ago`
  return new Date(iso).toLocaleDateString('en', { year: 'numeric', month: 'short', day: 'numeric' })
}
