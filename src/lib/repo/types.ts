import type { GuestbookEntry, Homestead, NeighbourhoodSlug } from '../../types'

export class RepoError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'RepoError'
  }
}

export interface Repo {
  readonly mode: 'demo' | 'supabase'
  listHomesteads(opts?: { publishedOnly?: boolean }): Promise<Homestead[]>
  getHomestead(neighbourhood: string, name: string): Promise<Homestead | null>
  isNameAvailable(neighbourhood: NeighbourhoodSlug, name: string): Promise<boolean>
  /** Creates a published homestead with the starter template. Throws RepoError if taken. */
  createHomestead(neighbourhood: NeighbourhoodSlug, name: string): Promise<Homestead>
  saveHomestead(h: Homestead): Promise<Homestead>
  /** True when this browser created the homestead (owner controls). */
  isOwner(homesteadId: string): boolean
  listGuestbook(homesteadId: string): Promise<GuestbookEntry[]>
  /** Validates, sanitises and stores. Throws RepoError with a plain-words message. */
  signGuestbook(homesteadId: string, author: string, message: string): Promise<GuestbookEntry>
  deleteGuestbookEntry(entryId: string, homesteadId: string): Promise<void>
  getViews(homesteadId: string): Promise<number>
  /** Increments and returns the new count. */
  incrementViews(homesteadId: string): Promise<number>
}
