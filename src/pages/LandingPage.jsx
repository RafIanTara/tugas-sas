import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
    Users, Globe, LayoutDashboard, Calendar, X, Tag, BookOpen, 
    Wifi, Menu, Monitor, Cpu, Clock, ArrowRight, Hourglass, 
    MapPin, Phone, Instagram, Facebook, Mail, ExternalLink
} from 'lucide-react'
import logoSekolah from '../assets/images/logosmk.png'
import logoJurusan from '../assets/images/logotkj.jpg'

import { collection, query, getDocs, limit, orderBy, doc, getDoc } from "firebase/firestore"
import { db } from "../services/firebase"

// ==========================================
// 1. COMPONENT: NAVBAR WIDGET (Dibuat Hidden di HP biar rapi)
// ==========================================
const NavbarWidget = ({ currentTime, nextPrayer }) => {
    return (
        <div className="hidden lg:flex absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="flex items-center bg-slate-50/90 backdrop-blur-md border border-slate-200 rounded-full shadow-sm px-5 py-1.5 gap-4">
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
        <div className="bg-white py-8 border-b border-slate-100">
            <div className="max-w-7xl mx-auto px-4">
                <div className="bg-gradient-to-r from-[#00994d] to-emerald-600 rounded-2xl p-1 shadow-lg relative overflow-hidden group">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                    <div className="bg-[#002f6c] rounded-xl p-6 md:p-8 relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="text-center md:text-left flex-1">
                            <div className="inline-flex items-center gap-2 bg-white/10 text-emerald-300 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2 border border-emerald-500/30">
                                <Hourglass size={12} className="animate-spin-slow"/> Sedang Berjalan
                            </div>
                            <h3 className="text-xl md:text-2xl font-black text-white leading-tight">
                                {landingCountdown.title}
                            </h3>
                        </div>
                        <div className="flex gap-3">
                            {[
                                { label: 'HARI', val: timeLeftEvent.d },
                                { label: 'JAM', val: timeLeftEvent.h },
                                { label: 'MENIT', val: timeLeftEvent.m },
                                { label: 'DETIK', val: timeLeftEvent.s }
                            ].map((item, i) => (
                                <div key={i} className="flex flex-col items-center">
                                    <div className="w-12 h-12 md:w-14 md:h-14 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center shadow-inner backdrop-blur-sm">
                                        <span className="text-lg md:text-xl font-black text-white tabular-nums">{item.val}</span>
                                    </div>
                                    <span className="text-[8px] font-bold text-emerald-400 mt-1 tracking-wider">{item.label}</span>
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
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-[#002f6c]/95 backdrop-blur-md shadow-md py-2' : 'bg-[#002f6c] py-4'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex justify-between items-center h-12">
            
            {/* Logo */}
            <div className="flex items-center gap-3 cursor-pointer z-20" onClick={() => window.scrollTo(0,0)}>
              <div className="h-10 w-10 rounded-lg overflow-hidden border-2 border-white/20 shadow-sm bg-white">
                 {/* PASTIKAN PATH GAMBAR BENAR */}
                 <img src={logoJurusan} alt="Logo TKJ" className="h-full w-full object-cover"/>
              </div>
              <div className="leading-tight">
                  <span className="block font-black text-lg tracking-tight text-white">TKJ CENTER</span>
                  <span className="block font-semibold text-emerald-400 text-[10px] tracking-widest uppercase">SMK Muhammadiyah 1</span>
              </div>
            </div>
            
            {/* WIDGET TENGAH (Hidden di Mobile) */}
            <NavbarWidget currentTime={currentTime} nextPrayer={nextPrayer} />

       {/* Menu Desktop */}
<div className="hidden md:flex space-x-8 items-center font-bold text-sm text-blue-100 z-20">
    
    <div className="ml-64 flex space-x-8"> 
        <button onClick={() => document.getElementById('kelas').scrollIntoView({behavior: 'smooth'})} className="hover:text-white transition-colors">Portal</button>
        <button onClick={() => document.getElementById('news').scrollIntoView({behavior: 'smooth'})} className="hover:text-white transition-colors">Berita</button>
        <button onClick={() => navigate('/showcase')} className="hover:text-white transition-colors">Showcase</button>
        <button onClick={() => navigate('/ebook')} className="hover:text-white transition-colors">E-Library</button>
    </div>
    
    <a href={mainSchoolWebsite} target="_blank" rel="noreferrer" className="bg-white hover:bg-blue-50 text-[#002f6c] px-4 py-2 rounded-full transition-all shadow-sm text-xs font-bold flex items-center gap-2">
      <Globe size={14}/> Website Sekolah
    </a>
</div>

            {/* Mobile Toggle */}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-white p-2 z-20 hover:bg-white/10 rounded-lg">
                {mobileMenuOpen ? <X size={24}/> : <Menu size={24}/>}
            </button>
          </div>
        </div>
        
        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
            <div className="md:hidden bg-white border-t border-slate-100 shadow-xl absolute w-full left-0 top-full animate-in slide-in-from-top-5">
                <div className="flex flex-col p-4 space-y-2">
                    <button onClick={() => {setMobileMenuOpen(false); document.getElementById('kelas').scrollIntoView({behavior: 'smooth'})}} className="w-full text-left font-bold px-4 py-3 rounded-lg text-slate-700 hover:bg-slate-50 flex items-center gap-2"><LayoutDashboard size={18}/> Portal Siswa</button>
                    <button onClick={() => {setMobileMenuOpen(false); navigate('/showcase')}} className="w-full text-left font-bold px-4 py-3 rounded-lg text-slate-700 hover:bg-slate-50 flex items-center gap-2"><Monitor size={18}/> Showcase Project</button>
                    <button onClick={() => {setMobileMenuOpen(false); navigate('/ebook')}} className="w-full text-left font-bold px-4 py-3 rounded-lg text-slate-700 hover:bg-slate-50 flex items-center gap-2"><BookOpen size={18}/> E-Library</button>
                    <div className="h-px bg-slate-100 my-2"></div>
                    <a href={mainSchoolWebsite} className="w-full text-left font-bold px-4 py-3 rounded-lg text-[#00994d] bg-green-50 flex items-center gap-2"><Globe size={18}/> Web Sekolah Utama</a>
                </div>
            </div>
        )}
      </nav>

      {/* HERO SECTION */}
      <header className="relative bg-slate-50 pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background Blobs (Fixed overflow) */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-200/40 rounded-full blur-[100px] -mr-20 -mt-20 mix-blend-multiply"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-green-200/40 rounded-full blur-[100px] -ml-20 -mb-20 mix-blend-multiply"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                <div className="text-center lg:text-left space-y-8">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-[#002f6c] text-xs font-bold uppercase tracking-wide shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-[#00994d] animate-pulse"></span>
                        Portal Resmi Jurusan TKJ
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-[#002f6c] leading-tight tracking-tight">
                        Masa Depan <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00994d] to-emerald-500">Digital</span> Dimulai.
                    </h1>
                    <p className="text-lg text-slate-600 leading-relaxed max-w-lg mx-auto lg:mx-0 font-medium">
                        Pusat informasi, pembelajaran, dan kreativitas siswa Teknik Komputer & Jaringan SMK Muhammadiyah 1 Metro.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
                        <button onClick={() => document.getElementById('kelas').scrollIntoView({behavior: 'smooth'})} className="bg-[#002f6c] hover:bg-[#001a3d] text-white px-8 py-4 rounded-xl font-bold shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2">
                            Akses Portal Siswa <ArrowRight size={18}/>
                        </button>
                        <button onClick={() => navigate('/galeri')} className="bg-white border border-slate-200 text-[#002f6c] hover:bg-slate-50 px-8 py-4 rounded-xl font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2">
                            <BookOpen size={18}/> Galeri Foto
                        </button>
                    </div>
                </div>

                <div className="relative hidden lg:block group">
                    <div className="relative rounded-3xl overflow-hidden shadow-2xl border-[6px] border-white rotate-2 group-hover:rotate-0 transition-transform duration-700 bg-slate-200">
                        {/* Ganti dengan foto lab atau kegiatan asli */}
                        <img src="https://smkmuh1metro.sch.id/wp-content/uploads/2017/02/simulasi4_mini.jpg" alt="Hero" className="w-full h-[500px] object-cover scale-110 group-hover:scale-100 transition-transform duration-700"/>
                        <div className="absolute inset-0 bg-gradient-to-t from-[#002f6c]/90 via-transparent to-transparent opacity-90"></div>
                        <div className="absolute bottom-8 left-8 text-white max-w-xs">
                            <div className="flex items-center gap-2 mb-2">
                                <Wifi size={18} className="text-[#00994d]" />
                                <span className="text-xs font-bold uppercase tracking-wider text-green-300">Fasilitas Utama</span>
                            </div>
                            <p className="font-bold text-2xl leading-tight">Laboratorium Jaringan Standar Industri</p>
                        </div>
                    </div>
                    {/* Floating Badge */}
                    <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce-slow">
                        <div className="bg-green-100 p-2 rounded-lg text-[#00994d]"><Cpu size={24}/></div>
                        <div>
                            <p className="text-xs text-slate-400 font-bold uppercase">Konsentrasi</p>
                            <p className="text-sm font-black text-[#002f6c]">Network Engineer</p>
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
      <section id="kelas" className="py-24 bg-[#002f6c] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-black mb-4">Pilih Kelas Kamu</h2>
            <p className="text-blue-200 text-lg">Login untuk mengakses materi, tugas, dan manajemen kelas digital.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
                { id: 'X', path: '/kelas-x', title: 'KELAS X', sub: 'Dasar TJKT', icon: <Wifi/>, desc: "Informatika Dasar & Jaringan Dasar" },
                { id: 'XI', path: '/kelas-xi', title: 'KELAS XI', sub: 'Konsentrasi', icon: <Cpu/>, desc: "Administrasi Server & Routing" },
                { id: 'XII', path: '/kelas-xii', title: 'KELAS XII', sub: 'Manajemen', icon: <Globe/>, desc: "Troubleshooting & Project Akhir" }
            ].map((k) => (
                <div key={k.id} className="bg-white/5 border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-all text-center group cursor-pointer backdrop-blur-sm relative overflow-hidden" onClick={() => navigate(k.path)}>
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                         {React.cloneElement(k.icon, { size: 120 })}
                    </div>
                    
                    <div className="bg-white/10 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform shadow-inner text-emerald-300">
                        {React.cloneElement(k.icon, { size: 40 })}
                    </div>
                    <h3 className="text-2xl font-black mb-2">{k.title}</h3>
                    <p className="text-xs font-bold text-emerald-400 mb-4 uppercase tracking-widest">{k.sub}</p>
                    <p className="text-sm text-blue-200 mb-8 px-4 leading-relaxed">{k.desc}</p>
                    <button className="w-full py-4 bg-white text-[#002f6c] font-bold rounded-xl text-sm hover:bg-emerald-50 transition-colors shadow-lg flex items-center justify-center gap-2">
                        Masuk Portal <ArrowRight size={16}/>
                    </button>
                </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- BERITA --- */}
      <section id="news" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
                <div>
                    <h2 className="text-3xl md:text-4xl font-black text-[#002f6c] mb-2">Berita & Kegiatan</h2>
                    <p className="text-slate-500">Update terbaru seputar jurusan Teknik Komputer & Jaringan</p>
                </div>
                <button onClick={() => navigate('/berita')} className="bg-white text-[#002f6c] px-6 py-3 rounded-xl border border-slate-200 text-sm font-bold hover:shadow-md transition-all flex items-center gap-2">
                    Lihat Semua <ArrowRight size={16}/>
                </button>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
                {featuredNews.map((item) => (
                    <div key={item.id} onClick={() => setSelectedNews(item)} className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-xl transition-all cursor-pointer group border border-slate-100 flex flex-col h-full hover:-translate-y-1 duration-300">
                        <div className="h-56 bg-slate-200 overflow-hidden relative">
                            {item.image ? (
                                <img src={item.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"/>
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-100"><Tag size={40}/></div>
                            )}
                            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg text-[10px] font-bold text-[#00994d] uppercase shadow-sm">
                                {item.category}
                            </div>
                        </div>
                        <div className="p-6 flex flex-col flex-1">
                            <div className="flex items-center gap-2 text-xs text-slate-400 font-bold mb-3">
                                <Calendar size={14}/> {item.dateString}
                            </div>
                            <h3 className="font-bold text-xl text-slate-800 mb-3 line-clamp-2 group-hover:text-[#002f6c] transition-colors leading-snug">
                                {item.title}
                            </h3>
                            <p className="text-slate-500 text-sm line-clamp-3 mb-4 flex-1">
                                {item.content}
                            </p>
                            <span className="text-[#00994d] text-sm font-bold flex items-center gap-1 mt-auto">
                                Baca Selengkapnya <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform"/>
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-[#002f6c] text-white pt-20 pb-10 border-t-8 border-[#00994d]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-12 lg:gap-20 mb-16">
                
                {/* KOLOM 1: IDENTITAS */}
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-lg p-1">
                             <img src={logoJurusan} className="w-full h-full object-cover rounded"/>
                        </div>
                        <div>
                            <h4 className="font-black text-xl leading-none tracking-tight">TKJ CENTER</h4>
                            <p className="text-xs font-bold text-emerald-400 tracking-[0.2em] mt-1.5 uppercase">SMK Muhammadiyah 1 Metro</p>
                        </div>
                    </div>
                    <p className="text-blue-100 text-sm leading-relaxed opacity-80">
                        Mewujudkan teknisi yang kompeten, berakhlak mulia, dan siap bersaing di dunia industri global.
                    </p>
                    <div className="flex gap-3">
                        <a href="#" className="w-10 h-10 bg-white/5 border border-white/10 rounded-full flex items-center justify-center hover:bg-[#00994d] hover:border-[#00994d] transition-all"><Instagram size={18}/></a>
                        <a href="#" className="w-10 h-10 bg-white/5 border border-white/10 rounded-full flex items-center justify-center hover:bg-[#00994d] hover:border-[#00994d] transition-all"><Facebook size={18}/></a>
                        <a href="mailto:tkj@smkmuh1metro.sch.id" className="w-10 h-10 bg-white/5 border border-white/10 rounded-full flex items-center justify-center hover:bg-[#00994d] hover:border-[#00994d] transition-all"><Mail size={18}/></a>
                    </div>
                </div>

                {/* KOLOM 2: KONTAK */}
                <div>
                    <h4 className="font-bold text-lg mb-8 flex items-center gap-2 text-white">
                        Hubungi Kami
                    </h4>
                    <ul className="space-y-5 text-sm text-blue-100">
                        <li className="flex items-start gap-4 group">
                            <div className="bg-white/10 p-2 rounded-lg text-emerald-400 group-hover:bg-[#00994d] group-hover:text-white transition-colors"><MapPin size={18}/></div>
                            <span className="leading-relaxed">Jl. Tawes, Yosodadi, Kec. Metro Timur, Kota Metro, Lampung 34111</span>
                        </li>
                        <li className="flex items-center gap-4 group">
                             <div className="bg-white/10 p-2 rounded-lg text-emerald-400 group-hover:bg-[#00994d] group-hover:text-white transition-colors"><Phone size={18}/></div>
                            <span>+62 725 41926</span>
                        </li>
                    </ul>
                </div>

                {/* KOLOM 3: SHORTCUT */}
                <div>
                    <h4 className="font-bold text-lg mb-8 text-white">Akses Cepat</h4>
                    <ul className="space-y-3 text-sm font-medium text-blue-200">
                        <li><button onClick={() => navigate('/kelas-x')} className="hover:text-white hover:translate-x-2 transition-all flex items-center gap-2"><ArrowRight size={12}/> Portal Kelas X</button></li>
                        <li><button onClick={() => navigate('/kelas-xi')} className="hover:text-white hover:translate-x-2 transition-all flex items-center gap-2"><ArrowRight size={12}/> Portal Kelas XI</button></li>
                        <li><button onClick={() => navigate('/kelas-xii')} className="hover:text-white hover:translate-x-2 transition-all flex items-center gap-2"><ArrowRight size={12}/> Portal Kelas XII</button></li>
                        <li><button onClick={() => navigate('/showcase')} className="hover:text-white hover:translate-x-2 transition-all flex items-center gap-2"><ArrowRight size={12}/> Showcase Project</button></li>
                    </ul>
                </div>

            </div>
            
            <div className="border-t border-white/10 pt-8 text-center flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-xs text-blue-300 font-medium">© 2025 TKJ SMK Muhammadiyah 1 Metro.</p>
                <p className="text-xs text-blue-400 font-medium flex items-center gap-1">
                    Developed with ❤️ by <span className="text-white font-bold">Rafiantara</span>
                </p>
            </div>
        </div>
      </footer>

      {/* MODAL NEWS DETAIL */}
      {selectedNews && (
        <div className="fixed inset-0 bg-slate-900/80 flex items-center justify-center z-[100] p-4 backdrop-blur-sm" onClick={() => setSelectedNews(null)}>
            <div className="bg-white max-w-2xl w-full rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="h-64 bg-slate-200 relative shrink-0">
                    {selectedNews.image && <img src={selectedNews.image} className="w-full h-full object-cover"/>}
                    <button onClick={() => setSelectedNews(null)} className="absolute top-4 right-4 bg-black/50 hover:bg-red-500 text-white p-2 rounded-full transition-colors"><X size={20}/></button>
                    <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-6 pt-20">
                         <span className="text-[10px] font-bold text-white uppercase bg-[#00994d] px-2.5 py-1 rounded-md tracking-wide mb-2 inline-block">{selectedNews.category}</span>
                         <h2 className="text-xl md:text-2xl font-bold text-white leading-tight">{selectedNews.title}</h2>
                    </div>
                </div>
                <div className="p-8 overflow-y-auto custom-scrollbar">
                    <div className="flex items-center gap-4 text-xs text-slate-400 font-bold mb-6 border-b border-slate-100 pb-4">
                        <span className="flex items-center gap-1"><Calendar size={14}/> {selectedNews.dateString}</span>
                        <span className="flex items-center gap-1"><Users size={14}/> {selectedNews.author}</span>
                    </div>
                    <p className="text-slate-700 whitespace-pre-line leading-relaxed text-sm md:text-base">{selectedNews.content}</p>
                </div>
            </div>
        </div>
      )}
    </div>
  )
}