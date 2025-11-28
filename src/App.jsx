import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

// Import Halaman
import LandingPage from './pages/LandingPage'
import DashboardKelas from './pages/DashboardKelas'
import BeritaPage from './pages/BeritaPage'
import GaleriPage from './pages/GaleriPage'
import ShowcasePage from './pages/ShowcasePage' // Pastikan ini ada

// Import Component Chat Tamu
import GuestChat from './components/GuestChat'

function App() {
  return (
    <Router>
      {/* CHATBOT TAMU (Global Component) */}
      <GuestChat />

      <Routes>
        {/* Halaman Publik */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/berita" element={<BeritaPage />} />
        <Route path="/galeri" element={<GaleriPage />} />
        
        {/* INI YANG KURANG WAK: Rute ke halaman Showcase */}
        <Route path="/showcase" element={<ShowcasePage />} />
        
        {/* Halaman Dashboard */}
        <Route path="/kelas-x" element={<DashboardKelas kelasId="X" />} />
        <Route path="/kelas-xi" element={<DashboardKelas kelasId="XI" />} />
        <Route path="/kelas-xii" element={<DashboardKelas kelasId="XII" />} />
      </Routes>
    </Router>
  )
}

export default App