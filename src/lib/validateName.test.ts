import { describe, expect, it } from 'vitest'
import { RESERVED_NAMES, slugify, validateName } from './validateName'

describe('validateName', () => {
  it('accepts valid names', () => {
    for (const n of ['abc', 'adam', 'my-page-2', 'a1b', 'x'.repeat(24)]) expect(validateName(n).ok).toBe(true)
  })
  it('rejects empty, short and long', () => {
    expect(validateName('').ok).toBe(false)
    expect(validateName('ab').ok).toBe(false)
    expect(validateName('x'.repeat(25)).ok).toBe(false)
  })
  it('rejects uppercase and symbols', () => {
    expect(validateName('Adam').ok).toBe(false)
    expect(validateName('my page').ok).toBe(false)
    expect(validateName('a_b_c').ok).toBe(false)
    expect(validateName('café').ok).toBe(false)
  })
  it('rejects edge hyphens', () => {
    expect(validateName('-abc').ok).toBe(false)
    expect(validateName('abc-').ok).toBe(false)
  })
  it('blocks every reserved name', () => {
    for (const r of RESERVED_NAMES) expect(validateName(r).ok).toBe(false)
    expect(RESERVED_NAMES).toEqual(['admin', 'root', 'support', 'homestead', 'explore', 'new', 'build', 'api', 'www'])
  })
  it('gives plain-words errors', () => {
    const r = validateName('ab')
    expect(!r.ok && r.error).toMatch(/at least 3/)
  })
})

describe('slugify', () => {
  it('cleans input', () => {
    expect(slugify('  Hello World! ')).toBe('hello-world')
    expect(slugify('--a--b--')).toBe('a-b')
  })
})
