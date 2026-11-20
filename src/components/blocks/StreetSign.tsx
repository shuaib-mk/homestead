import type { Neighbourhood } from '../../types'

/** Vintage street sign showing the page address. */
export default function StreetSign({ hood, name }: { hood: Neighbourhood; name: string }) {
  return (
    <div className="mx-auto flex max-w-full flex-col items-stretch" aria-label={`Address: ${hood.name}, ${name}`}>
      <div className="hs-sign" style={{ background: hood.palette[3], color: '#fff' }}>
        <span className="text-xs uppercase opacity-80">Neighbourhood</span>
        <span className="font-display text-xl uppercase sm:text-2xl">{hood.name}</span>
      </div>
      <div className="hs-sign hs-sign-2" style={{ background: '#fff', color: '#1a1a1a' }}>
        <span className="text-xs uppercase opacity-70">Homestead</span>
        <span className="font-display break-all text-lg sm:text-xl">/{hood.slug}/{name}</span>
      </div>
    </div>
  )
}
