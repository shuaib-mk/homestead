import { describe, expect, it } from 'vitest'
import { checkEntry, friendlyTime, toPlainText } from './guestbook'

describe('guestbook', () => {
  it('strips html', () => {
    expect(toPlainText('hi <script>alert(1)</script><b>there</b>')).toBe('hi alert(1)there')
  })
  it('validates lengths', () => {
    expect(checkEntry('a'.repeat(51), 'x').ok).toBe(false)
    expect(checkEntry('a', 'x'.repeat(501)).ok).toBe(false)
    expect(checkEntry('', 'x').ok).toBe(false)
    expect(checkEntry('a', '  ').ok).toBe(false)
    expect(checkEntry('a'.repeat(50), 'x'.repeat(500)).ok).toBe(true)
  })
  it('formats time', () => {
    const now = Date.now()
    expect(friendlyTime(new Date(now - 1000).toISOString(), now)).toBe('just now')
    expect(friendlyTime(new Date(now - 3 * 3600_000).toISOString(), now)).toBe('3 hours ago')
  })
})
