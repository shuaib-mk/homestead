import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ArrowDown, ArrowUp, GripVertical, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import type { Block } from '../../types'
import { BLOCK_META, blockSummary } from './blockMeta'

interface Props {
  block: Block
  index: number
  count: number
  selected: boolean
  onSelect: () => void
  onMove: (dir: -1 | 1) => void
  onDelete: () => void
}

const iconBtn = 'inline-flex size-11 items-center justify-center rounded-chunk border-[3px] border-ink bg-white transition-[transform,background-color,box-shadow] duration-150 hover:bg-sun active:translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white'

export default function SortableBlock({ block, index, count, selected, onSelect, onMove, onDelete }: Props) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id: block.id })
  const [confirming, setConfirming] = useState(false)
  const { label, Icon } = BLOCK_META[block.type]
  const summary = blockSummary(block)

  return (
    <li ref={setNodeRef} data-id={block.id}
      style={{ transform: CSS.Transform.toString(transform), transition: transition ?? 'transform 220ms cubic-bezier(0.2, 0.8, 0.2, 1)' }}
      className={`relative rounded-chunk border-[3px] border-ink bg-white p-2 ${selected ? 'shadow-hard bg-[#fff6cf]' : 'shadow-hard-sm'} ${isDragging ? 'z-10 scale-[1.02] opacity-90 shadow-hard' : ''}`}>
      <div className="flex items-center gap-1">
        <button type="button" ref={setActivatorNodeRef} {...attributes} {...listeners}
          aria-label={`Drag to reorder ${label} block, position ${index + 1} of ${count}`}
          className={`${iconBtn} touch-none cursor-grab active:cursor-grabbing`}>
          <GripVertical aria-hidden size={18} />
        </button>
        <button type="button" onClick={onSelect} aria-pressed={selected} aria-label={`Edit ${label} block: ${summary.slice(0, 40)}`}
          className="flex min-h-11 min-w-0 flex-1 items-center gap-2 rounded-chunk px-2 text-left transition-colors duration-150 hover:bg-sun/60 active:bg-sun">
          <Icon aria-hidden size={18} className="shrink-0" />
          <span className="min-w-0">
            <span className="block font-display text-xs uppercase">{label}</span>
            <span className="block truncate text-sm text-neutral-700">{summary || 'Empty'}</span>
          </span>
        </button>
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-1 pl-12">
        <button type="button" className={iconBtn} onClick={() => onMove(-1)} disabled={index === 0} aria-label={`Move ${label} block up`}><ArrowUp aria-hidden size={18} /></button>
        <button type="button" className={iconBtn} onClick={() => onMove(1)} disabled={index === count - 1} aria-label={`Move ${label} block down`}><ArrowDown aria-hidden size={18} /></button>
        <button type="button" className={iconBtn} onClick={onSelect} aria-label={`Open editor for ${label} block`}><Pencil aria-hidden size={18} /></button>
        {confirming ? (
          <span role="group" aria-label="Confirm delete" className="flex flex-wrap items-center gap-1">
            <button type="button" className="btn btn-brick !px-3 !text-xs" onClick={() => { setConfirming(false); onDelete() }}>Delete block</button>
            <button type="button" className="btn btn-paper !px-3 !text-xs" onClick={() => setConfirming(false)}>Keep it</button>
          </span>
        ) : (
          <button type="button" className={`${iconBtn} hover:!bg-brick hover:text-white`} onClick={() => setConfirming(true)} aria-label={`Delete ${label} block`}><Trash2 aria-hidden size={18} /></button>
        )}
      </div>
    </li>
  )
}
