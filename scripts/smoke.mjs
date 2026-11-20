// Boots the built app and checks key routes load with zero console errors. Run after `npm run build`.
import { chromium } from 'playwright'
import { spawn } from 'node:child_process'
const srv = spawn('npx', ['vite', 'preview', '--port', '4173'], { stdio: 'ignore' })
await new Promise((r) => setTimeout(r, 3000))
const b = await chromium.launch(); const p = await b.newPage(); const errs = []
p.on('console', (m) => m.type() === 'error' && !/ERR_(NAME|INTERNET|CONNECTION|TUNNEL)|Failed to load resource/.test(m.text()) && errs.push(m.text()))
p.on('pageerror', (e) => errs.push(String(e)))
for (const u of ['/', '/soho/lenses-by-mara', '/soho/nope', '/zzz/yyy']) {
  await p.goto('http://localhost:4173' + u); await p.waitForTimeout(500)
  console.log(u, '|', await p.title(), '|', await p.locator('h1').first().textContent())
}
console.log('console errors:', errs); await b.close(); srv.kill(); process.exit(errs.length ? 1 : 0)
