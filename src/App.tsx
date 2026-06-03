import { Routes, Route, useLocation } from 'react-router-dom'
import TopNav from './components/TopNav'
import Home from './pages/Home'
import Why from './pages/Why'
import Blueprint from './pages/Blueprint'
import Orchestration from './pages/Orchestration'
import Agents from './pages/Agents'
import Tools from './pages/Tools'
import Guardrails from './pages/Guardrails'
import Action from './pages/Action'
import Outcome from './pages/Outcome'
import Placement from './pages/Placement'
import Takeaway from './pages/Takeaway'

export default function App() {
  const loc = useLocation()
  return (
    <div className="min-h-full flex flex-col">
      <TopNav />

      <main key={loc.pathname} className="flex-1 anim-float-in">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/why" element={<Why />} />
          <Route path="/blueprint" element={<Blueprint />} />
          <Route path="/orchestration" element={<Orchestration />} />
          <Route path="/agents" element={<Agents />} />
          <Route path="/tools" element={<Tools />} />
          <Route path="/guardrails" element={<Guardrails />} />
          <Route path="/action" element={<Action />} />
          <Route path="/outcome" element={<Outcome />} />
          <Route path="/placement" element={<Placement />} />
          <Route path="/takeaway" element={<Takeaway />} />
        </Routes>
      </main>

      <footer className="border-t border-white/5 py-5 text-center text-xs text-paper/40">
        A hands-on tour of a real multi-agent system — six layers, one refund. Everything runs in your browser; no API keys, no data leaves the page.
      </footer>
    </div>
  )
}
