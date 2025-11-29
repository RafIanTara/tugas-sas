import { useState, useEffect, useRef } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import logoJurusan from '../assets/images/logotkj.jpg'

// ICONS
import { BookOpen, CheckSquare, Plus, Trash2, X, Edit3, Megaphone, Calendar, Link, Wifi, Calculator, Zap, Send, Bot, Globe, Lock, Unlock, LogOut, Image as ImageIcon, XCircle, UserCheck, Coffee, Settings, Key, Quote, Wallet, TrendingUp, TrendingDown, FileSpreadsheet, Download, Filter, UserMinus, CheckCircle, AlertCircle, Home, Eye, Users, Moon, Sun, Newspaper, UploadCloud, Brain, Clock, Monitor, Loader2 } from 'lucide-react'

// FIREBASE
import { collection, doc, updateDoc, addDoc, deleteDoc, setDoc, serverTimestamp, getDoc } from "firebase/firestore"
import { db } from "../services/firebase"
import useFirestore from '../hooks/useFirestore'

// AI & UTILS
import { GoogleGenerativeAI } from "@google/generative-ai"
import ReactMarkdown from 'react-markdown'
import { motion, AnimatePresence } from "framer-motion"
import * as XLSX from 'xlsx'

// --- NEW AUTH & PERMISSIONS IMPORTS ---
import { useAuth } from '../context/AuthContext'
import { canAccess } from '../utils/permissions'
import ApprovalList from '../components/ApprovalList'

const DEFAULT_QUOTES = [
    { text: "Hidup hidupilah Muhammadiyah, jangan mencari hidup di Muhammadiyah.", author: "KH. Ahmad Dahlan" },
    { text: "Pendidikan adalah senjata paling mematikan untuk mengubah dunia.", author: "Nelson Mandela" }
]

// --- SUB-COMPONENTS (MODAL & TOAST) ---
const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null
    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-800 w-full md:max-w-lg rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border-t-4 border-[#002f6c] dark:border-blue-500">
                <div className="flex justify-between items-center px-6 py-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 shrink-0">
                    <h3 className="text-lg font-bold tracking-wide flex items-center gap-2 uppercase text-[#002f6c] dark:text-blue-400">{title}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-red-500 transition-colors"><X size={20} /></button>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200">{children}</div>
            </div>
        </div>
    )
}

const Toast = ({ message, type, onClose }) => {
    return (
        <motion.div initial={{ opacity: 0, y: -50, x: 50 }} animate={{ opacity: 1, y: 0, x: 0 }} exit={{ opacity: 0, y: -20, x: 20 }} className={`fixed top-5 right-5 z-[100] flex items-center gap-3 px-4 py-3 rounded-lg shadow-xl border-l-4 min-w-[300px] ${type === 'success' ? 'bg-white border-green-500 text-slate-700' : 'bg-white border-red-500 text-slate-700'}`}>
            {type === 'success' ? <CheckCircle className="text-green-500" size={20} /> : <AlertCircle className="text-red-500" size={20} />}
            <span className="text-sm font-semibold">{message}</span>
            <button onClick={onClose} className="ml-auto text-slate-400 hover:text-slate-600"><X size={14} /></button>
        </motion.div>
    )
}

