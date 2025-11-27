import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, ArrowRight, MapPin, Phone, Globe, ExternalLink, LayoutDashboard, Calendar, ChevronRight, X, Tag, BookOpen, Award, Wifi, Menu, Settings } from 'lucide-react'
// Import Logo SMK (Tetap dipakai di Footer)
import logoSekolah from '../assets/images/logosmk.png'
// Import Logo TKJ (Dipakai di Navbar & Hero)
import logoJurusan from '../assets/images/logotkj.jpg'

import { collection, query, getDocs } from "firebase/firestore"
import { db } from "../services/firebase"

export default function LandingPage() {
  const navigate = useNavigate()
  const mainSchoolWebsite = "https://smkmuh1metro.sch.id"

  const [featuredNews, setFeaturedNews] = useState([])
  const [galeriPreview, setGaleriPreview] = useState([]) 
  const [loadingNews, setLoadingNews] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [selectedNews, setSelectedNews] = useState(null)

  // FETCH DATA
  useEffect(() => {
    const fetchData = async () => {
        try {
            const qNews = query(collection(db, "berita_sekolah"));
            const snapNews = await getDocs(qNews);
            let allNews = snapNews.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setFeaturedNews(allNews.sort(() => 0.5 - Math.random()).slice(0, 3));

            const qGaleri = query(collection(db, "galeri_sekolah"));
            const snapGaleri = await getDocs(qGaleri);
            let allGaleri = snapGaleri.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setGaleriPreview(allGaleri.slice(0, 4)); 

        } catch (error) {
            console.error("Error fetch:", error);
        } finally {
            setLoadingNews(false);
        }
    }
    fetchData();
  }, [])

  return (
    <div className="min-h-screen font-sans text-slate-800 bg-slate-50">
      
      {/* --- NAVBAR --- */}
      <nav className="bg-[#002f6c] text-white shadow-lg sticky top-0 z-50 border-b-4 border-[#00994d]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 p-1 bg-white/10 rounded-full backdrop-blur-sm overflow-hidden">
                 {/* GANTI: Pakai Logo TKJ */}
                 <img src={logoJurusan} alt="Logo TKJ" className="h-full w-full object-cover rounded-full"/>
              </div>
              <div className="leading-tight">
                  <span className="block font-extrabold text-lg md:text-xl tracking-wide">TKJ CENTER</span>
                  <span className="block font-medium text-[#00994d] text-[10px] md:text-xs tracking-wider">SMK MUHAMMADIYAH 1 METRO</span>
              </div>
            </div>
            
            <div className="hidden md:flex space-x-8 text-sm font-bold items-center">
              <button onClick={() => document.getElementById('news').scrollIntoView({behavior: 'smooth'})} className="hover:text-[#00994d] transition-colors">Berita</button>
              <button onClick={() => navigate('/galeri')} className="hover:text-[#00994d] transition-colors">Galeri</button>
              <div className="h-4 w-px bg-white/20"></div>
              <a href={mainSchoolWebsite} className="flex items-center gap-2 opacity-80 hover:opacity-100 transition-opacity text-xs font-normal bg-[#002f6c] border border-white/30 px-3 py-1.5 rounded-full">
                <Globe size={12}/> Web Utama
              </a>
            </div>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-white p-2">
                {mobileMenuOpen ? <X size={24}/> : <Menu size={24}/>}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
            <div className="md:hidden bg-[#00224f] border-t border-white/10 p-4 space-y-4 animate-in slide-in-from-top-5">
                <button onClick={() => {document.getElementById('news').scrollIntoView({behavior: 'smooth'}); setMobileMenuOpen(false)}} className="block w-full text-left font-bold py-2 hover:text-[#00994d]">Berita</button>
                <button onClick={() => navigate('/galeri')} className="block w-full text-left font-bold py-2 hover:text-[#00994d]">Galeri</button>
                <a href={mainSchoolWebsite} className="block w-full text-left text-sm opacity-70 py-2">Kembali ke Web Sekolah</a>
            </div>
        )}
      </nav>

      {/* --- HERO SECTION --- */}
      <header className="relative bg-gradient-to-br from-[#002f6c] to-[#001a3d] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="max-w-7xl mx-auto px-4 pt-12 pb-24 md:py-32 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row items-center gap-10 md:gap-16">
          
          <div className="flex-1 text-center md:text-left">
            <span className="inline-block py-1 px-3 rounded-full bg-[#00994d]/20 text-[#00994d] text-[10px] md:text-xs font-extrabold mb-4 border border-[#00994d]/50 uppercase tracking-wider backdrop-blur-sm">Kompetensi Keahlian Unggulan</span>
            <h1 className="text-4xl md:text-6xl font-black leading-tight mb-6">Masa Depan Digital <br/> Dimulai <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00994d] to-emerald-300">Di Sini.</span></h1>
            <p className="text-sm md:text-lg text-blue-100 mb-8 max-w-2xl mx-auto md:mx-0 font-medium leading-relaxed opacity-90">Bergabunglah dengan TKJ SMK Muhammadiyah 1 Metro. Mencetak ahli jaringan, programmer, dan teknisi handal berkarakter Islami.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                <button onClick={() => document.getElementById('kelas').scrollIntoView({behavior: 'smooth'})} className="bg-[#00994d] hover:bg-[#007a3d] text-white font-bold py-3.5 px-8 rounded-xl shadow-lg shadow-green-900/20 transition-transform transform hover:scale-105 flex items-center justify-center gap-2">Akses Portal Siswa <ArrowRight size={18}/></button>
                <button onClick={() => document.getElementById('news').scrollIntoView({behavior: 'smooth'})} className="bg-white/5 hover:bg-white/10 text-white font-bold py-3.5 px-8 rounded-xl border border-white/10 transition-all flex items-center justify-center gap-2 backdrop-blur-sm">Lihat Kegiatan <ChevronRight size={18}/></button>
            </div>
          </div>

          <div className="flex-1 w-full flex justify-center relative mt-8 md:mt-0">
            <div className="w-64 h-64 md:w-96 md:h-96 bg-gradient-to-tr from-white/5 to-white/10 backdrop-blur-2xl rounded-full flex items-center justify-center border-[1px] border-white/20 relative shadow-2xl animate-pulse-slow overflow-hidden">
                {/* Logo TKJ Besar */}
                <img 
                    src={logoJurusan} 
                    alt="Logo TKJ Besar" 
                    className="w-full h-full object-cover opacity-90 hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute -top-4 -right-4 bg-[#00994d] p-3 rounded-2xl shadow-lg animate-bounce"><Wifi size={24}/></div>
                <div className="absolute bottom-10 -left-8 bg-blue-500 p-3 rounded-2xl shadow-lg animate-spin-slow"><Settings size={24}/></div>
            </div>
          </div>

        </div>
        <div className="absolute bottom-0 w-full overflow-hidden leading-none"><svg className="relative block w-full h-[40px] md:h-[80px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none"><path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="fill-slate-50"></path></svg></div>
      </header>

      {/* --- STATS --- */}
      <section className="py-12 -mt-10 relative z-20 px-4">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl border-t-4 border-[#00994d] p-8 text-center transform hover:-translate-y-1 transition-transform duration-300">
            <div className="flex flex-col items-center justify-center">
                <div className="bg-green-50 p-4 rounded-full mb-4"><Award size={48} className="text-[#00994d]" /></div>
                <h3 className="text-5xl font-black text-[#002f6c] mb-2">TERAKREDITASI A</h3>
                <p className="text-slate-500 font-medium text-lg">Keunggulan Mutu Pendidikan & Fasilitas Standar Industri</p>
            </div>
        </div>
      </section>

      {/* --- BERITA --- */}
      <section id="news" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4 text-center md:text-left">
            <div><h2 className="text-2xl md:text-3xl font-black text-[#002f6c]">Sekilas <span className="text-[#00994d]">TKJ</span></h2><p className="text-slate-500 mt-1">Kegiatan, prestasi, dan inovasi terbaru siswa.</p></div>
            <button onClick={() => navigate('/berita')} className="text-sm font-bold text-[#00994d] hover:underline flex items-center gap-1">
                Lihat Arsip Berita <ArrowRight size={16}/>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {loadingNews ? ([1,2,3].map(i => <div key={i} className="h-64 bg-slate-200 rounded-xl animate-pulse"></div>)) : featuredNews.length === 0 ? (<div className="col-span-3 text-center py-10 bg-white border border-dashed border-slate-300 rounded-xl text-slate-400">Belum ada berita yang diupload.</div>) : (
                featuredNews.map((item) => (
                  <div key={item.id} onClick={() => setSelectedNews(item)} className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all border border-slate-100 flex flex-col h-full cursor-pointer">
                    <div className="h-48 overflow-hidden relative">
                        {item.image ? (<img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"/>) : (<div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300"><Tag size={40}/></div>)}
                        <div className="absolute top-3 left-3 bg-[#002f6c] text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">{item.category}</div>
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                        <div className="text-[10px] font-bold text-slate-400 mb-2 flex items-center gap-1"><Calendar size={10}/> {item.dateString}</div>
                        <h3 className="text-base font-bold text-slate-800 mb-3 leading-snug group-hover:text-[#00994d] transition-colors line-clamp-2">{item.title}</h3>
                        <p className="text-xs text-slate-500 line-clamp-3 mb-4 flex-1">{item.content}</p>
                        <button className="text-xs font-bold text-[#00994d] hover:text-[#007a3d] flex items-center gap-1 mt-auto">Baca Selengkapnya <ChevronRight size={12}/></button>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      </section>

      {/* --- MODAL DETAIL --- */}
      {selectedNews && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200" onClick={() => setSelectedNews(null)}>
            <div className="bg-white w-full md:max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="relative h-64 shrink-0 bg-slate-100">
                    {selectedNews.image && <img src={selectedNews.image} alt={selectedNews.title} className="w-full h-full object-cover"/>}
                    <button onClick={() => setSelectedNews(null)} className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-red-500 transition-colors"><X size={20}/></button>
                    <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-6 pt-20">
                        <span className="bg-[#00994d] text-white text-xs font-bold px-3 py-1 rounded-full mb-2 inline-block">{selectedNews.category}</span>
                        <h2 className="text-2xl font-bold text-white leading-tight">{selectedNews.title}</h2>
                        <div className="flex items-center gap-4 mt-2 text-white/80 text-xs font-medium"><span className="flex items-center gap-1"><Calendar size={12}/> {selectedNews.dateString}</span><span className="flex items-center gap-1"><Users size={12}/> {selectedNews.author}</span></div>
                    </div>
                </div>
                <div className="p-8 overflow-y-auto custom-scrollbar"><p className="text-slate-700 leading-relaxed whitespace-pre-line text-base">{selectedNews.content}</p></div>
                <div className="p-4 bg-slate-50 border-t border-slate-100 text-right"><button onClick={() => setSelectedNews(null)} className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-6 py-2 rounded-lg font-bold text-sm transition-colors">Tutup</button></div>
            </div>
        </div>
      )}

      {/* --- GALERI --- */}
      <section className="py-16 bg-[#002f6c] text-white relative overflow-hidden">
         <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')]"></div>
         <div className="max-w-7xl mx-auto px-4 relative z-10">
            <div className="text-center mb-10"><h2 className="text-2xl md:text-3xl font-black mb-2">Galeri Kegiatan</h2><p className="text-blue-200 text-sm md:text-base">Dokumentasi aktivitas pembelajaran dan praktik siswa.</p></div>
            {galeriPreview.length === 0 ? (
                <div className="text-center text-white/50 py-10 border border-white/10 rounded-xl border-dashed">Belum ada foto galeri.</div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                    {galeriPreview.map((img) => (
                        <div key={img.id} className="aspect-square bg-slate-800 rounded-xl overflow-hidden hover:opacity-90 transition-opacity cursor-pointer group">
                            <img src={img.image} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt={img.caption}/>
                        </div>
                    ))}
                    <div className="aspect-square bg-slate-800 rounded-xl overflow-hidden flex items-center justify-center cursor-pointer hover:bg-[#00994d] transition-colors border-2 border-white/10 group" onClick={() => navigate('/galeri')}> 
     <div className="text-center"><span className="block font-bold text-lg group-hover:scale-110 transition-transform">Lihat<br/>Semua</span><ArrowRight size={20} className="mx-auto mt-2"/></div> 
 </div>
                </div>
            )}
         </div>
      </section>

      {/* --- PORTAL --- */}
      <section id="kelas" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16"><h2 className="text-3xl font-black text-[#002f6c] mb-4">Akses Kelas Digital</h2><p className="text-slate-600 max-w-xl mx-auto">Sistem manajemen pembelajaran terintegrasi untuk setiap angkatan.</p></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[{ id: 'X', color: 'bg-cyan-500', light: 'bg-cyan-50', text: 'text-cyan-600', path: '/kelas-x', label: 'Dasar TJKT' },{ id: 'XI', color: 'bg-[#00994d]', light: 'bg-green-50', text: 'text-[#00994d]', path: '/kelas-xi', label: 'Mikrotik, Setting Jaringan, dan Pemrograman' },{ id: 'XII', color: 'bg-indigo-500', light: 'bg-indigo-50', text: 'text-indigo-600', path: '/kelas-xii', label: 'GTW Aku' }].map((k) => (
                <div key={k.id} className="bg-white rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all p-6 border border-slate-100 text-center flex flex-col items-center group">
                    <div className={`w-16 h-16 ${k.light} ${k.text} rounded-2xl flex items-center justify-center text-2xl font-black mb-4 group-hover:scale-110 transition-transform`}>{k.id}</div>
                    <h3 className="text-xl font-bold text-slate-800 mb-1">Kelas {k.id} TKJ</h3>
                    <p className="text-xs text-slate-500 mb-6 font-medium uppercase tracking-wide">{k.label}</p>
                    <button onClick={() => navigate(k.path)} className={`w-full py-3 rounded-xl ${k.id === 'XI' ? 'bg-[#00994d] hover:bg-[#007a3d]' : 'bg-[#002f6c] hover:bg-[#001a3d]'} text-white font-bold shadow-lg transition-all flex items-center justify-center gap-2`}><LayoutDashboard size={16}/> Masuk</button>
                </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-white border-t border-slate-200 pt-12 pb-8 text-sm text-slate-500">
        <div className="max-w-7xl mx-auto px-4 text-center">
            <div className="flex justify-center items-center gap-2 mb-4 opacity-50"><img src={logoSekolah} className="h-8 grayscale" alt="Logo Footer"/><span className="font-bold">SMK MUHAMMADIYAH 1 METRO</span></div>
            <p>&copy; 2025 Tim IT & Pengembangan TKJ. Developed by Rafiantara.</p>
        </div>
      </footer>
    </div>
  )
}