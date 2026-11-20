import type { Block } from '../../types'
import GuestbookBlock from './GuestbookBlock'
import HitCounter from './HitCounter'
import {
  ConstructionBlock, DividerBlock, GalleryBlock, HeaderBlock, ImageBlock, LinkListBlock, StampsBlock, TextBlock,
} from './SimpleBlocks'
import type { BlockCtx } from './types'
import WebringBlock from './WebringBlock'

/** One renderer for every block type, shared by the public page, the builder preview and (later) export. */
export default function BlockRenderer({ block, ctx }: { block: Block; ctx: BlockCtx }) {
  switch (block.type) {
    case 'header': return <HeaderBlock block={block} level={block.id === ctx.firstHeaderId ? 1 : 2} />
    case 'text': return <TextBlock block={block} />
    case 'image': return <ImageBlock block={block} />
    case 'gallery': return <GalleryBlock block={block} />
    case 'linklist': return <LinkListBlock block={block} />
    case 'guestbook': return <GuestbookBlock heading={block.heading} ctx={ctx} />
    case 'counter': return <HitCounter label={block.label} views={ctx.views} />
    case 'webring': return <WebringBlock ctx={ctx} />
    case 'divider': return <DividerBlock block={block} />
    case 'construction': return <ConstructionBlock block={block} />
    case 'stamps': return <StampsBlock block={block} />
  }
}
