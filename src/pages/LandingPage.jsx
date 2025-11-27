import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, ArrowRight, MapPin, Phone, Globe, ExternalLink, LayoutDashboard, Calendar, ChevronRight, X, Tag, BookOpen, Award, Wifi, Menu, Settings, CheckCircle2, Monitor, Cpu, Trophy, Clock, AlertTriangle } from 'lucide-react'
import logoSekolah from '../assets/images/logosmk.png'
import logoJurusan from '../assets/images/logotkj.jpg'

// TAMBAHKAN 'doc' dan 'getDoc' di import ini
import { collection, query, getDocs, limit, orderBy, doc, getDoc } from "firebase/firestore"
import { db } from "../services/firebase"

export default function LandingPage() {
  const navigate = useNavigate()
  const mainSchoolWebsite = "https://smkmuh1metro.sch.id"

  const [featuredNews, setFeaturedNews] = useState([])
  const [galeriPreview, setGaleriPreview] = useState([]) 
  const [loadingNews, setLoadingNews] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [selectedNews, setSelectedNews] = useState(null)

  // --- STATE BARU UNTUK COUNTDOWN LANDING PAGE ---
  const [landingCountdown, setLandingCountdown] = useState({ title: '', targetDate: null })
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    const fetchData = async () => {
        try {
            // 1. Ambil Berita Terbaru
            const qNews = query(collection(db, "berita_sekolah"), orderBy("createdAt", "desc"), limit(3));
            const snapNews = await getDocs(qNews);
            setFeaturedNews(snapNews.docs.map(doc => ({ id: doc.id, ...doc.data() })));

            // 2. Ambil Galeri Terbaru
            const qGaleri = query(collection(db, "galeri_sekolah"), orderBy("createdAt", "desc"), limit(6));
            const snapGaleri = await getDocs(qGaleri);
            setGaleriPreview(snapGaleri.docs.map(doc => ({ id: doc.id, ...doc.data() }))); 

            // 3. --- AMBIL DATA COUNTDOWN (Collection: settings, Doc: landing_countdown) ---
            // Ini beda tabel dengan dashboard agar independen
            const docRef = doc(db, "settings", "landing_countdown");
            const snapCountdown = await getDoc(docRef);
            if (snapCountdown.exists()) {
                setLandingCountdown(snapCountdown.data());
            }

        } catch (error) {
            console.error("Error fetch data:", error);
        } finally {
            setLoadingNews(false);
        }
    }
    fetchData();
  }, [])

  // --- LOGIC TIMER COUNTDOWN ---
  useEffect(() => {
    if (!landingCountdown.targetDate) return;

    const interval = setInterval(() => {
        const now = new Date().getTime();
        const target = new Date(landingCountdown.targetDate).getTime();
        const distance = target - now;

        if (distance < 0) {
            setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
            clearInterval(interval);
        } else {
            setTimeLeft({
                days: Math.floor(distance / (1000 * 60 * 60 * 24)),
                hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((distance % (1000 * 60)) / 1000)
            });
        }
    }, 1000);

    return () => clearInterval(interval);
  }, [landingCountdown.targetDate]);

  return (
    <div className="min-h-screen font-sans text-slate-800 bg-slate-50 overflow-x-hidden">
      
      {/* --- NAVBAR --- */}
      <nav className="bg-white/95 backdrop-blur-md text-[#002f6c] shadow-sm sticky top-0 z-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo(0,0)}>
              <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg overflow-hidden shadow-md border border-slate-100">
                 <img src={logoJurusan} alt="Logo TKJ" className="h-full w-full object-cover"/>
              </div>
              <div className="leading-tight">
                  <span className="block font-black text-lg md:text-xl tracking-tight text-[#002f6c]">TKJ CENTER</span>
                  <span className="block font-semibold text-[#00994d] text-[10px] md:text-xs tracking-wider uppercase">SMK Muhammadiyah 1 Metro</span>
              </div>
            </div>
            
            <div className="hidden md:flex space-x-1 items-center font-bold text-sm">
              <button onClick={() => document.getElementById('keunggulan').scrollIntoView({behavior: 'smooth'})} className="px-4 py-2 rounded-full hover:bg-slate-50 hover:text-[#00994d] transition-colors">Keunggulan</button>
              <button onClick={() => document.getElementById('news').scrollIntoView({behavior: 'smooth'})} className="px-4 py-2 rounded-full hover:bg-slate-50 hover:text-[#00994d] transition-colors">Berita</button>
              <button onClick={() => navigate('/galeri')} className="px-4 py-2 rounded-full hover:bg-slate-50 hover:text-[#00994d] transition-colors">Galeri</button>
              <div className="h-6 w-px bg-slate-200 mx-2"></div>
              <a href={mainSchoolWebsite} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-[#002f6c] hover:bg-[#001a3d] text-white px-5 py-2.5 rounded-full transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                <Globe size={14}/> Web Sekolah
              </a>
            </div>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-[#002f6c] p-2 hover:bg-slate-100 rounded-lg">
                {mobileMenuOpen ? <X size={24}/> : <Menu size={24}/>}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
            <div className="md:hidden bg-white border-b border-slate-100 p-4 space-y-2 absolute w-full shadow-xl">
                <button onClick={() => {document.getElementById('keunggulan').scrollIntoView({behavior: 'smooth'}); setMobileMenuOpen(false)}} className="block w-full text-left font-bold py-3 px-4 rounded-lg hover:bg-slate-50 text-[#002f6c]">Keunggulan</button>
                <button onClick={() => {document.getElementById('news').scrollIntoView({behavior: 'smooth'}); setMobileMenuOpen(false)}} className="block w-full text-left font-bold py-3 px-4 rounded-lg hover:bg-slate-50 text-[#002f6c]">Berita</button>
                <button onClick={() => navigate('/galeri')} className="block w-full text-left font-bold py-3 px-4 rounded-lg hover:bg-slate-50 text-[#002f6c]">Galeri</button>
                <a href={mainSchoolWebsite} className="block w-full text-left font-bold py-3 px-4 rounded-lg bg-slate-50 text-[#00994d]">Kunjungi Web Utama</a>
            </div>
        )}
      </nav>

      {/* --- RUNNING TEXT --- */}
      <div className="bg-[#002f6c] text-white relative z-40 shadow-inner overflow-hidden">
        <div className="max-w-7xl mx-auto flex items-center">
            <div className="bg-[#00994d] px-4 py-2 font-black text-[10px] md:text-xs uppercase tracking-wider shrink-0 z-10 shadow-lg relative skew-x-12 -ml-4 pl-8">
                <span className="-skew-x-12 block">Info Terkini</span>
            </div>
            <marquee behavior="scroll" direction="left" scrollamount="6" className="text-xs md:text-sm font-medium py-2 opacity-90 w-full">
                📢 Selamat Datang di Portal Resmi Teknik Komputer & Jaringan SMK Muhammadiyah 1 Metro  —  🎓 PPDB Gelombang 1 Telah Dibuka  —  🏆 TKJ: Terampil, Kreatif, Juara!  —  📞 Hubungi Humas: 0812-XXXX-XXXX
            </marquee>
        </div>
      </div>

      {/* --- HERO SECTION --- */}
      <header className="relative bg-slate-50 overflow-hidden pt-10 pb-16 lg:pt-20 lg:pb-24">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-blue-100 rounded-full blur-3xl opacity-50 mix-blend-multiply animate-blob"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[600px] h-[600px] bg-green-100 rounded-full blur-3xl opacity-50 mix-blend-multiply animate-blob animation-delay-2000"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid lg:grid-cols-12 gap-12 items-center">
                {/* Text Content */}
                <div className="lg:col-span-7 text-center lg:text-left space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wide mb-2 animate-in fade-in slide-in-from-bottom-4">
                        <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                        Portal Resmi Jurusan TKJ
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-[#002f6c] leading-[1.1] tracking-tight">
                        Masa Depan Digital <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00994d] to-emerald-400">Dimulai Di Sini.</span>
                    </h1>
                    <p className="text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                        Bergabunglah dengan <span className="font-bold text-[#002f6c]">TKJ SMK Muhammadiyah 1 Metro</span>. Mencetak ahli jaringan, programmer, dan teknisi handal yang siap kerja dan berkarakter Islami.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
                        <button onClick={() => document.getElementById('kelas').scrollIntoView({behavior: 'smooth'})} className="group bg-[#002f6c] hover:bg-[#001a3d] text-white px-8 py-4 rounded-2xl font-bold text-sm md:text-base shadow-xl shadow-blue-900/20 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3">
                            Akses Portal Siswa <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform"/>
                        </button>
                        <button onClick={() => document.getElementById('keunggulan').scrollIntoView({behavior: 'smooth'})} className="group bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-8 py-4 rounded-2xl font-bold text-sm md:text-base shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-3">
                            <BookOpen size={18} className="text-[#00994d]"/> Jelajahi Jurusan
                        </button>
                    </div>

                    {/* Mini Stats (Horizontal) */}
                    <div className="pt-8 flex items-center justify-center lg:justify-start gap-6 md:gap-10 text-slate-500">
                         <div className="flex items-center gap-3">
                             <div className="p-2 bg-green-50 rounded-lg text-[#00994d]"><Award size={24}/></div>
                             <div className="text-left"><p className="text-xs font-bold uppercase tracking-wider">Akreditasi</p><p className="text-xl font-black text-slate-800 leading-none">A (Unggul)</p></div>
                         </div>
                         <div className="w-px h-10 bg-slate-200"></div>
                         <div className="flex items-center gap-3">
                             <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><Users size={24}/></div>
                             <div className="text-left"><p className="text-xs font-bold uppercase tracking-wider">Siswa Aktif</p><p className="text-xl font-black text-slate-800 leading-none">350+</p></div>
                         </div>
                    </div>
                </div>

                {/* Hero Image */}
                <div className="lg:col-span-5 relative hidden lg:block">
                    <div className="relative z-10 bg-gradient-to-tr from-[#002f6c] to-[#004bb5] rounded-[2rem] p-1 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
                        <img src="https://smkmuh1metro.sch.id/wp-content/uploads/2017/02/simulasi4_mini.jpg" alt="Siswa TKJ" className="rounded-[1.9rem] w-full object-cover h-[500px] opacity-90 mix-blend-overlay"/>
                        <div className="absolute inset-0 bg-black/10 rounded-[1.9rem]"></div>
                        {/* Badges... */}
                        <div className="absolute -left-10 top-10 bg-white p-4 rounded-xl shadow-xl flex items-center gap-3 animate-bounce-slow">
                            <div className="bg-green-100 p-2 rounded-lg text-[#00994d]"><Wifi size={24}/></div>
                            <div><p className="text-xs text-slate-500 font-bold">Materi</p><p className="text-sm font-black text-slate-800">Mikrotik</p></div>
                        </div>
                        <div className="absolute -right-6 bottom-20 bg-white p-4 rounded-xl shadow-xl flex items-center gap-3 animate-bounce-slow delay-700">
                            <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><Cpu size={24}/></div>
                            <div><p className="text-xs text-slate-500 font-bold">Laboratorium</p><p className="text-sm font-black text-slate-800">Informatika</p></div>
                        </div>
                    </div>
                    <div className="absolute -bottom-10 -right-10 grid grid-cols-4 gap-2 opacity-20">
                        {[...Array(16)].map((_,i) => <div key={i} className="w-2 h-2 rounded-full bg-[#002f6c]"></div>)}
                    </div>
                </div>
            </div>
        </div>
      </header>

      {/* --- COUNTDOWN LANDING PAGE (FITUR BARU) --- */}
      {/* Strategis: Antara Hero dan Konten Utama. Jika data 'targetDate' ada di DB, tampilkan ini */}
      {landingCountdown.targetDate && (new Date(landingCountdown.targetDate) > new Date()) && (
        <section className="py-0 relative z-30 -mt-10 mb-10 px-4">
            <div className="max-w-5xl mx-auto bg-gradient-to-r from-[#002f6c] to-[#00994d] rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row items-center p-6 md:p-8 relative">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -mr-10 -mt-10"></div>
                
                <div className="flex-1 text-center md:text-left mb-6 md:mb-0 relative z-10">
                    <div className="inline-flex items-center gap-2 bg-white/10 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2 border border-white/10">
                        <Clock size={12}/> Limited Time Event
                    </div>
                    <h2 className="text-2xl md:text-3xl font-black text-white leading-tight mb-2">{landingCountdown.title}</h2>
                    <p className="text-blue-100 text-sm md:text-base font-medium">Segera persiapkan diri Anda. Jangan sampai terlewat!</p>
                </div>

                <div className="flex gap-3 md:gap-4 relative z-10">
                    {[
                        { val: timeLeft.days, label: "HARI" },
                        { val: timeLeft.hours, label: "JAM" },
                        { val: timeLeft.minutes, label: "MENIT" },
                        { val: timeLeft.seconds, label: "DETIK" }
                    ].map((time, idx) => (
                        <div key={idx} className="flex flex-col items-center">
                            <div className="w-16 h-16 md:w-20 md:h-20 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl flex items-center justify-center shadow-lg">
                                <span className="text-2xl md:text-4xl font-black text-white tabular-nums">{time.val}</span>
                            </div>
                            <span className="text-[10px] font-bold text-white/80 mt-2 tracking-widest">{time.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
      )}

      {/* --- KEUNGGULAN JURUSAN --- */}
      <section id="keunggulan" className="py-20 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
                <span className="text-[#00994d] font-bold tracking-wider uppercase text-xs mb-2 block">Kenapa Memilih Kami?</span>
                <h2 className="text-3xl md:text-4xl font-black text-[#002f6c] mb-4">Mencetak Teknisi Handal & Berkarakter</h2>
                <div className="h-1.5 w-24 bg-gradient-to-r from-[#00994d] to-emerald-300 mx-auto rounded-full"></div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {[
                    { icon: <Monitor size={32}/>, title: "Lab Komputer Lengkap", desc: "Fasilitas laboratorium standar industri dengan spesifikasi PC high-end untuk praktik jaringan & programming." },
                    { icon: <Trophy size={32}/>, title: "Prestasi Membanggakan", desc: "Juara LKS tingkat kota & provinsi, serta aktif mengikuti berbagai kompetisi IT nasional." },
                    { icon: <CheckCircle2 size={32}/>, title: "Sertifikasi Mikrotik", desc: "Sebagai Mikrotik Academy, siswa berkesempatan mendapatkan sertifikat MTCNA yang diakui internasional." }
                ].map((item, idx) => (
                    <div key={idx} className="bg-slate-50 p-8 rounded-2xl hover:bg-white hover:shadow-xl transition-all border border-slate-100 hover:border-blue-100 group">
                        <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center text-[#002f6c] group-hover:bg-[#002f6c] group-hover:text-white transition-colors mb-6 border border-slate-100">
                            {item.icon}
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-[#002f6c] transition-colors">{item.title}</h3>
                        <p className="text-slate-600 leading-relaxed text-sm">{item.desc}</p>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* --- BERITA TERBARU (Layout Grid Modern) --- */}
      <section id="news" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
                <h2 className="text-3xl font-black text-[#002f6c]">Kabar <span className="text-[#00994d]">TKJ</span></h2>
                <p className="text-slate-500 mt-2">Update kegiatan, prestasi, dan informasi terkini.</p>
            </div>
            <button onClick={() => navigate('/berita')} className="hidden md:flex items-center gap-2 text-sm font-bold text-[#002f6c] hover:text-[#00994d] transition-colors border-b-2 border-transparent hover:border-[#00994d] pb-1">
                Lihat Semua Berita <ArrowRight size={16}/>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Berita Utama (Kiri - Besar) */}
            {featuredNews.length > 0 && (
                <div onClick={() => setSelectedNews(featuredNews[0])} className="lg:col-span-2 group relative h-[400px] lg:h-[500px] rounded-3xl overflow-hidden cursor-pointer shadow-lg">
                    <div className="absolute inset-0 bg-slate-900/30 group-hover:bg-slate-900/20 transition-colors z-10"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-20"></div>
                    <img src={featuredNews[0].image || "https://placehold.co/800x600?text=No+Image"} alt={featuredNews[0].title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"/>
                    
                    <div className="absolute bottom-0 left-0 p-6 md:p-10 z-30 w-full">
                        <span className="inline-block px-3 py-1 bg-[#00994d] text-white text-[10px] font-bold uppercase tracking-wider rounded-md mb-3 shadow-md">{featuredNews[0].category}</span>
                        <h3 className="text-2xl md:text-4xl font-black text-white mb-3 leading-tight group-hover:underline decoration-[#00994d] decoration-4 underline-offset-4 transition-all">{featuredNews[0].title}</h3>
                        <div className="flex items-center gap-4 text-white/80 text-xs font-medium">
                            <span className="flex items-center gap-1"><Calendar size={14}/> {featuredNews[0].dateString}</span>
                            <span className="flex items-center gap-1"><Users size={14}/> {featuredNews[0].author}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* List Berita Samping (Kanan - Vertikal) */}
            <div className="flex flex-col gap-6">
                {featuredNews.slice(1).map((item) => (
                    <div key={item.id} onClick={() => setSelectedNews(item)} className="bg-white p-4 rounded-2xl shadow-sm hover:shadow-md transition-all flex gap-4 cursor-pointer group border border-slate-100 h-full">
                        <div className="w-28 h-28 shrink-0 rounded-xl overflow-hidden relative">
                            {item.image ? <img src={item.image} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt={item.title}/> : <div className="w-full h-full bg-slate-100 flex items-center justify-center"><Tag className="text-slate-300"/></div>}
                        </div>
                        <div className="flex flex-col justify-center">
                            <span className="text-[10px] font-bold text-[#00994d] uppercase mb-1">{item.category}</span>
                            <h4 className="font-bold text-slate-800 leading-snug mb-2 line-clamp-2 group-hover:text-[#002f6c] transition-colors">{item.title}</h4>
                            <span className="text-[10px] text-slate-400 flex items-center gap-1"><Calendar size={10}/> {item.dateString}</span>
                        </div>
                    </div>
                ))}
                {/* Tombol Lihat Semua (Mobile Only) */}
                <button onClick={() => navigate('/berita')} className="md:hidden w-full py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-600 text-sm hover:bg-slate-50 transition-colors">Lihat Semua Berita</button>
            </div>
          </div>
        </div>
      </section>

      {/* --- PORTAL KELAS --- */}
      <section id="kelas" className="py-24 bg-[#002f6c] relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#00994d] rounded-full blur-[150px] opacity-20"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Akses Kelas Digital</h2>
            <p className="text-blue-200 max-w-xl mx-auto text-lg">Pilih kelas Anda untuk mengakses jadwal, materi, dan informasi akademik.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
                { id: 'X', path: '/kelas-x', title: 'Kelas X', sub: 'Dasar TJKT', icon: <Wifi size={32}/>, color: 'from-cyan-400 to-blue-500' },
                { id: 'XI', path: '/kelas-xi', title: 'Kelas XI', sub: 'Konsentrasi Teknik', icon: <Cpu size={32}/>, color: 'from-[#00994d] to-emerald-400' },
                { id: 'XII', path: '/kelas-xii', title: 'Kelas XII', sub: 'Manajemen & Cloud', icon: <Globe size={32}/>, color: 'from-purple-500 to-indigo-500' }
            ].map((k) => (
                <div key={k.id} className="relative group rounded-3xl p-1 bg-gradient-to-br from-white/10 to-white/5 hover:to-white/20 transition-all duration-300 hover:-translate-y-2">
                    <div className="bg-[#00224f] h-full rounded-[1.4rem] p-8 flex flex-col items-center text-center relative overflow-hidden">
                        {/* Glow Effect */}
                        <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${k.color}`}></div>
                        
                        <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${k.color} flex items-center justify-center text-white shadow-lg mb-6 group-hover:scale-110 transition-transform duration-500`}>
                            {k.icon}
                        </div>
                        
                        <h3 className="text-2xl font-black text-white mb-1">{k.title}</h3>
                        <p className="text-sm font-medium text-blue-200 uppercase tracking-widest mb-8">{k.sub}</p>
                        
                        <button onClick={() => navigate(k.path)} className="w-full py-3.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white text-white hover:text-[#002f6c] font-bold transition-all flex items-center justify-center gap-2 group-hover:shadow-lg">
                            <LayoutDashboard size={18}/> Masuk Portal
                        </button>
                    </div>
                </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-white border-t border-slate-200 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-12 mb-12">
                <div className="col-span-2">
                    <div className="flex items-center gap-3 mb-6">
                        <img src={logoSekolah} alt="Logo" className="h-10"/>
                        <div>
                            <h4 className="font-black text-[#002f6c] text-lg">SMK MUHAMMADIYAH 1</h4>
                            <p className="text-xs font-bold text-[#00994d] tracking-widest">METRO - LAMPUNG</p>
                        </div>
                    </div>
                    <p className="text-slate-500 text-sm leading-relaxed max-w-sm mb-6">
                        Sekolah Pusat Keunggulan yang mencetak generasi islami, kompeten, dan siap kerja di era industri 4.0.
                    </p>
                    <div className="flex gap-4">
                        <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:bg-[#002f6c] hover:text-white transition-colors cursor-pointer"><Globe size={16}/></div>
                        <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:bg-[#002f6c] hover:text-white transition-colors cursor-pointer"><Phone size={16}/></div>
                        <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:bg-[#002f6c] hover:text-white transition-colors cursor-pointer"><MapPin size={16}/></div>
                    </div>
                </div>
                <div>
                    <h4 className="font-bold text-[#002f6c] mb-6">Tautan Cepat</h4>
                    <ul className="space-y-3 text-sm text-slate-500">
                        <li><button onClick={() => window.scrollTo(0,0)} className="hover:text-[#00994d] transition-colors">Beranda</button></li>
                        <li><button onClick={() => navigate('/berita')} className="hover:text-[#00994d] transition-colors">Berita Sekolah</button></li>
                        <li><button onClick={() => navigate('/galeri')} className="hover:text-[#00994d] transition-colors">Galeri Foto</button></li>
                        <li><a href={mainSchoolWebsite} className="hover:text-[#00994d] transition-colors">Web Utama</a></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold text-[#002f6c] mb-6">Kontak Kami</h4>
                    <ul className="space-y-3 text-sm text-slate-500">
                        <li className="flex items-start gap-3">
                            <MapPin size={16} className="text-[#00994d] shrink-0 mt-1"/>
                            <span>Jl. Tawes, Yosodadi, Kec. Metro Tim., Kota Metro,.</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <Phone size={16} className="text-[#00994d] shrink-0"/>
                            <span>(0725) 48254</span>
                        </li>
                    </ul>
                </div>
            </div>
            <div className="border-t border-slate-100 pt-8 text-center">
                <p className="text-xs text-slate-400 font-medium">&copy; 2025 Tim IT & Pengembangan TKJ SMK Muhammadiyah 1 Metro. Developed by Rafiantara.</p>
            </div>
        </div>
      </footer>

      {/* --- MODAL DETAIL BERITA --- */}
      {selectedNews && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200" onClick={() => setSelectedNews(null)}>
            <div className="bg-white w-full md:max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="relative h-64 shrink-0 bg-slate-100">
                    {selectedNews.image ? <img src={selectedNews.image} alt={selectedNews.title} className="w-full h-full object-cover"/> : <div className="w-full h-full bg-slate-200 flex items-center justify-center"><Tag size={48} className="text-slate-400"/></div>}
                    <button onClick={() => setSelectedNews(null)} className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-red-500 transition-colors"><X size={20}/></button>
                    <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-6 pt-20">
                        <span className="bg-[#00994d] text-white text-[10px] font-bold px-3 py-1 rounded-full mb-2 inline-block uppercase tracking-wide">{selectedNews.category}</span>
                        <h2 className="text-xl md:text-2xl font-bold text-white leading-tight">{selectedNews.title}</h2>
                    </div>
                </div>
                <div className="p-8 overflow-y-auto custom-scrollbar">
                    <div className="flex items-center gap-4 text-xs font-bold text-slate-400 mb-6 border-b border-slate-100 pb-4">
                        <span className="flex items-center gap-1"><Calendar size={14}/> {selectedNews.dateString}</span>
                        <span className="flex items-center gap-1"><Users size={14}/> {selectedNews.author}</span>
                    </div>
                    <p className="text-slate-700 leading-relaxed whitespace-pre-line text-sm md:text-base">{selectedNews.content}</p>
                </div>
            </div>
        </div>
      )}
    </div>
  )
}