import React from 'react';
import { LayoutDashboard, LogIn, LogOut, Instagram, Mail, MapPin, Phone, Globe, ExternalLink } from 'lucide-react';
import NavbarWidget from '../../components/landing/NavbarWidget';
import HeroSection from '../../components/landing/HeroSection';
import EventBanner from '../../components/landing/EventBanner';
import NewsSection from '../../components/landing/NewsSection';
import JoinCTA from '../../components/landing/JoinCTA';
import logoJurusan from '../../assets/images/logotkj.jpg';
import RunningText from '../../components/landing/RunningText';

export default function LandingPageDesktop({
    user, navigate, handlers, data, isScrolled
}) {
    return (
        <div className="min-h-screen font-sans text-slate-800 bg-slate-50 selection:bg-[#00994d] selection:text-white">

            {/* NAVBAR DESKTOP */}
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${isScrolled
                    ? 'bg-white/95 backdrop-blur-md shadow-lg py-2 border-b-4 border-[#00994d]'
                    : 'bg-[#002f6c] py-4 border-b-4 border-[#00994d] shadow-2xl'
                }`}>
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="flex justify-between items-center h-12">
                        {/* LOGO */}
                        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                            <div className={`h-11 w-11 rounded-xl overflow-hidden shadow-lg border-2 ${isScrolled ? 'border-white' : 'border-white/20'}`}>
                                <img src={logoJurusan} className="h-full w-full object-cover" alt="Logo TKJ" />
                            </div>
                            <div className="leading-tight">
                                <span className={`block font-black text-xl tracking-tighter transition-colors ${isScrolled ? 'text-[#002f6c]' : 'text-white'}`}>TKJ CENTER</span>
                                <span className="block font-bold text-[10px] tracking-[0.2em] uppercase text-[#00994d] mt-0.5">SMK Muhammadiyah 1</span>
                            </div>
                        </div>

                        {/* WIDGET JAM */}
                        <div className={`transition-all duration-500 ${isScrolled ? 'opacity-0 hidden xl:block xl:opacity-100' : 'opacity-100'}`}>
                            <div className={isScrolled ? "text-slate-800" : "text-white"}>
                                <NavbarWidget currentTime={data.currentTime} nextPrayer={data.nextPrayer} isDarkText={isScrolled} />
                            </div>
                        </div>

                        {/* MENU KANAN */}
                        <div className="flex items-center gap-8">
                            <div className={`flex space-x-6 text-sm font-bold transition-colors ${isScrolled ? 'text-slate-600' : 'text-blue-100'}`}>
                                {['Berita', 'Showcase', 'E-Library'].map((item) => (
                                    <button key={item} onClick={() => navigate(`/${item.toLowerCase().replace('-', '')}`)} className={`hover:text-[#00994d] transition-colors relative group py-1`}>
                                        {item}
                                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#00994d] transition-all duration-300 group-hover:w-full"></span>
                                    </button>
                                ))}
                            </div>
                            <div className={`h-8 w-px ${isScrolled ? 'bg-slate-200' : 'bg-white/10'}`}></div>
                            {user ? (
                                <div className="flex items-center gap-3">
                                    <div className="text-right hidden lg:block">
                                        <span className={`block text-xs font-bold leading-none ${isScrolled ? 'text-[#002f6c]' : 'text-white'}`}>{user.displayName?.split(' ')[0]}</span>
                                        <span className="text-[10px] uppercase font-bold text-[#00994d]">{user.role}</span>
                                    </div>
                                    <button onClick={handlers.navigateToDashboard} className="bg-[#00994d] hover:bg-emerald-600 text-white p-2.5 rounded-xl shadow-lg shadow-emerald-600/20 transition-all hover:-translate-y-0.5 border border-emerald-400"><LayoutDashboard size={18} /></button>
                                    <button onClick={handlers.logout} className={`p-2.5 rounded-xl transition-all ${isScrolled ? 'text-slate-400 hover:bg-red-50 hover:text-red-600' : 'text-blue-200 hover:bg-white/10 hover:text-white'}`}><LogOut size={18} /></button>
                                </div>
                            ) : (
                                <button onClick={() => handlers.setIsLoginOpen(true)} className={`group px-6 py-2.5 rounded-xl shadow-lg transition-all hover:-translate-y-0.5 font-bold text-xs flex items-center gap-2 border ${isScrolled ? 'bg-[#002f6c] text-white border-[#002f6c] hover:bg-blue-900' : 'bg-white text-[#002f6c] border-white hover:bg-blue-50'}`}>
                                    <LogIn size={16} className="group-hover:translate-x-1 transition-transform" /> Masuk Portal
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* MAIN CONTENT */}
            <main className="pt-24 relative overflow-hidden">

             <RunningText />

                {/* Dekorasi Blob Background */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute top-[40%] left-0 w-[400px] h-[400px] bg-emerald-50/60 rounded-full blur-3xl -z-10 -translate-x-1/2"></div>

                <div className="relative"><HeroSection navigate={navigate} user={user} onDashboardClick={handlers.navigateToDashboard} /></div>

                <div className="relative z-10 -mt-10 mb-0">
                    <div className="max-w-7xl mx-auto px-6">
                        <EventBanner landingCountdown={data.landingCountdown} timeLeftEvent={data.timeLeftEvent} isAdmin={data.isAdmin} onEdit={() => handlers.setIsEditCountdownOpen(true)} />
                    </div>
                </div>

                {/* --- NEWS SECTION CLEAN --- */}
                {/* Tidak ada wrapper manual, menggunakan style dari NewsSection.jsx */}
                <NewsSection featuredNews={data.featuredNews} navigate={navigate} />
                {/* -------------------------- */}

                <section className="bg-[#f0f7ff] py-20 border-t border-blue-100 relative overflow-hidden">
                    <div className="absolute right-0 bottom-0 w-64 h-64 bg-blue-200/20 rounded-full blur-3xl"></div>
                    <JoinCTA />
                </section>
            </main>

            {/* FOOTER DESKTOP */}
            <footer className="bg-[#002f6c] text-white pt-24 pb-8 relative overflow-hidden border-t-[6px] border-[#00994d]">
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
                        <div className="md:col-span-1 space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-white rounded-2xl p-1.5 shadow-xl"><img src={logoJurusan} className="w-full h-full object-cover rounded-xl" alt="Logo" /></div>
                                <div><h4 className="font-black text-2xl leading-none tracking-tight">TKJ<br />CENTER</h4><span className="text-[10px] font-bold bg-[#00994d] px-2 py-0.5 rounded text-white mt-1 inline-block">SMK MUHAMMADIYAH 1</span></div>
                            </div>
                            <p className="text-blue-100 text-sm leading-relaxed border-l-2 border-[#00994d] pl-4">Mencetak teknisi handal yang berakhlak mulia, unggul dalam teknologi, dan siap bersaing global.</p>
                            <div className="flex gap-3 pt-2">
                                <a href="#" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-[#00994d] hover:-translate-y-1 transition-all"><Instagram size={18} /></a>
                                <a href="#" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-blue-500 hover:-translate-y-1 transition-all"><Globe size={18} /></a>
                                <a href="mailto:tkj@smkmuh1metro.sch.id" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-red-500 hover:-translate-y-1 transition-all"><Mail size={18} /></a>
                            </div>
                        </div>
                        <div className="md:col-span-1">
                            <h4 className="font-bold text-lg mb-8 text-white flex items-center gap-2"><span className="w-8 h-1 bg-[#00994d] rounded-full"></span> Hubungi Kami</h4>
                            <ul className="space-y-5 text-sm text-blue-100">
                                <li className="flex items-start gap-3"><div className="bg-white/10 p-2 rounded-lg text-[#00994d]"><MapPin size={16} /></div><span className="leading-relaxed">Jl. Tawes, Yosodadi, Metro Timur, Kota Metro, Lampung</span></li>
                                <li className="flex items-center gap-3"><div className="bg-white/10 p-2 rounded-lg text-[#00994d]"><Phone size={16} /></div><span>+62 895-6328-76627</span></li>
                            </ul>
                        </div>
                        <div className="md:col-span-1">
                            <h4 className="font-bold text-lg mb-8 text-white flex items-center gap-2"><span className="w-8 h-1 bg-[#00994d] rounded-full"></span> Akses Cepat</h4>
                            <ul className="space-y-3 text-sm font-medium text-blue-100">
                                {['Portal Kelas X', 'Portal Kelas XI', 'Portal Kelas XII', 'Showcase Project'].map((item, idx) => (
                                    <li key={idx}><button onClick={() => navigate(`/kelas-${item.split(' ')[2]?.toLowerCase() || 'x'}`)} className="hover:text-[#00994d] hover:translate-x-2 transition-all flex items-center gap-2 w-full text-left py-1"><span className="w-1.5 h-1.5 rounded-full bg-[#00994d]"></span> {item}</button></li>
                                ))}
                            </ul>
                        </div>
                        <div className="md:col-span-1">
                            <div className="bg-white p-1 rounded-xl shadow-lg rotate-1 hover:rotate-0 transition-transform">
                                <div className="bg-slate-100 p-4 rounded-lg text-center">
                                    <p className="text-[#002f6c] font-bold text-sm mb-3">Kunjungi Sekolah Kami</p>
                                    <a href="https://maps.google.com" target="_blank" rel="noreferrer" className="block w-full py-2 bg-[#00994d] text-white text-xs font-bold rounded hover:bg-emerald-700 transition-colors">Buka Google Maps</a>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium text-blue-200">
                        <p>© 2025 TKJ SMK Muhammadiyah 1 Metro. All rights reserved.</p>
                        <p className="flex items-center gap-1">Developed by <span className="text-white font-bold">Rafiantara</span></p>
                    </div>
                </div>
            </footer>
        </div>
    );
}