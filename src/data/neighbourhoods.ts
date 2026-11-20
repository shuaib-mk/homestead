import type { Neighbourhood, NeighbourhoodSlug } from '../types'

export const NEIGHBOURHOODS: Neighbourhood[] = [
  {
    slug: 'siliconvalley', name: 'SiliconValley', tagline: 'Code, gadgets and side projects',
    vibe: 'Tech, code, projects. Terminal green on warm paper.',
    palette: ['#2f9e6e', '#3ec1d3', '#ffd23f', '#12372a', '#e3f6ec'], pattern: 'grid',
  },
  {
    slug: 'heartland', name: 'Heartland', tagline: 'Home, family, gardens and recipes',
    vibe: 'Warm kitchens, porch swings, tomato season.',
    palette: ['#e8793a', '#f2b84b', '#8a9a3b', '#4a2a14', '#fdecd8'], pattern: 'tiles',
  },
  {
    slug: 'soho', name: 'SoHo', tagline: 'Art, design and photography',
    vibe: 'Gallery white, loud accents, big type.',
    palette: ['#ff5a36', '#1a1a1a', '#f4c430', '#1a1a1a', '#f3efe6'], pattern: 'plain',
  },
  {
    slug: 'sunsetstrip', name: 'SunsetStrip', tagline: 'Bands, gigs and playlists',
    vibe: 'Neon after dark, posters on every wall.',
    palette: ['#d6336c', '#ff922b', '#7048e8', '#2b0f24', '#ffe3ec'], pattern: 'starfield',
  },
  {
    slug: 'enchantedforest', name: 'EnchantedForest', tagline: 'Fantasy, games and whimsy',
    vibe: 'Mossy paths, lanterns, dragons in the ferns.',
    palette: ['#3b8f5a', '#9b5de5', '#f2c94c', '#16301f', '#e4f3e2'], pattern: 'clouds',
  },
  {
    slug: 'motorcity', name: 'MotorCity', tagline: 'Cars, bikes and making things',
    vibe: 'Grease, chrome and workshop lighting.',
    palette: ['#e03131', '#f08c00', '#868e96', '#1c1c1c', '#f1f1ee'], pattern: 'tiles',
  },
]

export function getNeighbourhood(slug: string): Neighbourhood | undefined {
  return NEIGHBOURHOODS.find((n) => n.slug === slug)
}

export function isNeighbourhoodSlug(slug: string): slug is NeighbourhoodSlug {
  return NEIGHBOURHOODS.some((n) => n.slug === slug)
}
