import { Plus } from 'lucide-react'
import type { BlockType } from '../../types'
import { BLOCK_META, BLOCK_ORDER } from './blockMeta'

export default function Palette({ onAdd }: { onAdd: (t: BlockType) => void }) {
  return (
    <section aria-labelledby="palette-h">
      <h2 id="palette-h" className="mb-2 text-sm uppercase">Add a block</h2>
      <ul className="grid grid-cols-2 gap-2">
        {BLOCK_ORDER.map((t) => {
          const { label, hint, Icon } = BLOCK_META[t]
          return (
            <li key={t}>
              <button type="button" onClick={() => onAdd(t)} title={hint} aria-label={`Add ${label} block`}
                className="group flex min-h-11 w-full items-center gap-2 rounded-chunk border-[3px] border-ink bg-white px-2 py-1.5 text-left text-sm font-bold shadow-hard-sm transition-[transform,box-shadow,background-color] duration-150 hover:-translate-x-px hover:-translate-y-px hover:bg-sun active:translate-x-0.5 active:translate-y-0.5 active:shadow-none">
                <Icon aria-hidden size={18} className="shrink-0" />
                <span className="min-w-0 flex-1 leading-tight">{label}</span>
                <Plus aria-hidden size={16} className="shrink-0 opacity-60 transition-transform duration-150 group-hover:rotate-90" />
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
