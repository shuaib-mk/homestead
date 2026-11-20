import type { GuestbookEntry, Homestead, NeighbourhoodSlug } from '../../types'
import { SEED_ENTRIES, SEED_HOMESTEADS, SEED_VIEWS } from '../../data/seeds'
import { COOLDOWN_MS, checkEntry } from '../guestbook'
import { uid } from '../ids'
import { starterBlocks, starterTheme } from '../starter'
import { validateName } from '../validateName'
import { RepoError, type Repo } from './types'

const P = 'homestead:v1:'

/** localStorage with in-memory fallback (private mode / quota). */
const memory = new Map<string, string>()
function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(P + key) ?? memory.get(P + key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    const raw = memory.get(P + key)
    return raw ? (JSON.parse(raw) as T) : fallback
  }
}
function write(key: string, value: unknown): void {
  const raw = JSON.stringify(value)
  memory.set(P + key, raw)
  try { localStorage.setItem(P + key, raw) } catch { /* in-memory copy keeps the session working */ }
}

function ensureSeeded(): void {
  if (read<boolean>('seeded', false)) return
  write('homesteads', SEED_HOMESTEADS)
  write('guestbook', SEED_ENTRIES)
  write('views', SEED_VIEWS)
  write('owned', [])
  write('seeded', true)
}

const homesteads = () => (ensureSeeded(), read<Homestead[]>('homesteads', []))
const entries = () => (ensureSeeded(), read<GuestbookEntry[]>('guestbook', []))

export const localRepo: Repo = {
  mode: 'demo',

  async listHomesteads(opts) {
    const all = homesteads()
    return (opts?.publishedOnly ? all.filter((h) => h.published) : all)
      .slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  },

  async getHomestead(neighbourhood, name) {
    return homesteads().find((h) => h.neighbourhood === neighbourhood && h.name === name) ?? null
  },

  async isNameAvailable(neighbourhood, name) {
    return !homesteads().some((h) => h.neighbourhood === neighbourhood && h.name === name)
  },

  async createHomestead(neighbourhood: NeighbourhoodSlug, name: string) {
    const check = validateName(name)
    if (!check.ok) throw new RepoError(check.error)
    if (!(await this.isNameAvailable(neighbourhood, name))) {
      throw new RepoError('That address was just taken. Try another name.')
    }
    const h: Homestead = {
      id: uid(), neighbourhood, name, title: `${name}'s page`,
      theme: starterTheme(neighbourhood), blocks: starterBlocks(name),
      published: true, createdAt: new Date().toISOString(),
    }
    write('homesteads', [...homesteads(), h])
    write('owned', [...read<string[]>('owned', []), h.id])
    write('views', { ...read<Record<string, number>>('views', {}), [h.id]: 0 })
    return h
  },

  async saveHomestead(h) {
    const all = homesteads()
    if (!all.some((x) => x.id === h.id)) throw new RepoError('That homestead no longer exists.')
    write('homesteads', all.map((x) => (x.id === h.id ? h : x)))
    return h
  },

  isOwner(id) {
    ensureSeeded()
    return read<string[]>('owned', []).includes(id)
  },

  async listGuestbook(homesteadId) {
    return entries().filter((x) => x.homesteadId === homesteadId).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  },

  async signGuestbook(homesteadId, author, message) {
    const check = checkEntry(author, message)
    if (!check.ok) throw new RepoError(check.error)
    const last = read<number>('lastSign', 0)
    const wait = COOLDOWN_MS - (Date.now() - last)
    if (wait > 0) throw new RepoError(`Easy there. You can sign again in ${Math.ceil(wait / 1000)} seconds.`)
    const entry: GuestbookEntry = {
      id: uid(), homesteadId, author: check.author, message: check.message, createdAt: new Date().toISOString(),
    }
    write('guestbook', [...entries(), entry])
    write('lastSign', Date.now())
    return entry
  },

  async deleteGuestbookEntry(entryId) {
    write('guestbook', entries().filter((x) => x.id !== entryId))
  },

  async getViews(id) {
    ensureSeeded()
    return read<Record<string, number>>('views', {})[id] ?? 0
  },

  async incrementViews(id) {
    ensureSeeded()
    const views = read<Record<string, number>>('views', {})
    const next = (views[id] ?? 0) + 1
    write('views', { ...views, [id]: next })
    return next
  },
}
