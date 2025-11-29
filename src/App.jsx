import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

// Import Auth Provider
import { AuthProvider } from './context/AuthContext' // <--- TAMBAHAN

// Import Halaman Utama
import LandingPage from './pages/LandingPage'
import DashboardKelas from './pages/DashboardKelas'
import BeritaPage from './pages/BeritaPage'
import GaleriPage from './pages/GaleriPage'
import ShowcasePage from './pages/ShowcasePage'
import EbookPage from './pages/EbookPage'
import BacaArtikel from './pages/BacaArtikel'

// Import Halaman Auth (BARU)
import LoginPage from './pages/LoginPage'     // <--- TAMBAHAN
import RegisterPage from './pages/RegisterPage' // <--- TAMBAHAN

// Import Component Chat Tamu
import GuestChat from './components/GuestChat'

function App() {
  return (
    // Bungkus Router dengan AuthProvider agar state user bisa diakses di mana saja
    <AuthProvider>
      <Router>
        {/* CHATBOT TAMU (Global Component) */}
        <GuestChat />

        <Routes>
          {/* --- ZONE AUTH (BARU) --- */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* --- ZONE PUBLIK --- */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/berita" element={<BeritaPage />} />
          <Route path="/galeri" element={<GaleriPage />} />
          <Route path="/showcase" element={<ShowcasePage />} />
          
          {/* --- ZONE E-LIBRARY --- */}
          <Route path="/ebook" element={<EbookPage />} />
          <Route path="/artikel/:id" element={<BacaArtikel />} />
          
          {/* --- ZONE DASHBOARD KELAS --- */}
          {/* Logic proteksi akses akan kita pasang di dalam file DashboardKelas.jsx nanti */}
          <Route path="/kelas-x" element={<DashboardKelas kelasId="X" />} />
          <Route path="/kelas-xi" element={<DashboardKelas kelasId="XI" />} />
          <Route path="/kelas-xii" element={<DashboardKelas kelasId="XII" />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App