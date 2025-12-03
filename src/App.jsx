import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

// Import Auth Provider (Untuk Cek Login User)
import { AuthProvider } from './context/AuthContext'

// Import Halaman Utama
import LandingPage from './pages/LandingPage'
import DashboardKelas from './pages/DashboardKelas'
import BeritaPage from './pages/BeritaPage'
import GaleriPage from './pages/GaleriPage'
import ShowcasePage from './pages/ShowcasePage'
import EbookPage from './pages/EbookPage'
import BacaArtikel from './pages/BacaArtikel'
import InfoAnggotaPage from './pages/InfoAnggotaPage'

// Import Halaman Auth (Login/Register)
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'

// Import Component Tambahan (Global)
import GuestChat from './components/GuestChat'

function App() {
  return (
    // 1. AuthProvider membungkus semua agar data user bisa diakses di mana saja
    <AuthProvider>
      <Router>
        
        {/* 2. Chatbot/GuestChat ditaruh di sini agar muncul di semua halaman */}
        <GuestChat />

        <Routes>
          {/* --- ZONE AUTHENTICATION --- */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* --- ZONE PUBLIK (Landing Page & Menu) --- */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/berita" element={<BeritaPage />} />
          <Route path="/galeri" element={<GaleriPage />} />
          <Route path="/showcase" element={<ShowcasePage />} />
          <Route path="/info-kelompok" element={<InfoAnggotaPage />} />
          
          {/* --- ZONE E-LIBRARY --- */}
          <Route path="/ebook" element={<EbookPage />} />
          <Route path="/artikel/:id" element={<BacaArtikel />} />
          
          {/* --- ZONE DASHBOARD KELAS (Proteksi User) --- */}
          {/* DashboardKelas nanti akan mengecek apakah user boleh masuk atau tidak */}
          <Route path="/kelas-x" element={<DashboardKelas kelasId="X" />} />
          <Route path="/kelas-xi" element={<DashboardKelas kelasId="XI" />} />
          <Route path="/kelas-xii" element={<DashboardKelas kelasId="XII" />} />

          {/* Opsional: Route 404 jika halaman tidak ditemukan */}
          <Route path="*" element={<div className="text-center p-10">404 - Halaman Tidak Ditemukan</div>} />

        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App