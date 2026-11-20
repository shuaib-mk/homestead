import { describe, expect, it } from 'vitest'
import { safeUrl } from './safeUrl'

describe('safeUrl', () => {
  it('accepts http and https', () => {
    expect(safeUrl('https://example.com/a')).toBe('https://example.com/a')
    expect(safeUrl(' http://example.com ')).toBe('http://example.com/')
  })
  it('rejects scripts, data urls, empty and garbage', () => {
    expect(safeUrl('javascript:alert(1)')).toBeNull()
    expect(safeUrl('data:text/html,hi')).toBeNull()
    expect(safeUrl('')).toBeNull()
    expect(safeUrl('not a url')).toBeNull()
  })
})
