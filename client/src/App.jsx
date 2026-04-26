import { Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Home from './pages/Home'
import PinEntry from './pages/PinEntry'
import Dashboard from './pages/Dashboard'
import Leaderboard from './pages/Leaderboard'

export default function App() {
  return (
    <AnimatePresence mode="wait">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login/:name" element={<PinEntry />} />
        <Route path="/dashboard/:name" element={<Dashboard />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
      </Routes>
    </AnimatePresence>
  )
}
