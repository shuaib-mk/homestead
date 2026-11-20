import { describe, expect, it } from 'vitest'
import type { Homestead } from '../types'
import { buildRing, pickRandom, ringLinks } from './webring'

const mk = (id: string, name: string, over: Partial<Homestead> = {}): Homestead => ({
  id, name, title: name, neighbourhood: 'soho', published: true,
  theme: { pattern: 'plain', fontPair: 'press', accent: 0 }, blocks: [],
  createdAt: `2024-01-0${id}T00:00:00Z`, ...over,
})

describe('webring', () => {
  const a = mk('1', 'a'), b = mk('2', 'b'), c = mk('3', 'c')
  it('only includes published pages from the same neighbourhood, plus the current page', () => {
    const other = mk('4', 'x', { neighbourhood: 'heartland' })
    const draft = mk('5', 'd', { published: false })
    expect(buildRing([a, b, c, other, draft], b).map((h) => h.name)).toEqual(['a', 'b', 'c'])
    expect(buildRing([], b).map((h) => h.name)).toEqual(['b'])
  })
  it('wraps previous and next in a multi-page ring', () => {
    const ring = buildRing([a, b, c], a)
    expect(ringLinks(ring, '1').prev.name).toBe('c')
    expect(ringLinks(ring, '1').next.name).toBe('b')
    expect(ringLinks(ring, '3').next.name).toBe('a')
    expect(ringLinks(ring, '1').alone).toBe(false)
  })
  it('links a lone page to itself and says so', () => {
    const ring = buildRing([a], a)
    const l = ringLinks(ring, '1')
    expect(l.alone).toBe(true)
    expect(l.prev.id).toBe('1')
    expect(l.next.id).toBe('1')
    expect(pickRandom(ring, '1').id).toBe('1')
  })
  it('random never picks the current page when others exist', () => {
    const ring = buildRing([a, b, c], a)
    for (const r of [0, 0.3, 0.5, 0.99, 1]) expect(pickRandom(ring, '1', () => r).id).not.toBe('1')
  })
  it('two-page ring points both ways at the neighbour', () => {
    const ring = buildRing([a, b], a)
    const l = ringLinks(ring, '1')
    expect(l.prev.id).toBe('2')
    expect(l.next.id).toBe('2')
  })
})
