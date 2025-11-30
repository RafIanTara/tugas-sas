import React from 'react';
import { LayoutDashboard, LogIn, LogOut, Menu, X, ArrowRight, Instagram, Mail, MapPin, Phone } from 'lucide-react';
import NavbarWidget from '../../components/landing/NavbarWidget';
import HeroSection from '../../components/landing/HeroSection';
import EventBanner from '../../components/landing/EventBanner';
import NewsSection from '../../components/landing/NewsSection';
import JoinCTA from '../../components/landing/JoinCTA';
import logoJurusan from '../../assets/images/logotkj.jpg';

export default function LandingPageDesktop({ 
    user, navigate, handlers, data, isScrolled 
}) {
    return (
        <div className="min-h-screen font-sans text-slate-800 bg-white">
            {/* NAVBAR DESKTOP */}
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-[#002f6c]/95 backdrop-blur-md shadow-md py-2' : 'bg-[#002f6c] py-4'}`}>
                <div className="max-w-7xl mx-auto px-8">
                    <div className="flex justify-between items-center h-12">
                        {/* Logo */}
                        <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo(0, 0)}>
                            <div className="h-10 w-10 rounded-lg overflow-hidden border-2 border-white/20 bg-white"><img src={logoJurusan} className="h-full w-full object-cover" alt="Logo" /></div>
                            <div className="leading-tight"><span className="block font-black text-lg tracking-tight text-white">TKJ CENTER</span><span className="block font-semibold text-emerald-400 text-[10px] tracking-widest uppercase">SMK Muhammadiyah 1</span></div>
                        </div>

                        {/* Widget Jam */}
                        <NavbarWidget currentTime={data.currentTime} nextPrayer={data.nextPrayer} />

                        {/* Menu Kanan */}
                        <div className="flex items-center gap-6">
                            <div className="flex space-x-6 text-sm font-bold text-blue-100">
                                <button onClick={() => navigate('/berita')} className="hover:text-white transition-colors">Berita</button>
                                <button onClick={() => navigate('/showcase')} className="hover:text-white transition-colors">Showcase</button>
                                <button onClick={() => navigate('/ebook')} className="hover:text-white transition-colors">E-Library</button>
                            </div>

                            {user ? (
                                <div className="flex items-center gap-3 pl-4 border-l border-white/20">
                                    <div className="text-right">
                                        <span className="block text-white text-xs font-bold leading-none">{user.displayName?.split(' ')[0]}</span>
                                        <span className="text-[10px] text-emerald-300 uppercase">{user.role}</span>
                                    </div>
                                    <button onClick={handlers.navigateToDashboard} className="bg-emerald-500 hover:bg-emerald-600 text-white p-2 rounded-lg transition-colors shadow-sm" title="Dashboard"><LayoutDashboard size={18} /></button>
                                    <button onClick={handlers.logout} className="bg-white/10 hover:bg-red-500 hover:text-white text-blue-200 p-2 rounded-lg transition-colors" title="Logout"><LogOut size={18} /></button>
                                </div>
                            ) : (
                                <button onClick={() => handlers.setIsLoginOpen(true)} className="bg-white hover:bg-blue-50 text-[#002f6c] px-5 py-2 rounded-full transition-all shadow-sm text-xs font-bold flex items-center gap-2 whitespace-nowrap">
                                    <LogIn size={16} /> Masuk Portal
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* KONTEN UTAMA */}
            <HeroSection navigate={navigate} user={user} onDashboardClick={handlers.navigateToDashboard} />
            <EventBanner landingCountdown={data.landingCountdown} timeLeftEvent={data.timeLeftEvent} isAdmin={data.isAdmin} onEdit={() => handlers.setIsEditCountdownOpen(true)} />
            <NewsSection featuredNews={data.featuredNews} navigate={navigate} />
            <JoinCTA />

            {/* FOOTER DESKTOP */}
            <footer className="bg-[#002f6c] text-white pt-20 pb-10 border-t-8 border-[#00994d]">
                <div className="max-w-7xl mx-auto px-8">
                    <div className="grid grid-cols-3 gap-20 mb-16">
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white rounded-lg p-1"><img src={logoJurusan} className="w-full h-full object-cover rounded" alt="Logo" /></div>
                                <div><h4 className="font-black text-xl leading-none">TKJ CENTER</h4><p className="text-xs font-bold text-emerald-400 tracking-[0.2em] mt-1.5 uppercase">SMK Muhammadiyah 1 Metro</p></div>
                            </div>
                            <p className="text-blue-100 text-sm leading-relaxed opacity-80">Mewujudkan teknisi yang kompeten, berakhlak mulia, dan siap bersaing di dunia industri global.</p>
                            <div className="flex gap-3">
                                <a href="#" className="w-10 h-10 bg-white/5 border border-white/10 rounded-full flex items-center justify-center hover:bg-[#00994d] transition-all"><Instagram size={18} /></a>
                                <a href="mailto:tkj@smkmuh1metro.sch.id" className="w-10 h-10 bg-white/5 border border-white/10 rounded-full flex items-center justify-center hover:bg-[#00994d] transition-all"><Mail size={18} /></a>
                            </div>
                        </div>
                        <div>
                            <h4 className="font-bold text-lg mb-8 text-white">Hubungi Kami</h4>
                            <ul className="space-y-5 text-sm text-blue-100">
                                <li className="flex items-start gap-4"><div className="bg-white/10 p-2 rounded-lg text-emerald-400"><MapPin size={18} /></div><span className="leading-relaxed">Jl. Tawes, Yosodadi, Metro Timur</span></li>
                                <li className="flex items-center gap-4"><div className="bg-white/10 p-2 rounded-lg text-emerald-400"><Phone size={18} /></div><span>+62 895-6328-76627</span></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-lg mb-8 text-white">Akses Cepat</h4>
                            <ul className="space-y-3 text-sm font-medium text-blue-200">
                                <li><button onClick={() => navigate('/kelas-x')} className="hover:text-white hover:translate-x-2 transition-all flex items-center gap-2"><ArrowRight size={12} /> Portal Kelas X</button></li>
                                <li><button onClick={() => navigate('/kelas-xi')} className="hover:text-white hover:translate-x-2 transition-all flex items-center gap-2"><ArrowRight size={12} /> Portal Kelas XI</button></li>
                                <li><button onClick={() => navigate('/kelas-xii')} className="hover:text-white hover:translate-x-2 transition-all flex items-center gap-2"><ArrowRight size={12} /> Portal Kelas XII</button></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-white/10 pt-8 text-center flex justify-between items-center">
                        <p className="text-xs text-blue-300 font-medium">© 2025 TKJ SMK Muhammadiyah 1 Metro.</p>
                        <p className="text-xs text-blue-400 font-medium">Developed by <span className="text-white font-bold">Rafiantara</span></p>
                    </div>
                </div>
            </footer>
        </div>
    );
}