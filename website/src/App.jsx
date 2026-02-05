/**
 * App Component
 * 
 * Main router component that handles navigation
 * Routes:
 * - / : Home/Marketing page
 * - /dashboard : Analytics dashboard
 */

import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  )
}

export default App
