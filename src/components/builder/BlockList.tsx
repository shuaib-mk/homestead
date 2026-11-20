import {
  DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useLayoutEffect, useRef, useState } from 'react'
import type { Block } from '../../types'
import { BLOCK_META } from './blockMeta'
import SortableBlock from './SortableBlock'

interface Props {
  blocks: Block[]
  selectedId: string | null
  onSelect: (id: string) => void
  onReorder: (blocks: Block[]) => void
  onDelete: (id: string) => void
}

export default function BlockList({ blocks, selectedId, onSelect, onReorder, onDelete }: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )
  const [announce, setAnnounce] = useState('')
  const listRef = useRef<HTMLUListElement>(null)
  const rects = useRef(new Map<string, number>())
  const flip = useRef(false)

  // After a button-driven move, glide each row from its old position to its new one.
  useLayoutEffect(() => {
    const ul = listRef.current
    if (!ul) return
    const next = new Map<string, number>()
    ul.querySelectorAll<HTMLElement>(':scope > li[data-id]').forEach((li) => {
      const top = li.getBoundingClientRect().top
      next.set(li.dataset.id!, top)
      const prev = rects.current.get(li.dataset.id!)
      if (flip.current && prev !== undefined && Math.abs(prev - top) > 1 && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
        li.animate([{ transform: `translateY(${prev - top}px)` }, { transform: 'none' }], { duration: 240, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' })
      }
    })
    rects.current = next
    flip.current = false
  })

  function move(from: number, to: number) {
    if (to < 0 || to >= blocks.length) return
    flip.current = true
    onReorder(arrayMove(blocks, from, to))
    setAnnounce(`${BLOCK_META[blocks[from].type].label} moved to position ${to + 1} of ${blocks.length}`)
  }

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e
    if (!over || active.id === over.id) return
    const from = blocks.findIndex((b) => b.id === active.id)
    const to = blocks.findIndex((b) => b.id === over.id)
    onReorder(arrayMove(blocks, from, to))
    setAnnounce(`${BLOCK_META[blocks[from].type].label} moved to position ${to + 1} of ${blocks.length}`)
  }

  return (
    <div>
      <p role="status" className="sr-only">{announce}</p>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
          <ul ref={listRef} className="grid gap-3" aria-label="Page blocks">
            {blocks.map((b, i) => (
              <SortableBlock key={b.id} block={b} index={i} count={blocks.length} selected={b.id === selectedId}
                onSelect={() => onSelect(b.id)} onMove={(d) => move(i, i + d)} onDelete={() => onDelete(b.id)} />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    </div>
  )
}
