import React, { useState } from 'react';
import { LayoutDashboard, LogIn, LogOut, Menu, X, Tag, Monitor, BookOpen, ArrowRight, MapPin } from 'lucide-react';
import HeroSection from '../../components/landing/HeroSection';
import EventBanner from '../../components/landing/EventBanner';
import NewsSection from '../../components/landing/NewsSection';
import JoinCTA from '../../components/landing/JoinCTA';
import logoJurusan from '../../assets/images/logotkj.jpg';

export default function LandingPageMobile({ 
    user, navigate, handlers, data, isScrolled 
}) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen font-sans text-slate-800 bg-white overflow-x-hidden">
            {/* NAVBAR MOBILE */}
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-[#002f6c]/95 backdrop-blur-md shadow-md py-2' : 'bg-[#002f6c] py-3'}`}>
                <div className="px-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo(0, 0)}>
                            <div className="h-8 w-8 rounded overflow-hidden border border-white/20 bg-white"><img src={logoJurusan} className="h-full w-full object-cover" alt="Logo" /></div>
                            <div className="leading-tight"><span className="block font-black text-md tracking-tight text-white">TKJ CENTER</span><span className="block font-semibold text-emerald-400 text-[8px] tracking-widest uppercase">SMK Mutu Metro</span></div>
                        </div>
                        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-white p-1 rounded hover:bg-white/10">
                            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* DROPDOWN MENU MOBILE */}
                {mobileMenuOpen && (
                    <div className="bg-white border-t border-slate-100 shadow-xl absolute w-full left-0 top-full animate-in slide-in-from-top-5">
                        <div className="flex flex-col p-4 space-y-2">
                            {/* Widget Sholat Mini di Menu */}
                            <div className="bg-slate-50 p-3 rounded-lg mb-2 flex justify-between items-center text-xs font-bold border border-slate-100">
                                <span className="text-slate-500">Jadwal {data.nextPrayer.name}</span>
                                <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded">{data.nextPrayer.time}</span>
                            </div>

                            <button onClick={() => { setMobileMenuOpen(false); navigate('/berita') }} className="w-full text-left font-bold px-4 py-3 rounded-lg text-slate-700 hover:bg-slate-50 flex items-center gap-3"><Tag size={18} className="text-blue-600"/> Berita & Kegiatan</button>
                            <button onClick={() => { setMobileMenuOpen(false); navigate('/showcase') }} className="w-full text-left font-bold px-4 py-3 rounded-lg text-slate-700 hover:bg-slate-50 flex items-center gap-3"><Monitor size={18} className="text-purple-600"/> Showcase Project</button>
                            <button onClick={() => { setMobileMenuOpen(false); navigate('/ebook') }} className="w-full text-left font-bold px-4 py-3 rounded-lg text-slate-700 hover:bg-slate-50 flex items-center gap-3"><BookOpen size={18} className="text-orange-600"/> E-Library</button>
                            
                            <div className="h-px bg-slate-100 my-2"></div>
                            
                            {!user ? (
                                <button onClick={() => { setMobileMenuOpen(false); handlers.setIsLoginOpen(true) }} className="w-full text-left font-bold px-4 py-3 rounded-lg bg-[#002f6c] text-white flex items-center gap-3 shadow-md"><LogIn size={18} /> Masuk Portal</button>
                            ) : (
                                <>
                                    <div className="px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Halo, {user.displayName}</div>
                                    <button onClick={() => { setMobileMenuOpen(false); handlers.navigateToDashboard() }} className="w-full text-left font-bold px-4 py-3 rounded-lg bg-emerald-500 text-white flex items-center gap-3"><LayoutDashboard size={18} /> Dashboard Kelas</button>
                                    <button onClick={() => { setMobileMenuOpen(false); handlers.logout() }} className="w-full text-left font-bold px-4 py-3 rounded-lg bg-red-50 text-red-600 flex items-center gap-3"><LogOut size={18} /> Logout</button>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </nav>

            {/* KOMPONEN UTAMA (Responsive Props) */}
            {/* Kita bungkus HeroSection biar padding mobile pas */}
            <div className="pt-4"> 
                <HeroSection navigate={navigate} user={user} onDashboardClick={handlers.navigateToDashboard} />
            </div>
            
            <EventBanner landingCountdown={data.landingCountdown} timeLeftEvent={data.timeLeftEvent} isAdmin={data.isAdmin} onEdit={() => handlers.setIsEditCountdownOpen(true)} />
            
            <div className="px-2"> {/* Wrapper News biar ga mepet banget di HP */}
                <NewsSection featuredNews={data.featuredNews} navigate={navigate} />
            </div>

            <JoinCTA />

            {/* FOOTER MOBILE (Simpel 1 Kolom) */}
            <footer className="bg-[#002f6c] text-white pt-10 pb-20 border-t-8 border-[#00994d]">
                <div className="px-6 text-center">
                    <div className="w-16 h-16 bg-white rounded-xl p-1 mx-auto mb-4 shadow-lg"><img src={logoJurusan} className="w-full h-full object-cover rounded" alt="Logo Footer" /></div>
                    <h4 className="font-black text-xl leading-none">TKJ CENTER</h4>
                    <p className="text-xs font-bold text-emerald-400 tracking-[0.2em] mt-2 uppercase mb-6">SMK Muhammadiyah 1 Metro</p>
                    
                    <div className="space-y-4 text-sm text-blue-100 mb-8">
                        <p className="leading-relaxed opacity-80">Jl. Tawes, Yosodadi, Metro Timur<br/>Lampung, Indonesia</p>
                        <a href="https://maps.google.com" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full text-xs font-bold hover:bg-emerald-600 transition-colors">
                            <MapPin size={14}/> Lihat di Maps
                        </a>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs font-bold text-blue-200 mb-8">
                        <button onClick={() => navigate('/kelas-x')} className="bg-white/5 p-3 rounded-lg border border-white/10 hover:bg-[#00994d] hover:text-white transition-colors">Portal Kelas X</button>
                        <button onClick={() => navigate('/kelas-xi')} className="bg-white/5 p-3 rounded-lg border border-white/10 hover:bg-[#00994d] hover:text-white transition-colors">Portal Kelas XI</button>
                        <button onClick={() => navigate('/kelas-xii')} className="bg-white/5 p-3 rounded-lg border border-white/10 hover:bg-[#00994d] hover:text-white transition-colors">Portal Kelas XII</button>
                        <button onClick={() => navigate('/showcase')} className="bg-white/5 p-3 rounded-lg border border-white/10 hover:bg-[#00994d] hover:text-white transition-colors">Showcase</button>
                    </div>

                    <div className="border-t border-white/10 pt-6">
                        <p className="text-[10px] text-blue-400 font-medium">© 2025 TKJ SMK Mutu Metro</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}