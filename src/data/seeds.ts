import type { Block, GuestbookEntry, Homestead, Theme } from '../types'

const ago = (mins: number) => new Date(Date.now() - mins * 60_000).toISOString()
const SITE = 'https://homesteadd.vercel.app'

function hs(
  n: number, neighbourhood: Homestead['neighbourhood'], name: string, title: string,
  theme: Theme, blocks: Block[], createdMins: number,
): Homestead {
  return {
    id: `00000000-0000-4000-8000-00000000000${n}`,
    neighbourhood, name, title, theme, blocks, published: true, createdAt: ago(createdMins),
  }
}

export const SEED_HOMESTEADS: Homestead[] = [
  hs(1, 'siliconvalley', 'nullpointer', "Priya's Null Pointer Lab",
    { pattern: 'grid', fontPair: 'typewriter', accent: 0 },
    [
      { id: 's1-1', type: 'header', title: 'nullpointer.lab', subtitle: 'Small tools, strong opinions, zero dependencies (almost).' },
      { id: 's1-2', type: 'construction', message: 'v2 of the build log is under construction' },
      { id: 's1-3', type: 'text', body: "Hi, I'm Priya. I build tiny command line tools in the evenings and write down what broke.\n\nCurrently: a 200-line static site generator, a Game Boy emulator that boots exactly one ROM, and a tea timer that has opinions." },
      { id: 's1-4', type: 'linklist', heading: 'Projects', links: [
        { label: 'More builders in Silicon Valley', url: `${SITE}/explore?hood=siliconvalley` },
        { label: 'Next door: The Static Hearts', url: `${SITE}/sunsetstrip/the-static-hearts` },
        { label: 'Claim an address for your own project', url: `${SITE}/new` },
      ] },
      { id: 's1-5', type: 'divider', style: 'zigzag' },
      { id: 's1-6', type: 'stamps', stamps: ['floppy', 'star', 'bolt', 'house'] },
      { id: 's1-7', type: 'guestbook', heading: 'Leave a bug report (or a hello)' },
      { id: 's1-8', type: 'counter', label: 'Compiled for visitor' },
      { id: 's1-9', type: 'webring' },
    ], 60 * 24 * 21),
  hs(2, 'soho', 'lenses-by-mara', 'Lenses by Mara',
    { pattern: 'plain', fontPair: 'zine', accent: 0 },
    [
      { id: 's2-1', type: 'header', title: 'Lenses by Mara', subtitle: 'Street photography, shot on a 1987 film camera and an unreasonable amount of patience.' },
      { id: 's2-2', type: 'image', url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6e/Soggy_Brolly_%28255068043%29.jpeg/960px-Soggy_Brolly_%28255068043%29.jpeg', alt: 'A rain-soaked umbrella hanging on a railing beside a wet walkway', caption: 'Left to dry, 6:12pm, Tuesday' },
      { id: 's2-3', type: 'text', body: 'I walk the same eight blocks every week and every week they look different. This page is my contact sheet: unedited, a little crooked, honest.' },
      { id: 's2-4', type: 'gallery', images: [
        { url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fb/Nob_Hill_Fire_Escape_2014.jpg/960px-Nob_Hill_Fire_Escape_2014.jpg', alt: 'A fire escape and its shadow on a brick wall' },
        { url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b2/Reading_newspaper_in_a_caf%C3%A9_%28Unsplash%29.jpg/960px-Reading_newspaper_in_a_caf%C3%A9_%28Unsplash%29.jpg', alt: 'A regular reading the newspaper in the corner café' },
        { url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/75/Pigeons_on_wires_%282023-07-24%29_E911a_40.jpg/960px-Pigeons_on_wires_%282023-07-24%29_E911a_40.jpg', alt: 'A pigeon on a wire' },
        { url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/78/DFC_0505_Neon-lit_city_street_at_night_reflected_in_a_rain_puddle_colorful_signs_and_lights_mirrored_on_the_wet_pavement.jpg/960px-DFC_0505_Neon-lit_city_street_at_night_reflected_in_a_rain_puddle_colorful_signs_and_lights_mirrored_on_the_wet_pavement.jpg', alt: 'Neon signs reflected in a puddle' },
      ] },
      { id: 's2-5', type: 'divider', style: 'rainbow' },
      { id: 's2-6', type: 'guestbook', heading: 'Tell me what you saw' },
      { id: 's2-7', type: 'counter', label: 'Exposure number' },
      { id: 's2-8', type: 'webring' },
    ], 60 * 24 * 14),
  hs(3, 'sunsetstrip', 'the-static-hearts', 'The Static Hearts',
    { pattern: 'starfield', fontPair: 'press', accent: 0 },
    [
      { id: 's3-1', type: 'header', title: 'THE STATIC HEARTS', subtitle: 'Loud guitars. Small venues. Est. in a garage that smells like pizza.' },
      { id: 's3-2', type: 'text', body: 'Four friends, three chords and a drummer who refuses to stop. Playing every second Friday at The Rusty Bell.\n\nNew EP "Dial Tone Summer" drops when we find the cassette duplicator.' },
      { id: 's3-3', type: 'linklist', heading: 'Gigs and tapes', links: [
        { label: 'Find more bands in Sunset Strip', url: `${SITE}/explore?hood=sunsetstrip` },
        { label: 'Next door: Lenses by Mara', url: `${SITE}/soho/lenses-by-mara` },
        { label: 'Claim an address for your own band', url: `${SITE}/new` },
      ] },
      { id: 's3-4', type: 'stamps', stamps: ['music', 'heart', 'star', 'bolt', 'skull'] },
      { id: 's3-5', type: 'guestbook', heading: 'Sign the setlist' },
      { id: 's3-6', type: 'counter', label: 'Tickets torn' },
      { id: 's3-7', type: 'webring' },
    ], 60 * 24 * 9),
  hs(4, 'heartland', 'nana-june', "Nana June's Kitchen",
    { pattern: 'tiles', fontPair: 'zine', accent: 0 },
    [
      { id: 's4-1', type: 'header', title: "Nana June's Kitchen", subtitle: 'Recipes my grandmother never wrote down, written down.' },
      { id: 's4-2', type: 'image', url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4b/Apple_pie.jpg/960px-Apple_pie.jpg', alt: 'A golden pie cooling on a windowsill', caption: 'Sunday pie. Always Sunday pie.' },
      { id: 's4-3', type: 'text', body: "Brown butter apple pie\n\nYou need six tart apples, a stick of butter, a cup of patience and a pinch of salt. Brown the butter until it smells like toast. Toss the sliced apples in it with half a cup of sugar and a spoon of cinnamon. Pile into a crust, cover, and bake at 400 degrees for 45 minutes.\n\nLet it cool. This is the hard part." },
      { id: 's4-4', type: 'divider', style: 'dots' },
      { id: 's4-5', type: 'stamps', stamps: ['house', 'heart', 'leaf', 'sun', 'coffee'] },
      { id: 's4-6', type: 'guestbook', heading: 'Leave a note on the fridge' },
      { id: 's4-7', type: 'counter', label: 'Pies served' },
      { id: 's4-8', type: 'webring' },
    ], 60 * 24 * 5),
  hs(5, 'enchantedforest', 'fern-and-flame', 'Fern & Flame: a Dragon Fan Page',
    { pattern: 'clouds', fontPair: 'press', accent: 1 },
    [
      { id: 's5-1', type: 'header', title: 'Fern & Flame', subtitle: 'A fan page for every dragon who ever guarded a library.' },
      { id: 's5-2', type: 'construction', message: 'The Hoard Room is still being dug' },
      { id: 's5-3', type: 'text', body: 'Welcome, traveller! I collect dragon stories: the grumpy ones, the shy ones, the ones who just want a quiet cave and good tea.\n\nMy rule: no dragon is ever the villain without a good reason.' },
      { id: 's5-4', type: 'gallery', images: [
        { url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/61/Coming_home_iii_-_Flickr_-_hannes-flo.jpg/960px-Coming_home_iii_-_Flickr_-_hannes-flo.jpg', alt: 'Misty forest path at dawn' },
        { url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/ce/Moss-covered_stone.jpg/960px-Moss-covered_stone.jpg', alt: 'Moss-covered stones in green light' },
      ] },
      { id: 's5-5', type: 'linklist', heading: 'Where the dragons live', links: [
        { label: 'Nana June\'s Kitchen (cosy cave snacks)', url: `${SITE}/heartland/nana-june` },
        { label: 'More homes in the Enchanted Forest', url: `${SITE}/explore?hood=enchantedforest` },
      ] },
      { id: 's5-6', type: 'stamps', stamps: ['flame', 'leaf', 'star', 'moon'] },
      { id: 's5-7', type: 'guestbook', heading: 'Sign the hoard ledger' },
      { id: 's5-8', type: 'counter', label: 'Adventurers passed' },
      { id: 's5-9', type: 'webring' },
    ], 60 * 24 * 2),
]

const e = (n: number, h: number, author: string, message: string, mins: number): GuestbookEntry => ({
  id: `10000000-0000-4000-8000-0000000000${String(n).padStart(2, '0')}`,
  homesteadId: SEED_HOMESTEADS[h - 1].id, author, message, createdAt: ago(mins),
})

export const SEED_ENTRIES: GuestbookEntry[] = [
  e(1, 1, 'Dev from the old IRC', 'steep saved my morning. Please add a 4-minute oolong preset.', 60 * 30),
  e(2, 1, 'Tomás', 'The Game Boy emulator booted Tetris for a full second. I am proud of you.', 60 * 6),
  e(3, 1, 'anon_ferret', 'No dependencies, you say. Check your node_modules. I dare you.', 55),
  e(4, 2, 'Jo', 'The pigeons on the wire made me stop and stare at the actual sky today. Thank you.', 60 * 50),
  e(5, 2, 'Albert K.', 'Is that the corner by the laundromat? It is gorgeous in the rain.', 60 * 12),
  e(6, 3, 'Wren', 'Saw you at the Rusty Bell. The drummer is a legend. Please never stop.', 60 * 40),
  e(7, 3, 'Big Dale', 'Tape arrived. Side B is unreasonably good.', 60 * 8),
  e(8, 3, 'Marguerite', 'Play "Dial Tone" next time! My cat loves it.', 120),
  e(9, 4, 'Cousin Ray', 'Made the pie. The butter trick works. Grandma would be proud.', 60 * 20),
  e(10, 4, 'Dolores', 'I cried a little at the word patience. Thank you for writing this down.', 60 * 3),
  e(11, 5, 'Sir Bramble', 'Finally, a page where the dragon gets to be the hero. Huzzah!', 60 * 15),
  e(12, 5, 'Lumi', 'The Hoard Room better have a reading nook.', 90),
]

/** Seed hit counts, keyed by homestead id */
export const SEED_VIEWS: Record<string, number> = {
  [SEED_HOMESTEADS[0].id]: 1337,
  [SEED_HOMESTEADS[1].id]: 842,
  [SEED_HOMESTEADS[2].id]: 2104,
  [SEED_HOMESTEADS[3].id]: 516,
  [SEED_HOMESTEADS[4].id]: 273,
}
