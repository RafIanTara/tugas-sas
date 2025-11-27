import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

// Import Halaman
import LandingPage from './pages/LandingPage'
import DashboardKelas from './pages/DashboardKelas'
import BeritaPage from './pages/BeritaPage'
import GaleriPage from './pages/GaleriPage'

// Import Component Chat Tamu (BARU)
import GuestChat from './components/GuestChat' // Pastikan path-nya benar

function App() {
  return (
    <Router>
      {/* CHATBOT TAMU (Global Component) */}
      {/* Dia punya otak sendiri buat ngecek kapan harus muncul/hilang */}
      <GuestChat />

      <Routes>
        {/* Halaman Publik */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/berita" element={<BeritaPage />} />
        <Route path="/galeri" element={<GaleriPage />} />
        
        {/* Halaman Dashboard (Chatbot Tamu bakal otomatis ngumpet disini) */}
        <Route path="/kelas-x" element={<DashboardKelas kelasId="X" />} />
        <Route path="/kelas-xi" element={<DashboardKelas kelasId="XI" />} />
        <Route path="/kelas-xii" element={<DashboardKelas kelasId="XII" />} />
      </Routes>
    </Router>
  )
}

export default App