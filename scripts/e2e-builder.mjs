// Drives the builder and export in headless Chromium against `vite preview`. Run after `npm run build`.
// The exported file is opened via file:// with the network blocked to prove it renders offline.
import { chromium } from 'playwright'
import { spawn } from 'node:child_process'
import assert from 'node:assert/strict'
import { mkdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
const srv = spawn('npx', ['vite', 'preview', '--port', '4175'], { stdio: 'ignore' })
await new Promise((r) => setTimeout(r, 3000))
const B = 'http://localhost:4175'
const out = resolve('docs/screenshots'); mkdirSync(out, { recursive: true })
const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true }); const p = await ctx.newPage(); const errs = []
p.on('console', (m) => m.type() === 'error' && !/ERR_(NAME|INTERNET|CONNECTION|TUNNEL)|Failed to load resource/.test(m.text()) && errs.push(m.text()))
p.on('pageerror', (e) => errs.push(String(e)))
const names = async () => p.locator('ul[aria-label="Page blocks"] > li .font-display').allTextContents()
try {
  await p.goto(B + '/new')
  await p.getByLabel('2. Choose a name').fill('builder-test'); await p.waitForTimeout(500)
  await p.getByRole('button', { name: 'Claim this address' }).click()
  await p.waitForURL('**/build/soho/builder-test', { timeout: 6000 })
  assert.equal(await p.getByTestId('publish-state').textContent(), 'Published')
  const start = await names(); assert.equal(start.length, 4)

  // add every block type
  for (const t of ['Heading', 'Text', 'Image', 'Gallery', 'Link list', 'Webring', 'Divider', 'Under construction', 'Stamp wall'])
    await p.getByRole('button', { name: `Add ${t} block`, exact: true }).click()
  assert.equal((await names()).length, 13)

  // edit each type via side panel
  const edit = async (label, nth = 0) => { await p.locator('ul[aria-label="Page blocks"] > li').filter({ hasText: label }).nth(nth).getByRole('button', { name: /^Edit /, exact: false }).first().click() }
  await edit('Heading', 0); await p.locator('aside').getByLabel('Title', { exact: true }).fill('Edited Title')
  await edit('Text', 0); await p.locator('aside').getByLabel('Text', { exact: true }).fill('Edited body para.\n\nSecond para.')
  await edit('Image'); await p.locator('aside').getByLabel('Image web address').fill('https://picsum.photos/seed/x/600/400'); await p.locator('aside').getByLabel('Alt text').fill('Seeded photo'); await p.locator('aside').getByLabel('Caption').fill('My caption')
  await p.locator('aside').getByLabel('Image web address').fill('javascript:alert(1)')
  assert.match(await p.locator('aside').textContent(), /starts with https/)
  await p.locator('aside').getByLabel('Image web address').fill('https://picsum.photos/seed/x/600/400')
  await edit('Link list'); await p.locator('aside').getByLabel('Label').first().fill('Example'); await p.getByRole('button', { name: 'Add link', exact: true }).click()
  await edit('Under construction'); await p.locator('aside').getByLabel('Message').fill('Hammering away')
  await edit('Divider'); await p.getByRole('button', { name: 'Zigzag' }).click()
  await edit('Stamp wall'); await p.getByRole('button', { name: 'Coffee', exact: true }).click()
  await edit('Gallery'); await p.getByRole('button', { name: 'Add picture', exact: true }).click()
  await edit('Hit counter'); await p.locator('aside').getByLabel('Label').fill('Visitors so far')
  await edit('Guestbook'); await p.locator('aside').getByLabel('Heading').fill('Say hi')

  // keyboard-operable reorder: move heading down then up
  await p.getByRole('button', { name: 'Move Heading block down' }).first().click(); await p.waitForTimeout(350)
  assert.equal((await names())[0], 'Text')
  await p.getByRole('button', { name: 'Move Heading block up' }).first().click(); await p.waitForTimeout(350)
  assert.equal((await names())[0], 'Heading')
  // keyboard sensor drag: focus handle, space, arrow down, space
  const handle = p.getByRole('button', { name: /^Drag to reorder Heading block/ }).first()
  await handle.focus(); await p.keyboard.press('Space'); await p.waitForTimeout(200); await p.keyboard.press('ArrowDown'); await p.waitForTimeout(250); await p.keyboard.press('Space'); await p.waitForTimeout(400)
  assert.equal((await names())[1], 'Heading', 'keyboard drag reorder')
  // pointer drag: drag the first block's handle down over its neighbours
  const order0 = await names()
  const hs = p.getByRole('button', { name: /^Drag to reorder/ }).first()
  await hs.scrollIntoViewIfNeeded(); const a = await hs.boundingBox()
  await p.mouse.move(a.x + 20, a.y + 20); await p.mouse.down()
  await p.mouse.move(a.x + 20, a.y + 60, { steps: 5 }); await p.mouse.move(a.x + 20, a.y + 190, { steps: 15 }); await p.mouse.up(); await p.waitForTimeout(500)
  const order1 = await names()
  assert.notEqual(order1[0], order0[0], 'pointer drag moved first block')

  // delete with confirm
  const before = (await names()).length
  await p.getByRole('button', { name: 'Delete Divider block' }).click(); await p.getByRole('button', { name: 'Keep it' }).click()
  assert.equal((await names()).length, before)
  await p.getByRole('button', { name: 'Delete Divider block' }).click(); await p.getByRole('button', { name: 'Delete block' }).click()
  assert.equal((await names()).length, before - 1)

  // theme
  await p.getByRole('tab', { name: 'Theme' }).click()
  await p.getByLabel('Page title').fill('Builder Test Title')
  await p.getByRole('button', { name: 'Starfield' }).click()
  await p.getByRole('button', { name: /Zine/ }).click()
  await p.getByRole('button', { name: /^Third accent/ }).click()

  // autosave
  await p.waitForTimeout(1200)
  assert.match(await p.getByRole('status').filter({ hasText: /Saved/ }).first().textContent(), /Saved just now/)
  await p.screenshot({ path: `${out}/builder-1440.png` })

  // sign guestbook in preview as owner then delete (owner deletion)
  await p.getByRole('region',{name:'Live preview'}).getByLabel('Your name').fill('Visitor'); await p.getByRole('region',{name:'Live preview'}).getByLabel('Message').fill('Hello from preview')
  await p.getByRole('button', { name: 'Sign the guestbook' }).click(); await p.waitForTimeout(400)
  await p.getByRole('button', { name: /Delete entry from Visitor/ }).click(); await p.getByRole('button', { name: 'Yes, delete' }).click(); await p.waitForTimeout(300)
  assert.equal(await p.getByRole('button', { name: /Delete entry from Visitor/ }).count(), 0)
  await p.evaluate(() => localStorage.removeItem('homestead:v1:lastSign')); await p.reload(); await p.waitForTimeout(800)
  await p.getByRole('region',{name:'Live preview'}).getByLabel('Your name').fill('Visitor2'); await p.getByRole('region',{name:'Live preview'}).getByLabel('Message').fill('Keep me')
  await p.getByRole('button', { name: 'Sign the guestbook' }).click(); await p.waitForTimeout(400)

  // preview matches public: compare normalised text content of the page
  const grab = (pg) => pg.locator('.hs-page').evaluate((el) => el.innerText.replace(/\s+/g, ' ').replace(/\d{6}/, '').replace('Thanks for signing! ', '').trim())
  const previewText = await grab(p)
  const norm = (st) => st.split(';').map((x) => x.trim()).filter(Boolean).sort().join(';')
  const previewStyle = norm(await p.locator('.hs-page').getAttribute('style'))
  await p.reload(); await p.waitForTimeout(800) // persisted after reload
  assert.match(await p.locator('.hs-page').innerText(), /edited title/i)
  await p.goto(B + '/soho/builder-test'); await p.waitForTimeout(1000)
  assert.equal(norm(await p.locator('.hs-page').getAttribute('style')), previewStyle, 'theme identical on public page')
  assert.equal((await grab(p)).replace('Edit this page', '').replace(/\s+/g, ' ').trim().replace(/ ?Previous.*$/, ''), previewText.replace(/ ?Previous.*$/, '').trim(), 'text identical')
  assert.match(await p.title(), /Builder Test Title/)
  await p.screenshot({ path: `${out}/published-1440.png`, fullPage: true })

  // unpublish -> 404, republish
  await p.goto(B + '/build/soho/builder-test'); await p.waitForTimeout(500)
  await p.getByRole('button', { name: 'Unpublish' }).click(); await p.waitForTimeout(300)
  assert.equal(await p.getByTestId('publish-state').textContent(), 'Draft')
  await p.goto(B + '/soho/builder-test'); assert.match(await p.locator('h1').textContent(), /hasn't been built yet/)
  await p.goto(B + '/build/soho/builder-test'); await p.getByRole('button', { name: 'Publish' }).click(); await p.waitForTimeout(300)
  assert.equal(await p.getByTestId('publish-state').textContent(), 'Published')
  await p.getByRole('link', { name: 'View page' }).click(); await p.waitForURL('**/soho/builder-test')

  // non-owner cannot edit
  const other = await b.newContext(); const op = await other.newPage()
  await op.goto(B + '/build/soho/lenses-by-mara'); assert.match(await op.locator('h1').textContent(), /belongs to someone else/); await other.close()

  // export
  await p.goto(B + '/build/soho/builder-test'); await p.waitForTimeout(600)
  const [dl] = await Promise.all([p.waitForEvent('download'), p.getByRole('button', { name: 'Export my page' }).click()])
  assert.equal(dl.suggestedFilename(), 'builder-test-homestead.html')
  const file = resolve('docs/exported-sample.html'); await dl.saveAs(file)
  const html = readFileSync(file, 'utf8')
  assert.ok(!/<script/i.test(html) && !/<link[^>]+stylesheet/i.test(html), 'no scripts or external css')
  // offline: new context, offline, file://
  const off = await b.newContext({ viewport: { width: 1440, height: 900 }, offline: true }); const op2 = await off.newPage(); const oerrs = []
  op2.on('pageerror', (e) => oerrs.push(String(e)))
  await op2.goto('file://' + file); await op2.waitForTimeout(500)
  assert.equal(await op2.locator('h1').count(), 1)
  assert.match(await op2.locator('h1').textContent(), /edited title/i)
  assert.match(await op2.locator('body').innerText(), /hammering away/i)
  assert.match(await op2.locator('body').innerText(), /keep me/i)
  assert.equal(await op2.evaluate(() => getComputedStyle(document.querySelector('.hs-card')).borderTopWidth), '3px')
  assert.ok(await op2.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1))
  await op2.screenshot({ path: `${out}/export-offline-1440.png`, fullPage: true })
  await op2.setViewportSize({ width: 390, height: 800 })
  assert.ok(await op2.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'export overflow at 390')
  await op2.screenshot({ path: `${out}/export-offline-390.png`, fullPage: true })
  assert.deepEqual(oerrs, [])

  // mobile builder
  await p.setViewportSize({ width: 390, height: 800 }); await p.goto(B + '/build/soho/builder-test'); await p.waitForTimeout(600)
  assert.ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'builder overflow at 390')
  for (const tab of ['Edit', 'Theme', 'Preview']) { await p.getByRole('tab', { name: tab, exact: true }).click(); await p.waitForTimeout(150); assert.ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'overflow ' + tab) }
  const small = await p.evaluate(() => [...document.querySelectorAll('a,button,input,select,textarea')].filter((e) => { const r = e.getBoundingClientRect(); return r.width && (r.height < 43.5 || r.width < 43.5) && !e.closest('.sr-only') && !e.closest('.hidden') && getComputedStyle(e).display !== 'none' }).map((e) => (e.getAttribute('aria-label') || e.textContent).trim().slice(0, 30)))
  if (small.length) console.log('small targets', small)
  await p.getByRole('tab', { name: 'Blocks' }).click(); await p.screenshot({ path: `${out}/builder-390.png` })
  console.log('OK')
} catch (e) { console.error('FAIL', e.message); errs.push('assert') }
console.log('console errors:', errs); await b.close(); srv.kill(); process.exit(errs.length ? 1 : 0)
