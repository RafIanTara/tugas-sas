import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

// Firebase
import { collection, query, getDocs, limit, orderBy, doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../services/firebase";
import { useAuth } from '../context/AuthContext';

// Hooks & Utils
import useIsMobile from '../hooks/useIsMobile';
import ModalWrapper from '../components/ui/ModalWrapper';

// Views
import LandingPageDesktop from './views/LandingPageDesktop';
import LandingPageMobile from './views/LandingPageMobile';

export default function LandingPage() {
    const navigate = useNavigate();
    const { user, login, register, logout } = useAuth();
    const isMobile = useIsMobile(); // Deteksi Layar

    // --- STATE MANAGEMENT ---
    const [isEditCountdownOpen, setIsEditCountdownOpen] = useState(false);
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isRegisterOpen, setIsRegisterOpen] = useState(false);
    const isAdmin = user?.role === 'ADMIN';

    // Auth State
    const [authLoading, setAuthLoading] = useState(false);
    const [authError, setAuthError] = useState('');
    const [loginData, setLoginData] = useState({ email: '', password: '' });
    const [regData, setRegData] = useState({ name: '', email: '', password: '', targetRole: 'SISWA', kelasId: 'X' });

    // Data State
    const [featuredNews, setFeaturedNews] = useState([]);
    const [prayerTimes, setPrayerTimes] = useState(null);
    const [nextPrayer, setNextPrayer] = useState({ name: '-', time: '-' });
    const [landingCountdown, setLandingCountdown] = useState({ title: '', targetDate: '' });
    const [currentTime, setCurrentTime] = useState('');
    const [timeLeftEvent, setTimeLeftEvent] = useState({ d: 0, h: 0, m: 0, s: 0 });
    const [isScrolled, setIsScrolled] = useState(false);

    // --- HANDLERS ---
    const handlers = {
        setIsLoginOpen,
        setIsRegisterOpen,
        setIsEditCountdownOpen,
        logout,
        navigateToDashboard: () => {
            if (!user) return setIsLoginOpen(true);
            const targetKelas = user.kelasId ? user.kelasId.toLowerCase() : 'x';
            navigate(`/kelas-${targetKelas}`);
        },
        handleLogin: async (e) => {
            e.preventDefault(); setAuthLoading(true); setAuthError('');
            try { await login(loginData.email, loginData.password); setIsLoginOpen(false); setLoginData({ email: '', password: '' }); } 
            catch (err) { setAuthError("Email atau Password salah!"); } finally { setAuthLoading(false); }
        },
        handleRegister: async (e) => {
            e.preventDefault(); setAuthLoading(true); setAuthError('');
            try { 
                await register(regData.email, regData.password, regData.name, regData.targetRole, regData.kelasId);
                setIsRegisterOpen(false); alert("Registrasi Berhasil! Akun berstatus PENDING hingga disetujui.");
                setRegData({ name: '', email: '', password: '', targetRole: 'SISWA', kelasId: 'X' });
            } catch (err) { setAuthError("Gagal daftar: " + err.message); } finally { setAuthLoading(false); }
        },
        handleSaveCountdown: async (e) => {
            e.preventDefault();
            try {
                await setDoc(doc(db, 'settings', 'landing_countdown'), { title: landingCountdown.title, targetDate: landingCountdown.targetDate, updatedAt: serverTimestamp() });
                alert("Countdown berhasil diupdate!"); setIsEditCountdownOpen(false);
            } catch (e) { alert("Gagal update: " + e.message); }
        }
    };

    // --- EFFECTS (Fetch Data, Scroll, Timer) ---
    useEffect(() => {
        const fetchAll = async () => {
            try {
                const qNews = query(collection(db, "berita_sekolah"), orderBy("createdAt", "desc"), limit(3));
                const snapNews = await getDocs(qNews);
                setFeaturedNews(snapNews.docs.map(d => ({ id: d.id, ...d.data() })));

                const date = new Date(); const today = date.toISOString().split('T')[0].split('-').reverse().join('-');
                const res = await fetch(`https://api.aladhan.com/v1/timingsByCity/${today}?city=Metro&country=Indonesia&method=20`);
                const data = await res.json(); if (data.code === 200) setPrayerTimes(data.data.timings);

                const docRef = doc(db, "settings", "landing_countdown");
                const snapCountdown = await getDoc(docRef);
                if (snapCountdown.exists()) setLandingCountdown(snapCountdown.data());
            } catch (e) { console.error(e); }
        };
        fetchAll();
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
            if (diff > 0) setTimeLeftEvent({ d: Math.floor(diff / (864e5)), h: Math.floor((diff / 36e5) % 24), m: Math.floor((diff / 6e4) % 60), s: Math.floor((diff / 1e3) % 60) });
        }, 1000);
        return () => clearInterval(interval);
    }, [landingCountdown]);

    // --- BUNDLE PROPS ---
    const viewProps = {
        user, navigate, handlers, isScrolled,
        data: { featuredNews, nextPrayer, currentTime, landingCountdown, timeLeftEvent, isAdmin }
    };

    return (
        <>
            {/* 1. SWITCH VIEW */}
            {isMobile ? <LandingPageMobile {...viewProps} /> : <LandingPageDesktop {...viewProps} />}

            {/* 2. GLOBAL MODALS */}
            <ModalWrapper isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} title="Login Portal">
                <form onSubmit={handlers.handleLogin} className="space-y-4">
                    {authError && <div className="bg-red-50 text-red-600 p-3 rounded text-xs text-center font-bold">{authError}</div>}
                    <div><label className="text-xs font-bold text-slate-500">Email</label><input type="email" required className="w-full border p-3 rounded-lg text-sm outline-none focus:border-[#002f6c]" onChange={e => setLoginData({ ...loginData, email: e.target.value })} /></div>
                    <div><label className="text-xs font-bold text-slate-500">Password</label><input type="password" required className="w-full border p-3 rounded-lg text-sm outline-none focus:border-[#002f6c]" onChange={e => setLoginData({ ...loginData, password: e.target.value })} /></div>
                    <button disabled={authLoading} className="w-full bg-[#002f6c] text-white py-3 rounded-xl font-bold hover:bg-blue-900 transition flex justify-center">{authLoading ? <Loader2 className="animate-spin" /> : "Masuk Sekarang"}</button>
                    <p className="text-center text-xs text-slate-500 mt-4">Belum punya akun? <span onClick={() => { setIsLoginOpen(false); setIsRegisterOpen(true) }} className="text-blue-600 font-bold cursor-pointer hover:underline">Daftar disini</span></p>
                </form>
            </ModalWrapper>

            <ModalWrapper isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} title="Daftar Akun Baru">
                <form onSubmit={handlers.handleRegister} className="space-y-3">
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

            <ModalWrapper isOpen={isEditCountdownOpen} onClose={() => setIsEditCountdownOpen(false)} title="Edit Event Publik">
                <form onSubmit={handlers.handleSaveCountdown} className="space-y-4">
                    <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-xs mb-2">Info: Countdown ini akan dilihat oleh semua pengunjung website.</div>
                    <div><label className="block text-xs font-bold text-slate-500 mb-1">Nama Event</label><input type="text" className="w-full border p-2 rounded text-sm" value={landingCountdown.title} onChange={e => setLandingCountdown({ ...landingCountdown, title: e.target.value })} required /></div>
                    <div><label className="block text-xs font-bold text-slate-500 mb-1">Waktu Target</label><input type="datetime-local" className="w-full border p-2 rounded text-sm" value={landingCountdown.targetDate || ''} onChange={e => setLandingCountdown({ ...landingCountdown, targetDate: e.target.value })} required /></div>
                    <div className="flex gap-2 pt-2">
                        <button type="button" onClick={async () => { if (confirm("Hapus Countdown?")) { await setDoc(doc(db, 'settings', 'landing_countdown'), { title: '', targetDate: '' }); setLandingCountdown({ title: '', targetDate: '' }); setIsEditCountdownOpen(false); } }} className="px-4 py-2 bg-red-100 text-red-600 rounded-lg text-xs font-bold hover:bg-red-200">Hapus</button>
                        <button type="submit" className="flex-1 bg-[#002f6c] text-white py-2 rounded-lg text-sm font-bold hover:bg-blue-800">Simpan Perubahan</button>
                    </div>
                </form>
            </ModalWrapper>
        </>
    );
}