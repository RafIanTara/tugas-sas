import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Users, LayoutDashboard, Tag, BookOpen, 
    Menu, Monitor, X, MapPin, Phone, Instagram, Facebook, Mail, ArrowRight,
    LogIn, LogOut, Loader2
} from 'lucide-react';
import logoJurusan from '../assets/images/logotkj.jpg';

// Firebase
import { collection, query, getDocs, limit, orderBy, doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../services/firebase";
import { useAuth } from '../context/AuthContext'; 

// Components Refactored
import NavbarWidget from '../components/landing/NavbarWidget';
import HeroSection from '../components/landing/HeroSection';
import EventBanner from '../components/landing/EventBanner';
import NewsSection from '../components/landing/NewsSection';
import ModalWrapper from '../components/ui/ModalWrapper'; // Pakai ModalWrapper generic kita

export default function LandingPage() {
    const navigate = useNavigate();
    const { user, login, register, logout } = useAuth();
    
    // STATE MODALS
    const [isEditCountdownOpen, setIsEditCountdownOpen] = useState(false); 
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isRegisterOpen, setIsRegisterOpen] = useState(false);

    const isAdmin = user?.role === 'ADMIN';

    // STATE AUTH
    const [authLoading, setAuthLoading] = useState(false);
    const [authError, setAuthError] = useState('');
    const [loginData, setLoginData] = useState({ email: '', password: '' });
    const [regData, setRegData] = useState({ name: '', email: '', password: '', targetRole: 'SISWA', kelasId: 'X' });

    // STATE DATA
    const [featuredNews, setFeaturedNews] = useState([]);
    const [prayerTimes, setPrayerTimes] = useState(null);
    const [nextPrayer, setNextPrayer] = useState({ name: '-', time: '-' });
    const [landingCountdown, setLandingCountdown] = useState({ title: '', targetDate: '' });
    const [currentTime, setCurrentTime] = useState('');
    const [timeLeftEvent, setTimeLeftEvent] = useState({ d: 0, h: 0, m: 0, s: 0 });
    const [isScrolled, setIsScrolled] = useState(false);

    // --- HANDLERS AUTH ---
    const handleLogin = async (e) => {
        e.preventDefault(); setAuthLoading(true); setAuthError('');
        try {
            await login(loginData.email, loginData.password);
            setIsLoginOpen(false);
            setLoginData({ email: '', password: '' });
        } catch (err) { setAuthError("Email atau Password salah!"); }
        finally { setAuthLoading(false); }
    };

    const handleRegister = async (e) => {
        e.preventDefault(); setAuthLoading(true); setAuthError('');
        try {
            await register(regData.email, regData.password, regData.name, regData.targetRole, regData.kelasId);
            setIsRegisterOpen(false);
            alert("Registrasi Berhasil! Akun berstatus PENDING hingga disetujui.");
            setRegData({ name: '', email: '', password: '', targetRole: 'SISWA', kelasId: 'X' });
        } catch (err) { setAuthError("Gagal daftar: " + err.message); }
        finally { setAuthLoading(false); }
    };

    const navigateToDashboard = () => {
        if (!user) return setIsLoginOpen(true);
        const targetKelas = user.kelasId ? user.kelasId.toLowerCase() : 'x';
        navigate(`/kelas-${targetKelas}`);
    };

    // --- FETCH DATA (News, Prayer, Countdown) ---
    useEffect(() => {
        const fetchAll = async () => {
            try {
                // News
                const qNews = query(collection(db, "berita_sekolah"), orderBy("createdAt", "desc"), limit(3));
                const snapNews = await getDocs(qNews);
                setFeaturedNews(snapNews.docs.map(d => ({ id: d.id, ...d.data() })));

                // Prayer
                const date = new Date(); const today = date.toISOString().split('T')[0].split('-').reverse().join('-');
                const res = await fetch(`https://api.aladhan.com/v1/timingsByCity/${today}?city=Metro&country=Indonesia&method=20`);
                const data = await res.json(); if (data.code === 200) setPrayerTimes(data.data.timings);

                // Countdown
                const docRef = doc(db, "settings", "landing_countdown");
                const snapCountdown = await getDoc(docRef);
                if (snapCountdown.exists()) setLandingCountdown(snapCountdown.data());
            } catch (e) { console.error(e); }
        };
        fetchAll();
    }, []);

    // --- EFFECTS: Scroll & Timer ---
    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll); return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (!prayerTimes) return;
        const interval = setInterval(() => {
            const now = new Date(); setCurrentTime(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/\./g, ':'));
            const timings = { 'Subuh': prayerTimes.Fajr, 'Dzuhur': prayerTimes.Dhuhr, 'Ashar': prayerTimes.Asr, 'Maghrib': prayerTimes.Maghrib, 'Isya': prayerTimes.Isha };
            let upcoming = null, minDiff = Infinity;
            for (const [name, time] of Object.entries(timings)) {
                const [h, m] = time.split(':').map(Number); const pDate = new Date(); pDate.setHours(h, m, 0, 0); const diff = pDate - now;
                if (diff < 0 && diff > -600000) { upcoming = { name, time }; break; }
                if (diff > 0 && diff < minDiff) { minDiff = diff; upcoming = { name, time }; }
            }
            if (!upcoming) upcoming = { name: 'Subuh', time: prayerTimes.Fajr }; setNextPrayer(upcoming);
        }, 1000);
        return () => clearInterval(interval);
    }, [prayerTimes]);

    useEffect(() => {
        if (!landingCountdown.targetDate) return;
        const interval = setInterval(() => {
            const diff = new Date(landingCountdown.targetDate) - new Date();
            if (diff > 0) { setTimeLeftEvent({ d: Math.floor(diff / (864e5)), h: Math.floor((diff / 36e5) % 24), m: Math.floor((diff / 6e4) % 60), s: Math.floor((diff / 1e3) % 60) }); }
        }, 1000);
        return () => clearInterval(interval);
    }, [landingCountdown]);

    // --- SAVE COUNTDOWN HANDLER ---
    const handleSaveCountdown = async (e) => { 
        e.preventDefault(); 
        try { 
            await setDoc(doc(db, 'settings', 'landing_countdown'), { 
                title: landingCountdown.title, 
                targetDate: landingCountdown.targetDate, 
                updatedAt: serverTimestamp() 
            }); 
            alert("Countdown Landing Page berhasil diupdate!"); 
            setIsEditCountdownOpen(false); 
        } catch (e) { alert("Gagal update: " + e.message); } 
    };

    return (
        <div className="min-h-screen font-sans text-slate-800 bg-white overflow-x-hidden w-full">

            {/* NAVBAR (Tetap di sini karena Logic Navigasinya nempel) */}
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 w-full ${isScrolled ? 'bg-[#002f6c]/95 backdrop-blur-md shadow-md py-2' : 'bg-[#002f6c] py-4'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-12">
                        {/* Logo */}
                        <div className="flex items-center gap-3 cursor-pointer z-20 shrink-0" onClick={() => window.scrollTo(0, 0)}>
                            <div className="h-10 w-10 rounded-lg overflow-hidden border-2 border-white/20 shadow-sm bg-white"><img src={logoJurusan} className="h-full w-full object-cover" alt="Logo" /></div>
                            <div className="leading-tight"><span className="block font-black text-lg tracking-tight text-white whitespace-nowrap">TKJ CENTER</span><span className="block font-semibold text-emerald-400 text-[10px] tracking-widest uppercase whitespace-nowrap">SMK Muhammadiyah 1</span></div>
                        </div>

                        {/* Widget Jam (Imported Component) */}
                        <div className="absolute left-1/2 transform -translate-x-1/2 hidden xl:block">
                            <NavbarWidget currentTime={currentTime} nextPrayer={nextPrayer} />
                        </div>

                        {/* Menu Desktop */}
                        <div className="hidden md:flex items-center gap-6 z-20 shrink-0">
                            <div className="flex space-x-6 text-sm font-bold text-blue-100">
                                <button onClick={() => navigate('/berita')} className="hover:text-white transition-colors">Berita</button>
                                <button onClick={() => navigate('/showcase')} className="hover:text-white transition-colors">Showcase</button>
                                <button onClick={() => navigate('/ebook')} className="hover:text-white transition-colors">E-Library</button>
                            </div>

                            {user ? (
                                <div className="flex items-center gap-3 pl-4 border-l border-white/20">
                                    <div className="text-right hidden lg:block">
                                        <span className="block text-white text-xs font-bold leading-none">{user.displayName?.split(' ')[0]}</span>
                                        <span className="text-[10px] text-emerald-300 uppercase">{user.role}</span>
                                    </div>
                                    <button onClick={navigateToDashboard} className="bg-emerald-500 hover:bg-emerald-600 text-white p-2 rounded-lg transition-colors shadow-sm" title="Dashboard"><LayoutDashboard size={18}/></button>
                                    <button onClick={logout} className="bg-white/10 hover:bg-red-500 hover:text-white text-blue-200 p-2 rounded-lg transition-colors" title="Logout"><LogOut size={18} /></button>
                                </div>
                            ) : (
                                <button onClick={() => setIsLoginOpen(true)} className="bg-white hover:bg-blue-50 text-[#002f6c] px-5 py-2 rounded-full transition-all shadow-sm text-xs font-bold flex items-center gap-2 whitespace-nowrap">
                                    <LogIn size={16} /> Masuk Portal
                                </button>
                            )}
                        </div>

                        {/* Mobile Toggle */}
                        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-white p-2 z-20 hover:bg-white/10 rounded-lg">
                            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden bg-white border-t border-slate-100 shadow-xl absolute w-full left-0 top-full animate-in slide-in-from-top-5">
                        <div className="flex flex-col p-4 space-y-2">
                            <button onClick={() => { setMobileMenuOpen(false); navigate('/berita') }} className="w-full text-left font-bold px-4 py-3 rounded-lg text-slate-700 hover:bg-slate-50 flex items-center gap-2"><Tag size={18} /> Berita & Kegiatan</button>
                            <button onClick={() => { setMobileMenuOpen(false); navigate('/showcase') }} className="w-full text-left font-bold px-4 py-3 rounded-lg text-slate-700 hover:bg-slate-50 flex items-center gap-2"><Monitor size={18} /> Showcase Project</button>
                            <button onClick={() => { setMobileMenuOpen(false); navigate('/ebook') }} className="w-full text-left font-bold px-4 py-3 rounded-lg text-slate-700 hover:bg-slate-50 flex items-center gap-2"><BookOpen size={18} /> E-Library</button>
                            <div className="h-px bg-slate-100 my-2"></div>
                            {!user ? (
                                <button onClick={() => { setMobileMenuOpen(false); setIsLoginOpen(true) }} className="w-full text-left font-bold px-4 py-3 rounded-lg bg-[#002f6c] text-white flex items-center gap-2 shadow-md"><LogIn size={18} /> Masuk Portal</button>
                            ) : (
                                <>
                                    <button onClick={() => { setMobileMenuOpen(false); navigateToDashboard() }} className="w-full text-left font-bold px-4 py-3 rounded-lg bg-emerald-500 text-white flex items-center gap-2"><LayoutDashboard size={18} /> Dashboard Kelas</button>
                                    <button onClick={() => { setMobileMenuOpen(false); logout() }} className="w-full text-left font-bold px-4 py-3 rounded-lg bg-red-50 text-red-600 flex items-center gap-2"><LogOut size={18} /> Logout</button>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </nav>

            {/* SECTIONS IMPORTED */}
            <HeroSection navigate={navigate} user={user} onDashboardClick={navigateToDashboard} />
            <EventBanner landingCountdown={landingCountdown} timeLeftEvent={timeLeftEvent} isAdmin={isAdmin} onEdit={() => setIsEditCountdownOpen(true)} />
            <NewsSection featuredNews={featuredNews} navigate={navigate} />

            {/* FOOTER (Simple enough to keep inline or extract if needed) */}
            <footer className="bg-[#002f6c] text-white pt-20 pb-10 border-t-8 border-[#00994d] w-full">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-3 gap-12 lg:gap-20 mb-16">
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white rounded-lg p-1"><img src={logoJurusan} className="w-full h-full object-cover rounded" alt="Logo Footer" /></div>
                                <div><h4 className="font-black text-xl leading-none tracking-tight">TKJ CENTER</h4><p className="text-xs font-bold text-emerald-400 tracking-[0.2em] mt-1.5 uppercase">SMK Muhammadiyah 1 Metro</p></div>
                            </div>
                            <p className="text-blue-100 text-sm leading-relaxed opacity-80">Mewujudkan teknisi yang kompeten, berakhlak mulia, dan siap bersaing di dunia industri global.</p>
                            <div className="flex gap-3">
                                <a href="#" className="w-10 h-10 bg-white/5 border border-white/10 rounded-full flex items-center justify-center hover:bg-[#00994d] hover:border-[#00994d] transition-all"><Instagram size={18} /></a>
                                <a href="#" className="w-10 h-10 bg-white/5 border border-white/10 rounded-full flex items-center justify-center hover:bg-[#00994d] hover:border-[#00994d] transition-all"><Facebook size={18} /></a>
                                <a href="mailto:tkj@smkmuh1metro.sch.id" className="w-10 h-10 bg-white/5 border border-white/10 rounded-full flex items-center justify-center hover:bg-[#00994d] hover:border-[#00994d] transition-all"><Mail size={18} /></a>
                            </div>
                        </div>
                        <div>
                            <h4 className="font-bold text-lg mb-8 flex items-center gap-2 text-white">Hubungi Kami</h4>
                            <ul className="space-y-5 text-sm text-blue-100">
                                <li className="flex items-start gap-4 group"><div className="bg-white/10 p-2 rounded-lg text-emerald-400 group-hover:bg-[#00994d] group-hover:text-white transition-colors"><MapPin size={18} /></div><span className="leading-relaxed">Jl. Tawes, Yosodadi, Kec. Metro Timur, Kota Metro, Lampung 34111</span></li>
                                <li className="flex items-center gap-4 group"><div className="bg-white/10 p-2 rounded-lg text-emerald-400 group-hover:bg-[#00994d] group-hover:text-white transition-colors"><Phone size={18} /></div><span>+62 725 41926</span></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-lg mb-8 text-white">Akses Cepat</h4>
                            <ul className="space-y-3 text-sm font-medium text-blue-200">
                                <li><button onClick={() => navigate('/kelas-x')} className="hover:text-white hover:translate-x-2 transition-all flex items-center gap-2"><ArrowRight size={12} /> Portal Kelas X</button></li>
                                <li><button onClick={() => navigate('/kelas-xi')} className="hover:text-white hover:translate-x-2 transition-all flex items-center gap-2"><ArrowRight size={12} /> Portal Kelas XI</button></li>
                                <li><button onClick={() => navigate('/kelas-xii')} className="hover:text-white hover:translate-x-2 transition-all flex items-center gap-2"><ArrowRight size={12} /> Portal Kelas XII</button></li>
                                <li><button onClick={() => navigate('/showcase')} className="hover:text-white hover:translate-x-2 transition-all flex items-center gap-2"><ArrowRight size={12} /> Showcase Project</button></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-white/10 pt-8 text-center flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-xs text-blue-300 font-medium">© 2025 TKJ SMK Muhammadiyah 1 Metro.</p>
                        <p className="text-xs text-blue-400 font-medium flex items-center gap-1">Developed with ❤️ by <span className="text-white font-bold">Rafiantara</span></p>
                    </div>
                </div>
            </footer>

            {/* MODALS AUTH (Using Reusable ModalWrapper) */}
            <ModalWrapper isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} title="Login Portal">
                <form onSubmit={handleLogin} className="space-y-4">
                    {authError && <div className="bg-red-50 text-red-600 p-3 rounded text-xs text-center font-bold">{authError}</div>}
                    <div><label className="text-xs font-bold text-slate-500">Email</label><input type="email" required className="w-full border p-3 rounded-lg text-sm outline-none focus:border-[#002f6c]" onChange={e => setLoginData({ ...loginData, email: e.target.value })} /></div>
                    <div><label className="text-xs font-bold text-slate-500">Password</label><input type="password" required className="w-full border p-3 rounded-lg text-sm outline-none focus:border-[#002f6c]" onChange={e => setLoginData({ ...loginData, password: e.target.value })} /></div>
                    <button disabled={authLoading} className="w-full bg-[#002f6c] text-white py-3 rounded-xl font-bold hover:bg-blue-900 transition flex justify-center">{authLoading ? <Loader2 className="animate-spin" /> : "Masuk Sekarang"}</button>
                    <p className="text-center text-xs text-slate-500 mt-4">Belum punya akun? <span onClick={() => { setIsLoginOpen(false); setIsRegisterOpen(true) }} className="text-blue-600 font-bold cursor-pointer hover:underline">Daftar disini</span></p>
                </form>
            </ModalWrapper>

            <ModalWrapper isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} title="Daftar Akun Baru">
                <form onSubmit={handleRegister} className="space-y-3">
                    {authError && <div className="bg-red-50 text-red-600 p-3 rounded text-xs text-center font-bold">{authError}</div>}
                    <div><label className="text-xs font-bold text-slate-500">Nama Lengkap</label><input type="text" required className="w-full border p-2.5 rounded-lg text-sm" onChange={e => setRegData({ ...regData, name: e.target.value })} /></div>
                    <div><label className="text-xs font-bold text-slate-500">Email</label><input type="email" required className="w-full border p-2.5 rounded-lg text-sm" onChange={e => setRegData({ ...regData, email: e.target.value })} /></div>
                    <div><label className="text-xs font-bold text-slate-500">Password</label><input type="password" required className="w-full border p-2.5 rounded-lg text-sm" minLength={6} onChange={e => setRegData({ ...regData, password: e.target.value })} /></div>
                    <div className="grid grid-cols-2 gap-3">
                        <div><label className="text-xs font-bold text-slate-500">Role</label><select className="w-full border p-2.5 rounded-lg text-sm" onChange={e => setRegData({ ...regData, targetRole: e.target.value })}><option value="SISWA">Siswa</option><option value="GURU">Guru</option></select></div>
                        <div><label className="text-xs font-bold text-slate-500">Kelas</label><select className="w-full border p-2.5 rounded-lg text-sm" onChange={e => setRegData({ ...regData, kelasId: e.target.value })}><option value="X">Kelas X</option><option value="XI">Kelas XI</option><option value="XII">Kelas XII</option></select></div>
                    </div>
                    <button disabled={authLoading} className="w-full bg-[#00994d] text-white py-3 rounded-xl font-bold hover:bg-green-700 transition flex justify-center mt-2">{authLoading ? <Loader2 className="animate-spin" /> : "Daftar Akun"}</button>
                    <p className="text-center text-xs text-slate-500 mt-4">Sudah punya akun? <span onClick={() => { setIsRegisterOpen(false); setIsLoginOpen(true) }} className="text-blue-600 font-bold cursor-pointer hover:underline">Login disini</span></p>
                </form>
            </ModalWrapper>

            {/* MODAL EDIT COUNTDOWN */}
            <ModalWrapper isOpen={isEditCountdownOpen} onClose={() => setIsEditCountdownOpen(false)} title="Edit Event Publik">
                <form onSubmit={handleSaveCountdown} className="space-y-4">
                    <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-xs mb-2">Info: Countdown ini akan dilihat oleh semua pengunjung website (Tamu/Siswa/Guru).</div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Nama Event</label>
                        <input type="text" className="w-full border p-2 rounded text-sm" placeholder="Contoh: PPDB Gelombang 1" value={landingCountdown.title} onChange={e => setLandingCountdown({...landingCountdown, title: e.target.value})} required/>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Waktu Target</label>
                        <input type="datetime-local" className="w-full border p-2 rounded text-sm" value={landingCountdown.targetDate || ''} onChange={e => setLandingCountdown({...landingCountdown, targetDate: e.target.value})} required/>
                    </div>
                    <div className="flex gap-2 pt-2">
                        <button type="button" onClick={async () => {
                            if(confirm("Hapus Countdown?")) {
                                await setDoc(doc(db, 'settings', 'landing_countdown'), { title: '', targetDate: '' });
                                setLandingCountdown({ title: '', targetDate: '' });
                                setIsEditCountdownOpen(false);
                            }
                        }} className="px-4 py-2 bg-red-100 text-red-600 rounded-lg text-xs font-bold hover:bg-red-200">Hapus</button>
                        <button type="submit" className="flex-1 bg-[#002f6c] text-white py-2 rounded-lg text-sm font-bold hover:bg-blue-800">Simpan Perubahan</button>
                    </div>
                </form>
            </ModalWrapper>
        </div>
    );
}