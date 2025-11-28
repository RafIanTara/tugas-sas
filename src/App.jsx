import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

// Import Halaman Utama
import LandingPage from './pages/LandingPage'
import DashboardKelas from './pages/DashboardKelas'
import BeritaPage from './pages/BeritaPage'
import GaleriPage from './pages/GaleriPage'
import ShowcasePage from './pages/ShowcasePage'

// Import Halaman E-Book & Baca Artikel (INI YANG KEMARIN KURANG WAK)
import EbookPage from './pages/EbookPage'
import BacaArtikel from './pages/BacaArtikel'

// Import Component Chat Tamu
import GuestChat from './components/GuestChat'

function App() {
  return (
    <Router>
      {/* CHATBOT TAMU (Global Component) */}
      <GuestChat />

      <Routes>
        {/* --- ZONE PUBLIK --- */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/berita" element={<BeritaPage />} />
        <Route path="/galeri" element={<GaleriPage />} />
        <Route path="/showcase" element={<ShowcasePage />} />
        
        {/* --- ZONE E-LIBRARY (BARU) --- */}
        {/* Halaman Daftar Ebook */}
        <Route path="/ebook" element={<EbookPage />} />
        
        {/* Halaman Baca Detail (Penting: :id adalah variabel dinamis) */}
        <Route path="/artikel/:id" element={<BacaArtikel />} />
        
        {/* --- ZONE DASHBOARD KELAS --- */}
        <Route path="/kelas-x" element={<DashboardKelas kelasId="X" />} />
        <Route path="/kelas-xi" element={<DashboardKelas kelasId="XI" />} />
        <Route path="/kelas-xii" element={<DashboardKelas kelasId="XII" />} />
      </Routes>
    </Router>
  )
}

export default App