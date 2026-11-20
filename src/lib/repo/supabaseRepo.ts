import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { GuestbookEntry, Homestead, NeighbourhoodSlug } from '../../types'
import { SEED_HOMESTEADS } from '../../data/seeds'
import { checkEntry } from '../guestbook'
import { uid } from '../ids'
import { starterBlocks, starterTheme } from '../starter'
import { validateName } from '../validateName'
import { RepoError, type Repo } from './types'

interface HomesteadRow {
  id: string; neighbourhood_slug: string; name: string; title: string
  theme: Homestead['theme']; blocks: Homestead['blocks']; published: boolean; created_at: string
}
interface EntryRow { id: string; homestead_id: string; author_name: string; message: string; created_at: string }

const toHomestead = (r: HomesteadRow): Homestead => ({
  id: r.id, neighbourhood: r.neighbourhood_slug as NeighbourhoodSlug, name: r.name, title: r.title,
  theme: r.theme, blocks: r.blocks, published: r.published, createdAt: r.created_at,
})
const toEntry = (r: EntryRow): GuestbookEntry => ({
  id: r.id, homesteadId: r.homestead_id, author: r.author_name, message: r.message, createdAt: r.created_at,
})

const OWNED_KEY = 'homestead:v1:owned'
const ownedIds = (): string[] => {
  try { return JSON.parse(localStorage.getItem(OWNED_KEY) ?? '[]') as string[] } catch { return [] }
}

function fail(action: string, error: { message: string } | null): never {
  throw new RepoError(`Could not ${action}. ${error?.message ?? 'Please try again.'}`)
}

export function createSupabaseRepo(url: string, anonKey: string): Repo {
  const db: SupabaseClient = createClient(url, anonKey)
  let seeding: Promise<void> | null = null

  /** First run against an empty database: insert the sample homesteads so the webring has somewhere to go. */
  function ensureSeeded(): Promise<void> {
    seeding ??= (async () => {
      const { count, error } = await db.from('homesteads').select('id', { count: 'exact', head: true })
      if (error || (count ?? 0) > 0) return
      await db.from('homesteads').insert(SEED_HOMESTEADS.map((h) => ({
        id: h.id, neighbourhood_slug: h.neighbourhood, name: h.name, title: h.title,
        theme: h.theme, blocks: h.blocks, published: true, created_at: h.createdAt,
      })))
    })()
    return seeding
  }

  return {
    mode: 'supabase',

    async listHomesteads(opts) {
      await ensureSeeded()
      let q = db.from('homesteads').select('*').order('created_at', { ascending: false })
      if (opts?.publishedOnly) q = q.eq('published', true)
      const { data, error } = await q
      if (error) fail('load homesteads', error)
      return (data as HomesteadRow[]).map(toHomestead)
    },

    async getHomestead(neighbourhood, name) {
      await ensureSeeded()
      const { data, error } = await db.from('homesteads').select('*')
        .eq('neighbourhood_slug', neighbourhood).eq('name', name).maybeSingle()
      if (error) fail('load this homestead', error)
      return data ? toHomestead(data as HomesteadRow) : null
    },

    async isNameAvailable(neighbourhood, name) {
      const { count, error } = await db.from('homesteads').select('id', { count: 'exact', head: true })
        .eq('neighbourhood_slug', neighbourhood).eq('name', name)
      if (error) fail('check that name', error)
      return (count ?? 0) === 0
    },

    async createHomestead(neighbourhood, name) {
      const check = validateName(name)
      if (!check.ok) throw new RepoError(check.error)
      const h: Homestead = {
        id: uid(), neighbourhood, name, title: `${name}'s page`,
        theme: starterTheme(neighbourhood), blocks: starterBlocks(name),
        published: true, createdAt: new Date().toISOString(),
      }
      const { error } = await db.from('homesteads').insert({
        id: h.id, neighbourhood_slug: neighbourhood, name, title: h.title,
        theme: h.theme, blocks: h.blocks, published: true,
      })
      if (error) {
        if (error.code === '23505') throw new RepoError('That address was just taken. Try another name.')
        fail('claim that address', error)
      }
      try { localStorage.setItem(OWNED_KEY, JSON.stringify([...ownedIds(), h.id])) } catch { /* owner flag is best-effort */ }
      return h
    },

    async saveHomestead(h) {
      const { error } = await db.from('homesteads')
        .update({ title: h.title, theme: h.theme, blocks: h.blocks, published: h.published })
        .eq('id', h.id)
      if (error) fail('save your page', error)
      return h
    },

    isOwner: (id) => ownedIds().includes(id),

    async listGuestbook(homesteadId) {
      const { data, error } = await db.from('guestbook_entries').select('*')
        .eq('homestead_id', homesteadId).order('created_at', { ascending: false })
      if (error) fail('load the guestbook', error)
      return (data as EntryRow[]).map(toEntry)
    },

    async signGuestbook(homesteadId, author, message) {
      const check = checkEntry(author, message)
      if (!check.ok) throw new RepoError(check.error)
      const { data, error } = await db.from('guestbook_entries')
        .insert({ homestead_id: homesteadId, author_name: check.author, message: check.message })
        .select().single()
      if (error) fail('sign the guestbook', error)
      return toEntry(data as EntryRow)
    },

    async deleteGuestbookEntry(entryId) {
      const { error } = await db.from('guestbook_entries').delete().eq('id', entryId)
      if (error) fail('delete that entry', error)
    },

    async getViews(id) {
      const { data, error } = await db.from('page_views').select('count').eq('homestead_id', id).maybeSingle()
      if (error) fail('load the counter', error)
      return Number((data as { count: number } | null)?.count ?? 0)
    },

    async incrementViews(id) {
      const { data, error } = await db.rpc('increment_page_views', { hid: id })
      if (error) fail('update the counter', error)
      return Number(data)
    },
  }
}
