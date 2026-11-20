// End-to-end QA of the core flow in demo mode (no backend), plus screenshots. Run after `npm run build`.
// Flow: land, claim, build (add/reorder/edit/delete/theme), publish, view, sign guestbook, counter, webring, export, open export.
import { chromium } from 'playwright'
import { spawn } from 'node:child_process'
import assert from 'node:assert/strict'
import { mkdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
const srv = spawn('npx', ['vite', 'preview', '--port', '4176'], { stdio: 'ignore' })
await new Promise((r) => setTimeout(r, 3000))
const B = 'http://localhost:4176'
const out = resolve('docs/screenshots'); mkdirSync(out, { recursive: true })
const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true }); const p = await ctx.newPage(); const errs = []
p.on('console', (m) => m.type() === 'error' && !/ERR_(NAME|INTERNET|CONNECTION|TUNNEL)|Failed to load resource/.test(m.text()) && errs.push(m.text()))
p.on('pageerror', (e) => errs.push(String(e)))
const noOverflow = (pg) => pg.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)
const digits = async () => Number((await p.locator('p[aria-label]').filter({ has: p.locator('.hs-digit') }).first().getAttribute('aria-label')).replace(/\D/g, ''))
const names = async () => p.locator('ul[aria-label="Page blocks"] > li .font-display').allTextContents()
try {
  // 1. land
  await p.goto(B + '/'); await p.waitForTimeout(900)
  assert.match(await p.title(), /Homestead/)
  assert.ok(await noOverflow(p))
  await p.screenshot({ path: `${out}/landing-1440.png`, fullPage: true })
  await p.setViewportSize({ width: 390, height: 800 }); await p.waitForTimeout(300)
  assert.ok(await noOverflow(p), 'landing overflow at 390')
  await p.screenshot({ path: `${out}/landing-390.png`, fullPage: true })
  await p.setViewportSize({ width: 1440, height: 900 })

  // 2. claim in MotorCity (no seeded pages: single-page webring case)
  await p.getByRole('link', { name: /Claim your address/ }).first().click()
  await p.getByText('MotorCity', { exact: true }).click()
  await p.getByLabel('2. Choose a name').fill('admin'); await p.waitForTimeout(400)
  assert.match(await p.locator('#name-help').textContent(), /reserved|can't|not available/i)
  await p.getByLabel('2. Choose a name').fill('-bad-'); await p.waitForTimeout(400)
  assert.ok(/hyphen/i.test(await p.locator('#name-help').textContent()))
  await p.getByLabel('2. Choose a name').fill('qa-garage'); await p.waitForTimeout(500)
  await p.getByRole('button', { name: 'Claim this address' }).click()
  await p.waitForURL('**/build/motorcity/qa-garage', { timeout: 6000 })

  // 3. build
  assert.equal(await p.getByTestId('publish-state').textContent(), 'Published')
  const n0 = (await names()).length
  await p.getByRole('button', { name: 'Add Heading block', exact: true }).click()
  await p.getByRole('button', { name: 'Add Divider block', exact: true }).click()
  await p.getByRole('button', { name: 'Add Webring block', exact: true }).click()
  assert.equal((await names()).length, n0 + 3)
  await p.locator('ul[aria-label="Page blocks"] > li').filter({ hasText: 'Heading' }).last().getByRole('button', { name: /^Edit /, exact: false }).first().click()
  await p.locator('aside').getByLabel('Title', { exact: true }).fill('QA Garage Rocks')
  await p.getByRole('button', { name: 'Move Heading block down' }).last().click().catch(() => {})
  await p.waitForTimeout(300)
  const before = (await names()).length
  await p.getByRole('button', { name: 'Delete Divider block' }).click(); await p.getByRole('button', { name: 'Delete block' }).click()
  assert.equal((await names()).length, before - 1)
  await p.getByRole('tab', { name: 'Theme' }).click(); await p.getByRole('button', { name: 'Clouds' }).click()
  await p.getByRole('button', { name: /Typewriter|Zine/ }).first().click()
  await p.waitForTimeout(1200)
  await p.getByRole('tab', { name: 'Blocks' }).click().catch(() => {})
  await p.screenshot({ path: `${out}/builder-1440.png` })

  // 4. publish (already published by default; toggle to prove state)
  await p.getByRole('button', { name: 'Unpublish' }).click(); await p.waitForTimeout(300)
  assert.equal(await p.getByTestId('publish-state').textContent(), 'Draft')
  await p.getByRole('button', { name: 'Publish' }).click(); await p.waitForTimeout(300)
  assert.equal(await p.getByTestId('publish-state').textContent(), 'Published')

  // 5. view public page, counter, guestbook
  await p.getByRole('link', { name: 'View page' }).click(); await p.waitForURL('**/motorcity/qa-garage'); await p.waitForTimeout(900)
  assert.match(await p.title(), /qa-garage's page · MotorCity · Homestead|QA Garage/i)
  const c1 = await digits()
  await p.getByLabel('Your name').fill('Visitor'); await p.getByLabel('Message').fill('Great garage!')
  await p.getByRole('button', { name: 'Sign the guestbook' }).click(); await p.waitForTimeout(500)
  assert.match(await p.locator('section ul li').first().textContent(), /Great garage/)
  await p.reload(); await p.waitForTimeout(900)
  assert.equal(await digits(), c1 + 1, 'counter ticks on reload')
  assert.match(await p.locator('body').innerText(), /Great garage/)
  // single-page webring
  assert.match(await p.locator('nav[aria-label$="webring"]').innerText(), /only homestead/i)
  await p.screenshot({ path: `${out}/published-1440.png`, fullPage: true })

  // 6. webring hop in a multi-page ring
  await p.goto(B + '/new'); await p.getByText('SoHo', { exact: true }).click()
  await p.getByLabel('2. Choose a name').fill('qa-second'); await p.waitForTimeout(500)
  await p.getByRole('button', { name: 'Claim this address' }).click(); await p.waitForURL('**/build/soho/qa-second', { timeout: 6000 })
  await p.goto(B + '/soho/lenses-by-mara'); await p.waitForTimeout(900)
  await p.getByRole('link', { name: /Next/ }).first().click(); await p.waitForTimeout(500)
  assert.ok(!/lenses-by-mara$/.test(p.url()), 'hopped away: ' + p.url())
  await p.goto(B + '/soho/lenses-by-mara'); await p.waitForTimeout(700)
  await p.getByRole('button', { name: /Random/ }).click(); await p.waitForTimeout(500)

  // 7. export + open
  await p.goto(B + '/build/motorcity/qa-garage'); await p.waitForTimeout(700)
  const [dl] = await Promise.all([p.waitForEvent('download'), p.getByRole('button', { name: 'Export my page' }).click()])
  const file = resolve('docs/exported-sample.html'); await dl.saveAs(file)
  const html = readFileSync(file, 'utf8'); assert.ok(!/<script/i.test(html))
  const off = await b.newContext({ viewport: { width: 1440, height: 900 }, offline: true }); const op = await off.newPage(); const oerr = []
  op.on('pageerror', (e) => oerr.push(String(e)))
  await op.goto('file://' + file); await op.waitForTimeout(400)
  assert.match(await op.locator('body').innerText(), /qa garage rocks/i)
  assert.match(await op.locator('body').innerText(), /great garage/i)
  assert.deepEqual(oerr, []); await off.close()

  // 8. mobile screenshots
  await p.setViewportSize({ width: 390, height: 800 })
  await p.goto(B + '/build/motorcity/qa-garage'); await p.waitForTimeout(700)
  assert.ok(await noOverflow(p), 'builder overflow 390')
  await p.screenshot({ path: `${out}/builder-390.png` })
  await p.goto(B + '/motorcity/qa-garage'); await p.waitForTimeout(1200)
  assert.ok(await noOverflow(p), 'published overflow 390')
  await p.screenshot({ path: `${out}/published-390.png`, fullPage: true })
  console.log('OK')
} catch (e) { console.error('FAIL', e.message); errs.push('assert') }
console.log('console errors:', errs); await b.close(); srv.kill(); process.exit(errs.length ? 1 : 0)
