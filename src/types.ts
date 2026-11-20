export type NeighbourhoodSlug =
  | 'siliconvalley' | 'heartland' | 'soho' | 'sunsetstrip' | 'enchantedforest' | 'motorcity'

export type Pattern = 'starfield' | 'tiles' | 'clouds' | 'grid' | 'plain'
export type FontPair = 'press' | 'zine' | 'typewriter'
export type DividerStyle = 'line' | 'dots' | 'rainbow' | 'zigzag'

export interface Neighbourhood {
  slug: NeighbourhoodSlug
  name: string
  tagline: string
  vibe: string
  /** 5 colours: [0] main, [1] second, [2] third, [3] dark, [4] light tint */
  palette: [string, string, string, string, string]
  pattern: Pattern
}

export interface Theme {
  pattern: Pattern
  fontPair: FontPair
  /** index into neighbourhood palette (0-2) */
  accent: number
}

export interface LinkItem { label: string; url: string }
export interface GalleryImage { url: string; alt: string }

interface BaseBlock { id: string }
export type Block =
  | (BaseBlock & { type: 'header'; title: string; subtitle: string })
  | (BaseBlock & { type: 'text'; body: string })
  | (BaseBlock & { type: 'image'; url: string; alt: string; caption: string })
  | (BaseBlock & { type: 'gallery'; images: GalleryImage[] })
  | (BaseBlock & { type: 'linklist'; heading: string; links: LinkItem[] })
  | (BaseBlock & { type: 'guestbook'; heading: string })
  | (BaseBlock & { type: 'counter'; label: string })
  | (BaseBlock & { type: 'webring' })
  | (BaseBlock & { type: 'divider'; style: DividerStyle })
  | (BaseBlock & { type: 'construction'; message: string })
  | (BaseBlock & { type: 'stamps'; stamps: string[] })

export type BlockType = Block['type']

export interface Homestead {
  id: string
  neighbourhood: NeighbourhoodSlug
  name: string
  title: string
  theme: Theme
  blocks: Block[]
  published: boolean
  createdAt: string
}

export interface GuestbookEntry {
  id: string
  homesteadId: string
  author: string
  message: string
  createdAt: string
}
