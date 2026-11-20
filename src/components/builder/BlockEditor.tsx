import { Plus, Trash2 } from 'lucide-react'
import { useId, type ReactNode } from 'react'
import { safeUrl } from '../../lib/safeUrl'
import type { Block, DividerStyle } from '../../types'
import { STAMPS } from '../blocks/stamps'
import { BLOCK_META } from './blockMeta'

type Of<T extends Block['type']> = Extract<Block, { type: T }>

function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: (p: { id: string; describedBy?: string }) => ReactNode }) {
  const id = useId()
  const dId = `${id}-d`
  const describedBy = error || hint ? dId : undefined
  return (
    <div>
      <label htmlFor={id} className="mb-1 block font-display text-xs uppercase">{label}</label>
      {children({ id, describedBy })}
      {(error || hint) && <p id={dId} className={`mt-1 text-sm ${error ? 'font-medium text-red-700' : 'text-neutral-700'}`}>{error ?? hint}</p>}
    </div>
  )
}

function TextInput({ label, value, onChange, max = 120, hint, error, placeholder }: { label: string; value: string; onChange: (v: string) => void; max?: number; hint?: string; error?: string; placeholder?: string }) {
  return (
    <Field label={label} hint={hint} error={error}>
      {({ id, describedBy }) => <input id={id} className="field" value={value} maxLength={max} placeholder={placeholder} aria-invalid={!!error} aria-describedby={describedBy} onChange={(e) => onChange(e.target.value)} />}
    </Field>
  )
}

const urlError = (v: string) => (v.trim() && !safeUrl(v) ? 'Use a full web address that starts with https:// or http://' : undefined)

function Header({ b, set }: { b: Of<'header'>; set: (b: Block) => void }) {
  return (<>
    <TextInput label="Title" value={b.title} max={80} onChange={(title) => set({ ...b, title })} />
    <TextInput label="Subtitle" value={b.subtitle} max={140} onChange={(subtitle) => set({ ...b, subtitle })} />
  </>)
}

function Text({ b, set }: { b: Of<'text'>; set: (b: Block) => void }) {
  return (
    <Field label="Text" hint="Leave a blank line between paragraphs.">
      {({ id, describedBy }) => <textarea id={id} className="field min-h-40" rows={7} maxLength={3000} value={b.body} aria-describedby={describedBy} onChange={(e) => set({ ...b, body: e.target.value })} />}
    </Field>
  )
}

function ImageEd({ b, set }: { b: Of<'image'>; set: (b: Block) => void }) {
  return (<>
    <TextInput label="Image web address" value={b.url} max={500} placeholder="https://..." error={urlError(b.url)} hint="Paste the link to a picture that is already online." onChange={(url) => set({ ...b, url })} />
    <TextInput label="Alt text" value={b.alt} max={200} hint="Describe the picture for people who cannot see it." onChange={(alt) => set({ ...b, alt })} />
    <TextInput label="Caption" value={b.caption} max={200} onChange={(caption) => set({ ...b, caption })} />
  </>)
}

function Gallery({ b, set }: { b: Of<'gallery'>; set: (b: Block) => void }) {
  const upd = (i: number, patch: Partial<{ url: string; alt: string }>) => set({ ...b, images: b.images.map((im, j) => (j === i ? { ...im, ...patch } : im)) })
  return (<>
    {b.images.map((im, i) => (
      <fieldset key={i} className="grid gap-3 rounded-chunk border-[3px] border-ink p-3">
        <legend className="px-1 font-display text-xs uppercase">Picture {i + 1}</legend>
        <TextInput label="Web address" value={im.url} max={500} placeholder="https://..." error={urlError(im.url)} onChange={(url) => upd(i, { url })} />
        <TextInput label="Alt text" value={im.alt} max={200} onChange={(alt) => upd(i, { alt })} />
        <button type="button" className="btn btn-paper justify-self-start" onClick={() => set({ ...b, images: b.images.filter((_, j) => j !== i) })}><Trash2 aria-hidden size={16} /> Remove picture {i + 1}</button>
      </fieldset>
    ))}
    {b.images.length === 0 && <p className="text-neutral-700">No pictures yet. Add one below.</p>}
    <button type="button" className="btn btn-paper justify-self-start" disabled={b.images.length >= 6} onClick={() => set({ ...b, images: [...b.images, { url: '', alt: '' }] })}><Plus aria-hidden size={16} /> Add picture</button>
    {b.images.length >= 6 && <p className="text-sm text-neutral-700">Galleries hold up to six pictures.</p>}
  </>)
}

