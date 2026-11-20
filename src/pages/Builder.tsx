import { Download, Eye, EyeOff, Globe, Lock, Palette, LayoutList, Pencil, ExternalLink } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import HomesteadView from '../components/blocks/HomesteadView'
import BlockEditor from '../components/builder/BlockEditor'
import BlockList from '../components/builder/BlockList'
import Palette_ from '../components/builder/Palette'
import SaveStatus, { type SaveState } from '../components/builder/SaveStatus'
import ThemePanel from '../components/builder/ThemePanel'
import { getNeighbourhood } from '../data/neighbourhoods'
import { repo } from '../lib/repo'
import { newBlock } from '../lib/starter'
import { useMeta } from '../lib/useMeta'
import { buildRing } from '../lib/webring'
import type { Block, BlockType, Homestead } from '../types'
import NotFound from './NotFound'

type View = 'blocks' | 'block' | 'theme' | 'preview'
const TABS: { id: View; label: string; Icon: typeof Eye }[] = [
  { id: 'blocks', label: 'Blocks', Icon: LayoutList },
  { id: 'block', label: 'Edit', Icon: Pencil },
  { id: 'theme', label: 'Theme', Icon: Palette },
  { id: 'preview', label: 'Preview', Icon: Eye },
]

export default function Builder() {
  const { neighbourhood = '', name = '' } = useParams()
  const hood = getNeighbourhood(neighbourhood)
  const [state, setState] = useState<'loading' | 'missing' | 'forbidden' | 'ready'>('loading')
  const [h, setH] = useState<Homestead | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [view, setView] = useState<View>('blocks')
  const [save, setSave] = useState<SaveState>({ kind: 'idle' })
  const [views, setViews] = useState<number | null>(null)
  const [exportMsg, setExportMsg] = useState('')
  const [exporting, setExporting] = useState(false)
  const latest = useRef<Homestead | null>(null)
  const dirty = useRef(false)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useMeta(`Building ${name} · Homestead`, 'Build your homestead page with blocks, a theme and a live preview.')

  useEffect(() => {
    let live = true
    setState('loading')
    if (!hood) { setState('missing'); return }
    repo.getHomestead(neighbourhood, name).then(async (found) => {
      if (!live) return
      if (!found) { setState('missing'); return }
      if (!repo.isOwner(found.id)) { setH(found); setState('forbidden'); return }
      latest.current = found
      setH(found); setSelectedId(found.blocks[0]?.id ?? null); setState('ready')
      setViews(await repo.getViews(found.id).catch(() => 0))
    }).catch(() => live && setState('missing'))
    return () => { live = false }
  }, [neighbourhood, name, hood])

  const flush = useCallback(async () => {
    clearTimeout(timer.current)
    if (!dirty.current || !latest.current) return
    dirty.current = false
    setSave({ kind: 'saving' })
    try {
      await repo.saveHomestead(latest.current)
      if (!dirty.current) setSave({ kind: 'saved', at: Date.now() })
    } catch {
      dirty.current = true
      setSave({ kind: 'error', message: 'Could not save your changes.' })
    }
  }, [])

  const change = useCallback((next: Homestead, immediate = false) => {
    latest.current = next
    dirty.current = true
    setH(next)
    setSave({ kind: 'saving' })
    clearTimeout(timer.current)
    if (immediate) void flush()
    else timer.current = setTimeout(() => void flush(), 600)
  }, [flush])

  // Save anything pending when leaving the page or closing the tab.
  useEffect(() => {
    const onHide = () => { void flush() }
    window.addEventListener('beforeunload', onHide)
    return () => { window.removeEventListener('beforeunload', onHide); void flush() }
  }, [flush])

  if (state === 'loading') {
    return (
      <div className="mx-auto grid max-w-3xl gap-4 px-4 py-10" role="status" aria-label="Loading builder">
        <div className="skeleton h-16" /><div className="skeleton h-64" />
      </div>
    )
  }
  if (state === 'missing' || !h || !hood) return <NotFound address={`/${neighbourhood}/${name}`} />
  if (state === 'forbidden') {
    return (
      <section className="mx-auto max-w-xl px-4 py-14 text-center">
        <Lock aria-hidden size={40} className="mx-auto mb-3" />
        <h1 className="text-3xl uppercase">This page belongs to someone else</h1>
        <p className="mt-3 text-lg">Only the browser that claimed /{hood.slug}/{h.name} can edit it. You can still visit it, or claim an address of your own.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link to={`/${hood.slug}/${h.name}`} className="btn btn-paper">Visit the page</Link>
          <Link to="/new" className="btn btn-brick">Claim your own</Link>
        </div>
      </section>
    )
  }

  const selected = h.blocks.find((b) => b.id === selectedId) ?? null
  const rightTab = view === 'theme' ? 'theme' : 'block'
  const setBlocks = (blocks: Block[]) => change({ ...h, blocks })

  function add(type: BlockType) {
    const b = newBlock(type)
    setBlocks([...h!.blocks, b])
    setSelectedId(b.id)
  }
  function updateBlock(b: Block) { setBlocks(h!.blocks.map((x) => (x.id === b.id ? b : x))) }
  function remove(id: string) {
    const i = h!.blocks.findIndex((b) => b.id === id)
    const rest = h!.blocks.filter((b) => b.id !== id)
    setBlocks(rest)
    if (selectedId === id) setSelectedId(rest[Math.min(i, rest.length - 1)]?.id ?? null)
  }

  async function doExport() {
    if (!h || !hood) return
    setExporting(true); setExportMsg('')
    try {
      await flush()
      const [{ exportHtml, downloadHtml }, cssMod, guestbook, count, all] = await Promise.all([
        import('../lib/exportHtml'), import('../lib/exportCss'), repo.listGuestbook(h.id), repo.getViews(h.id), repo.listHomesteads({ publishedOnly: true }),
      ])
      const html = exportHtml({ homestead: h, hood, guestbook, views: count, ring: buildRing(all, h), css: cssMod.default, origin: window.location.origin })
      downloadHtml(`${h.name}-homestead.html`, html)
      setExportMsg(`Downloaded ${h.name}-homestead.html. It is one file and works offline.`)
    } catch {
      setExportMsg('Export failed. Please try again.')
    } finally { setExporting(false) }
  }

  const publicPath = `/${hood.slug}/${h.name}`
  return (
    <div className="bg-paper">
      <div className="border-b-4 border-ink bg-white">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2">
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg uppercase">Building {publicPath}</h1>
            <SaveStatus state={save} onRetry={() => void flush()} />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`chip ${h.published ? 'bg-moss text-white' : 'bg-neutral-200'}`} data-testid="publish-state">
              {h.published ? <Globe aria-hidden size={14} /> : <EyeOff aria-hidden size={14} />}
              {h.published ? 'Published' : 'Draft'}
            </span>
            {h.published ? (
              <>
                <Link to={publicPath} className="btn btn-paper"><ExternalLink aria-hidden size={18} /> View page</Link>
                <button type="button" className="btn btn-paper" onClick={() => change({ ...h, published: false }, true)}>Unpublish</button>
              </>
            ) : (
              <button type="button" className="btn btn-brick" onClick={() => change({ ...h, published: true }, true)}><Globe aria-hidden size={18} /> Publish</button>
            )}
            <button type="button" className="btn" onClick={doExport} disabled={exporting}><Download aria-hidden size={18} /> {exporting ? 'Exporting...' : 'Export my page'}</button>
          </div>
          <p role="status" className="basis-full text-sm font-medium empty:hidden">{exportMsg}</p>
        </div>
      </div>

      <div role="tablist" aria-label="Builder sections" className="sticky top-0 z-20 grid grid-cols-4 border-b-4 border-ink bg-sun lg:hidden">
        {TABS.map(({ id, label, Icon }) => (
          <button key={id} type="button" role="tab" aria-selected={view === id} onClick={() => setView(id)}
            className={`flex min-h-11 flex-col items-center justify-center gap-0.5 border-r-2 border-ink px-1 py-1.5 font-display text-xs uppercase transition-colors duration-150 last:border-r-0 hover:bg-white/60 active:bg-white ${view === id ? 'bg-white' : ''}`}>
            <Icon aria-hidden size={18} /> {label}
          </button>
        ))}
      </div>

      <div className="mx-auto grid max-w-[1500px] grid-cols-[minmax(0,1fr)] gap-4 px-4 py-4 lg:grid-cols-[320px_minmax(0,1fr)_340px]">
        <div className={`${view === 'blocks' ? 'grid' : 'hidden'} min-w-0 grid-cols-[minmax(0,1fr)] content-start gap-5 lg:sticky lg:top-2 lg:grid lg:max-h-[calc(100vh-1rem)] lg:self-start lg:overflow-y-auto lg:pr-1`}>
          <Palette_ onAdd={(t) => { add(t); if (window.innerWidth < 1024) setView('block') }} />
          <section aria-labelledby="blocks-h">
            <h2 id="blocks-h" className="mb-2 text-sm uppercase">Your blocks ({h.blocks.length})</h2>
            {h.blocks.length === 0 ? (
              <p className="rounded-chunk border-[3px] border-dashed border-ink bg-white p-4 text-center">Your page is empty. Pick a block above to add your first one.</p>
            ) : (
              <BlockList blocks={h.blocks} selectedId={selectedId}
                onSelect={(id) => { setSelectedId(id); setView('block') }} onReorder={setBlocks} onDelete={remove} />
            )}
          </section>
        </div>

        <div className={`${view === 'preview' ? 'block' : 'hidden'} min-w-0 lg:block`}>
          <div className="overflow-hidden rounded-chunk border-[3px] border-ink shadow-hard" aria-label="Live preview" role="region">
            <p className="flex items-center gap-2 border-b-[3px] border-ink bg-ink px-3 py-1.5 font-display text-xs uppercase text-paper"><Eye aria-hidden size={14} /> Live preview</p>
            <HomesteadView homestead={h} hood={hood} views={views} />
          </div>
        </div>

        <aside aria-label="Settings" className={`${view === 'block' || view === 'theme' ? 'block' : 'hidden'} min-w-0 lg:sticky lg:top-2 lg:block lg:max-h-[calc(100vh-1rem)] lg:self-start lg:overflow-y-auto lg:pr-1`}>
          <div role="tablist" aria-label="Settings sections" className="mb-3 hidden grid-cols-2 gap-2 lg:grid">
            {(['block', 'theme'] as const).map((t) => (
              <button key={t} type="button" role="tab" aria-selected={rightTab === t} onClick={() => setView(t)}
                className={`btn !text-xs ${rightTab === t ? 'btn-brick' : 'btn-paper'}`}>{t === 'block' ? 'Selected block' : 'Theme'}</button>
            ))}
          </div>
          <div className="card p-4">
            {rightTab === 'theme' ? (
              <ThemePanel theme={h.theme} hood={hood} title={h.title}
                onTheme={(theme) => change({ ...h, theme })} onTitle={(title) => change({ ...h, title })} />
            ) : selected ? (
              <BlockEditor key={selected.id} block={selected} onChange={updateBlock} />
            ) : (
              <p className="text-center text-neutral-700">Select a block to edit it, or add a new one from the palette.</p>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
