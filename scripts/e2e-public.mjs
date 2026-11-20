// Drives the public flows in headless Chromium against `vite preview`. Run after `npm run build`.
import { chromium } from 'playwright'
import { spawn } from 'node:child_process'
import assert from 'node:assert/strict'
const srv = spawn('npx', ['vite', 'preview', '--port', '4174'], { stdio: 'ignore' })
await new Promise((r) => setTimeout(r, 3000))
const B = 'http://localhost:4174'
const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); const p = await ctx.newPage(); const errs = []
p.on('console', (m) => m.type() === 'error' && !/ERR_(NAME|INTERNET|CONNECTION|TUNNEL)|Failed to load resource/.test(m.text()) && errs.push(m.text()))
p.on('pageerror', (e) => errs.push(String(e)))
try {
  await p.goto(B + '/'); assert.match(await p.title(), /Homestead/)
  assert.equal(await p.locator('a[href^="/explore?hood="]').count(), 6)
  // Claim
  await p.getByRole('link', { name: /Claim your address/ }).first().click()
  await p.getByLabel('2. Choose a name').fill('Bad Name'); await p.waitForTimeout(300)
  assert.match(await p.locator('#name-help').textContent(), /lowercase/i)
  await p.getByLabel('2. Choose a name').fill('lenses-by-mara'); await p.waitForTimeout(500)
  assert.match(await p.locator('#name-help').textContent(), /taken in SoHo/)
  await p.getByLabel('2. Choose a name').fill('tester-one'); await p.waitForTimeout(500)
  assert.match(await p.locator('#name-help').textContent(), /free/)
  await p.getByRole('button', { name: 'Claim this address' }).click()
  await p.waitForURL('**/build/soho/tester-one', { timeout: 6000 })
  // Public page
  await p.goto(B + '/soho/tester-one'); await p.waitForTimeout(800)
  assert.match(await p.title(), /tester-one's page · SoHo · Homestead/)
  assert.equal(await p.locator('h1').count(), 1)
  assert.equal(await p.getByRole('button', { name: /Delete entry/ }).count(), 0)
  // Counter increments per view
  await p.goto(B + '/soho/lenses-by-mara'); await p.waitForTimeout(800)
  const c1 = await p.locator('p[aria-label]').filter({ has: p.locator('.hs-digit') }).getAttribute('aria-label')
  await p.reload(); await p.waitForTimeout(800)
  const c2 = await p.locator('p[aria-label]').filter({ has: p.locator('.hs-digit') }).getAttribute('aria-label')
  assert.equal(Number(c2.replace(/,/g, '')), Number(c1.replace(/,/g, '')) + 1)
  // Guestbook: escape + sign + cooldown
  await p.getByLabel('Your name').fill('Tester'); await p.getByLabel('Message').fill('<script>alert(1)</script>hello <b>there</b>')
  await p.getByRole('button', { name: 'Sign the guestbook' }).click(); await p.waitForTimeout(400)
  const txt = await p.locator('section ul li').first().textContent(); assert.match(txt, /hello there/); assert.ok(!/<script|<b>/.test(txt))
  await p.getByLabel('Message').fill('again'); await p.getByRole('button', { name: 'Sign the guestbook' }).click(); await p.waitForTimeout(300)
  assert.match(await p.locator('form [role=status]').textContent(), /sign again in/)
  // Owner delete on own page
  await p.goto(B + '/soho/tester-one'); await p.waitForTimeout(500)
  await p.getByLabel('Your name').fill('Me'); await p.getByLabel('Message').fill('x')
  await p.evaluate(() => localStorage.removeItem('homestead:v1:lastSign'))
  await p.getByRole('button', { name: 'Sign the guestbook' }).click(); await p.waitForTimeout(300)
  await p.getByRole('button', { name: /Delete entry/ }).click(); await p.getByRole('button', { name: 'Yes, delete' }).click(); await p.waitForTimeout(300)
  assert.match(await p.locator('text=No one has signed yet').textContent(), /first/)
  // Webring in multi-page ring + explore
  await p.goto(B + '/heartland/nana-june'); await p.waitForTimeout(500)
  await p.goto(B + '/explore'); await p.getByRole('button', { name: 'Surprise me' }).click()
  assert.ok(await p.getByText('Travelling...').isVisible()); await p.waitForURL(/\/[a-z]+\/[a-z0-9-]+$/, { timeout: 4000 })
  await p.goto(B + '/explore?hood=soho'); assert.ok(await p.getByText('Newest in SoHo').isVisible())
  // 404 + mobile overflow
  await p.goto(B + '/soho/nope'); assert.match(await p.locator('h1').textContent(), /hasn't been built yet/)
  await p.setViewportSize({ width: 390, height: 800 })
  for (const u of ['/', '/explore', '/new', '/soho/lenses-by-mara', '/sunsetstrip/the-static-hearts']) {
    await p.goto(B + u); await p.waitForTimeout(500)
    assert.ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'overflow at ' + u)
    const small = await p.evaluate(() => [...document.querySelectorAll('a,button')].filter((e) => { const r = e.getBoundingClientRect(); return r.width && (r.height < 43.5) && !e.closest('.sr-only') }).map((e) => e.textContent.trim().slice(0, 20)))
    if (small.length) console.log('small targets', u, small)
  }
  console.log('OK')
} catch (e) { console.error('FAIL', e.message); errs.push('assert') }
console.log('console errors:', errs); await b.close(); srv.kill(); process.exit(errs.length ? 1 : 0)
