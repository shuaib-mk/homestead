import { Route, Routes } from 'react-router-dom'
import Shell from './components/Shell'
import Landing from './pages/Landing'
import Explore from './pages/Explore'
import Claim from './pages/Claim'
import Builder from './pages/Builder'
import PublicPage from './pages/PublicPage'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <Routes>
      <Route element={<Shell />}>
        <Route path="/" element={<Landing />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/new" element={<Claim />} />
        <Route path="/build/:neighbourhood/:name" element={<Builder />} />
        <Route path="/:neighbourhood/:name" element={<PublicPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