function LinkList({ b, set }: { b: Of<'linklist'>; set: (b: Block) => void }) {
  const upd = (i: number, patch: Partial<{ label: string; url: string }>) => set({ ...b, links: b.links.map((l, j) => (j === i ? { ...l, ...patch } : l)) })
  return (<>
    <TextInput label="Heading" value={b.heading} max={80} onChange={(heading) => set({ ...b, heading })} />
    {b.links.map((l, i) => (
      <fieldset key={i} className="grid gap-3 rounded-chunk border-[3px] border-ink p-3">
        <legend className="px-1 font-display text-xs uppercase">Link {i + 1}</legend>
        <TextInput label="Label" value={l.label} max={80} onChange={(label) => upd(i, { label })} />
        <TextInput label="Web address" value={l.url} max={500} placeholder="https://..." error={urlError(l.url)} onChange={(url) => upd(i, { url })} />
        <button type="button" className="btn btn-paper justify-self-start" onClick={() => set({ ...b, links: b.links.filter((_, j) => j !== i) })}><Trash2 aria-hidden size={16} /> Remove link {i + 1}</button>
      </fieldset>
    ))}
    {b.links.length === 0 && <p className="text-neutral-700">No links yet. Add your first one below.</p>}
    <button type="button" className="btn btn-paper justify-self-start" disabled={b.links.length >= 10} onClick={() => set({ ...b, links: [...b.links, { label: '', url: '' }] })}><Plus aria-hidden size={16} /> Add link</button>
  </>)
}

const DIVIDER_STYLES: { id: DividerStyle; label: string }[] = [
  { id: 'line', label: 'Line' }, { id: 'dots', label: 'Dots' }, { id: 'rainbow', label: 'Rainbow' }, { id: 'zigzag', label: 'Zigzag' },
]

function Divider({ b, set }: { b: Of<'divider'>; set: (b: Block) => void }) {
  return (
    <fieldset>
      <legend className="mb-2 font-display text-xs uppercase">Style</legend>
      <div className="grid grid-cols-2 gap-2">
        {DIVIDER_STYLES.map((s) => (
          <button key={s.id} type="button" aria-pressed={b.style === s.id} onClick={() => set({ ...b, style: s.id })}
            className={`btn !text-xs ${b.style === s.id ? 'btn-brick' : 'btn-paper'}`}>{s.label}</button>
        ))}
      </div>
    </fieldset>
  )
}

function Stamps({ b, set }: { b: Of<'stamps'>; set: (b: Block) => void }) {
  const toggle = (id: string) => set({ ...b, stamps: b.stamps.includes(id) ? b.stamps.filter((s) => s !== id) : [...b.stamps, id] })
  return (
    <fieldset>
      <legend className="mb-1 font-display text-xs uppercase">Pick your stamps</legend>
      <p className="mb-2 text-sm text-neutral-700">{b.stamps.length} of {STAMPS.length} on the wall.</p>
      <div className="grid grid-cols-4 gap-2">
        {STAMPS.map(({ id, label, Icon }) => {
          const on = b.stamps.includes(id)
          return (
            <button key={id} type="button" aria-pressed={on} aria-label={label} title={label} onClick={() => toggle(id)}
              className={`flex size-14 items-center justify-center rounded-chunk border-[3px] border-ink transition-[transform,background-color] duration-150 hover:bg-sun active:scale-95 ${on ? 'bg-sun shadow-hard-sm' : 'border-dashed bg-white'}`}>
              <Icon aria-hidden size={26} strokeWidth={2.5} />
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

export default function BlockEditor({ block, onChange }: { block: Block; onChange: (b: Block) => void }) {
  const { label } = BLOCK_META[block.type]
  let body: ReactNode
  switch (block.type) {
    case 'header': body = <Header b={block} set={onChange} />; break
    case 'text': body = <Text b={block} set={onChange} />; break
    case 'image': body = <ImageEd b={block} set={onChange} />; break
    case 'gallery': body = <Gallery b={block} set={onChange} />; break
    case 'linklist': body = <LinkList b={block} set={onChange} />; break
    case 'guestbook': body = (<>
      <TextInput label="Heading" value={block.heading} max={80} onChange={(heading) => onChange({ ...block, heading })} />
      <p className="rounded-chunk bg-neutral-100 p-3 text-sm">Signatures show up in the preview. As the owner you will see a Delete button under each entry.</p>
    </>); break
    case 'counter': body = <TextInput label="Label" value={block.label} max={60} onChange={(l) => onChange({ ...block, label: l })} />; break
    case 'webring': body = <p className="rounded-chunk bg-neutral-100 p-3">Nothing to edit. This block links to the other homesteads in your neighbourhood and updates by itself.</p>; break
    case 'divider': body = <Divider b={block} set={onChange} />; break
    case 'construction': body = <TextInput label="Message" value={block.message} max={80} onChange={(message) => onChange({ ...block, message })} />; break
    case 'stamps': body = <Stamps b={block} set={onChange} />; break
  }
  return (
    <section aria-label={`${label} settings`} className="grid gap-4">
      <h3 className="text-lg uppercase">{label} settings</h3>
      {body}
    </section>
  )
}
