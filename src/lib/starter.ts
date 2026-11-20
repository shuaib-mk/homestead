import type { Block, NeighbourhoodSlug, Theme } from '../types'
import { getNeighbourhood } from '../data/neighbourhoods'
import { uid } from './ids'

export function starterTheme(slug: NeighbourhoodSlug): Theme {
  return { pattern: getNeighbourhood(slug)?.pattern ?? 'plain', fontPair: 'press', accent: 0 }
}

export function starterBlocks(name: string): Block[] {
  return [
    { id: uid(), type: 'header', title: `Welcome to ${name}'s page`, subtitle: 'Pull up a chair. I just moved in.' },
    { id: uid(), type: 'text', body: 'This is my little corner of the internet. I am still unpacking boxes, so check back soon.\n\nSign the guestbook before you go!' },
    { id: uid(), type: 'guestbook', heading: 'Sign my guestbook' },
    { id: uid(), type: 'counter', label: 'You are visitor number' },
  ]
}

export function newBlock(type: Block['type']): Block {
  const id = uid()
  switch (type) {
    case 'header': return { id, type, title: 'A new heading', subtitle: 'A short line underneath' }
    case 'text': return { id, type, body: 'Write something about yourself here.' }
    case 'image': return { id, type, url: '', alt: '', caption: '' }
    case 'gallery': return { id, type, images: [{ url: '', alt: '' }, { url: '', alt: '' }] }
    case 'linklist': return { id, type, heading: 'My favourite corners of the web', links: [{ label: 'Explore Homestead', url: 'https://homestead-seven-gray.vercel.app/explore' }] }
    case 'guestbook': return { id, type, heading: 'Sign my guestbook' }
    case 'counter': return { id, type, label: 'You are visitor number' }
    case 'webring': return { id, type }
    case 'divider': return { id, type, style: 'rainbow' }
    case 'construction': return { id, type, message: 'This page is under construction' }
    case 'stamps': return { id, type, stamps: ['house', 'star', 'heart'] }
  }
}
