import type { Homestead } from '../types'

/** Published homesteads in the same neighbourhood as `current`, always including `current`, in a stable order. */
export function buildRing(all: Homestead[], current: Homestead): Homestead[] {
  const seen = new Set<string>()
  const ring: Homestead[] = []
  for (const h of [...all, current]) {
    if (h.neighbourhood !== current.neighbourhood) continue
    if (h.id !== current.id && !h.published) continue
    if (seen.has(h.id)) continue
    seen.add(h.id)
    ring.push(h.id === current.id ? current : h)
  }
  return ring.sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.name.localeCompare(b.name))
}

export interface RingLinks {
  prev: Homestead
  next: Homestead
  size: number
  /** True when the current page is the only one, so every link points back at itself. */
  alone: boolean
}

/** Previous and next wrap around. Never returns an empty target: with one page both are the page itself. */
export function ringLinks(ring: Homestead[], currentId: string): RingLinks {
  const i = ring.findIndex((h) => h.id === currentId)
  const at = i < 0 ? 0 : i
  const n = ring.length
  return { prev: ring[(at - 1 + n) % n], next: ring[(at + 1) % n], size: n, alone: n <= 1 }
}

/** Random other member of the ring; the page itself when it is the only one. */
export function pickRandom(ring: Homestead[], currentId: string, rng: () => number = Math.random): Homestead {
  const others = ring.filter((h) => h.id !== currentId)
  const pool = others.length > 0 ? others : ring
  return pool[Math.min(pool.length - 1, Math.floor(rng() * pool.length))]
}
