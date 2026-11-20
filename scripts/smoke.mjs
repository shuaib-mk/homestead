// Boots the built app and checks key routes load with zero console errors. Run after `npm run build`.
import { chromium } from 'playwright'
import { spawn } from 'node:child_process'
const srv = spawn('npx', ['vite', 'preview', '--port', '4173'], { stdio: 'ignore' })
await new Promise((r) => setTimeout(r, 3000))
const b = await chromium.launch(); const p = await b.newPage(); const errs = []
p.on('console', (m) => m.type() === 'error' && !/ERR_(NAME|INTERNET|CONNECTION|TUNNEL)|Failed to load resource/.test(m.text()) && errs.push(m.text()))
await p.addInitScript(() => document.addEventListener('securitypolicyviolation', (e) => console.error('CSP violation: ' + e.violatedDirective + ' ' + e.blockedURI)))
p.on('pageerror', (e) => errs.push(String(e)))
const first = await p.goto('http://localhost:4173/')
const h = first.headers()
for (const k of ['content-security-policy', 'x-content-type-options', 'x-frame-options', 'referrer-policy', 'permissions-policy']) if (!h[k]) errs.push('missing header ' + k)
console.log('csp:', h['content-security-policy'])
for (const u of ['/', '/soho/lenses-by-mara', '/soho/nope', '/zzz/yyy']) {
  await p.goto('http://localhost:4173' + u); await p.waitForTimeout(500)
  console.log(u, '|', await p.title(), '|', await p.locator('h1').first().textContent())
}
for (const u of ['/sunsetstrip/the-static-hearts', '/enchantedforest/fern-and-flame']) {
  await p.goto('http://localhost:4173' + u); await p.waitForTimeout(400)
  const hrefs = await p.locator('main a[target=_blank]').evaluateAll((as) => as.map((a) => a.href))
  console.log(u, hrefs)
  for (const href of hrefs) { if (/example\.com/.test(href)) errs.push('placeholder link ' + href); else if (href.includes('homesteadd.vercel.app')) { const r = await p.request.get(href.replace('https://homesteadd.vercel.app', 'http://localhost:4173')); if (r.status() !== 200) errs.push('bad link ' + href) } }
}
// XSS: a hostile guestbook entry must render as text and never execute
await p.goto('http://localhost:4173/soho/lenses-by-mara'); await p.waitForTimeout(400)
let fired = false; await p.exposeFunction('__xss', () => { fired = true })
// the well-formed tags are stripped on input; the unterminated tag survives as text and must be escaped on render
const payload = 'hello <img src=x onerror="window.__xss()"> <script>window.__xss()</script> <img src=x onerror="window.__xss()"'
await p.getByLabel('Your name').first().fill('<b>evil</b>'); await p.getByLabel('Message').first().fill(payload)
await p.getByRole('button', { name: /sign/i }).first().click(); await p.waitForTimeout(800)
const injected = await p.locator('main img[src="x"], main script, main b').count()
console.log('xss payload rendered as text:', (await p.locator('main').innerText()).includes('<img src=x onerror'), '| injected elements:', injected, '| executed:', fired)
if (fired || injected || !(await p.locator('main').innerText()).includes('<img src=x onerror'))  errs.push('XSS check failed')
console.log('console errors:', errs); await b.close(); srv.kill(); process.exit(errs.length ? 1 : 0)
