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
  it('rejects every scheme bypass tried', () => {
    for (const bad of [
      'JaVaScRiPt:alert(1)', 'JAVASCRIPT:alert(1)', '  javascript:alert(1)', '\n\tjavascript:alert(1)', '\u0001javascript:alert(1)',
      '\u0000javascript:alert(1)', 'java\tscript:alert(1)', 'java\nscript:alert(1)', 'javascript&colon;alert(1)', 'javascript://%0aalert(1)',
      'vbscript:msgbox(1)', 'VBScript:msgbox(1)', 'data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==', 'DATA:text/html,x',
      '//evil.example/x', '///evil.example', '\\\\evil.example', '/relative/path', 'file:///etc/passwd', 'blob:https://a.b/1',
      'ftp://a.b/c', 'mailto:a@b.c', 'about:blank', 'https', 'http:', '\u00a0javascript:alert(1)',
    ]) {
      expect(safeUrl(bad), JSON.stringify(bad)).toBeNull()
    }
  })
  it('only ever returns http or https hrefs, and encodes quotes', () => {
    const out = safeUrl('https://a.b/x"onmouseover="alert(1)')!
    expect(out.startsWith('https://')).toBe(true)
    expect(out).not.toContain('"')
    expect(safeUrl('HTTPS://A.B/')).toBe('https://a.b/')
  })
})
