import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
    Users, Globe, LayoutDashboard, Calendar, X, Tag, BookOpen, 
    Wifi, Menu, Monitor, Cpu, Clock, ArrowRight, Hourglass, 
    MapPin, Phone, Instagram, Facebook, Mail 
} from 'lucide-react'
import logoSekolah from '../assets/images/logosmk.png'
import logoJurusan from '../assets/images/logotkj.jpg'

import { collection, query, getDocs, limit, orderBy, doc, getDoc } from "firebase/firestore"
import { db } from "../services/firebase"

// ==========================================
// 1. COMPONENT: NAVBAR WIDGET (PERMANEN)
// ==========================================
const NavbarWidget = ({ currentTime, nextPrayer }) => {
    return (
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="hidden md:flex items-center bg-slate-50/80 backdrop-blur-md border border-slate-200 rounded-full shadow-sm px-5 py-1.5 gap-4">
                <div className="flex items-center gap-2">
                    <Clock size={16} className="text-[#002f6c]" />
                    <span className="text-sm font-black text-[#002f6c] font-mono tracking-tight">
                        {currentTime} <span className="text-[10px] text-slate-400 font-bold">WIB</span>
                    </span>
                </div>
                <div className="w-px h-4 bg-slate-300"></div>
                <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Menuju</span>
                    <span className="text-sm font-bold text-[#00994d]">{nextPrayer.name}</span>
                    <span className="bg-green-100 text-[#00994d] text-[10px] font-bold px-1.5 py-0.5 rounded border border-green-200">
                        {nextPrayer.time}
                    </span>
                </div>
            </div>
        </div>
    )
}

