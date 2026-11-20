import {
  BookOpen, Hash, HardHat, Heading1, Image, Images, Link, Link2, Minus, Stamp, Type, type LucideIcon,
} from 'lucide-react'
import type { Block, BlockType } from '../../types'

export const BLOCK_META: Record<BlockType, { label: string; hint: string; Icon: LucideIcon }> = {
  header: { label: 'Heading', hint: 'A big title with a subtitle', Icon: Heading1 },
  text: { label: 'Text', hint: 'Paragraphs about you', Icon: Type },
  image: { label: 'Image', hint: 'One picture with a caption', Icon: Image },
  gallery: { label: 'Gallery', hint: 'Up to six pictures', Icon: Images },
  linklist: { label: 'Link list', hint: 'Your favourite places on the web', Icon: Link },
  guestbook: { label: 'Guestbook', hint: 'Let visitors sign', Icon: BookOpen },
  counter: { label: 'Hit counter', hint: 'Count your visitors', Icon: Hash },
  webring: { label: 'Webring', hint: 'Hop between neighbours', Icon: Link2 },
  divider: { label: 'Divider', hint: 'A line to separate sections', Icon: Minus },
  construction: { label: 'Under construction', hint: 'Hazard stripes, very 1998', Icon: HardHat },
  stamps: { label: 'Stamp wall', hint: 'Little badges of honour', Icon: Stamp },
}

export const BLOCK_ORDER: BlockType[] = ['header', 'text', 'image', 'gallery', 'linklist', 'guestbook', 'counter', 'webring', 'divider', 'construction', 'stamps']

/** One short line describing a block's content, for the block list. */
export function blockSummary(b: Block): string {
  switch (b.type) {
    case 'header': return b.title
    case 'text': return b.body.replace(/\s+/g, ' ')
    case 'image': return b.caption || b.alt || b.url
    case 'gallery': return `${b.images.length} picture${b.images.length === 1 ? '' : 's'}`
    case 'linklist': return b.heading
    case 'guestbook': return b.heading
    case 'counter': return b.label
    case 'webring': return 'Neighbourhood webring'
    case 'divider': return `${b.style} style`
    case 'construction': return b.message
    case 'stamps': return `${b.stamps.length} stamp${b.stamps.length === 1 ? '' : 's'}`
  }
}
