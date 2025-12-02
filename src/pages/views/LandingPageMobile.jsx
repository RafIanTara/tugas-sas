import React, { useState, useEffect } from 'react';
import { LayoutDashboard, LogIn, LogOut, Menu, X, Tag, Monitor, BookOpen, ChevronRight, Home, User, MapPin } from 'lucide-react';
import HeroSection from '../../components/landing/HeroSection';
import EventBanner from '../../components/landing/EventBanner';
import NewsSection from '../../components/landing/NewsSection';
import JoinCTA from '../../components/landing/JoinCTA';
import logoJurusan from '../../assets/images/logotkj.jpg';
import RunningText from '../../components/landing/RunningText';

export default function LandingPageMobile({
    user, navigate, handlers, data, isScrolled
}) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (mobileMenuOpen) { document.body.style.overflow = 'hidden'; }
        else { document.body.style.overflow = 'unset'; }
        return () => { document.body.style.overflow = 'unset'; }
    }, [mobileMenuOpen]);

    const handleNavClick = (path) => {
        setMobileMenuOpen(false);
        navigate(path);
    };

    // --- PERBAIKAN LOGIC DASHBOARD ---
    // Menggunakan handlers.navigateToDashboard agar SAMA PERSIS dengan Desktop
    const handleDashboardClick = () => {
        setMobileMenuOpen(false);
        
        // Panggil handler pusat. Logic penentuan kelas/admin ada di parent component (LandingPage.jsx/App.jsx)
        if (handlers && handlers.navigateToDashboard) {
            handlers.navigateToDashboard();
        } else {
            // Fallback safety
            console.error("Handler dashboard tidak ditemukan");
            if (user) navigate('/'); 
            else handlers.setIsLoginOpen(true);
        }
    };

    return (
        <div className="min-h-screen font-sans text-slate-800 bg-[#f8faff]">

            {/* NAVBAR MOBILE */}
            <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${isScrolled
                    ? 'bg-white/95 backdrop-blur-lg shadow-md py-3 border-b-4 border-[#00994d]'
                    : 'bg-[#002f6c] py-4 border-b-4 border-[#00994d] shadow-lg'
                }`}>
                <div className="px-5">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2.5" onClick={() => window.scrollTo(0, 0)}>
                            <div className={`h-10 w-10 rounded-lg overflow-hidden border-2 bg-white ${isScrolled ? 'border-slate-100' : 'border-white/20'}`}>
                                <img src={logoJurusan} className="h-full w-full object-cover" alt="Logo" />
                            </div>
                            <div className="leading-tight">
                                <span className={`block font-black text-lg tracking-tight ${isScrolled ? 'text-[#002f6c]' : 'text-white'}`}>TKJ CENTER</span>
                                <span className={`block font-bold text-[9px] tracking-widest uppercase ${isScrolled ? 'text-[#00994d]' : 'text-emerald-400'}`}>SMK Muhammadiyah 1</span>
                            </div>
                        </div>
                        <button onClick={() => setMobileMenuOpen(true)} className={`p-2 rounded-xl transition-colors ${isScrolled ? 'text-[#002f6c] bg-blue-50' : 'text-white bg-white/10'}`}>
                            <Menu size={24} strokeWidth={2.5} />
                        </button>
                    </div>
                </div>
            </nav>

            {/* FULL SCREEN MENU */}
            <div className={`fixed inset-0 z-50 transform transition-transform duration-300 ease-in-out ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                {/* Gradient Overlay Khas */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#002f6c] to-[#006633]"></div>

                <div className="relative h-full flex flex-col p-6 overflow-y-auto">
                    <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
                        <div className="flex items-center gap-3"><div className="bg-white p-1 rounded-lg"><img src={logoJurusan} className="h-8 w-8 rounded" alt="Logo" /></div><span className="font-black text-xl text-white tracking-tight">MENU UTAMA</span></div>
                        <button onClick={() => setMobileMenuOpen(false)} className="p-2 bg-white/10 rounded-full text-white hover:bg-red-500 transition-colors"><X size={24} /></button>
                    </div>
                    <div className="bg-black/20 border border-white/10 rounded-2xl p-5 mb-8 flex justify-between items-center backdrop-blur-sm">
                        <div><p className="text-xs text-emerald-200 mb-1 font-bold uppercase tracking-wider">Jadwal Sholat</p><h3 className="text-2xl font-bold text-white">{data.nextPrayer.name}</h3></div>
                        <div className="text-xl font-black text-[#002f6c] bg-white px-4 py-2 rounded-xl shadow-lg">{data.nextPrayer.time}</div>
                    </div>
                    <div className="space-y-3 flex-1">
                        {[
                            { path: '/', icon: Home, label: 'Beranda' },
                            { path: '/berita', icon: Tag, label: 'Berita & Agenda' },
                            { path: '/showcase', icon: Monitor, label: 'Showcase Project' },
                            { path: '/ebook', icon: BookOpen, label: 'E-Book' },
                        ].map((item, idx) => (
                            <button key={idx} onClick={() => handleNavClick(item.path)} className="w-full text-left p-4 rounded-xl bg-white/5 hover:bg-white/20 text-white font-bold flex items-center justify-between group border border-white/5"><span className="flex items-center gap-3"><item.icon size={20} className="text-emerald-300" /> {item.label}</span><ChevronRight size={18} className="opacity-50" /></button>
                        ))}
                    </div>
                    <div className="mt-6">
                        {!user ? (
                            <button onClick={() => { setMobileMenuOpen(false); handlers.setIsLoginOpen(true) }} className="w-full py-4 bg-white text-[#002f6c] rounded-xl font-black flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-transform"><LogIn size={20} /> MASUK PORTAL</button>
                        ) : (
                            <div className="bg-white rounded-2xl p-4 shadow-xl">
                                <div className="flex items-center gap-3 mb-4 border-b border-slate-100 pb-4">
                                    <div className="h-10 w-10 bg-[#002f6c] rounded-full flex items-center justify-center text-white font-bold"><User size={20} /></div>
                                    <div><p className="font-bold text-[#002f6c]">{user.displayName}</p><p className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full inline-block font-bold">{user.role}</p></div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    {/* MENGGUNAKAN HANDLER YANG SUDAH DIPERBAIKI */}
                                    <button onClick={handleDashboardClick} className="py-3 bg-[#00994d] text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2"><LayoutDashboard size={16} /> Dashboard</button>
                                    
                                    <button onClick={() => { setMobileMenuOpen(false); handlers.logout() }} className="py-3 bg-red-50 text-red-600 rounded-lg font-bold text-sm flex items-center justify-center gap-2"><LogOut size={16} /> Logout</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT MOBILE */}
            <main className="pt-24 pb-12 overflow-hidden">

                <RunningText />
                
                <div className="px-2 mb-8 relative z-10">
                    <HeroSection 
                        navigate={navigate} 
                        user={user} 
                        onDashboardClick={handleDashboardClick} 
                    />
                </div>
                
                <div className="px-4 mb-4 relative z-20"><EventBanner landingCountdown={data.landingCountdown} timeLeftEvent={data.timeLeftEvent} isAdmin={data.isAdmin} onEdit={() => handlers.setIsEditCountdownOpen(true)} /></div>

                <NewsSection featuredNews={data.featuredNews} navigate={navigate} />

                <div className="px-5 pt-12"><JoinCTA /></div>
            </main>

            {/* FOOTER MOBILE */}
            <footer className="bg-[#002f6c] text-white pt-12 pb-24 rounded-t-[3rem] relative mt-[-2rem] border-t-[6px] border-[#00994d]">
                <div className="px-8 relative z-10 text-center">
                    <div className="inline-block p-2 bg-white rounded-2xl mb-6 shadow-lg shadow-blue-900/50">
                        <img src={logoJurusan} className="w-14 h-14 rounded-xl mx-auto" alt="Logo Footer" />
                    </div>

                    <h4 className="font-black text-2xl tracking-tight mb-2">TKJ CENTER</h4>
                    <p className="text-xs font-bold text-[#00994d] bg-white px-3 py-1 rounded-full inline-block mb-8">SMK MUHAMMADIYAH 1 METRO</p>

                    <div className="grid grid-cols-2 gap-3 mb-10">
                        {['X', 'XI', 'XII'].map(kls => (
                            <button key={kls} onClick={() => navigate(`/kelas-${kls.toLowerCase()}`)} className="bg-white/5 border border-white/10 hover:bg-[#00994d] hover:border-[#00994d] transition-colors py-3 rounded-xl text-xs font-bold text-blue-100">
                                Portal Kelas {kls}
                            </button>
                        ))}
                        <button onClick={() => navigate('/showcase')} className="bg-white/5 border border-white/10 hover:bg-blue-500 hover:border-blue-500 transition-colors py-3 rounded-xl text-xs font-bold text-blue-100">
                            Showcase
                        </button>
                    </div>

                    <div className="mb-8">
                        <a href="https://maps.google.com/?q=SMK+Muhammadiyah+1+Metro" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full py-3 bg-[#00994d] text-white rounded-xl text-xs font-bold shadow-lg hover:bg-emerald-600 transition-colors">
                            <MapPin size={16} /> Buka Lokasi di Maps
                        </a>
                    </div>

                    <div className="border-t border-white/10 pt-6">
                        <p className="text-[10px] text-blue-300 font-medium">© 2025 TKJ Center SMK Mutu Metro</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}