// ==========================================
// 2. COMPONENT: EVENT BANNER (COUNTDOWN)
// ==========================================
const EventBanner = ({ landingCountdown, timeLeftEvent }) => {
    if (!landingCountdown.targetDate || new Date(landingCountdown.targetDate) <= new Date()) return null;

    return (
        <div className="bg-white py-12 border-b border-slate-100">
            <div className="max-w-4xl mx-auto px-4">
                <div className="bg-gradient-to-r from-[#00994d] to-emerald-600 rounded-3xl p-1 shadow-2xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                    <div className="bg-[#002f6c] rounded-[1.4rem] p-8 md:p-10 relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="text-center md:text-left flex-1">
                            <div className="inline-flex items-center gap-2 bg-white/10 text-emerald-300 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-3 border border-emerald-500/30">
                                <Hourglass size={12} className="animate-spin-slow"/> Sedang Berjalan
                            </div>
                            <h3 className="text-2xl md:text-3xl font-black text-white leading-tight mb-2">
                                {landingCountdown.title}
                            </h3>
                            <p className="text-blue-200 text-sm">Waktu tersisa hingga acara dimulai:</p>
                        </div>
                        <div className="flex gap-3">
                            {[
                                { label: 'HARI', val: timeLeftEvent.d },
                                { label: 'JAM', val: timeLeftEvent.h },
                                { label: 'MENIT', val: timeLeftEvent.m },
                                { label: 'DETIK', val: timeLeftEvent.s }
                            ].map((item, i) => (
                                <div key={i} className="flex flex-col items-center">
                                    <div className="w-14 h-14 md:w-16 md:h-16 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center shadow-inner backdrop-blur-sm">
                                        <span className="text-xl md:text-2xl font-black text-white tabular-nums">{item.val}</span>
                                    </div>
                                    <span className="text-[9px] font-bold text-emerald-400 mt-2 tracking-wider">{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ==========================================
// 3. MAIN PAGE
// ==========================================
export default function LandingPage() {
  const navigate = useNavigate()
  const mainSchoolWebsite = "https://smkmuh1metro.sch.id"
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  // Data State
  const [featuredNews, setFeaturedNews] = useState([])
  const [prayerTimes, setPrayerTimes] = useState(null)
  const [nextPrayer, setNextPrayer] = useState({ name: '-', time: '-' })
  const [landingCountdown, setLandingCountdown] = useState({ title: '', targetDate: null })
  
  // Time State
  const [currentTime, setCurrentTime] = useState('') 
  const [timeLeftEvent, setTimeLeftEvent] = useState({ d: 0, h: 0, m: 0, s: 0 })
  const [selectedNews, setSelectedNews] = useState(null)
  const [isScrolled, setIsScrolled] = useState(false)

  // 1. FETCH DATA
  useEffect(() => {
    const fetchAll = async () => {
        try {
            const qNews = query(collection(db, "berita_sekolah"), orderBy("createdAt", "desc"), limit(3))
            const snapNews = await getDocs(qNews)
            setFeaturedNews(snapNews.docs.map(d => ({ id: d.id, ...d.data() })))

            const date = new Date()
            const today = date.toISOString().split('T')[0].split('-').reverse().join('-') 
            const res = await fetch(`https://api.aladhan.com/v1/timingsByCity/${today}?city=Metro&country=Indonesia&method=20`)
            const data = await res.json()
            if (data.code === 200) setPrayerTimes(data.data.timings)

            const docRef = doc(db, "settings", "landing_countdown")
            const snapCountdown = await getDoc(docRef)
            if (snapCountdown.exists()) setLandingCountdown(snapCountdown.data())
        } catch (e) { console.error("Fetch Error:", e) }
    }
    fetchAll()
  }, [])

  // 2. SCROLL LISTENER
  useEffect(() => {
      const handleScroll = () => setIsScrolled(window.scrollY > 10)
      window.addEventListener('scroll', handleScroll)
      return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // 3. LOGIC JAM & SHOLAT
  useEffect(() => {
      if (!prayerTimes) return
      
      const interval = setInterval(() => {
          const now = new Date()
          setCurrentTime(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/\./g, ':'))

          const timings = { 'Subuh': prayerTimes.Fajr, 'Dzuhur': prayerTimes.Dhuhr, 'Ashar': prayerTimes.Asr, 'Maghrib': prayerTimes.Maghrib, 'Isya': prayerTimes.Isha }
          let upcoming = null, minDiff = Infinity
          
          for (const [name, time] of Object.entries(timings)) {
              const [h, m] = time.split(':').map(Number)
              const pDate = new Date(); pDate.setHours(h, m, 0, 0)
              const diff = pDate - now
              
              if (diff < 0 && diff > -600000) { upcoming = { name, time }; break }
              if (diff > 0 && diff < minDiff) { minDiff = diff; upcoming = { name, time }; }
          }
          
          if (!upcoming) upcoming = { name: 'Subuh', time: prayerTimes.Fajr }
          setNextPrayer(upcoming)
      }, 1000)
      return () => clearInterval(interval)
  }, [prayerTimes])

  // 4. LOGIC EVENT COUNTDOWN
  useEffect(() => {
      if (!landingCountdown.targetDate) return
      const interval = setInterval(() => {
          const diff = new Date(landingCountdown.targetDate) - new Date()
          if (diff > 0) {
              setTimeLeftEvent({
                  d: Math.floor(diff / (1000 * 60 * 60 * 24)),
                  h: Math.floor((diff / (1000 * 60 * 60)) % 24),
                  m: Math.floor((diff / 1000 / 60) % 60),
                  s: Math.floor((diff / 1000) % 60)
              })
          }
      }, 1000)
      return () => clearInterval(interval)
  }, [landingCountdown])

  return (
    <div className="min-h-screen font-sans text-slate-800 bg-white overflow-x-hidden">
      
      {/* NAVBAR */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${isScrolled ? 'bg-[#002f6c]/95 backdrop-blur-md shadow-md border-white/10 py-0' : 'bg-[#002f6c] border-transparent py-2'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex justify-between h-16 items-center">
            
            {/* Logo - Text Putih */}
            <div className="flex items-center gap-3 cursor-pointer z-20" onClick={() => window.scrollTo(0,0)}>
              <div className="h-9 w-9 rounded-lg overflow-hidden border border-white/20 shadow-sm bg-white">
                 <img src={logoJurusan} alt="Logo TKJ" className="h-full w-full object-cover"/>
              </div>
              <div className="leading-tight">
                  <span className="block font-black text-base tracking-tight text-white">TKJ CENTER</span>
                  <span className="block font-semibold text-emerald-400 text-[9px] tracking-wider uppercase">SMK Muhammadiyah 1 Metro</span>
              </div>
            </div>
            
            {/* WIDGET TENGAH (Kapsul Putih di atas Biru) */}
            <NavbarWidget currentTime={currentTime} nextPrayer={nextPrayer} />

            {/* Menu Desktop - Text Putih/Biru Muda */}
            <div className="hidden md:flex space-x-6 items-center font-bold text-sm text-blue-100 z-20">
              <button onClick={() => document.getElementById('kelas').scrollIntoView({behavior: 'smooth'})} className="hover:text-white transition-colors">Portal</button>
              <button onClick={() => document.getElementById('news').scrollIntoView({behavior: 'smooth'})} className="hover:text-white transition-colors">Berita</button>
              <button onClick={() => navigate('/showcase')} className="hover:text-white transition-colors">Showcase</button>
              
              {/* Tombol Web Sekolah (Invert: Putih Teks Biru) */}
              <a href={mainSchoolWebsite} target="_blank" rel="noreferrer" className="bg-white hover:bg-blue-50 text-[#002f6c] px-4 py-2 rounded-full transition-all shadow-sm text-xs font-bold flex items-center gap-2">
                <Globe size={14}/> Web
              </a>
            </div>

            {/* Mobile Toggle Putih */}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-white p-2 z-20">
                {mobileMenuOpen ? <X size={24}/> : <Menu size={24}/>}
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
            <div className="md:hidden bg-white border-b border-slate-100 p-4 space-y-2 shadow-xl absolute w-full text-slate-800">
                <button onClick={() => setMobileMenuOpen(false)} className="block w-full text-left font-bold py-2 text-[#002f6c]">Portal Siswa</button>
                <button onClick={() => setMobileMenuOpen(false)} className="block w-full text-left font-bold py-2 text-[#002f6c]">Berita</button>
                <a href={mainSchoolWebsite} className="block w-full text-left font-bold py-2 text-[#00994d]">Web Utama</a>
            </div>
        )}
      </nav>
      {/* HERO SECTION */}
      <header className="relative bg-slate-50 pt-28 pb-16 lg:pt-36 lg:pb-24 overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-100 rounded-full blur-3xl opacity-40 mix-blend-multiply -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-green-100 rounded-full blur-3xl opacity-40 mix-blend-multiply -ml-20 -mb-20"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="text-center lg:text-left space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-[#002f6c] text-xs font-bold uppercase tracking-wide">
                        <span className="w-2 h-2 rounded-full bg-[#00994d] animate-pulse"></span>
                        Portal Resmi Jurusan TKJ
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-[#002f6c] leading-tight">
                        Masa Depan Digital <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00994d] to-emerald-500">Dimulai Di Sini.</span>
                    </h1>
                    <p className="text-lg text-slate-600 leading-relaxed max-w-lg mx-auto lg:mx-0">
                        Bergabunglah dengan Teknik Komputer & Jaringan SMK Muhammadiyah 1 Metro. Mencetak teknisi handal yang siap kerja dan berkarakter Islami.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
                        <button onClick={() => document.getElementById('kelas').scrollIntoView({behavior: 'smooth'})} className="bg-[#002f6c] hover:bg-[#001a3d] text-white px-8 py-3.5 rounded-xl font-bold text-sm shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2">
                            Akses Portal Siswa <ArrowRight size={18}/>
                        </button>
                        <button onClick={() => navigate('/galeri')} className="bg-white border border-slate-200 text-[#002f6c] hover:bg-slate-50 px-8 py-3.5 rounded-xl font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2">
                            <BookOpen size={18}/> Galeri Foto
                        </button>
                    </div>
                </div>

                <div className="relative hidden lg:block group">
                    <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white rotate-1 hover:rotate-0 transition-transform duration-500 bg-slate-200">
                        <img src="https://smkmuh1metro.sch.id/wp-content/uploads/2017/02/simulasi4_mini.jpg" alt="Hero" className="w-full h-[400px] object-cover"/>
                        <div className="absolute inset-0 bg-gradient-to-t from-[#002f6c]/90 via-transparent to-transparent opacity-80"></div>
                        <div className="absolute bottom-6 left-6 text-white">
                            <div className="flex items-center gap-2 mb-1">
                                <Wifi size={16} className="text-[#00994d]" />
                                <span className="text-xs font-bold uppercase tracking-wider text-green-300">Fasilitas Utama</span>
                            </div>
                            <p className="font-bold text-xl">Laboratorium Informatika</p>
                            <p className="text-sm opacity-90">Standar Industri</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </header>

      {/* --- EVENT BANNER --- */}
      <EventBanner 
          landingCountdown={landingCountdown}
          timeLeftEvent={timeLeftEvent}
      />

      {/* --- PORTAL KELAS --- */}
      <section id="kelas" className="py-20 bg-[#002f6c] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black mb-4">Akses Kelas Digital</h2>
            <p className="text-blue-200">Login untuk mengakses materi, tugas, dan ujian.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
                { id: 'X', path: '/kelas-x', title: 'Kelas X', sub: 'Dasar TJKT', icon: <Wifi/> },
                { id: 'XI', path: '/kelas-xi', title: 'Kelas XI', sub: 'Konsentrasi', icon: <Cpu/> },
                { id: 'XII', path: '/kelas-xii', title: 'Kelas XII', sub: 'Manajemen', icon: <Globe/> }
            ].map((k) => (
                <div key={k.id} className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-all text-center group cursor-pointer backdrop-blur-sm" onClick={() => navigate(k.path)}>
                    <div className="bg-white/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-inner">
                        {React.cloneElement(k.icon, { size: 32 })}
                    </div>
                    <h3 className="text-xl font-bold mb-1">{k.title}</h3>
                    <p className="text-sm text-blue-200 mb-6 uppercase tracking-wider">{k.sub}</p>
                    <button className="w-full py-3 bg-white text-[#002f6c] font-bold rounded-lg text-sm hover:bg-slate-100 transition-colors">Masuk Portal</button>
                </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- BERITA --- */}
      <section id="news" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end mb-10">
                <h2 className="text-3xl font-black text-[#002f6c]">Berita Terbaru</h2>
                <button onClick={() => navigate('/berita')} className="text-sm font-bold text-[#00994d] hover:underline flex items-center gap-1">Lihat Semua <ArrowRight size={14}/></button>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
                {featuredNews.map((item) => (
                    <div key={item.id} onClick={() => setSelectedNews(item)} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all cursor-pointer group border border-slate-100">
                        <div className="h-48 bg-slate-200 overflow-hidden relative">
                            {item.image ? <img src={item.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/> : <div className="w-full h-full flex items-center justify-center text-slate-400"><Tag/></div>}
                            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2 py-1 rounded text-[10px] font-bold text-[#00994d] uppercase shadow-sm">
                                {item.category}
                            </div>
                        </div>
                        <div className="p-5">
                            <h3 className="font-bold text-slate-800 mb-2 line-clamp-2 hover:text-[#002f6c] transition-colors">{item.title}</h3>
                            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                                <Calendar size={12}/> {item.dateString}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* --- FOOTER (DIUPDATE SESUAI REQUEST) --- */}
      <footer className="bg-[#002f6c] text-white pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-12 mb-12">
                
                {/* KOLOM 1: IDENTITAS */}
                <div>
                    <div className="flex items-center gap-3 mb-6">

                        <div>
                            <h4 className="font-black text-lg leading-none">TKJ SMK Muhammadiyah 1</h4>
                            <p className="text-xs font-bold text-[#00994d] tracking-[0.2em] mt-1">METRO - LAMPUNG</p>
                        </div>
                    </div>
                    
                    <div className="flex gap-4">
                        <a href="https://tiktok.com/@sekolahmu" target="_blank" rel="noreferrer" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#00994d] transition-colors">
                            <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                width="18" 
                                height="18" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="2" 
                                strokeLinecap="round" 
                                strokeLinejoin="round"
                            >
                                <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
                            </svg>
                        </a>
                        <a href="https://instagram.com" target="_blank" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#00994d] transition-colors"><Instagram size={18}/></a>
                        <a href="mailto:muhammad.rafa163418@smk.belajar.id" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#00994d] transition-colors"><Mail size={18}/></a>
                    </div>
                </div>

                {/* KOLOM 2: KONTAK */}
                <div>
                    <h4 className="font-bold text-lg mb-6 flex items-center gap-2 text-[#00994d]">
                        <Phone size={20}/> Hubungi Kami
                    </h4>
                    <ul className="space-y-4 text-sm text-blue-100">
                        <li className="flex items-start gap-3">
                            <MapPin size={18} className="shrink-0 mt-1 text-[#00994d]"/>
                            <span>SMK Muhammadiyah 1 Metro<br></br>Jl. Tawes, Yosodadi, Kec. Metro Tim., Kota Metro, Lampung 34111</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <Phone size={18} className="shrink-0 text-[#00994d]"/>
                            <span>+62 895-6328-76627</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <Mail size={18} className="shrink-0 text-[#00994d]"/>
                            <span>muhammad.rafa163418@smk.belajar.id</span>
                        </li>
                    </ul>
                </div>

                {/* KOLOM 3: MAPS (Opsional/Placeholder) */}
                <div className="rounded-xl overflow-hidden h-48 bg-slate-800 border border-white/10 relative group shadow-lg">
                    {/* Teks Overlay (Pointer Events None agar tembus klik ke peta) */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                        <div className="bg-[#00994d] text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                            Buka di Google Maps
                        </div>
                    </div>
                    
                    {/* Iframe Peta Asli */}
                    <iframe 
                        title="Lokasi Sekolah"
                        src="https://maps.google.com/maps?q=SMK%20Muhammadiyah%201%20Metro&t=&z=15&ie=UTF8&iwloc=&output=embed"
                        className="w-full h-full border-0 grayscale hover:grayscale-0 transition-all duration-500" 
                        allowFullScreen
                        loading="lazy"
                    ></iframe>
                </div>

            </div>
            <div className="border-t border-white/10 pt-8 text-center">
                <p className="text-xs text-blue-300 font-medium">&copy; 2025 Tim IT & Pengembangan TKJ SMK Muhammadiyah 1 Metro. Developed by Rafiantara.</p>
            </div>
        </div>
      </footer>

      {/* MODAL NEWS */}
      {selectedNews && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4 backdrop-blur-sm" onClick={() => setSelectedNews(null)}>
            <div className="bg-white max-w-2xl w-full rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
                <div className="h-64 bg-slate-200 relative">
                    {selectedNews.image && <img src={selectedNews.image} className="w-full h-full object-cover"/>}
                    <button onClick={() => setSelectedNews(null)} className="absolute top-4 right-4 bg-black/50 hover:bg-red-500 text-white p-2 rounded-full transition-colors"><X size={20}/></button>
                </div>
                <div className="p-8">
                    <span className="text-xs font-bold text-[#00994d] uppercase bg-green-50 px-2.5 py-1 rounded-md tracking-wide">{selectedNews.category}</span>
                    <h2 className="text-2xl font-bold text-[#002f6c] mt-4 mb-4 leading-tight">{selectedNews.title}</h2>
                    <div className="flex items-center gap-4 text-xs text-slate-400 font-bold mb-6 border-b border-slate-100 pb-4">
                        <span className="flex items-center gap-1"><Calendar size={14}/> {selectedNews.dateString}</span>
                        <span className="flex items-center gap-1"><Users size={14}/> {selectedNews.author}</span>
                    </div>
                    <p className="text-slate-600 whitespace-pre-line leading-relaxed text-sm md:text-base">{selectedNews.content}</p>
                </div>
            </div>
        </div>
      )}
    </div>
  )
}