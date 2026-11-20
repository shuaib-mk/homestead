export const RESERVED_NAMES = ['admin', 'root', 'support', 'homestead', 'explore', 'new', 'build', 'api', 'www']
export const NAME_MIN = 3
export const NAME_MAX = 24

export type NameCheck = { ok: true } | { ok: false; error: string }

/** Format and reserved-word checks only. Availability is checked against the repo. */
export function validateName(raw: string): NameCheck {
  const name = raw
  if (name.length === 0) return { ok: false, error: 'Pick a name for your homestead.' }
  if (name.length < NAME_MIN) return { ok: false, error: `Names need at least ${NAME_MIN} characters.` }
  if (name.length > NAME_MAX) return { ok: false, error: `Names can be at most ${NAME_MAX} characters.` }
  if (/[A-Z]/.test(name)) return { ok: false, error: 'Use lowercase letters only.' }
  if (!/^[a-z0-9-]+$/.test(name)) {
    return { ok: false, error: 'Use only lowercase letters, numbers and hyphens (no spaces or symbols).' }
  }
  if (name.startsWith('-') || name.endsWith('-')) {
    return { ok: false, error: 'Names cannot start or end with a hyphen.' }
  }
  if (RESERVED_NAMES.includes(name)) {
    return { ok: false, error: `"${name}" is reserved for the town hall. Try another name.` }
  }
  return { ok: true }
}

/** Turn free typing into a best-effort valid name (used for suggestions, not silently applied). */
export function slugify(raw: string): string {
  return raw.toLowerCase().trim().replace(/[^a-z0-9-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, NAME_MAX)
}
