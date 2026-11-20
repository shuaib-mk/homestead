import type { Homestead, Neighbourhood } from '../../types'

/** Everything a block needs to know about the page it lives on. */
export interface BlockCtx {
  homestead: Homestead
  hood: Neighbourhood
  /** Current hit count, null while loading. */
  views: number | null
  /** Id of the first header block (rendered as the page h1). */
  firstHeaderId?: string
}
