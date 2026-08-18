import { Route, Routes } from 'react-router-dom'
import ScrollManager from './components/ScrollManager'
import PageDecoration from './components/PageDecoration'
import Home from './pages/Home'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <div className="home-stage theme-aurora">
      <ScrollManager />
      <PageDecoration />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  )
}
