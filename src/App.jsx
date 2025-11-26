// src/App.jsx
import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

// Import Halaman
import LandingPage from './pages/LandingPage'
import DashboardKelas from './pages/DashboardKelas'
// Nanti kamu perlu buat file ini (saya kasih template kosong di bawah)
import BeritaPage from './pages/BeritaPage' 
import GaleriPage from './pages/GaleriPage'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        
        {/* HALAMAN BARU BUAT ORANG LUAR */}
        <Route path="/berita" element={<BeritaPage />} />
        <Route path="/galeri" element={<GaleriPage />} />

        {/* DASHBOARD KELAS */}
        <Route path="/kelas-x" element={<DashboardKelas kelasId="X" />} />
        <Route path="/kelas-xi" element={<DashboardKelas kelasId="XI" />} />
        <Route path="/kelas-xii" element={<DashboardKelas kelasId="XII" />} />
      </Routes>
    </Router>
  )
}

export default App