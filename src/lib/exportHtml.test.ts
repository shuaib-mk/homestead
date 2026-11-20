import { describe, expect, it } from 'vitest'
import { getNeighbourhood } from '../data/neighbourhoods'
import type { Block, GuestbookEntry, Homestead } from '../types'
import { esc, exportHtml, styleToCss } from './exportHtml'

const hood = getNeighbourhood('soho')!
const blocks: Block[] = [
  { id: 'b1', type: 'header', title: 'Hi <b>there</b>', subtitle: 'Sub & more' },
  { id: 'b2', type: 'text', body: 'First para\n\nSecond "para"' },
  { id: 'b3', type: 'image', url: 'https://example.com/a.jpg', alt: 'A photo', caption: 'Cap' },
  { id: 'b4', type: 'gallery', images: [{ url: 'https://example.com/1.jpg', alt: 'one' }, { url: 'javascript:alert(1)', alt: 'bad' }] },
  { id: 'b5', type: 'linklist', heading: 'Links', links: [{ label: 'Good', url: 'https://example.com' }, { label: 'Evil', url: 'javascript:alert(1)' }] },
  { id: 'b6', type: 'guestbook', heading: 'Sign me' },
  { id: 'b7', type: 'counter', label: 'Visitors' },
  { id: 'b8', type: 'webring' },
  { id: 'b9', type: 'divider', style: 'zigzag' },
  { id: 'b10', type: 'construction', message: 'Hammering' },
  { id: 'b11', type: 'stamps', stamps: ['house', 'coffee', 'nope'] },
]
const page: Homestead = {
  id: 'h1', neighbourhood: 'soho', name: 'tester', title: 'Tester <page>', published: true, createdAt: '2025-01-01T00:00:00Z',
  theme: { pattern: 'grid', fontPair: 'typewriter', accent: 1 }, blocks,
}
const other: Homestead = { ...page, id: 'h2', name: 'other', title: 'Other', createdAt: '2025-02-01T00:00:00Z' }
const entries: GuestbookEntry[] = [{ id: 'e1', homesteadId: 'h1', author: '<i>Ann</i>', message: 'Lovely <script>x</script>', createdAt: '2025-03-04T10:00:00Z' }]
const html = exportHtml({ homestead: page, hood, guestbook: entries, views: 1234, ring: [page, other], css: '.hs-card{border:3px solid}', origin: 'https://homestead.test' })

describe('exportHtml', () => {
  it('is one standalone document with inline css', () => {
    expect(html.startsWith('<!doctype html>')).toBe(true)
    expect(html).toContain('.hs-card{border:3px solid}')
    expect(html).not.toMatch(/<link[^>]+stylesheet/i)
    expect(html).not.toMatch(/<script/i)
    expect(html).not.toMatch(/\son[a-z]+=/i)
  })
  it('contains every block type', () => {
    for (const s of ['Sub &amp; more', 'First para', 'Second &quot;para&quot;', 'https://example.com/a.jpg', 'alt="A photo"', 'Cap', 'https://example.com/1.jpg',
      'Links', 'https://example.com', 'Sign me', 'Visitors', 'SoHo webring', 'hs-div-zigzag', 'Hammering', 'Home sweet home', 'Coffee']) {
      expect(html, s).toContain(s)
    }
  })
  it('renders exactly one h1, from the first header', () => {
    expect(html.match(/<h1[ >]/g)).toHaveLength(1)
  })
  it('escapes user content', () => {
    expect(html).toContain('Hi &lt;b&gt;there&lt;/b&gt;')
    expect(html).toContain('&lt;i&gt;Ann&lt;/i&gt;')
    expect(html).toContain('Lovely &lt;script&gt;x&lt;/script&gt;')
    expect(html).not.toContain('<b>there')
  })
  it('drops non-http urls', () => {
    expect(html).not.toContain('javascript:')
  })
  it('shows the counter value and guestbook date', () => {
    expect(html).toContain('aria-label="1,234"')
    expect(html).toContain('2025-03-04')
  })
  it('links the webring to live neighbours', () => {
    expect(html).toContain('https://homestead.test/soho/other')
  })
  it('applies the theme as css variables', () => {
    expect(html).toContain(`--hs-accent:${hood.palette[1]}`)
    expect(html).toContain('Courier Prime')
  })
  it('handles an empty page and a style-tag breakout in css', () => {
    const out = exportHtml({ homestead: { ...page, blocks: [] }, hood, guestbook: [], views: 0, ring: [], css: 'a{}</style><p>x</p>', origin: '' })
    expect(out).toContain('This page has no blocks yet.')
    expect(out).toContain('<h1 class="sr-only">')
    expect(out).not.toContain('</style><p>')
    expect(out.match(/<\/style>/g)).toHaveLength(1)
  })
})

describe('helpers', () => {
  it('esc handles quotes', () => expect(esc(`<a href="x">'&`)).toBe('&lt;a href=&quot;x&quot;&gt;&#39;&amp;'))
  it('styleToCss kebab-cases but keeps custom properties', () => {
    expect(styleToCss({ backgroundColor: 'red', '--hs-main': '#fff', skip: undefined })).toBe('background-color:red;--hs-main:#fff')
  })
})
