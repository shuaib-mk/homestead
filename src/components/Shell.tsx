import { Home } from 'lucide-react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'

const link = ({ isActive }: { isActive: boolean }) =>
  `inline-flex min-h-11 items-center px-3 font-display text-sm uppercase rounded-chunk border-2 border-transparent hover:border-ink hover:bg-sun focus-visible:bg-sun transition-colors ${isActive ? 'bg-sun border-ink' : ''}`

export default function Shell() {
  const { pathname } = useLocation()
  const bare = pathname.startsWith('/build/')
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b-4 border-ink bg-sun">
        <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-2" aria-label="Main">
          <Link to="/" className="inline-flex min-h-11 items-center gap-2 font-display text-xl uppercase hover:underline">
            <Home aria-hidden size={24} strokeWidth={3} /> Homestead
          </Link>
          <div className="flex items-center gap-1">
            <NavLink to="/explore" className={link}>Explore</NavLink>
            <Link to="/new" className="btn btn-brick">Claim yours</Link>
          </div>
        </nav>
      </header>
      <main className="flex-1"><Outlet /></main>
      {!bare && (
        <footer className="border-t-4 border-ink bg-ink px-4 py-6 text-center text-sm text-paper">
          <p className="font-display uppercase">Homestead</p>
          <p>GeoCities (1994-2009), resurrected. This time, your page is yours.</p>
        </footer>
      )}
    </div>
  )
}
