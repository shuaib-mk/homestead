import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { GuestbookEntry, Homestead, NeighbourhoodSlug } from '../../types'
import { SEED_ENTRIES, SEED_HOMESTEADS, SEED_VIEWS } from '../../data/seeds'
import { COOLDOWN_MS, checkEntry } from '../guestbook'
import { uid } from '../ids'
import { starterBlocks, starterTheme } from '../starter'
import { validateName } from '../validateName'
import { getToken, hashToken, newToken, saveToken } from './editToken'
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

/** The hash column is not readable by the anon role, so never select('*') on homesteads. */
const HOMESTEAD_COLS = 'id, neighbourhood_slug, name, title, theme, blocks, published, created_at'

const LAST_SIGN_KEY = 'homestead:v1:lastSign'
const lastSign = { at: 0 }
const readLastSign = (): number => {
  try { return Number(localStorage.getItem(LAST_SIGN_KEY) ?? 0) || lastSign.at } catch { return lastSign.at }
}
const writeLastSign = (t: number): void => {
  lastSign.at = t
  try { localStorage.setItem(LAST_SIGN_KEY, String(t)) } catch { /* memory copy keeps the cooldown for this session */ }
}

function fail(action: string, error: { message: string } | null): never {
  throw new RepoError(`Could not ${action}. ${error?.message ?? 'Please try again.'}`)
}

export function createSupabaseRepo(url: string, anonKey: string): Repo {
  const db: SupabaseClient = createClient(url, anonKey)
  let seeding: Promise<void> | null = null

  /**
   * Idempotent and safe on an existing database. Inserts any missing sample homesteads, sample guestbook entries
   * (fixed ids, so duplicates are ignored) and starting page counters (only set when a page has no counter yet).
   * Sample pages carry no edit token, so nobody can edit them. Failures are ignored: seeding is cosmetic.
   */
  function ensureSeeded(): Promise<void> {
    seeding ??= (async () => {
      const ids = SEED_HOMESTEADS.map((h) => h.id)
      const { data: have, error } = await db.from('homesteads').select('id', { count: 'exact' }).in('id', ids)
      if (error) return
      const present = new Set((have as { id: string }[]).map((r) => r.id))
      if (present.size === 0) {
        const { count } = await db.from('homesteads').select('id', { count: 'exact', head: true })
        // A database that already has other pages but none of ours was not set up for samples: leave it alone.
        if ((count ?? 0) > 0) return
      }
      const missing = SEED_HOMESTEADS.filter((h) => !present.has(h.id))
      if (missing.length) {
        await db.from('homesteads').insert(missing.map((h) => ({
          id: h.id, neighbourhood_slug: h.neighbourhood, name: h.name, title: h.title,
          theme: h.theme, blocks: h.blocks, published: true, created_at: h.createdAt,
        })))
      }
      const { count: entryCount } = await db.from('guestbook_entries').select('id', { count: 'exact', head: true }).in('homestead_id', ids)
      if ((entryCount ?? 0) === 0) {
        await db.from('guestbook_entries').upsert(SEED_ENTRIES.map((x) => ({
          id: x.id, homestead_id: x.homesteadId, author_name: x.author, message: x.message, created_at: x.createdAt,
        })), { onConflict: 'id', ignoreDuplicates: true })
      }
      const { data: counted } = await db.from('page_views').select('homestead_id').in('homestead_id', ids)
      const hasCounter = new Set((counted as { homestead_id: string }[] | null)?.map((r) => r.homestead_id))
      await Promise.all(Object.entries(SEED_VIEWS).filter(([id]) => !hasCounter.has(id))
        .map(([id, n]) => db.rpc('seed_page_views', { hid: id, n })))
    })().catch(() => undefined)
    return seeding
  }

  return {
    mode: 'supabase',

    async listHomesteads(opts) {
      await ensureSeeded()
      let q = db.from('homesteads').select(HOMESTEAD_COLS).order('created_at', { ascending: false })
      if (opts?.publishedOnly) q = q.eq('published', true)
      const { data, error } = await q
      if (error) fail('load homesteads', error)
      return (data as HomesteadRow[]).map(toHomestead)
    },

    async getHomestead(neighbourhood, name) {
      await ensureSeeded()
      const { data, error } = await db.from('homesteads').select(HOMESTEAD_COLS)
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
      if (!globalThis.crypto?.subtle) throw new RepoError('Your browser cannot create a secure edit key here. Use https or localhost.')
      const token = newToken()
      const { error } = await db.from('homesteads').insert({
        id: h.id, neighbourhood_slug: neighbourhood, name, title: h.title,
        theme: h.theme, blocks: h.blocks, published: true, edit_token_hash: await hashToken(token),
      })
      if (error) {
        if (error.code === '23505') throw new RepoError('That address was just taken. Try another name.')
        fail('claim that address', error)
      }
      saveToken(h.id, token)
      return h
    },

    async saveHomestead(h) {
      const token = getToken(h.id)
      if (!token) throw new RepoError('This browser does not hold the edit key for this page, so it cannot be changed here.')
      const { error } = await db.rpc('update_homestead', {
        hid: h.id, token, p_title: h.title, p_theme: h.theme, p_blocks: h.blocks, p_published: h.published,
      })
      if (error) fail('save your page', error)
      return h
    },

    isOwner: (id) => getToken(id) !== null,

    async listGuestbook(homesteadId) {
      const { data, error } = await db.from('guestbook_entries').select('*')
        .eq('homestead_id', homesteadId).order('created_at', { ascending: false })
      if (error) fail('load the guestbook', error)
      return (data as EntryRow[]).map(toEntry)
    },

    async signGuestbook(homesteadId, author, message) {
      const check = checkEntry(author, message)
      if (!check.ok) throw new RepoError(check.error)
      const wait = COOLDOWN_MS - (Date.now() - readLastSign())
      if (wait > 0) throw new RepoError(`Easy there. You can sign again in ${Math.ceil(wait / 1000)} seconds.`)
      const { data, error } = await db.from('guestbook_entries')
        .insert({ homestead_id: homesteadId, author_name: check.author, message: check.message })
        .select().single()
      if (error) fail('sign the guestbook', error)
      writeLastSign(Date.now())
      return toEntry(data as EntryRow)
    },

    async deleteGuestbookEntry(entryId, homesteadId) {
      const token = homesteadId ? getToken(homesteadId) : null
      if (!token) throw new RepoError('Only the owner of this page can delete entries.')
      const { error } = await db.rpc('delete_guestbook_entry', { entry_id: entryId, token })
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