// ===============================================
// MAIN COMPONENT: DASHBOARD KELAS
// ===============================================
function DashboardKelas({ kelasId }) {
    const navigate = useNavigate()
    
    // 1. INTEGRASI AUTH CONTEXT
    const { user, logout, loading: authLoading } = useAuth() 
    const dbPrefix = kelasId.toLowerCase() + '_';

    // THEME STATE
    const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark')
    useEffect(() => { if (isDarkMode) { document.documentElement.classList.add('dark'); localStorage.setItem('theme', 'dark') } else { document.documentElement.classList.remove('dark'); localStorage.setItem('theme', 'light') } }, [isDarkMode])

    // BASIC STATE
    const [time, setTime] = useState(new Date())
    const namaHariIni = new Date().toLocaleDateString('id-ID', { weekday: 'long' })
    const [hariPilihan, setHariPilihan] = useState(namaHariIni)
    const [quote, setQuote] = useState(DEFAULT_QUOTES[0])
    const [newQuoteText, setNewQuoteText] = useState('')
    const [toast, setToast] = useState(null)

    // MODAL STATES
    const [isStrukturModalOpen, setIsStrukturModalOpen] = useState(false)
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)
    const [isPiketModalOpen, setIsPiketModalOpen] = useState(false)
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false)
    const [isAiModalOpen, setIsAiModalOpen] = useState(false)
    const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false)
    const [isKasModalOpen, setIsKasModalOpen] = useState(false)
    const [isPdfModalOpen, setIsPdfModalOpen] = useState(false)
    const [isAbsenModalOpen, setIsAbsenModalOpen] = useState(false)
    const [isNewsModalOpen, setIsNewsModalOpen] = useState(false)
    const [isGaleriModalOpen, setIsGaleriModalOpen] = useState(false)
    const [isCountdownModalOpen, setIsCountdownModalOpen] = useState(false) // MODAL BARU UNTUK EDIT COUNTDOWN
    
    // INPUT STATES
    const [settingTab, setSettingTab] = useState('ai')
    
    // AI SETTINGS
    const [apiKeyInput, setApiKeyInput] = useState('')
    const [isApiKeySet, setIsApiKeySet] = useState(false)
    const [selectedModel, setSelectedModel] = useState('gemini-1.5-flash')
    const [guestAiContext, setGuestAiContext] = useState('')

    // COUNTDOWN STATES
    const [countdownData, setCountdownData] = useState({ title: '', targetDate: '' })
    const [landingCountdownData, setLandingCountdownData] = useState({ title: '', targetDate: '' }) 
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

    // DATA INPUT STATES (Kas, Tugas, dll)
    const [saldoAwal, setSaldoAwal] = useState(0)
    const [newStudentName, setNewStudentName] = useState('')
    const [nominalKas, setNominalKas] = useState(2000)
    const [newTask, setNewTask] = useState({ judul: '', mapel: '' })
    const [scheduleInput, setScheduleInput] = useState('')
    const [piketInput, setPiketInput] = useState('')
    const [infoInput, setInfoInput] = useState('')
    const [absenInput, setAbsenInput] = useState({ sakit: '', izin: '', alpha: '' })
    const [absenTab, setAbsenTab] = useState('view')
    const [kasTab, setKasTab] = useState('laporan')
    const [kasInput, setKasInput] = useState({ tanggal: new Date().toISOString().split('T')[0], nama: '', jumlah: '', tipe: 'masuk', keterangan: '' })
    const [buktiFile, setBuktiFile] = useState(null)
    const [buktiPreview, setBuktiPreview] = useState(null)
    const [newsInput, setNewsInput] = useState({ title: '', category: 'Kegiatan', content: '', imageBase64: '' })
    const [newsImagePreview, setNewsImagePreview] = useState(null)
    const [galeriInput, setGaleriInput] = useState({ caption: '', imageBase64: '' })
    const [galeriImagePreview, setGaleriImagePreview] = useState(null)
    const [pdfImages, setPdfImages] = useState([])
    const [filterBulan, setFilterBulan] = useState(new Date().getMonth() + 1)
    const [filterTahun, setFilterTahun] = useState(new Date().getFullYear())

    // --- STATE STRUKTUR ORGANISASI (BARU) ---
    const [strukturData, setStrukturData] = useState({
        kajur: '-', wali_kelas: '-', ketua: '-', wakil: '-', sekretaris: '-', bendahara: '-'
    })
    const [isEditingStruktur, setIsEditingStruktur] = useState(false)

    // CHAT STATES
    const [chatInput, setChatInput] = useState('')
    // Chat History Initial dengan nama User yang login
    const [chatHistory, setChatHistory] = useState([])
    useEffect(() => {
        if(user) {
            setChatHistory([{ role: 'model', text: `Assalamualaikum ${user.displayName || 'Wak'}! Gue Asisten AI TKJ nih. Ada yang bisa gue bantu? Spill aja!` }])
        }
    }, [user])

    const [isTyping, setIsTyping] = useState(false)
    const [imageFile, setImageFile] = useState(null)
    const [imagePreview, setImagePreview] = useState(null)

    // REFS
    const newsFileInputRef = useRef(null)
    const galeriFileInputRef = useRef(null)
    const buktiInputRef = useRef(null)
    const fileInputRef = useRef(null)
    const chatEndRef = useRef(null)

    // FIRESTORE HOOKS
    const { data: daftarTugas, loading: loadingTugas } = useFirestore(`${dbPrefix}tugas`)
    const { data: dataJadwal, loading: loadingJadwal } = useFirestore(`${dbPrefix}jadwal`)
    const { data: dataPiket, loading: loadingPiket } = useFirestore(`${dbPrefix}piket`)
    const { data: dataStudents, loading: loadingStudents } = useFirestore(`${dbPrefix}students`)
    const { data: dataKas, loading: loadingKas } = useFirestore(`${dbPrefix}uang_kas`)
    const { data: dataAbsensi } = useFirestore(`${dbPrefix}absensi`)
    const { data: dataInfo } = useFirestore('pengumuman')
    const { data: dataQuotes, loading: loadingQuotes } = useFirestore('quotes')

    // DERIVED DATA
    const jadwalTampil = dataJadwal.find(j => j.id === hariPilihan)
    const piketTampil = dataPiket.find(p => p.id === hariPilihan)
    const absenHariIni = dataAbsensi.find(a => a.id === 'harian') || { sakit: '-', izin: '-', alpha: '-' }
    const activeQuotes = dataQuotes.length > 0 ? dataQuotes : DEFAULT_QUOTES
    const countAbsen = (str) => { if (!str || str === '-') return 0; return str.split(',').map(s => s.trim()).filter(s => s.length > 0).length; }
    const countSakit = countAbsen(absenHariIni.sakit);
    const countIzin = countAbsen(absenHariIni.izin);
    const countAlpha = countAbsen(absenHariIni.alpha);
    const totalTransaksi = dataKas.reduce((acc, curr) => curr.tipe === 'masuk' ? acc + Number(curr.jumlah) : acc - Number(curr.jumlah), 0)
    const totalSaldoAkhir = parseInt(saldoAwal) + totalTransaksi
    const formatRupiah = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)
    const transactionsInPeriod = dataKas.filter(item => { if (!item.tanggal) return false; const date = new Date(item.tanggal); return (date.getMonth() + 1) === parseInt(filterBulan) && date.getFullYear() === parseInt(filterTahun); }).sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
    const isLibur = hariPilihan === 'Sabtu' || hariPilihan === 'Minggu';

    // --- PROTECTED ROUTE CHECK ---
    if (authLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white"><Loader2 className="animate-spin mr-2"/> Memuat Data User...</div>
    if (!user) return <Navigate to="/login" replace />

    // --- PERMISSION CHECKS (NEW) ---
    const canManageKas = canAccess(user, 'MANAGE_KAS');
    const canInputAbsen = canAccess(user, 'INPUT_ABSEN');
    const canPostNews = canAccess(user, 'POST_NEWS');
    const canUploadGaleri = canAccess(user, 'UPLOAD_GALERI');
    const canManageTugas = canAccess(user, 'MANAGE_TUGAS');
    const canManageUsers = canAccess(user, 'MANAGE_USERS'); // Untuk Struktur & Piket
    const canManagePiket = canAccess(user, 'MANAGE_USERS'); 
    const canEditSchedule = canAccess(user, 'MANAGE_USERS'); 
    const canBroadcastInfo = canAccess(user, 'POST_NEWS');
    const canViewClassSettings = canAccess(user, 'VIEW_SETTINGS_CLASS');
    const canViewAllSettings = canAccess(user, 'VIEW_SETTINGS_ALL');
    const canApproveUser = canAccess(user, 'APPROVE_SISWA') || canAccess(user, 'APPROVE_GURU');

    // --- EFFECTS ---
    // Update Chat History with User Name
    useEffect(() => {
        if(user) {
            setChatHistory([{ role: 'model', text: `Assalamualaikum ${user.displayName || 'Wak'}! Gue Asisten AI TKJ nih. Ada yang bisa gue bantu? Spill aja!` }])
        }
    }, [user])

    // Fetch Struktur Data
    useEffect(() => {
        if (isStrukturModalOpen) {
            const fetchStruktur = async () => {
                try {
                    const docRef = doc(db, 'struktur_kelas', kelasId);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) setStrukturData(docSnap.data());
                } catch (e) { console.log("Data struktur belum ada"); }
            }
            fetchStruktur();
        }
    }, [isStrukturModalOpen, kelasId]);

    // Fetch Configs
    useEffect(() => {
        const loadConfig = async () => {
            try {
                const aiSnap = await getDoc(doc(db, 'settings', 'ai_config'));
                if (aiSnap.exists()) { if(aiSnap.data().apiKey) setIsApiKeySet(true); if (aiSnap.data().model) setSelectedModel(aiSnap.data().model); if (aiSnap.data().guest_context) setGuestAiContext(aiSnap.data().guest_context); }
                
                // Fetch Countdown Dashboard
                const cdSnap = await getDoc(doc(db, 'settings', 'countdown'));
                if (cdSnap.exists()) setCountdownData(cdSnap.data());
                
                // Fetch Countdown Landing (Biar bisa diedit admin)
                const landingSnap = await getDoc(doc(db, 'settings', 'landing_countdown'));
                if (landingSnap.exists()) setLandingCountdownData(landingSnap.data());

                const kasSnap = await getDoc(doc(db, 'settings', `${dbPrefix}kas_config`));
                if (kasSnap.exists()) { setSaldoAwal(kasSnap.data().saldoAwal || 0); setNominalKas(kasSnap.data().nominal || 2000); }
            } catch (e) {}
        };
        loadConfig();
        const ci = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(ci);
    }, [dbPrefix]);

    // Countdown Logic
    useEffect(() => { if (!countdownData.targetDate) return; const iv = setInterval(() => { const diff = new Date(countdownData.targetDate) - new Date(); if(diff>0) setTimeLeft({ days: Math.floor(diff/(864e5)), hours: Math.floor((diff%864e5)/36e5), minutes: Math.floor((diff%36e5)/6e4), seconds: Math.floor((diff%6e4)/1e3) }); }, 1000); return () => clearInterval(iv); }, [countdownData]);

    // --- EVENT HANDLERS ---
    const triggerToast = (msg, type = 'success') => { setToast({ message: msg, type }); setTimeout(() => setToast(null), 3000); }
    const handleLogout = async () => { if (confirm("Yakin keluar?")) { await logout(); navigate('/login'); } }
    const handleJumlahChange = (e) => { let r = e.target.value.replace(/[^0-9]/g, ''); setKasInput({ ...kasInput, jumlah: r ? parseInt(r).toLocaleString('id-ID') : '' }); }

    // COMPRESS IMAGE
    const compressImage = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new window.Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 800;
                    const scaleSize = MAX_WIDTH / img.width;
                    canvas.width = MAX_WIDTH;
                    canvas.height = img.height * scaleSize;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    resolve(canvas.toDataURL('image/jpeg', 0.6));
                };
                img.onerror = (error) => reject(error);
            };
            reader.onerror = (error) => reject(error);
        });
    };

    const handleNewsImageChange = async (e) => { const file = e.target.files[0]; if (file) { try { const b64 = await compressImage(file); setNewsImagePreview(b64); setNewsInput({ ...newsInput, imageBase64: b64 }); } catch { triggerToast("Gagal kompres", "error"); } } }
    const handleGaleriImageChange = async (e) => { const file = e.target.files[0]; if (file) { try { const b64 = await compressImage(file); setGaleriImagePreview(b64); setGaleriInput({ ...galeriInput, imageBase64: b64 }); } catch { triggerToast("Gagal kompres", "error"); } } }
    const handleBuktiChange = (e) => { const f = e.target.files[0]; if (f) { const r = new FileReader(); r.onloadend = () => setBuktiPreview(r.result); r.readAsDataURL(f); } }

    // --- CRUD OPERATIONS ---
    const handleSaveStruktur = async (e) => {
        e.preventDefault();
        try {
            await setDoc(doc(db, 'struktur_kelas', kelasId), strukturData);
            setIsEditingStruktur(false);
            triggerToast("Struktur Organisasi Diupdate!");
        } catch (e) { triggerToast("Gagal update", "error"); }
    }

    const handlePostNews = async (e) => { e.preventDefault(); if(!canPostNews) return; await addDoc(collection(db, 'berita_sekolah'), { ...newsInput, image: newsInput.imageBase64 || null, author: user.displayName, createdAt: serverTimestamp(), dateString: new Date().toLocaleDateString('id-ID') }); triggerToast("Berita Diposting"); setIsNewsModalOpen(false); setNewsInput({ title: '', category: 'Kegiatan', content: '', imageBase64: '' }); setNewsImagePreview(null);}
    const handlePostGaleri = async (e) => { e.preventDefault(); if(!canUploadGaleri) return; await addDoc(collection(db, 'galeri_sekolah'), { ...galeriInput, image: galeriInput.imageBase64, author: user.displayName, createdAt: serverTimestamp() }); triggerToast("Galeri Diupload"); setIsGaleriModalOpen(false); setGaleriInput({ caption: '', imageBase64: '' }); setGaleriImagePreview(null);}
    
    const handleAddKas = async (e) => { e.preventDefault(); await addDoc(collection(db, `${dbPrefix}uang_kas`), { ...kasInput, jumlah: parseInt(kasInput.jumlah.replace(/\./g, '')), createdAt: serverTimestamp(), buktiFoto: buktiPreview }); triggerToast("Kas Masuk"); setKasInput({...kasInput, nama: '', jumlah: ''}); setBuktiPreview(null); }
    const handleDeleteKas = async (id) => { if (confirm("Hapus?")) try { await deleteDoc(doc(db, `${dbPrefix}uang_kas`, id)); triggerToast("Dihapus"); } catch (e) { triggerToast("Gagal hapus", "error") } }
    
    const handleSaveAbsensi = async (e) => { e.preventDefault(); await setDoc(doc(db, `${dbPrefix}absensi`, 'harian'), { ...absenInput, lastUpdated: serverTimestamp() }); setIsAbsenModalOpen(false); triggerToast("Absen Updated"); }
    
    const handleAddTask = async (e) => { e.preventDefault(); await addDoc(collection(db, `${dbPrefix}tugas`), { ...newTask, selesai: false, createdAt: serverTimestamp() }); setIsTaskModalOpen(false); triggerToast("Tugas Ditambah"); setNewTask({ judul: '', mapel: '' });}
    const handleToggleTask = async (id, s) => { if(canManageTugas) await updateDoc(doc(db, `${dbPrefix}tugas`, id), { selesai: !s }); }
    const handleDeleteTask = async (e, id) => { e.stopPropagation(); if(confirm("Hapus?")) await deleteDoc(doc(db, `${dbPrefix}tugas`, id)); }

    const handleSaveSchedule = async (e) => { e.preventDefault(); const m = scheduleInput.split(',').map(i => i.trim()).filter(i => i); await setDoc(doc(db, `${dbPrefix}jadwal`, hariPilihan), { mapel: m, updatedAt: serverTimestamp() }); setIsScheduleModalOpen(false); triggerToast("Jadwal Diupdate"); }
    const handleSavePiket = async (e) => { e.preventDefault(); const n = piketInput.split(',').map(i => i.trim()).filter(i => i); await setDoc(doc(db, `${dbPrefix}piket`, hariPilihan), { names: n, updatedAt: serverTimestamp() }); setIsPiketModalOpen(false); triggerToast("Piket Diupdate"); }
    const handleSaveInfo = async (e) => { e.preventDefault(); await setDoc(doc(db, 'pengumuman', 'info_utama'), { isi: infoInput, updatedAt: serverTimestamp() }); setIsInfoModalOpen(false); triggerToast("Info Dibroadcast"); }
    
    const handleSaveSettings = async (e) => {
        e.preventDefault();
        try {
            if (settingTab === 'ai' && canViewAllSettings) {
                const aiUpdates = { model: selectedModel, guest_context: guestAiContext, updatedAt: serverTimestamp() };
                if (apiKeyInput.trim()) { aiUpdates.apiKey = apiKeyInput; setIsApiKeySet(true); }
                await setDoc(doc(db, 'settings', 'ai_config'), aiUpdates, { merge: true });
            } else if (settingTab === 'kas' && canViewClassSettings) {
                await setDoc(doc(db, 'settings', `${dbPrefix}kas_config`), { saldoAwal: parseInt(saldoAwal), nominal: parseInt(nominalKas), updatedAt: serverTimestamp() });
            }
            triggerToast("Konfigurasi Disimpan!"); setIsSettingsModalOpen(false); setApiKeyInput('');
        } catch (e) { triggerToast("Gagal simpan", "error"); }
    }

    // SIMPAN COUNTDOWN (DASHBOARD)
    const handleSaveCountdown = async (e) => {
        e.preventDefault();
        try {
            await setDoc(doc(db, 'settings', 'countdown'), {
                title: countdownData.title,
                targetDate: countdownData.targetDate,
                updatedAt: serverTimestamp()
            });
            triggerToast("Countdown Berhasil Diset!");
            setIsCountdownModalOpen(false);
        } catch (e) { triggerToast("Gagal set countdown", "error"); }
    }

    // SIMPAN COUNTDOWN (LANDING PAGE - OPSIONAL)
    const handleSaveLandingCountdown = async (e) => {
        e.preventDefault();
        try {
            await setDoc(doc(db, 'settings', 'landing_countdown'), {
                title: landingCountdownData.title,
                targetDate: landingCountdownData.targetDate,
                updatedAt: serverTimestamp()
            });
            triggerToast("Countdown Landing Diset!");
        } catch (e) { triggerToast("Gagal set landing", "error"); }
    }

    async function fileToGenerativePart(file) { const r = new FileReader(); const p = new Promise(res => r.onloadend = () => res(r.result.split(',')[1])); r.readAsDataURL(file); return { inlineData: { data: await p, mimeType: file.type } }; }
    const handleSendChat = async (e) => { e.preventDefault(); if (!chatInput.trim() && !imageFile) return; const msg = { role: 'user', text: chatInput, image: imagePreview }; setChatHistory(p => [...p, msg]); setChatInput(''); setImageFile(null); setImagePreview(null); setIsTyping(true); try { const s = await getDoc(doc(db, 'settings', 'ai_config')); if (!s.exists()) throw new Error("API Key belum diset"); const genAI = new GoogleGenerativeAI(s.data().apiKey); const model = genAI.getGenerativeModel({ model: s.data().model || 'gemini-1.5-flash' }); const ctx = chatHistory.slice(-6).map(x => `${x.role === 'user' ? 'Siswa' : 'AI'}: ${x.text}`).join('\n'); const prompt = `Role: "TKJ Assistant", AI asisten SMK TKJ.\nStyle: Gaul tapi SOPAN. NO SARA/PORNO/JUDI.\nContext:\n${ctx}\nUser: "${msg.text}"`; const res = await model.generateContent(imageFile ? [prompt, await fileToGenerativePart(imageFile)] : prompt); setChatHistory(p => [...p, { role: 'model', text: res.response.text() }]); } catch (e) { setChatHistory(p => [...p, { role: 'model', text: `Error: ${e.message}` }]); } finally { setIsTyping(false); } }
    const handleFileChange = (e) => { const f = e.target.files[0]; if (f) { setImageFile(f); const r = new FileReader(); r.onloadend = () => setImagePreview(r.result); r.readAsDataURL(f); } }
    const clearImage = () => { setImageFile(null); setImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; }
    
    const openScheduleModal = () => { setScheduleInput(jadwalTampil ? jadwalTampil.mapel.join(', ') : ''); setIsScheduleModalOpen(true); }
    const openPiketModal = () => { setPiketInput(piketTampil ? piketTampil.names.join(', ') : ''); setIsPiketModalOpen(true); }
    
    return (
        <div className="min-h-screen font-sans bg-slate-100 dark:bg-[#0b1121] text-slate-800 dark:text-slate-100 pb-20 md:pb-0 transition-colors duration-300">
            <AnimatePresence>{toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}</AnimatePresence>

            {/* HEADER */}
            <div className="bg-[#002f6c] dark:bg-[#0f172a]/80 backdrop-blur-md text-white shadow-md sticky top-0 z-40 border-b-4 border-[#00994d] dark:border-blue-600 transition-colors">
                <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="hidden md:block h-16 w-auto p-1 bg-white/10 rounded-lg"><img src={logoJurusan} alt="Logo" className="h-full w-full object-cover rounded-lg" /></div>
                        <div>
                            <h1 className="text-xl md:text-2xl font-extrabold tracking-wider uppercase leading-none">{kelasId} TKJ <span className="text-[#00994d] dark:text-blue-400">DASHBOARD</span></h1>
                            <p className="text-[11px] text-blue-200 opacity-90 hidden md:block font-light tracking-wide mt-1">
                                Hi, {user.displayName} ({user.role}{user.jabatan !== 'MEMBER' ? ` - ${user.jabatan}` : ''})
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-lg bg-white/10">{isDarkMode ? <Sun size={18} className="text-yellow-300" /> : <Moon size={18} />}</button>
                        <button onClick={() => navigate('/')} className="bg-blue-600 px-3 py-2 rounded-lg text-xs font-bold flex gap-1 items-center hover:bg-blue-500"><Home size={16}/> <span className="hidden md:inline">Home</span></button>
                        <button onClick={handleLogout} className="bg-red-600 px-3 py-2 rounded-lg text-xs font-bold flex gap-1 items-center hover:bg-red-500"><LogOut size={16}/> <span className="hidden md:inline">Logout</span></button>
                        {(canViewClassSettings || canViewAllSettings) && (
                            <button onClick={() => setIsSettingsModalOpen(true)} className="bg-slate-700 hover:bg-slate-600 p-2 rounded-lg"><Settings size={18} /></button>
                        )}
                    </div>
                </div>
            </div>

            <div className="p-4 md:p-8 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* INFO & ABSEN */}
                <div className="md:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 bg-white dark:bg-slate-800 border-l-[6px] border-[#002f6c] dark:border-blue-500 p-6 rounded-r-lg shadow-sm flex flex-col justify-between">
                         <div className="relative z-10"><div className="flex items-center gap-2 mb-2"><span className="bg-[#002f6c] text-white text-[10px] px-2 py-0.5 rounded font-bold uppercase"><Megaphone size={10} /> Info Sekolah</span></div><p className="text-sm font-medium border-l-2 pl-3">{dataInfo.find(i => i.id === 'info_utama')?.isi || "Belum ada info."}</p></div>
                         {canBroadcastInfo && <button onClick={() => {setInfoInput(dataInfo.find(i => i.id === 'info_utama')?.isi || ""); setIsInfoModalOpen(true)}} className="text-blue-500 text-xs font-bold mt-4 flex gap-1 w-fit"><Edit3 size={12}/> Edit Info</button>}
                    </div>
                    <div className="bg-white dark:bg-slate-800 border-t-4 border-red-500 rounded-lg shadow-sm p-5">
                         <div className="flex justify-between items-center mb-4"><h3 className="font-bold text-sm flex gap-2"><UserMinus size={16} className="text-red-500"/> Absensi</h3>{canInputAbsen && <button onClick={() => {setAbsenTab('input'); setIsAbsenModalOpen(true)}} className="text-slate-400 hover:text-red-500"><Edit3 size={14}/></button>}</div>
                         <div className="grid grid-cols-3 gap-2 text-center">
                             <div className="bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded"><span className="text-[10px] text-yellow-600 font-bold block">Sakit</span><span className="text-xl font-black">{countSakit}</span></div>
                             <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded"><span className="text-[10px] text-blue-600 font-bold block">Izin</span><span className="text-xl font-black">{countIzin}</span></div>
                             <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded"><span className="text-[10px] text-red-600 font-bold block">Alpha</span><span className="text-xl font-black">{countAlpha}</span></div>
                         </div>
                         <button onClick={() => {setAbsenTab('view'); setIsAbsenModalOpen(true)}} className="w-full mt-3 py-2 bg-red-50 text-red-600 text-xs font-bold rounded flex justify-center gap-1"><Eye size={14}/> Detail</button>
                    </div>
                </div>

                {/* APPROVAL PANEL (HANYA GURU/ADMIN yang akan melihat) */}
                {canApproveUser && (
                    <div className="md:col-span-12">
                        <ApprovalList currentUser={user} />
                    </div>
                )}

                {/* SIDEBAR */}
                <div className="md:col-span-4 space-y-6">
                    {/* KAS WIDGET */}
                    <div onClick={() => setIsKasModalOpen(true)} className="bg-white dark:bg-slate-800 p-5 rounded-lg shadow-md border-t-4 border-[#00994d] cursor-pointer hover:shadow-xl transition-all relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10"><Wallet size={60} className="text-[#00994d]" /></div>
                        <h3 className="font-bold text-sm uppercase flex items-center gap-2 mb-2"><Wallet size={16} className="text-[#00994d]" /> Keuangan</h3>
                        <p className="text-3xl font-black text-slate-800 dark:text-slate-100">{formatRupiah(totalSaldoAkhir)}</p>
                        <div className="mt-3 bg-green-50 dark:bg-slate-700 px-3 py-1 text-[10px] text-green-700 font-bold rounded w-fit group-hover:bg-[#00994d] group-hover:text-white transition-colors">Lihat Detail &rarr;</div>
                    </div>

                    {/* SHORTCUT GRID */}
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => setIsNewsModalOpen(true)} className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm flex flex-col items-center gap-2 hover:border-orange-400 border border-transparent transition-all">
                             <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center"><Newspaper size={20}/></div>
                             <span className="text-xs font-bold">Mading {canPostNews && '(+)'}</span>
                        </button>
                        <button onClick={() => setIsGaleriModalOpen(true)} className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm flex flex-col items-center gap-2 hover:border-purple-400 border border-transparent transition-all">
                             <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center"><ImageIcon size={20}/></div>
                             <span className="text-xs font-bold">Galeri {canUploadGaleri && '(+)'}</span>
                        </button>
                        <button onClick={() => setIsAiModalOpen(true)} className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm flex flex-col items-center gap-2 hover:border-yellow-400 border border-transparent transition-all">
                             <div className="w-10 h-10 bg-yellow-50 text-yellow-600 rounded-full flex items-center justify-center"><Bot size={20}/></div>
                             <span className="text-xs font-bold">AI Chat</span>
                        </button>
                        <button onClick={() => setIsStrukturModalOpen(true)} className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm flex flex-col items-center gap-2 hover:border-teal-400 border border-transparent transition-all">
                             <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center"><Users size={20}/></div>
                             <span className="text-xs font-bold">Struktur</span>
                        </button>
                    </div>

                    {/* PIKET */}
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border-t-4 border-orange-500">
                        <div className="px-5 py-3 border-b dark:border-slate-700 flex justify-between items-center"><h3 className="text-sm font-bold flex gap-2"><UserCheck size={16} className="text-orange-500"/> Piket</h3>{canManagePiket && !isLibur && <button onClick={openPiketModal}><Edit3 size={14}/></button>}</div>
                        <div className="p-5 text-center min-h-[100px] flex items-center justify-center flex-col bg-slate-50/50 dark:bg-slate-900/50">
                            {isLibur ? <span className="text-xs text-orange-500 font-bold bg-orange-50 px-3 py-1 rounded-full">Libur</span> : piketTampil ? <div className="flex flex-wrap gap-2 justify-center">{piketTampil.names.map((n, i) => <span key={i} className="bg-white dark:bg-slate-700 text-xs font-bold px-3 py-1 rounded shadow-sm border dark:border-slate-600">{n}</span>)}</div> : <span className="text-xs text-slate-400 italic">Belum ada data.</span>}
                        </div>
                    </div>
                </div>

                {/* MAIN CONTENT */}
                <div className="md:col-span-8 space-y-6">
                    {/* COUNTDOWN WIDGET (MODIFIED) */}
                    {countdownData.targetDate ? (
                        <div className="bg-gradient-to-r from-[#002f6c] to-[#004bb5] rounded-xl shadow-lg p-6 text-white relative overflow-hidden group">
                            {/* Background Decoration */}
                            <div className="absolute top-0 right-0 -mr-10 -mt-10 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>
                            
                            {/* EDIT BUTTON (Langsung di widget) */}
                            {canManageUsers && (
                                <button onClick={() => setIsCountdownModalOpen(true)} className="absolute top-3 right-3 bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors z-20" title="Edit Countdown">
                                    <Edit3 size={16}/>
                                </button>
                            )}

                            <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                                <div className="text-center md:text-left flex-1 min-w-0">
                                    <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                                        <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded animate-pulse">Coming Soon</span>
                                        <Calendar size={14} className="text-blue-200"/>
                                    </div>
                                    <h3 className="text-2xl font-black leading-tight mb-1 truncate">{countdownData.title}</h3>
                                    <p className="text-blue-200 text-xs md:text-sm">Persiapkan dirimu, jangan sampai terlewat!</p>
                                </div>

                                {/* Timer Boxes (Fixed Layout) */}
                                <div className="flex flex-wrap justify-center gap-2">
                                    <div className="bg-white/10 backdrop-blur-md border border-white/20 p-2 rounded-lg text-center w-16">
                                        <span className="block text-xl font-black">{timeLeft.days}</span>
                                        <span className="text-[9px] uppercase font-bold text-blue-200">Hari</span>
                                    </div>
                                    <div className="bg-white/10 backdrop-blur-md border border-white/20 p-2 rounded-lg text-center w-16">
                                        <span className="block text-xl font-black">{timeLeft.hours}</span>
                                        <span className="text-[9px] uppercase font-bold text-blue-200">Jam</span>
                                    </div>
                                    <div className="bg-white/10 backdrop-blur-md border border-white/20 p-2 rounded-lg text-center w-16">
                                        <span className="block text-xl font-black">{timeLeft.minutes}</span>
                                        <span className="text-[9px] uppercase font-bold text-blue-200">Mnt</span>
                                    </div>
                                    <div className="bg-white/10 backdrop-blur-md border border-white/20 p-2 rounded-lg text-center w-16">
                                        <span className="block text-xl font-black">{timeLeft.seconds}</span>
                                        <span className="text-[9px] uppercase font-bold text-blue-200">Dtk</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        // Placeholder jika countdown belum ada
                        (canManageUsers) && (
                            <div onClick={() => setIsCountdownModalOpen(true)} className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 text-center cursor-pointer hover:border-[#002f6c] transition-colors group flex flex-col items-center justify-center h-32">
                                <Clock size={24} className="text-slate-400 group-hover:text-[#002f6c] mb-2"/>
                                <p className="text-sm font-bold text-slate-500 group-hover:text-[#002f6c]">Setup Hitung Mundur</p>
                            </div>
                        )
                    )}

                    {/* JADWAL PELAJARAN */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border-t-4 border-[#002f6c]">
                        <div className="flex justify-between items-center mb-4">
                             <div className="flex items-center gap-3"><div className="p-2 bg-blue-100 rounded text-[#002f6c]"><BookOpen size={20}/></div><div><h2 className="font-bold text-lg">Jadwal</h2><p className="text-xs font-bold uppercase text-[#002f6c]">{hariPilihan}</p></div></div>
                             <div className="flex gap-1">{['Senin','Selasa','Rabu','Kamis','Jumat'].map(h => <button key={h} onClick={() => setHariPilihan(h)} className={`px-3 py-1 rounded text-[10px] font-bold ${hariPilihan===h ? 'bg-blue-50 text-blue-600' : 'text-slate-400'}`}>{h}</button>)}{canEditSchedule && !isLibur && <button onClick={openScheduleModal} className="px-2 bg-slate-100 rounded ml-2"><Edit3 size={12}/></button>}</div>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border dark:border-slate-700">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {isLibur ? <div className="col-span-full py-6 text-center text-xs text-slate-400">Libur Wak.</div> : jadwalTampil ? jadwalTampil.mapel.map((m,i) => <div key={i} className="p-3 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded shadow-sm text-xs font-bold flex gap-2"><span className="text-[#002f6c]">{i+1}.</span> {m}</div>) : <div className="col-span-full text-center text-xs text-slate-400">Jadwal Kosong.</div>}
                            </div>
                        </div>
                    </div>

                    {/* TUGAS */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border-t-4 border-purple-600">
                        <div className="flex justify-between items-center mb-4"><div className="flex items-center gap-3"><div className="p-2 bg-purple-100 rounded text-purple-700"><CheckSquare size={20}/></div><h3 className="font-bold">Tugas</h3></div>{canManageTugas && <button onClick={() => setIsTaskModalOpen(true)} className="bg-[#002f6c] text-white px-3 py-1.5 rounded-lg text-xs font-bold flex gap-1"><Plus size={14}/> Tambah</button>}</div>
                        <div className="space-y-2">
                             {daftarTugas.length === 0 && <div className="text-center py-6 text-xs text-slate-400 border border-dashed rounded bg-slate-50">Tidak ada tugas.</div>}
                             {daftarTugas.map(t => (
                                 <div key={t.id} onClick={() => handleToggleTask(t.id, t.selesai)} className={`p-3 rounded-lg border dark:border-slate-700 flex justify-between items-center ${t.selesai ? 'bg-slate-50 dark:bg-slate-900 opacity-60' : 'bg-white dark:bg-slate-700 shadow-sm'} ${canManageTugas ? 'cursor-pointer' : ''}`}>
                                     <div className="flex items-center gap-3">
                                         <div className={`w-4 h-4 rounded border flex items-center justify-center ${t.selesai ? 'bg-green-500 border-green-500' : 'bg-white'}`}>{t.selesai && <CheckSquare size={10} className="text-white"/>}</div>
                                         <div><h4 className={`font-bold text-sm ${t.selesai && 'line-through text-slate-400'}`}>{t.judul}</h4><span className="text-[10px] bg-slate-100 dark:bg-slate-900 px-2 rounded border dark:border-slate-600">{t.mapel}</span></div>
                                     </div>
                                     {canManageTugas && <button onClick={(e) => handleDeleteTask(e, t.id)} className="text-slate-300 hover:text-red-500"><Trash2 size={14}/></button>}
                                 </div>
                             ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* --- MODALS --- */}
            
            {/* MODAL EDIT COUNTDOWN (BARU) */}
            <Modal isOpen={isCountdownModalOpen} onClose={() => setIsCountdownModalOpen(false)} title="Edit Hitung Mundur">
                <div className="space-y-6 animate-in fade-in">
                    {/* BAGIAN 1: DASHBOARD */}
                    <form onSubmit={handleSaveCountdown} className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
                        <div className="flex items-center gap-2 mb-3 border-b border-slate-200 dark:border-slate-600 pb-2">
                            <Clock size={16} className="text-blue-600 dark:text-blue-400" />
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Widget Dashboard (Siswa)</h4>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Judul Event</label>
                                <input type="text" value={countdownData.title} onChange={e => setCountdownData({...countdownData, title: e.target.value})} className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg p-2 text-xs dark:text-white" placeholder="Contoh: PAS Ganjil" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Waktu Target</label>
                                <input type="datetime-local" value={countdownData.targetDate} onChange={e => setCountdownData({...countdownData, targetDate: e.target.value})} className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg p-2 text-xs dark:text-white" />
                            </div>
                            <div className="flex gap-2 pt-1">
                                    <button type="button" onClick={async () => { if(confirm("Hapus?")) { await setDoc(doc(db, 'settings', 'countdown'), { title: '', targetDate: '' }); setCountdownData({ title: '', targetDate: '' }); setIsCountdownModalOpen(false); triggerToast("Dihapus"); }}} className="px-3 py-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg text-xs font-bold">Hapus</button>
                                    <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-xs font-bold shadow-sm">Simpan Dashboard</button>
                            </div>
                        </div>
                    </form>

                    {/* BAGIAN 2: LANDING PAGE */}
                    {canViewAllSettings && (
                        <form onSubmit={handleSaveLandingCountdown} className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                            <div className="flex items-center gap-2 mb-3 border-b border-green-200 dark:border-green-800 pb-2">
                                <Monitor size={16} className="text-green-600 dark:text-green-400" />
                                <h4 className="text-xs font-bold uppercase tracking-wider text-green-800 dark:text-green-300">Widget Landing Page (Publik)</h4>
                            </div>
                            <div className="space-y-3">
                                <div className="text-[10px] text-green-700 dark:text-green-400 bg-white/50 dark:bg-black/20 p-2 rounded">
                                    Info: Countdown ini muncul di halaman depan website sekolah. Hanya Admin yang bisa edit.
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Judul Event Publik</label>
                                    <input type="text" value={landingCountdownData.title} onChange={e => setLandingCountdownData({...landingCountdownData, title: e.target.value})} className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg p-2 text-xs dark:text-white" placeholder="Contoh: Penutupan PPDB" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Waktu Target</label>
                                    <input type="datetime-local" value={landingCountdownData.targetDate} onChange={e => setLandingCountdownData({...landingCountdownData, targetDate: e.target.value})} className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg p-2 text-xs dark:text-white" />
                                </div>
                                <div className="flex gap-2 pt-1">
                                        <button type="button" onClick={async () => { if(confirm("Hapus Landing Page Countdown?")) { await setDoc(doc(db, 'settings', 'landing_countdown'), { title: '', targetDate: '' }); setLandingCountdownData({ title: '', targetDate: '' }); triggerToast("Dihapus"); }}} className="px-3 py-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg text-xs font-bold">Hapus</button>
                                        <button type="submit" className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-xs font-bold shadow-sm">Simpan ke Publik</button>
                                </div>
                            </div>
                        </form>
                    )}
                </div>
            </Modal>
            
            {/* MODAL SETTINGS (Hanya Guru/Admin) */}
            <Modal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} title="Pengaturan Kelas">
                <div className="space-y-4">
                    <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-lg">
                        {canViewAllSettings && <button onClick={() => setSettingTab('ai')} className={`flex-1 py-2 text-xs font-bold rounded ${settingTab==='ai'?'bg-white dark:bg-slate-800 shadow':''}`}>AI & System</button>}
                        {canViewClassSettings && <button onClick={() => setSettingTab('kas')} className={`flex-1 py-2 text-xs font-bold rounded ${settingTab==='kas'?'bg-white dark:bg-slate-800 shadow':''}`}>Data Kelas</button>}
                    </div>

                    {/* HANYA ADMIN YANG BISA EDIT AI */}
                    {settingTab === 'ai' && canViewAllSettings && (
                         <form onSubmit={handleSaveSettings} className="p-4 bg-slate-50 dark:bg-slate-700/50 border dark:border-slate-600 rounded-lg animate-in fade-in">
                             <h4 className="font-bold text-sm mb-2 text-slate-700 dark:text-slate-300">Konfigurasi AI (Admin Only)</h4>
                             <input type="text" placeholder="API Key Gemini..." value={apiKeyInput} onChange={e=>setApiKeyInput(e.target.value)} className="w-full text-xs p-2 border rounded mb-2 dark:bg-slate-800"/>
                             <textarea placeholder="Context Otak AI..." value={guestAiContext} onChange={e=>setGuestAiContext(e.target.value)} className="w-full text-xs p-2 border rounded h-20 dark:bg-slate-800"/>
                             <button className="w-full bg-[#002f6c] text-white py-2 rounded text-xs font-bold mt-2">Simpan AI Config</button>
                         </form>
                    )}
                    
                    {/* SETTING KELAS (Guru) */}
                    {settingTab === 'kas' && canViewClassSettings && (
                        <form onSubmit={handleSaveSettings} className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg animate-in fade-in">
                             <h4 className="font-bold text-sm mb-2 text-green-800 dark:text-green-400">Data Keuangan & Siswa</h4>
                             <div className="flex gap-2 mt-2">
                                <input type="number" placeholder="Saldo Awal Kas" value={saldoAwal} onChange={e=>setSaldoAwal(e.target.value)} className="flex-1 text-xs p-2 border rounded dark:bg-slate-800"/>
                                <button className="bg-green-600 text-white px-3 py-2 rounded text-xs font-bold">Update Saldo</button>
                             </div>
                        </form>
                    )}
                </div>
            </Modal>

            {/* MODAL KAS */}
            <Modal isOpen={isKasModalOpen} onClose={() => setIsKasModalOpen(false)} title={`Kas ${kelasId}`}>
                 <div className="space-y-4">
                     <div className="bg-[#00994d] p-4 rounded-lg shadow-md text-center text-white"><h2 className="text-3xl font-bold">{formatRupiah(totalSaldoAkhir)}</h2><p className="text-xs">Saldo Akhir</p></div>
                     <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-lg">
                        <button onClick={() => setKasTab('laporan')} className={`flex-1 py-1 text-xs font-bold rounded ${kasTab==='laporan' ? 'bg-white dark:bg-slate-800 shadow' : ''}`}>Laporan</button>
                        {canManageKas && <button onClick={() => setKasTab('input')} className={`flex-1 py-1 text-xs font-bold rounded ${kasTab==='input' ? 'bg-white dark:bg-slate-800 shadow' : ''}`}>Input</button>}
                     </div>
                     {kasTab === 'input' && canManageKas && (
                         <form onSubmit={handleAddKas} className="space-y-3 bg-slate-50 dark:bg-slate-700 p-3 rounded border dark:border-slate-600">
                             <div className="flex gap-2"><input type="date" value={kasInput.tanggal} onChange={e=>setKasInput({...kasInput, tanggal: e.target.value})} className="border p-2 rounded text-xs dark:bg-slate-800"/> <select value={kasInput.tipe} onChange={e=>setKasInput({...kasInput, tipe: e.target.value})} className="border p-2 rounded text-xs dark:bg-slate-800"><option value="masuk">Masuk</option><option value="keluar">Keluar</option></select></div>
                             <input type="text" placeholder="Nama / Keterangan" value={kasInput.nama} onChange={e=>setKasInput({...kasInput, nama: e.target.value})} className="w-full border p-2 rounded text-xs dark:bg-slate-800"/>
                             <input type="text" placeholder="Jumlah (Rp)" value={kasInput.jumlah} onChange={handleJumlahChange} className="w-full border p-2 rounded text-xs dark:bg-slate-800"/>
                             <div className="border-t pt-2 dark:border-slate-600">
                                <label className="text-xs font-bold block mb-1">Bukti Foto (Opsional)</label>
                                <input type="file" onChange={handleBuktiChange} className="text-xs"/>
                             </div>
                             <button className="w-full bg-green-600 text-white py-2 rounded text-xs font-bold">Simpan Transaksi</button>
                         </form>
                     )}
                     {kasTab === 'laporan' && (
                         <div className="max-h-60 overflow-y-auto space-y-2">
                             {transactionsInPeriod.map(t => (
                                 <div key={t.id} className="flex justify-between items-center p-2 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded text-xs">
                                     <div>
                                         <span className="font-bold block">{t.nama}</span>
                                         <span className="text-[10px] text-slate-500">{t.tanggal}</span>
                                     </div>
                                     <div className="text-right">
                                        <span className={t.tipe==='masuk'?'text-green-600 font-bold block':'text-red-600 font-bold block'}>{formatRupiah(t.jumlah)}</span>
                                        {canManageKas && <button onClick={() => handleDeleteKas(t.id)} className="text-[9px] text-red-400 underline">Hapus</button>}
                                     </div>
                                 </div>
                             ))}
                         </div>
                     )}
                 </div>
            </Modal>

            {/* MODAL ABSEN */}
            <Modal isOpen={isAbsenModalOpen} onClose={() => setIsAbsenModalOpen(false)} title="Absensi Harian">
                 {canInputAbsen && <div className="mb-3 bg-slate-100 dark:bg-slate-700 p-1 rounded flex"><button onClick={() => setAbsenTab('input')} className={`flex-1 py-1 text-xs font-bold rounded ${absenTab==='input'?'bg-white dark:bg-slate-800 shadow':''}`}>Mode Input</button><button onClick={() => setAbsenTab('view')} className={`flex-1 py-1 text-xs font-bold rounded ${absenTab==='view'?'bg-white dark:bg-slate-800 shadow':''}`}>Mode Lihat</button></div>}
                 {absenTab === 'input' && canInputAbsen ? (
                     <form onSubmit={handleSaveAbsensi} className="space-y-3">
                         <div><label className="text-xs font-bold text-yellow-600">Sakit (Pisahkan koma)</label><textarea value={absenInput.sakit} onChange={e=>setAbsenInput({...absenInput, sakit: e.target.value})} className="w-full border p-2 rounded text-xs h-16 dark:bg-slate-800"/></div>
                         <div><label className="text-xs font-bold text-blue-600">Izin (Pisahkan koma)</label><textarea value={absenInput.izin} onChange={e=>setAbsenInput({...absenInput, izin: e.target.value})} className="w-full border p-2 rounded text-xs h-16 dark:bg-slate-800"/></div>
                         <div><label className="text-xs font-bold text-red-600">Alpha (Pisahkan koma)</label><textarea value={absenInput.alpha} onChange={e=>setAbsenInput({...absenInput, alpha: e.target.value})} className="w-full border p-2 rounded text-xs h-16 dark:bg-slate-800"/></div>
                         <button className="w-full bg-red-600 text-white py-2 rounded text-xs font-bold">Update Absen</button>
                     </form>
                 ) : (
                     <div className="space-y-3 text-sm">
                         <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-800 rounded"><span className="font-bold text-yellow-700 dark:text-yellow-400">Sakit:</span> {absenHariIni.sakit}</div>
                         <div className="p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded"><span className="font-bold text-blue-700 dark:text-blue-400">Izin:</span> {absenHariIni.izin}</div>
                         <div className="p-2 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded"><span className="font-bold text-red-700 dark:text-red-400">Alpha:</span> {absenHariIni.alpha}</div>
                     </div>
                 )}
            </Modal>

            {/* MODAL MADING (Post News) */}
            <Modal isOpen={isNewsModalOpen} onClose={() => setIsNewsModalOpen(false)} title="Mading Kelas">
                 {canPostNews ? (
                     <form onSubmit={handlePostNews} className="space-y-3">
                         <input type="text" placeholder="Judul Berita" value={newsInput.title} onChange={e=>setNewsInput({...newsInput, title: e.target.value})} className="w-full border p-2 rounded text-xs dark:bg-slate-800"/>
                         <select value={newsInput.category} onChange={e=>setNewsInput({...newsInput, category: e.target.value})} className="w-full border p-2 rounded text-xs dark:bg-slate-800"><option>Kegiatan</option><option>Prestasi</option><option>Karya Siswa</option><option>Info Sekolah</option></select>
                         <textarea placeholder="Isi Berita..." value={newsInput.content} onChange={e=>setNewsInput({...newsInput, content: e.target.value})} className="w-full border p-2 rounded text-xs h-24 dark:bg-slate-800"/>
                         <input type="file" ref={newsFileInputRef} onChange={handleNewsImageChange} className="text-xs"/>
                         {newsImagePreview && <img src={newsImagePreview} className="h-24 object-cover rounded"/>}
                         <button className="w-full bg-orange-500 text-white py-2 rounded text-xs font-bold">Posting</button>
                     </form>
                 ) : <div className="text-center py-8 text-slate-400 text-xs">Hanya Pengurus Kelas yang boleh posting mading.</div>}
            </Modal>

            {/* MODAL GALERI */}
            <Modal isOpen={isGaleriModalOpen} onClose={() => setIsGaleriModalOpen(false)} title="Upload Galeri">
                 {canUploadGaleri ? (
                     <form onSubmit={handlePostGaleri} className="space-y-3">
                         <input type="text" placeholder="Caption Foto..." value={galeriInput.caption} onChange={e=>setGaleriInput({...galeriInput, caption: e.target.value})} className="w-full border p-2 rounded text-xs dark:bg-slate-800"/>
                         <input type="file" ref={galeriFileInputRef} onChange={handleGaleriImageChange} className="text-xs"/>
                         {galeriImagePreview && <img src={galeriImagePreview} className="h-40 w-full object-cover rounded"/>}
                         <button className="w-full bg-purple-600 text-white py-2 rounded text-xs font-bold">Upload</button>
                     </form>
                 ) : <div className="text-center py-8 text-slate-400 text-xs">Hanya Pengurus Kelas yang boleh upload galeri.</div>}
            </Modal>
            
            {/* MODAL TUGAS */}
            <Modal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} title="Tambah Tugas"><form onSubmit={handleAddTask} className="space-y-3"><input placeholder="Judul Tugas" value={newTask.judul} onChange={e=>setNewTask({...newTask, judul: e.target.value})} className="w-full border p-2 rounded text-xs dark:bg-slate-800"/><input placeholder="Mapel" value={newTask.mapel} onChange={e=>setNewTask({...newTask, mapel: e.target.value})} className="w-full border p-2 rounded text-xs dark:bg-slate-800"/><button className="w-full bg-purple-600 text-white py-2 rounded text-xs font-bold">Simpan</button></form></Modal>
            
            {/* MODAL JADWAL */}
            <Modal isOpen={isScheduleModalOpen} onClose={() => setIsScheduleModalOpen(false)} title="Edit Jadwal"><form onSubmit={handleSaveSchedule} className="space-y-4"><textarea value={scheduleInput} onChange={e => setScheduleInput(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl p-3 text-slate-800 dark:text-white h-32" placeholder="Mapel pisah koma..." /><button className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-green-700">Update</button></form></Modal>
            
            {/* MODAL PIKET */}
            <Modal isOpen={isPiketModalOpen} onClose={() => setIsPiketModalOpen(false)} title={`Edit Piket (${hariPilihan})`}><form onSubmit={handleSavePiket} className="space-y-4"><textarea value={piketInput} onChange={e => setPiketInput(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl p-3 text-slate-800 dark:text-white h-32" placeholder="Nama siswa pisah koma..." /><button className="w-full bg-orange-500 text-white py-3 rounded-xl font-bold hover:bg-orange-600">Simpan Piket</button></form></Modal>

            {/* MODAL INFO BROADCAST */}
            <Modal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} title="Broadcast Info"><form onSubmit={handleSaveInfo} className="space-y-4"><textarea value={infoInput} onChange={e => setInfoInput(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl p-3 text-slate-800 dark:text-white h-32" /><button className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700">Kirim</button></form></Modal>

            {/* MODAL AI ASSISTANT */}
            <Modal isOpen={isAiModalOpen} onClose={() => setIsAiModalOpen(false)} title="TKJ Assistant">
                <div className="flex flex-col h-[50vh] md:h-[400px]">
                    <div className="flex-1 space-y-4 p-2 overflow-y-auto custom-scrollbar">
                        {chatHistory.map((msg, index) => (
                            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] p-3 rounded-lg text-sm leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-[#002f6c] text-white rounded-br-none' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 rounded-bl-none'}`}>
                                    {msg.image && <img src={msg.image} alt="Upload" className="w-full rounded-lg mb-2 border border-white/20" />}
                                    {msg.role === 'user' ? msg.text : <ReactMarkdown>{msg.text}</ReactMarkdown>}
                                </div>
                            </div>
                        ))}
                        {isTyping && <div className="flex justify-start"><div className="bg-slate-100 text-slate-500 px-4 py-2 rounded-lg text-xs animate-pulse">Mengetik...</div></div>}
                        <div ref={chatEndRef} />
                    </div>
                    {imagePreview && (
                        <div className="px-4 py-2 bg-slate-50 border-t flex justify-between items-center">
                            <div className="flex items-center gap-3"><img src={imagePreview} alt="Preview" className="h-12 w-12 rounded object-cover border" /><span className="text-xs text-slate-500">Gambar siap dikirim</span></div>
                            <button onClick={clearImage} className="text-red-500 hover:bg-red-50 rounded-full p-1"><XCircle size={20} /></button>
                        </div>
                    )}
                    <form onSubmit={handleSendChat} className="mt-0 flex gap-2 border-t pt-3">
                        <button type="button" onClick={() => fileInputRef.current.click()} className="bg-slate-100 hover:bg-slate-200 text-slate-500 p-3 rounded-xl"><ImageIcon size={20} /></button>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                        <input value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Tanya / Upload gambar..." className="flex-1 bg-slate-50 border rounded-xl px-4 py-3 text-slate-700 text-sm" />
                        <button type="submit" disabled={(!chatInput.trim() && !imageFile) || isTyping} className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white p-3 rounded-xl"><Send size={20} /></button>
                    </form>
                </div>
            </Modal>
            
            {/* MODAL STRUKTUR ORGANISASI (DYNAMIC & EDITABLE) */}
            <Modal isOpen={isStrukturModalOpen} onClose={() => {setIsStrukturModalOpen(false); setIsEditingStruktur(false)}} title={`Struktur Organisasi ${kelasId}`}>
                
                {/* TOMBOL EDIT (Hanya untuk Admin/Guru) */}
                {canManageUsers && (
                    <div className="flex justify-end mb-2">
                        <button onClick={() => setIsEditingStruktur(!isEditingStruktur)} className={`text-xs font-bold px-3 py-1 rounded flex items-center gap-1 transition-colors ${isEditingStruktur ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
                            {isEditingStruktur ? <X size={14}/> : <Edit3 size={14}/>} {isEditingStruktur ? 'Batal' : 'Edit Struktur'}
                        </button>
                    </div>
                )}

                {/* MODE EDIT */}
                {isEditingStruktur ? (
                    <form onSubmit={handleSaveStruktur} className="space-y-3 animate-in fade-in">
                        <div><label className="text-[10px] font-bold uppercase text-slate-500">Kepala Jurusan (Kajur)</label><input type="text" value={strukturData.kajur} onChange={e => setStrukturData({...strukturData, kajur: e.target.value})} className="w-full border p-2 rounded text-xs dark:bg-slate-800 dark:border-slate-600"/></div>
                        <div><label className="text-[10px] font-bold uppercase text-slate-500">Wali Kelas</label><input type="text" value={strukturData.wali_kelas} onChange={e => setStrukturData({...strukturData, wali_kelas: e.target.value})} className="w-full border p-2 rounded text-xs dark:bg-slate-800 dark:border-slate-600"/></div>
                        <div className="grid grid-cols-2 gap-2">
                            <div><label className="text-[10px] font-bold uppercase text-slate-500">Ketua Kelas</label><input type="text" value={strukturData.ketua} onChange={e => setStrukturData({...strukturData, ketua: e.target.value})} className="w-full border p-2 rounded text-xs dark:bg-slate-800 dark:border-slate-600"/></div>
                            <div><label className="text-[10px] font-bold uppercase text-slate-500">Wakil Ketua</label><input type="text" value={strukturData.wakil} onChange={e => setStrukturData({...strukturData, wakil: e.target.value})} className="w-full border p-2 rounded text-xs dark:bg-slate-800 dark:border-slate-600"/></div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div><label className="text-[10px] font-bold uppercase text-slate-500">Sekretaris</label><input type="text" value={strukturData.sekretaris} onChange={e => setStrukturData({...strukturData, sekretaris: e.target.value})} className="w-full border p-2 rounded text-xs dark:bg-slate-800 dark:border-slate-600"/></div>
                            <div><label className="text-[10px] font-bold uppercase text-slate-500">Bendahara</label><input type="text" value={strukturData.bendahara} onChange={e => setStrukturData({...strukturData, bendahara: e.target.value})} className="w-full border p-2 rounded text-xs dark:bg-slate-800 dark:border-slate-600"/></div>
                        </div>
                        <button className="w-full bg-[#002f6c] text-white py-2 rounded text-xs font-bold mt-2">Simpan Perubahan</button>
                    </form>
                ) : (
                    /* MODE VIEW (BAGAN) */
                    <div className="flex flex-col items-center py-4 min-h-[400px] w-full animate-in zoom-in duration-300">
                        {/* LEVEL 1: KAJUR */}
                        <div className="flex flex-col items-center w-full">
                            <div className="bg-[#002f6c] text-white w-3/4 md:w-1/2 py-2 rounded-lg shadow-md text-center relative z-10 border-b-4 border-blue-800">
                                <span className="text-[10px] font-bold opacity-70 uppercase tracking-widest block">Kepala Jurusan</span>
                                <span className="text-sm font-bold block">{strukturData.kajur}</span>
                            </div>
                            <div className="h-6 w-0.5 bg-slate-300 dark:bg-slate-600"></div>
                        </div>
                        {/* LEVEL 2: WALI KELAS */}
                        <div className="flex flex-col items-center w-full">
                            <div className="bg-white dark:bg-slate-700 border-2 border-[#00994d] text-slate-800 dark:text-slate-200 w-3/4 md:w-1/2 py-2 rounded-lg shadow-sm text-center relative z-10">
                                <span className="text-[10px] font-bold text-[#00994d] uppercase tracking-widest block">Wali Kelas</span>
                                <span className="text-sm font-bold block">{strukturData.wali_kelas}</span>
                            </div>
                            <div className="h-8 w-0.5 bg-slate-300 dark:bg-slate-600"></div>
                        </div>
                        {/* GARIS CABANG */}
                        <div className="relative w-3/4 h-4 border-t-2 border-slate-300 dark:border-slate-600 mb-2">
                             <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-0.5 h-3 bg-slate-300 dark:bg-slate-600"></div>
                             <div className="absolute top-0 left-0 w-0.5 h-4 bg-slate-300 dark:bg-slate-600"></div>
                             <div className="absolute top-0 right-0 w-0.5 h-4 bg-slate-300 dark:bg-slate-600"></div>
                        </div>
                        {/* LEVEL 3: KETUA & WAKIL */}
                        <div className="grid grid-cols-2 gap-4 w-full mb-6">
                            <div className="flex flex-col items-center">
                                <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 w-full py-2 rounded shadow-sm text-center">
                                    <span className="text-[9px] font-bold text-orange-600 uppercase block">Ketua Kelas</span>
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{strukturData.ketua}</span>
                                </div>
                                <div className="h-4 w-0.5 bg-slate-300 dark:bg-slate-600"></div>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 w-full py-2 rounded shadow-sm text-center">
                                    <span className="text-[9px] font-bold text-orange-600 uppercase block">Wakil Ketua</span>
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{strukturData.wakil}</span>
                                </div>
                            </div>
                        </div>
                        {/* LEVEL 4: SEKRETARIS & BENDAHARA */}
                        <div className="relative w-3/4 h-4 border-t-2 border-slate-300 dark:border-slate-600 mb-2">
                             <div className="absolute -top-6 left-1/4 w-0.5 h-6 bg-slate-300 dark:bg-slate-600"></div> 
                             <div className="absolute top-0 left-0 w-0.5 h-4 bg-slate-300 dark:bg-slate-600"></div>
                             <div className="absolute top-0 right-0 w-0.5 h-4 bg-slate-300 dark:bg-slate-600"></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 w-full">
                            <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 w-full py-2 rounded shadow-sm text-center">
                                <span className="text-[9px] font-bold text-teal-600 uppercase block">Sekretaris</span>
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{strukturData.sekretaris}</span>
                            </div>
                            <div className="bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800 w-full py-2 rounded shadow-sm text-center">
                                <span className="text-[9px] font-bold text-pink-600 uppercase block">Bendahara</span>
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{strukturData.bendahara}</span>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    )
}

export default DashboardKelas