import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import logoSekolah from '../assets/images/logosmk.png'
import logoJurusan from '../assets/images/logotkj.jpg'

import { BookOpen, CheckSquare, Plus, Trash2, X, Edit3, Megaphone, Calendar, Link, Wifi, Calculator, Zap, Send, Bot, Globe, Lock, Unlock, LogOut, Image as ImageIcon, XCircle, UserCheck, Coffee, Settings, Key, Quote, Wallet, TrendingUp, TrendingDown, FileSpreadsheet, Download, Filter, UserMinus, CheckCircle, AlertCircle, Home, Eye, Users, Moon, Sun, Newspaper, UploadCloud, Brain } from 'lucide-react'
import { collection, doc, updateDoc, addDoc, deleteDoc, setDoc, serverTimestamp, getDoc, increment } from "firebase/firestore"
import { db } from "../services/firebase"
import useFirestore from '../hooks/useFirestore'
import { GoogleGenerativeAI } from "@google/generative-ai"
import ReactMarkdown from 'react-markdown'
import { motion, AnimatePresence } from "framer-motion"
import * as XLSX from 'xlsx'

const DEFAULT_QUOTES = [
    { text: "Hidup hidupilah Muhammadiyah, jangan mencari hidup di Muhammadiyah.", author: "KH. Ahmad Dahlan" },
    { text: "Pendidikan adalah senjata paling mematikan untuk mengubah dunia.", author: "Nelson Mandela" }
]

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

function DashboardKelas({ kelasId }) { 
    const navigate = useNavigate()
    const dbPrefix = kelasId.toLowerCase() + '_'; 

    const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark')
    useEffect(() => { if (isDarkMode) { document.documentElement.classList.add('dark'); localStorage.setItem('theme', 'dark') } else { document.documentElement.classList.remove('dark'); localStorage.setItem('theme', 'light') } }, [isDarkMode])

    const [time, setTime] = useState(new Date())
    const namaHariIni = new Date().toLocaleDateString('id-ID', { weekday: 'long' })
    const [hariPilihan, setHariPilihan] = useState(namaHariIni)
    const [quote, setQuote] = useState(DEFAULT_QUOTES[0])
    const [newQuoteText, setNewQuoteText] = useState('')
    const [isAdmin, setIsAdmin] = useState(false)
    const [toast, setToast] = useState(null)

    // Modals
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
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

    // Inputs
    const [pinInput, setPinInput] = useState('')
    const [settingTab, setSettingTab] = useState('ai')
    
    // --- SETTING AI ---
    const [apiKeyInput, setApiKeyInput] = useState('')
    const [isApiKeySet, setIsApiKeySet] = useState(false) // Indikator apakah API Key sudah ada di DB
    const [selectedModel, setSelectedModel] = useState('gemini-1.5-flash')
    const [guestAiContext, setGuestAiContext] = useState('')
    
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
    
    // State Berita & Galeri
    const [newsInput, setNewsInput] = useState({ title: '', category: 'Kegiatan', content: '', imageBase64: '' })
    const [newsImagePreview, setNewsImagePreview] = useState(null)
    const newsFileInputRef = useRef(null)

    const [galeriInput, setGaleriInput] = useState({ caption: '', imageBase64: '' })
    const [galeriImagePreview, setGaleriImagePreview] = useState(null)
    const galeriFileInputRef = useRef(null)

    const [pdfImages, setPdfImages] = useState([])
    const buktiInputRef = useRef(null)
    const currentWeek = Math.ceil(new Date().getDate() / 7);
    const [filterBulan, setFilterBulan] = useState(new Date().getMonth() + 1)
    const [filterTahun, setFilterTahun] = useState(new Date().getFullYear())

    const [chatInput, setChatInput] = useState('')
    const [chatHistory, setChatHistory] = useState([{ role: 'model', text: 'Assalamualaikum Wak! Gue Asisten AI TKJ nih. Ada yang bisa gue bantu? Spill aja!' }])
    const [isTyping, setIsTyping] = useState(false)
    const [imageFile, setImageFile] = useState(null)
    const [imagePreview, setImagePreview] = useState(null)
    const fileInputRef = useRef(null)
    const chatEndRef = useRef(null)

    const { data: daftarTugas, loading: loadingTugas } = useFirestore(`${dbPrefix}tugas`)
    const { data: dataJadwal, loading: loadingJadwal } = useFirestore(`${dbPrefix}jadwal`)
    const { data: dataPiket, loading: loadingPiket } = useFirestore(`${dbPrefix}piket`)
    const { data: dataStudents, loading: loadingStudents } = useFirestore(`${dbPrefix}students`)
    const { data: dataKas, loading: loadingKas } = useFirestore(`${dbPrefix}uang_kas`)
    const { data: dataAbsensi } = useFirestore(`${dbPrefix}absensi`)
    const { data: dataInfo } = useFirestore('pengumuman') 
    const { data: dataQuotes, loading: loadingQuotes } = useFirestore('quotes')

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

    const triggerToast = (msg, type = 'success') => { setToast({ message: msg, type }); setTimeout(() => setToast(null), 3000); }
    const handleJumlahChange = (e) => { let r = e.target.value.replace(/[^0-9]/g, ''); setKasInput({ ...kasInput, jumlah: r ? parseInt(r).toLocaleString('id-ID') : '' }); }
    const clearBukti = () => { setBuktiFile(null); setBuktiPreview(null); if (buktiInputRef.current) buktiInputRef.current.value = ''; }
    
    const compressImage = (file) => {
        return new Promise((resolve) => {
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
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
                    resolve(dataUrl);
                }
            }
        });
    }

    const handleNewsImageChange = async (e) => {
        const file = e.target.files[0];
        if(file) {
            if(file.size > 20 * 1024 * 1024) { triggerToast("File kegedean Wak! Max 20MB.", "error"); return; }
            triggerToast("Mengkompres foto... Tunggu bentar", "success");
            try {
                const compressedBase64 = await compressImage(file);
                setNewsImagePreview(compressedBase64);
                setNewsInput({...newsInput, imageBase64: compressedBase64});
            } catch(err) {
                triggerToast("Gagal kompres foto", "error");
            }
        }
    }

    const handleGaleriImageChange = async (e) => {
        const file = e.target.files[0];
        if(file) {
            if(file.size > 20 * 1024 * 1024) { triggerToast("File kegedean Wak! Max 20MB.", "error"); return; }
            triggerToast("Mengkompres foto... Tunggu bentar", "success");
            try {
                const compressedBase64 = await compressImage(file);
                setGaleriImagePreview(compressedBase64);
                setGaleriInput({...galeriInput, imageBase64: compressedBase64});
            } catch(err) {
                triggerToast("Gagal kompres foto", "error");
            }
        }
    }

    const handlePostNews = async (e) => {
        e.preventDefault();
        if(!newsInput.title || !newsInput.content) { triggerToast("Judul & Isi wajib diisi!", "error"); return; }
        try {
            await addDoc(collection(db, 'berita_sekolah'), {
                title: newsInput.title, category: newsInput.category, content: newsInput.content,
                image: newsInput.imageBase64 || null, 
                author: `Admin Kelas ${kelasId} TKJ`,
                createdAt: serverTimestamp(), 
                dateString: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric'})
            });
            triggerToast("Berita Berhasil Diposting!"); setIsNewsModalOpen(false);
            setNewsInput({ title: '', category: 'Kegiatan', content: '', imageBase64: '' }); setNewsImagePreview(null);
        } catch (e) { triggerToast("Gagal posting: " + e.message, "error"); }
    }

    const handlePostGaleri = async (e) => {
        e.preventDefault();
        if(!galeriInput.imageBase64) { triggerToast("Wajib upload foto wak!", "error"); return; }
        try {
            await addDoc(collection(db, 'galeri_sekolah'), {
                caption: galeriInput.caption || 'Tanpa Keterangan',
                image: galeriInput.imageBase64,
                author: `Admin Kelas ${kelasId}`,
                createdAt: serverTimestamp()
            });
            triggerToast("Foto Masuk Galeri!"); setIsGaleriModalOpen(false);
            setGaleriInput({ caption: '', imageBase64: '' }); setGaleriImagePreview(null);
        } catch (e) { triggerToast("Gagal upload: " + e.message, "error"); }
    }

    useEffect(() => { 
        const loadConfig = async () => { 
            try { 
                const aiSnap = await getDoc(doc(db, 'settings', 'ai_config')); 
                if (aiSnap.exists()) { 
                    if(aiSnap.data().model) setSelectedModel(aiSnap.data().model); 
                    if(aiSnap.data().guest_context) setGuestAiContext(aiSnap.data().guest_context); 
                    
                    // CEK APAKAH API KEY ADA (Tapi jangan ditampilin semua demi keamanan)
                    if(aiSnap.data().apiKey) setIsApiKeySet(true);
                } 
                
                const kasSnap = await getDoc(doc(db, 'settings', `${dbPrefix}kas_config`)); 
                if (kasSnap.exists()) { 
                    setSaldoAwal(kasSnap.data().saldoAwal || 0); 
                    setNominalKas(kasSnap.data().nominal || 2000); 
                } 
            } catch (e) { } 
        }; 
        loadConfig(); 
        const s = localStorage.getItem('tkj_admin_auth'); if (s === 'true') setIsAdmin(true); 
        window.addEventListener('online', () => setIsOnline(true)); window.addEventListener('offline', () => setIsOnline(false)); 
        const ci = setInterval(() => { const now = new Date(); setTime(now); }, 1000); 
        return () => clearInterval(ci); 
    }, [dbPrefix])

    useEffect(() => { const qi = setInterval(() => { setQuote(p => { if (activeQuotes.length <= 1) return activeQuotes[0]; let r; do { r = Math.floor(Math.random() * activeQuotes.length) } while (activeQuotes[r].text === p.text); return activeQuotes[r]; }) }, 6000); return () => clearInterval(qi) }, [activeQuotes])
    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }) }, [chatHistory, isAiModalOpen, imagePreview])
    useEffect(() => { const c = async () => { try { const t = new Date().toDateString(); const r = doc(db, `${dbPrefix}absensi`, 'harian'); const s = await getDoc(r); if(s.exists()){ const d=s.data(); if(d.lastUpdated?.toDate().toDateString() !== t){ await setDoc(doc(db, `${dbPrefix}absensi_history`, d.lastUpdated.toDate().toISOString().split('T')[0]), {...d, archivedAt: serverTimestamp()}); await updateDoc(r, {sakit:'-',izin:'-',alpha:'-',lastUpdated:serverTimestamp()}); window.location.reload();}} else { await setDoc(r, {sakit:'-',izin:'-',alpha:'-',lastUpdated:serverTimestamp()}); } } catch(e){} }; c(); }, [dbPrefix]);

    const handleLogin = (e) => { e.preventDefault(); if (pinInput === 'tkj123') { setIsAdmin(true); localStorage.setItem('tkj_admin_auth', 'true'); setIsLoginModalOpen(false); setPinInput(''); triggerToast("Login Admin Berhasil!"); } else { triggerToast("PIN Salah!", "error"); setPinInput('') } }
    const handleLogout = () => { if (confirm("Logout?")) { setIsAdmin(false); localStorage.removeItem('tkj_admin_auth'); triggerToast("Berhasil Logout"); } }
    
    // --- UPDATE: SAVE SETTINGS YANG AMAN ---
    const handleSaveSettings = async (e) => { 
        e.preventDefault(); 
        try { 
            // Objek update untuk AI Config
            const aiUpdates = {
                model: selectedModel,
                guest_context: guestAiContext,
                updatedAt: serverTimestamp()
            };

            // HANYA UPDATE API KEY JIKA USER MENGETIK SESUATU
            // Jika kosong, jangan dikirim ke Firebase (biar key lama gak ilang)
            if (apiKeyInput.trim()) {
                aiUpdates.apiKey = apiKeyInput;
                setIsApiKeySet(true); // Update status lokal
            }

            await setDoc(doc(db, 'settings', 'ai_config'), aiUpdates, { merge: true });

            // Save config kas per kelas
            await setDoc(doc(db, 'settings', `${dbPrefix}kas_config`), { saldoAwal: parseInt(saldoAwal), nominal: parseInt(nominalKas), updatedAt: serverTimestamp() }); 
            
            triggerToast("Konfigurasi Disimpan!"); setIsSettingsModalOpen(false); setApiKeyInput(''); 
        } catch (e) { triggerToast("Gagal simpan", "error"); } 
    }
    
    const handleBuktiChange = (e) => { const f = e.target.files[0]; if (f && f.size <= 500 * 1024) { setBuktiFile(f); const r = new FileReader(); r.onloadend = () => setBuktiPreview(r.result); r.readAsDataURL(f); } else { triggerToast("File max 500KB!", "error"); } }
    const handleAddKas = async (e) => { e.preventDefault(); if (!kasInput.nama || !kasInput.jumlah) return; try { await addDoc(collection(db, `${dbPrefix}uang_kas`), { tanggal: kasInput.tanggal, nama: kasInput.nama, jumlah: parseInt(kasInput.jumlah.replace(/\./g, '')), tipe: kasInput.tipe, keterangan: kasInput.keterangan || '-', createdAt: serverTimestamp(), buktiFoto: buktiPreview }); setKasInput({ ...kasInput, nama: '', jumlah: '', keterangan: '' }); clearBukti(); triggerToast("Transaksi Berhasil!"); } catch (e) { triggerToast("Gagal simpan", "error"); } }
    const handleDeleteKas = async (id) => { if (confirm("Hapus?")) try { await deleteDoc(doc(db, `${dbPrefix}uang_kas`, id)); triggerToast("Dihapus"); } catch (e) { triggerToast("Gagal hapus", "error") } }
    const handleExportExcel = () => { const d = dataKas.map(i => ({ "Tgl": i.tanggal, "Ket": `${i.nama} (${i.keterangan})`, "Masuk": i.tipe === 'masuk' ? i.jumlah : 0, "Keluar": i.tipe === 'keluar' ? i.jumlah : 0 })); d.unshift({ "Tgl": "SALDO AWAL", "Masuk": parseInt(saldoAwal) }); d.push({ "Tgl": "TOTAL", "Masuk": totalSaldoAkhir }); const ws = XLSX.utils.json_to_sheet(d); const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "Kas"); XLSX.writeFile(wb, `Laporan_Kas_Kelas_${kelasId}.xlsx`); triggerToast("Download Dimulai!"); }
    const handleAddStudent = async (e) => { e.preventDefault(); if (newStudentName.trim()) { await addDoc(collection(db, `${dbPrefix}students`), { name: newStudentName, createdAt: serverTimestamp() }); setNewStudentName(''); triggerToast("Siswa Ditambahkan"); } }
    const handleDeleteStudent = async (id) => { if (confirm("Hapus?")) { await deleteDoc(doc(db, `${dbPrefix}students`, id)); triggerToast("Siswa Dihapus"); } }
    const handleAddQuote = async (e) => { e.preventDefault(); if (newQuoteText.trim()) { await addDoc(collection(db, 'quotes'), { text: newQuoteText, author: "Admin", createdAt: serverTimestamp() }); setNewQuoteText(''); triggerToast("Quote Ditambah"); } }
    const handleDeleteQuote = async (id) => { if (confirm("Hapus?")) { await deleteDoc(doc(db, 'quotes', id)); triggerToast("Quote Dihapus"); } }
    const handleSaveAbsensi = async (e) => { e.preventDefault(); try { await setDoc(doc(db, `${dbPrefix}absensi`, 'harian'), { sakit: absenInput.sakit || '-', izin: absenInput.izin || '-', alpha: absenInput.alpha || '-', lastUpdated: serverTimestamp() }); setIsAbsenModalOpen(false); setAbsenTab('view'); triggerToast("Absensi Diupdate!"); } catch (e) { triggerToast("Gagal update", "error"); } }
    const openAbsenModal = (tab = 'view') => { setAbsenInput({ sakit: absenHariIni.sakit !== '-' ? absenHariIni.sakit : '', izin: absenHariIni.izin !== '-' ? absenHariIni.izin : '', alpha: absenHariIni.alpha !== '-' ? absenHariIni.alpha : '' }); setAbsenTab(tab); setIsAbsenModalOpen(true); }
    const handleAddTask = async (e) => { e.preventDefault(); if (newTask.judul) { await addDoc(collection(db, `${dbPrefix}tugas`), { judul: newTask.judul, mapel: newTask.mapel || 'Umum', selesai: false, createdAt: serverTimestamp() }); setNewTask({ judul: '', mapel: '' }); setIsTaskModalOpen(false); triggerToast("Tugas Ditambahkan"); } }
    const handleDeleteTask = async (e, id) => { e.stopPropagation(); if (confirm("Hapus?")) { await deleteDoc(doc(db, `${dbPrefix}tugas`, id)); triggerToast("Tugas Dihapus"); } }
    const handleToggleTask = async (id, s) => { await updateDoc(doc(db, `${dbPrefix}tugas`, id), { selesai: !s }); }
    const handleSaveSchedule = async (e) => { e.preventDefault(); const m = scheduleInput.split(',').map(i => i.trim()).filter(i => i); await setDoc(doc(db, `${dbPrefix}jadwal`, hariPilihan), { mapel: m, updatedAt: serverTimestamp() }); setIsScheduleModalOpen(false); triggerToast("Jadwal Diupdate"); }
    const handleSavePiket = async (e) => { e.preventDefault(); const n = piketInput.split(',').map(i => i.trim()).filter(i => i); await setDoc(doc(db, `${dbPrefix}piket`, hariPilihan), { names: n, updatedAt: serverTimestamp() }); setIsPiketModalOpen(false); triggerToast("Piket Diupdate"); }
    const handleSaveInfo = async (e) => { e.preventDefault(); await setDoc(doc(db, 'pengumuman', 'info_utama'), { isi: infoInput, updatedAt: serverTimestamp() }); setIsInfoModalOpen(false); triggerToast("Info Dibroadcast"); }
    const openScheduleModal = () => { setScheduleInput(jadwalTampil ? jadwalTampil.mapel.join(', ') : ''); setIsScheduleModalOpen(true); }
    const openPiketModal = () => { setPiketInput(piketTampil ? piketTampil.names.join(', ') : ''); setIsPiketModalOpen(true); }
    const openInfoModal = () => { const i = dataInfo.find(x => x.id === 'info_utama') || dataInfo[0]; setInfoInput(i ? i.isi : ''); setIsInfoModalOpen(true); }
    
    async function fileToGenerativePart(file) { const r = new FileReader(); const p = new Promise(res => r.onloadend = () => res(r.result.split(',')[1])); r.readAsDataURL(file); return { inlineData: { data: await p, mimeType: file.type } }; }
    const handleSendChat = async (e) => { e.preventDefault(); if (!chatInput.trim() && !imageFile) return; const msg = { role: 'user', text: chatInput, image: imagePreview }; setChatHistory(p => [...p, msg]); setChatInput(''); setImageFile(null); setImagePreview(null); setIsTyping(true); try { const s = await getDoc(doc(db, 'settings', 'ai_config')); if (!s.exists()) throw new Error("API Key belum diset"); const genAI = new GoogleGenerativeAI(s.data().apiKey); const model = genAI.getGenerativeModel({ model: s.data().model || 'gemini-1.5-flash' }); const ctx = chatHistory.slice(-6).map(x => `${x.role === 'user' ? 'Siswa' : 'AI'}: ${x.text}`).join('\n'); const prompt = `Role: "TKJ Assistant", AI asisten SMK TKJ.\nStyle: Gaul tapi SOPAN. NO SARA/PORNO/JUDI.\nContext:\n${ctx}\nUser: "${msg.text}"`; const res = await model.generateContent(imageFile ? [prompt, await fileToGenerativePart(imageFile)] : prompt); setChatHistory(p => [...p, { role: 'model', text: res.response.text() }]); } catch (e) { setChatHistory(p => [...p, { role: 'model', text: `Error: ${e.message}` }]); } finally { setIsTyping(false); } }
    const handlePdfImageChange = (e) => { if (e.target.files) setPdfImages(p => [...p, ...Array.from(e.target.files).map(f => ({ file: f, url: URL.createObjectURL(f) }))]) }
    const handleGeneratePdf = () => { setPdfImages([]); setIsPdfModalOpen(false); triggerToast("PDF Dibuat!"); }
    const removePdfImage = (i) => { const n = [...pdfImages]; n.splice(i, 1); setPdfImages(n); }
    const handleFileChange = (e) => { const f = e.target.files[0]; if (f) { setImageFile(f); const r = new FileReader(); r.onloadend = () => setImagePreview(r.result); r.readAsDataURL(f); } }
    const clearImage = () => { setImageFile(null); setImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; }

    return (
        <div className="min-h-screen font-sans bg-slate-100 dark:bg-[#0b1121] text-slate-800 dark:text-slate-100 pb-20 md:pb-0 transition-colors duration-300">
            <AnimatePresence>{toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}</AnimatePresence>
            
            {/* HEADER & CONTENT GRID SAMA PERSIS */}
            {/* BAGIAN INI SAMA SEPERTI SEBELUMNYA (HEADER, GRID LAYOUT) */}
            <div className="bg-[#002f6c] dark:bg-[#0f172a]/80 backdrop-blur-md text-white shadow-md sticky top-0 z-40 border-b-4 border-[#00994d] dark:border-blue-600 transition-colors">
                <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="hidden md:block h-16 w-auto p-1 transition-transform hover:scale-105 duration-300 bg-white/10 rounded-lg backdrop-blur-sm"><img src={logoJurusan} alt="Logo" className="h-full w-full object-cover rounded-lg" /></div>
                        <div><h1 className="text-xl md:text-2xl font-extrabold tracking-wider uppercase leading-none">{kelasId} TKJ <span className="text-[#00994d] dark:text-blue-400">DASHBOARD</span></h1><p className="text-[11px] text-blue-200 opacity-90 hidden md:block font-light tracking-wide mt-1">Sistem Informasi Manajemen Kelas Digital</p></div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden md:block text-right border-r border-blue-800 dark:border-slate-600 pr-4 mr-1"><div className="text-lg font-bold font-mono text-white leading-none">{time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</div><div className="text-[10px] text-blue-300 dark:text-slate-400 uppercase tracking-wide font-semibold mt-1">{time.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}</div></div>
                        <div className="flex items-center gap-2">
                             <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all border border-white/10">{isDarkMode ? <Sun size={18} className="text-yellow-300"/> : <Moon size={18}/>}</button>
                             <button onClick={() => navigate('/')} className="flex items-center gap-1 bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-lg shadow-sm border border-blue-400/50 text-xs font-bold transition-all"><Home size={16} /> <span className="hidden md:inline">Home</span></button>
                            {isAdmin ? (<button onClick={handleLogout} className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg shadow-md border border-red-400 text-xs font-bold transition-all"><LogOut size={16} /> <span className="hidden md:inline">Keluar</span></button>) : (<button onClick={() => setIsLoginModalOpen(true)} className="flex items-center gap-1 bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg text-xs font-bold transition-all border border-white/20 backdrop-blur-sm"><Lock size={16} /> Admin</button>)}
                            {isAdmin && (<button onClick={() => setIsSettingsModalOpen(true)} className="bg-slate-700/50 hover:bg-slate-600 p-2 rounded-lg text-slate-200 transition-colors border border-slate-600"><Settings size={18} /></button>)}
                        </div>
                    </div>
                </div>
            </div>

            {/* CONTENT GRID (PASTE BAGIAN KONTEN DARI KODE SEBELUMNYA - SAMA PERSIS) */}
            <div className="p-4 md:p-8 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* INFO & ABSEN */}
                <div className="md:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 bg-white dark:bg-slate-800 border-l-[6px] border-[#002f6c] dark:border-blue-500 p-6 rounded-r-lg shadow-sm flex flex-col justify-between relative overflow-hidden transition-colors">
                        <div className="relative z-10"><div className="flex items-center gap-2 mb-2"><span className="bg-[#002f6c] dark:bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider shadow-sm flex items-center gap-1"><Megaphone size={10} /> Info Sekolah</span></div>{dataInfo.length > 0 ? <p className="text-slate-800 dark:text-slate-200 text-sm font-medium leading-relaxed border-l-2 border-slate-200 dark:border-slate-600 pl-3">{dataInfo.find(i => i.id === 'info_utama')?.isi || dataInfo[0]?.isi}</p> : <p className="text-slate-400 italic text-sm">Tidak ada pengumuman.</p>}</div>
                        {isAdmin && <button onClick={openInfoModal} className="text-[#002f6c] dark:text-blue-400 hover:text-white hover:bg-[#002f6c] dark:hover:bg-blue-600 flex items-center gap-1 text-xs font-bold border border-blue-200 dark:border-blue-800 px-3 py-1.5 rounded transition-all shadow-sm w-fit mt-4"><Edit3 size={12} /> Edit</button>}
                    </div>
                    <div className="bg-white dark:bg-slate-800 border-t-4 border-red-500 dark:border-pink-600 rounded-lg shadow-sm overflow-hidden flex flex-col transition-colors">
                        <div className="p-5 flex-1">
                            <div className="flex justify-between items-center mb-4"><h3 className="font-bold text-slate-700 dark:text-slate-200 text-sm flex items-center gap-2"><UserMinus size={16} className="text-red-500 dark:text-pink-500" /> Absensi {kelasId}</h3>{isAdmin && (<button onClick={() => openAbsenModal('input')} className="text-slate-400 hover:text-red-500 bg-red-50 dark:bg-slate-700 p-1.5 rounded-md transition-colors"><Edit3 size={14} /></button>)}</div>
                            <div className="grid grid-cols-3 gap-2 text-center">
                                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-100 dark:border-yellow-800 flex flex-col items-center justify-center"><span className="text-[10px] text-yellow-600 dark:text-yellow-400 font-bold uppercase tracking-wider mb-1">Sakit</span><span className="text-xl font-black text-slate-700 dark:text-slate-200 leading-none">{countSakit}</span></div>
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800 flex flex-col items-center justify-center"><span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider mb-1">Izin</span><span className="text-xl font-black text-slate-700 dark:text-slate-200 leading-none">{countIzin}</span></div>
                                <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-100 dark:border-red-800 flex flex-col items-center justify-center"><span className="text-[10px] text-red-600 dark:text-red-400 font-bold uppercase tracking-wider mb-1">Alpha</span><span className="text-xl font-black text-slate-700 dark:text-slate-200 leading-none">{countAlpha}</span></div>
                            </div>
                        </div>
                        <button onClick={() => openAbsenModal('view')} className="w-full py-2 bg-red-50 dark:bg-slate-700 text-red-600 dark:text-pink-400 text-xs font-bold hover:bg-red-100 dark:hover:bg-slate-600 transition-colors flex items-center justify-center gap-1 border-t border-red-100 dark:border-slate-600"><Eye size={14} /> Lihat Detail</button>
                    </div>
                </div>

                {/* SIDEBAR */}
                <div className="md:col-span-4 space-y-6">
                    <div className="bg-white dark:bg-slate-800 p-0 rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-xl transition-all group border-t-4 border-[#00994d] dark:border-green-500" onClick={() => setIsKasModalOpen(true)}>
                        <div className="p-5 relative overflow-hidden"><div className="absolute top-0 right-0 p-4 opacity-10"><Wallet size={60} className="text-[#00994d] dark:text-green-400" /></div><div className="flex justify-between items-center mb-3 relative z-10"><h3 className="font-bold text-slate-700 dark:text-slate-200 text-sm uppercase tracking-wide flex items-center gap-2"><Wallet size={16} className="text-[#00994d] dark:text-green-400" /> Keuangan {kelasId}</h3><div className="bg-green-50 dark:bg-green-900/30 p-1.5 rounded-full text-[#00994d] dark:text-green-400"><Plus size={14} /></div></div><p className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tighter">{formatRupiah(totalSaldoAkhir)}</p><p className="text-[10px] text-slate-400 mt-1 font-medium">Saldo Terkini • Klik untuk detail</p></div><div className="bg-green-50 dark:bg-slate-700 px-5 py-2 text-[10px] text-green-700 dark:text-green-400 font-bold text-right border-t border-green-100 dark:border-slate-600 group-hover:bg-[#00994d] group-hover:text-white transition-colors">Lihat Laporan &rarr;</div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => setIsNewsModalOpen(true)} className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 hover:border-orange-400 dark:hover:border-orange-500 hover:shadow-md transition-all flex flex-col items-center gap-2 text-center group">
                            <div className="w-10 h-10 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform border border-orange-100 dark:border-orange-800"><Newspaper size={20} /></div>
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Mading</span>
                        </button>
                        <button onClick={() => setIsGaleriModalOpen(true)} className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 hover:border-purple-400 dark:hover:border-purple-500 hover:shadow-md transition-all flex flex-col items-center gap-2 text-center group">
                            <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform border border-purple-100 dark:border-purple-800"><ImageIcon size={20} /></div>
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Galeri</span>
                        </button>
                        <button onClick={() => setIsAiModalOpen(true)} className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 hover:border-yellow-400 dark:hover:border-yellow-500 hover:shadow-md transition-all flex flex-col items-center gap-2 text-center group"><div className="w-10 h-10 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform border border-yellow-100 dark:border-yellow-800"><Bot size={20} /></div><span className="text-xs font-bold text-slate-700 dark:text-slate-200">AI Chat</span></button>
                        <button onClick={() => setIsPdfModalOpen(true)} className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 hover:border-red-400 hover:shadow-md transition-all flex flex-col items-center gap-2 text-center group"><div className="w-10 h-10 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform border border-red-100 dark:border-red-800"><FileSpreadsheet size={20} /></div><span className="text-xs font-bold text-slate-700 dark:text-slate-200">PDF Tools</span></button>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 border-t-4 border-orange-500 dark:border-orange-600">
                        <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-white dark:bg-slate-800 rounded-t-lg"><h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2"><UserCheck size={16} className="text-orange-500" /> Piket {kelasId}</h3>{isAdmin && !isLibur && <button onClick={openPiketModal} className="text-slate-400 hover:text-orange-500 transition-colors bg-slate-50 dark:bg-slate-700 p-1 rounded"><Edit3 size={14} /></button>}</div>
                        <div className="p-5 text-center min-h-[100px] flex items-center justify-center flex-col bg-slate-50/50 dark:bg-slate-900/50">{isLibur ? <span className="text-xs text-orange-500 font-bold bg-orange-50 dark:bg-orange-900/20 px-3 py-1 rounded-full border border-orange-100 dark:border-orange-800">Sekolah Libur</span> : piketTampil ? <div className="flex flex-wrap gap-2 justify-center">{piketTampil.names.map((n, i) => <span key={i} className="bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-200 text-xs font-bold px-3 py-1.5 rounded border border-slate-200 dark:border-slate-600 shadow-sm">{n}</span>)}</div> : <span className="text-xs text-slate-400 italic">Belum ada data.</span>}</div>
                    </div>
                </div>

                {/* MAIN CONTENT */}
                <div className="md:col-span-8 space-y-6">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 border-t-4 border-[#002f6c] dark:border-blue-500">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                            <div className="flex items-center gap-3"><div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded text-[#002f6c] dark:text-blue-400 shadow-md"><BookOpen size={20} /></div><div><h2 className="font-bold text-lg text-slate-800 dark:text-slate-200">Jadwal Pelajaran</h2><p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[#002f6c] dark:text-blue-400">{hariPilihan}</p></div></div>
                            <div className="flex gap-1 overflow-x-auto pb-1 md:pb-0 w-full md:w-auto no-scrollbar">{['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'].map(h => (<button key={h} onClick={() => setHariPilihan(h)} className={`px-4 py-1.5 rounded text-[10px] font-bold transition-all border-b-2 ${hariPilihan === h ? 'border-[#002f6c] dark:border-blue-500 text-[#002f6c] dark:text-blue-400 bg-blue-50 dark:bg-slate-700' : 'border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-700'}`}>{h}</button>))}{isAdmin && !isLibur && <button onClick={openScheduleModal} className="px-2 py-1 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-500 rounded hover:bg-slate-200 transition-colors"><Edit3 size={12} /></button>}</div>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-700"><div className="grid grid-cols-2 md:grid-cols-3 gap-3">{isLibur ? <div className="col-span-full py-10 text-center text-slate-400 bg-white dark:bg-slate-800 rounded-lg border border-dashed border-slate-200 dark:border-slate-600"><Coffee size={32} className="mx-auto mb-2 opacity-50" /><p className="text-xs">Tidak ada KBM.</p></div> : loadingJadwal ? <p className="text-xs text-slate-400 text-center py-4">Loading...</p> : jadwalTampil ? jadwalTampil.mapel.map((m, i) => (<div key={i} className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded shadow-sm hover:shadow-md transition-all hover:border-blue-300"><span className="w-6 h-6 rounded bg-blue-50 dark:bg-blue-900/20 text-[#002f6c] dark:text-blue-400 flex items-center justify-center text-[10px] font-bold border border-blue-100 dark:border-blue-800">{i + 1}</span><span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{m}</span></div>)) : <div className="col-span-full py-6 text-center text-slate-400 italic text-xs">Jadwal belum diatur.</div>}</div></div>
                    </div>
                    
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 relative overflow-hidden flex items-center justify-center text-center">
                        <div className="max-w-lg relative z-10"><Quote size={24} className="text-[#00994d] dark:text-green-500 mx-auto mb-3 opacity-80" />
                            <AnimatePresence mode="wait"><motion.div key={quote.text} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.5 }}><p className="font-serif italic text-slate-600 dark:text-slate-300 text-sm md:text-base leading-relaxed">"{quote.text}"</p><p className="text-[10px] font-bold mt-3 uppercase tracking-widest text-[#00994d] dark:text-green-500">— {quote.author}</p></motion.div></AnimatePresence>
                        </div>
                        {isAdmin && <button onClick={() => setIsQuoteModalOpen(true)} className="absolute top-3 right-3 text-slate-300 hover:text-[#00994d] transition-colors"><Edit3 size={14} /></button>}
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border-t-4 border-purple-600 dark:border-purple-500 border border-slate-200 dark:border-slate-700">
                        <div className="flex justify-between items-center mb-4"><div className="flex items-center gap-3"><div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded shadow-sm"><CheckSquare size={20} /></div><h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">Agenda & Tugas {kelasId}</h3></div>{isAdmin && <button onClick={() => setIsTaskModalOpen(true)} className="bg-[#002f6c] hover:bg-blue-800 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 shadow-md transition-colors"><Plus size={14} /> Tambah</button>}</div>
                        <div className="space-y-2">{!loadingTugas && daftarTugas.length === 0 && <div className="text-center py-8 text-slate-400 text-xs bg-slate-50 dark:bg-slate-900 rounded border border-dashed border-slate-200 dark:border-slate-700">Tidak ada tugas aktif. Aman!</div>}{daftarTugas.map(t => (<div key={t.id} onClick={() => isAdmin && handleToggleTask(t.id, t.selesai)} className={`p-3 rounded-lg border-l-4 flex items-center justify-between transition-all cursor-pointer ${t.selesai ? 'bg-slate-50 dark:bg-slate-900 border-l-slate-300 dark:border-l-slate-600 border-t border-r border-b border-slate-200 dark:border-slate-700 opacity-60' : 'bg-white dark:bg-slate-700 border-l-purple-500 dark:border-l-purple-400 border-t border-r border-b border-slate-200 dark:border-slate-600 shadow-sm hover:shadow-md'} ${!isAdmin ? 'cursor-default' : ''}`}><div className="flex items-center gap-3"><div className={`w-4 h-4 rounded border flex items-center justify-center ${t.selesai ? 'bg-[#00994d] border-[#00994d]' : 'border-slate-300 dark:border-slate-500 bg-white dark:bg-slate-800'}`}>{t.selesai && <CheckSquare size={10} className="text-white" />}</div><div><h4 className={`font-bold text-xs md:text-sm ${t.selesai ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-700 dark:text-slate-200'}`}>{t.judul}</h4><span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium px-2 py-0.5 bg-slate-100 dark:bg-slate-900/50 rounded mt-1 inline-block border border-slate-200 dark:border-slate-600">{t.mapel}</span></div></div>{isAdmin && <button onClick={(e) => handleDeleteTask(e, t.id)} className="text-slate-300 hover:text-red-500 p-1 transition-colors"><Trash2 size={14} /></button>}</div>))}</div>
                    </div>
                </div>
            </div>

            <footer className="text-center py-8 text-slate-400 text-xs bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 mt-8 shadow-inner"><p className="font-medium">SMK Muhammadiyah 1 Metro • © 2025 Rafiantara</p></footer>
            
            {/* ALL MODALS */}
            <Modal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} title="Admin Access"><form onSubmit={handleLogin} className="space-y-4"><div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg text-center border border-slate-200 dark:border-slate-600"><Lock size={24} className="text-slate-400 mx-auto mb-2" /><p className="text-xs text-slate-500 dark:text-slate-400">Masukkan PIN Keamanan</p></div><input type="password" value={pinInput} onChange={e => setPinInput(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 text-center text-slate-800 dark:text-white tracking-[8px] text-lg focus:outline-none focus:border-[#002f6c] dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-100" placeholder="••••" autoFocus maxLength={6} /><button className="w-full bg-[#002f6c] hover:bg-blue-800 text-white py-2.5 rounded-lg font-bold shadow-sm transition-all text-sm">Masuk Dashboard</button></form></Modal>
            
            {/* SETTINGS MODAL (DIPERBAIKI BIAR AI KEY AMAN) */}
            <Modal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} title="Konfigurasi">
                <form onSubmit={handleSaveSettings} className="space-y-4">
                    <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-lg mb-3">
                        <button type="button" onClick={() => setSettingTab('ai')} className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${settingTab === 'ai' ? 'bg-white text-[#002f6c] shadow-sm' : 'text-slate-500'}`}>AI & API</button>
                        <button type="button" onClick={() => setSettingTab('kas')} className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${settingTab === 'kas' ? 'bg-white text-[#002f6c] shadow-sm' : 'text-slate-500'}`}>Data Kelas</button>
                    </div>
                    
                    {settingTab === 'ai' && (
                        <div className="space-y-3 animate-in fade-in">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-300 mb-1">Gemini API Key</label>
                                <div className="flex gap-2">
                                    <input type="text" value={apiKeyInput} onChange={e => setApiKeyInput(e.target.value)} className="flex-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg p-2 text-slate-800 dark:text-white text-xs outline-none focus:border-blue-500" placeholder={isApiKeySet ? "Kunci sudah terpasang (Aman)" : "Paste API Key disini..."} />
                                    {isApiKeySet && <div className="text-green-500 flex items-center text-xs font-bold"><CheckCircle size={14}/> OK</div>}
                                </div>
                                <p className="text-[9px] text-slate-400 mt-1">*Kosongkan jika tidak ingin mengubah key yang sudah ada.</p>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-300 mb-1">Model AI</label>
                                <select value={selectedModel} onChange={e => setSelectedModel(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg p-2 text-slate-800 dark:text-white text-xs outline-none">
                                    <option value="gemini-1.5-flash">1.5 Flash (Cepat)</option>
                                    <option value="gemini-2.5-flash">2.5 Flash (Pintar)</option>
                                </select>
                            </div>
                            <div className="border-t border-slate-200 pt-3 mt-2">
                                <label className="block text-xs font-bold text-green-600 mb-1 flex items-center gap-1"><Brain size={12}/> Otak AI Tamu (Knowledge Base)</label>
                                <p className="text-[10px] text-slate-400 mb-2">Info ini dipakai AI di halaman depan buat jawab pertanyaan tamu.</p>
                                <textarea value={guestAiContext} onChange={e => setGuestAiContext(e.target.value)} className="w-full bg-green-50 border border-green-200 rounded-lg p-2 text-xs text-slate-700 h-24 focus:border-green-500 outline-none" placeholder="Contoh: Kepala Sekolah Bapak X, Jurusan TKJ berdiri tahun 2010..." />
                            </div>
                        </div>
                    )}
                    
                    {/* SETTING KAS (Sama) */}
                    {settingTab === 'kas' && (
                        <div className="space-y-3 animate-in fade-in">
                             <div><label className="block text-xs font-bold text-slate-500 mb-1">Saldo Awal (Rp)</label><input type="number" value={saldoAwal} onChange={e => setSaldoAwal(e.target.value)} className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800 text-xs outline-none" /></div>
                             <div className="border-t border-slate-200 pt-3"><label className="block text-xs font-bold text-slate-500 mb-2">Siswa</label><div className="flex gap-2 mb-2"><input type="text" value={newStudentName} onChange={e => setNewStudentName(e.target.value)} className="flex-1 bg-white border border-slate-300 rounded-lg p-2 text-xs outline-none" placeholder="Nama..." /><button type="button" onClick={handleAddStudent} className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700"><Plus size={14} /></button></div><div className="max-h-[100px] overflow-y-auto custom-scrollbar space-y-1 bg-slate-50 p-2 rounded-lg border border-slate-200">{loadingStudents ? <p className="text-xs text-slate-400">Loading...</p> : dataStudents.sort((a, b) => a.name.localeCompare(b.name)).map(s => (<div key={s.id} className="flex justify-between items-center p-1.5 bg-white rounded border border-slate-100"><span className="text-xs font-medium text-slate-700">{s.name}</span><button type="button" onClick={() => handleDeleteStudent(s.id)} className="text-red-400 hover:text-red-600"><X size={12} /></button></div>))}</div></div>
                        </div>
                    )}
                    <button className="w-full bg-[#00994d] text-white py-2.5 rounded-lg text-sm font-bold shadow-md hover:bg-green-700 mt-2">Simpan Konfigurasi</button>
                </form>
            </Modal>
            
            {/* Modal Sisa (Kas, News, Galeri, dll - SAMA SEPERTI SEBELUMNYA) */}
             <Modal isOpen={isKasModalOpen} onClose={() => setIsKasModalOpen(false)} title={`Kas ${kelasId}`}><div className="space-y-4"><div className="bg-[#00994d] p-4 rounded-lg shadow-md text-center text-white"><p className="text-green-100 text-xs font-medium uppercase tracking-wider mb-1">Saldo Kas</p><h2 className="text-3xl font-bold">{formatRupiah(totalSaldoAkhir)}</h2></div><div className="flex bg-slate-100 p-1 rounded-lg mb-2"><button onClick={() => setKasTab('laporan')} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${kasTab === 'laporan' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}>Laporan</button>{isAdmin && <button onClick={() => setKasTab('input')} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${kasTab === 'input' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}>Input</button>}</div>{kasTab === 'laporan' && (<div className="space-y-3 animate-in fade-in"><div className="flex gap-2 items-center bg-slate-50 p-2 rounded-lg border border-slate-200"><select value={filterBulan} onChange={(e) => setFilterBulan(e.target.value)} className="bg-transparent text-slate-700 text-[10px] font-bold outline-none flex-1">{Array.from({ length: 12 }, (_, i) => i + 1).map(m => <option key={m} value={m}>Bln {m}</option>)}</select><select value={filterTahun} onChange={(e) => setFilterTahun(e.target.value)} className="bg-transparent text-slate-700 text-[10px] font-bold outline-none flex-1">{[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}</select><button onClick={handleExportExcel} className="text-[10px] bg-green-600 text-white px-2 py-1 rounded flex items-center gap-1 hover:bg-green-700"><FileSpreadsheet size={12} /></button></div><div className="max-h-[250px] overflow-y-auto custom-scrollbar space-y-2">{transactionsInPeriod.length === 0 ? <p className="text-center text-xs text-slate-400 py-6">Kosong.</p> : transactionsInPeriod.map((item) => (<div key={item.id} className="flex justify-between items-center p-2 bg-white rounded-lg border border-slate-100 shadow-sm"><div className="flex items-center gap-2"><div className={`p-1.5 rounded-full ${item.tipe === 'masuk' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>{item.tipe === 'masuk' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}</div><div><p className="text-xs font-bold text-slate-700">{item.nama}</p><p className="text-[10px] text-slate-400">{item.tanggal}</p></div></div><div className="text-right"><p className={`text-xs font-bold ${item.tipe === 'masuk' ? 'text-green-600' : 'text-red-600'}`}>{item.tipe === 'masuk' ? '+' : '-'} {formatRupiah(item.jumlah)}</p>{isAdmin && <button onClick={() => handleDeleteKas(item.id)} className="text-[9px] text-slate-400 hover:text-red-500">Hapus</button>}</div></div>))}</div></div>)}{kasTab === 'input' && isAdmin && (<div className="bg-slate-50 p-4 rounded-lg border border-slate-200 animate-in fade-in"><form onSubmit={handleAddKas} className="space-y-3"><div className="grid grid-cols-2 gap-3"><input type="date" value={kasInput.tanggal} onChange={e => setKasInput({ ...kasInput, tanggal: e.target.value })} className="bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-700 outline-none" /><select value={kasInput.tipe} onChange={e => setKasInput({ ...kasInput, tipe: e.target.value })} className="bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-700 outline-none"><option value="masuk">Masuk (+)</option><option value="keluar">Keluar (-)</option></select></div><div className="flex gap-2"><div className="w-1/3 relative"><input list="students" type="text" value={kasInput.nama} onChange={e => setKasInput({ ...kasInput, nama: e.target.value })} placeholder="Nama" className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-700 outline-none" /><datalist id="students">{dataStudents.map(s => <option key={s.id} value={s.name} />)}</datalist></div><input type="text" value={kasInput.jumlah} onChange={handleJumlahChange} placeholder="Rp" className="w-1/3 bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-700 outline-none" /><input type="text" value={kasInput.keterangan} onChange={e => setKasInput({ ...kasInput, keterangan: e.target.value })} placeholder="Ket" className="w-1/3 bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-700 outline-none" /></div><div className="border-t border-slate-200 pt-2"><input type="file" ref={buktiInputRef} onChange={handleBuktiChange} accept="image/*" className="hidden" id="buktiUpload" /><div className="flex justify-between items-center"><label htmlFor="buktiUpload" className="text-xs text-blue-600 cursor-pointer flex items-center gap-1 hover:underline font-medium"><ImageIcon size={14} /> {buktiPreview ? "Ganti Foto" : "Upload Bukti"}</label>{buktiPreview && <button type="button" onClick={clearBukti} className="text-red-500"><XCircle size={14} /></button>}</div></div><button className="w-full bg-[#00994d] hover:bg-green-700 text-white py-2.5 rounded-lg text-xs font-bold shadow-sm flex items-center justify-center gap-2"><Plus size={14} /> Simpan</button></form></div>)}</div></Modal>
            <Modal isOpen={isNewsModalOpen} onClose={() => setIsNewsModalOpen(false)} title="Post Berita/Karya">
                {isAdmin ? (
                    <form onSubmit={handlePostNews} className="space-y-4 animate-in fade-in">
                        <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg border border-orange-200 dark:border-orange-800 mb-2 text-[11px] text-orange-800 dark:text-orange-300 flex gap-2">
                            <AlertCircle size={14} className="shrink-0 mt-0.5"/>
                            <p>Berita yang diposting akan tampil di Halaman Depan (Landing Page) dan bisa dilihat publik. Gambar akan dikompres otomatis.</p>
                        </div>
                        <div><label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Judul</label><input type="text" value={newsInput.title} onChange={e => setNewsInput({...newsInput, title: e.target.value})} className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg p-2 text-sm dark:text-white" placeholder="Judul Berita..." required /></div>
                        <div className="grid grid-cols-2 gap-3">
                            <div><label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Kategori</label><select value={newsInput.category} onChange={e => setNewsInput({...newsInput, category: e.target.value})} className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg p-2 text-sm dark:text-white"><option>Kegiatan</option><option>Prestasi</option><option>Karya Siswa</option><option>Info Sekolah</option></select></div>
                            <div><label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Upload Foto</label><input type="file" accept="image/*" ref={newsFileInputRef} onChange={handleNewsImageChange} className="w-full text-xs text-slate-500 file:mr-2 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-slate-100 dark:file:bg-slate-700 file:text-slate-700 dark:file:text-slate-300 hover:file:bg-slate-200" /></div>
                        </div>
                        {newsImagePreview && (
                            <div className="relative h-32 w-full rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                                <img src={newsImagePreview} alt="Preview" className="w-full h-full object-cover" />
                                <button type="button" onClick={() => {setNewsImagePreview(null); setNewsInput({...newsInput, imageBase64: ''}); if(newsFileInputRef.current) newsFileInputRef.current.value='';}} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full shadow-md hover:bg-red-600"><X size={12}/></button>
                            </div>
                        )}
                        <div><label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Isi Berita</label><textarea value={newsInput.content} onChange={e => setNewsInput({...newsInput, content: e.target.value})} className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg p-3 text-sm h-24 dark:text-white" placeholder="Tulis detail berita..." required /></div>
                        <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-lg font-bold text-sm shadow-md flex items-center justify-center gap-2"><UploadCloud size={16}/> Posting Berita</button>
                    </form>
                ) : (
                    <div className="text-center py-10 text-slate-400">
                        <Lock size={40} className="mx-auto mb-2 opacity-50"/>
                        <p className="text-sm">Hanya Admin yang boleh posting berita.</p>
                        <button onClick={() => {setIsNewsModalOpen(false); setIsLoginModalOpen(true);}} className="mt-4 text-blue-500 text-xs font-bold hover:underline">Login Admin Dulu</button>
                    </div>
                )}
            </Modal>
            <Modal isOpen={isGaleriModalOpen} onClose={() => setIsGaleriModalOpen(false)} title="Upload Galeri">
                {isAdmin ? (
                    <form onSubmit={handlePostGaleri} className="space-y-4 animate-in fade-in">
                        <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border border-purple-200 dark:border-purple-800 mb-2 text-[11px] text-purple-800 dark:text-purple-300 flex gap-2">
                            <AlertCircle size={14} className="shrink-0 mt-0.5"/>
                            <p>Foto yang diupload akan muncul di halaman Galeri Publik. Ukuran otomatis dikompres (Max 20MB).</p>
                        </div>
                        <div><label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Caption / Keterangan</label><input type="text" value={galeriInput.caption} onChange={e => setGaleriInput({...galeriInput, caption: e.target.value})} className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg p-2 text-sm dark:text-white" placeholder="Foto kegiatan apa..." /></div>
                        <div><label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Upload Foto</label><input type="file" accept="image/*" ref={galeriFileInputRef} onChange={handleGaleriImageChange} className="w-full text-xs text-slate-500 file:mr-2 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-slate-100 dark:file:bg-slate-700 file:text-slate-700 dark:file:text-slate-300 hover:file:bg-slate-200" /></div>
                        
                        {galeriImagePreview && (
                            <div className="relative h-40 w-full rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                                <img src={galeriImagePreview} alt="Preview" className="w-full h-full object-cover" />
                                <button type="button" onClick={() => {setGaleriImagePreview(null); setGaleriInput({...galeriInput, imageBase64: ''}); if(galeriFileInputRef.current) galeriFileInputRef.current.value='';}} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full shadow-md hover:bg-red-600"><X size={12}/></button>
                            </div>
                        )}
                        <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-lg font-bold text-sm shadow-md flex items-center justify-center gap-2"><UploadCloud size={16}/> Upload ke Galeri</button>
                    </form>
                ) : (
                    <div className="text-center py-10 text-slate-400">
                        <Lock size={40} className="mx-auto mb-2 opacity-50"/>
                        <p className="text-sm">Login Admin dulu wak buat upload foto.</p>
                        <button onClick={() => {setIsGaleriModalOpen(false); setIsLoginModalOpen(true);}} className="mt-4 text-blue-500 text-xs font-bold hover:underline">Login Disini</button>
                    </div>
                )}
            </Modal>
            <Modal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} title="Tugas Baru"><form onSubmit={handleAddTask} className="space-y-4"><input value={newTask.judul} onChange={e => setNewTask({ ...newTask, judul: e.target.value })} className="w-full bg-slate-50 border-slate-200 rounded-xl p-3 text-slate-800 outline-none focus:border-emerald-500" placeholder="Judul..." autoFocus /><input value={newTask.mapel} onChange={e => setNewTask({ ...newTask, mapel: e.target.value })} className="w-full bg-slate-50 border-slate-200 rounded-xl p-3 text-slate-800 outline-none focus:border-emerald-500" placeholder="Mapel..." /><button className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700">Simpan</button></form></Modal>
            <Modal isOpen={isScheduleModalOpen} onClose={() => setIsScheduleModalOpen(false)} title="Edit Jadwal"><form onSubmit={handleSaveSchedule} className="space-y-4"><textarea value={scheduleInput} onChange={e => setScheduleInput(e.target.value)} className="w-full bg-slate-50 border-slate-200 rounded-xl p-3 text-slate-800 h-32 outline-none focus:border-emerald-500" placeholder="Mapel pisah koma..." /><button className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-green-700">Update</button></form></Modal>
            <Modal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} title="Broadcast Info"><form onSubmit={handleSaveInfo} className="space-y-4"><textarea value={infoInput} onChange={e => setInfoInput(e.target.value)} className="w-full bg-slate-50 border-slate-200 rounded-xl p-3 text-slate-800 h-32 outline-none focus:border-emerald-500" /><button className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700">Kirim</button></form></Modal>
            <Modal isOpen={isPiketModalOpen} onClose={() => setIsPiketModalOpen(false)} title={`Edit Piket (${hariPilihan})`}><form onSubmit={handleSavePiket} className="space-y-4"><div className="text-slate-500 text-xs mb-2">Pisahkan koma (Cth: Budi, Andi)</div><textarea value={piketInput} onChange={e => setPiketInput(e.target.value)} className="w-full bg-slate-50 border-slate-200 rounded-xl p-3 text-slate-800 h-32 outline-none focus:border-orange-500" placeholder="Nama siswa..." /><button className="w-full bg-orange-500 text-white py-3 rounded-xl font-bold hover:bg-orange-600">Simpan Piket</button></form></Modal>
            <Modal isOpen={isQuoteModalOpen} onClose={() => setIsQuoteModalOpen(false)} title="Manage Quotes"><div className="space-y-6"><form onSubmit={handleAddQuote} className="space-y-3 pb-4 border-b border-slate-100"><input type="text" value={newQuoteText} onChange={e => setNewQuoteText(e.target.value)} className="w-full bg-white border-slate-300 rounded-lg p-2.5 text-slate-800 text-sm focus:border-blue-500 outline-none" placeholder="Kata mutiara..." /><button className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700">Tambah</button></form><div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar"><h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Quotes DB ({dataQuotes.length})</h4>{loadingQuotes ? <p className="text-xs text-slate-400">Loading...</p> : dataQuotes.length === 0 ? <p className="text-xs text-slate-400 italic">Belum ada.</p> : dataQuotes.map((q) => (<div key={q.id} className="flex items-start justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 group"><div><p className="text-sm text-slate-700 line-clamp-2">"{q.text}"</p><span className="text-[10px] text-slate-400">{q.author}</span></div><button onClick={() => handleDeleteQuote(q.id)} className="text-slate-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14} /></button></div>))}</div></div></Modal>
            <Modal isOpen={isAbsenModalOpen} onClose={() => setIsAbsenModalOpen(false)} title="Data Absensi">
                <div className="space-y-4">
                    <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-lg mb-3">
                        <button onClick={() => setAbsenTab('view')} className={`flex-1 py-2 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-2 ${absenTab === 'view' ? 'bg-white dark:bg-slate-800 text-red-600 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}><Eye size={14}/> Lihat Data</button>
                        {isAdmin && (<button onClick={() => setAbsenTab('input')} className={`flex-1 py-2 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-2 ${absenTab === 'input' ? 'bg-white dark:bg-slate-800 text-red-600 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}><Edit3 size={14}/> Input Absensi</button>)}
                    </div>
                    {absenTab === 'view' && (
                        <div className="space-y-4 animate-in fade-in">
                             <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-center border border-red-100 dark:border-red-800 mb-4">
                                <p className="text-red-800 dark:text-red-300 text-xs font-bold uppercase tracking-wider">Total Siswa Tidak Hadir</p>
                                <h2 className="text-3xl font-black text-red-600 dark:text-red-400">{countSakit + countIzin + countAlpha}</h2>
                                <p className="text-[10px] text-red-400 font-medium">Hari Ini</p>
                            </div>
                            <div className="space-y-3">
                                <div className="bg-white dark:bg-slate-700 p-3 rounded-lg border border-yellow-200 dark:border-yellow-900/50 shadow-sm">
                                    <h4 className="text-xs font-bold text-yellow-700 dark:text-yellow-400 flex items-center gap-2 mb-2"><AlertCircle size={14}/> Sakit ({countSakit})</h4>
                                    <p className="text-sm text-slate-700 dark:text-slate-200 font-medium">{absenHariIni.sakit === '-' || !absenHariIni.sakit ? <span className="text-slate-400 italic text-xs">Nihil</span> : absenHariIni.sakit}</p>
                                </div>
                                <div className="bg-white dark:bg-slate-700 p-3 rounded-lg border border-blue-200 dark:border-blue-900/50 shadow-sm">
                                    <h4 className="text-xs font-bold text-blue-700 dark:text-blue-400 flex items-center gap-2 mb-2"><AlertCircle size={14}/> Izin ({countIzin})</h4>
                                    <p className="text-sm text-slate-700 dark:text-slate-200 font-medium">{absenHariIni.izin === '-' || !absenHariIni.izin ? <span className="text-slate-400 italic text-xs">Nihil</span> : absenHariIni.izin}</p>
                                </div>
                                <div className="bg-white dark:bg-slate-700 p-3 rounded-lg border border-red-200 dark:border-red-900/50 shadow-sm">
                                    <h4 className="text-xs font-bold text-red-700 dark:text-red-400 flex items-center gap-2 mb-2"><AlertCircle size={14}/> Alpha ({countAlpha})</h4>
                                    <p className="text-sm text-slate-700 dark:text-slate-200 font-medium">{absenHariIni.alpha === '-' || !absenHariIni.alpha ? <span className="text-slate-400 italic text-xs">Nihil</span> : absenHariIni.alpha}</p>
                                </div>
                            </div>
                        </div>
                    )}
                    {absenTab === 'input' && isAdmin && (
                        <form onSubmit={handleSaveAbsensi} className="space-y-4 animate-in fade-in">
                            <div className="bg-slate-50 dark:bg-slate-700 p-3 rounded-lg border border-slate-200 dark:border-slate-600 text-[11px] text-slate-500 dark:text-slate-300 mb-2 flex items-start gap-2">
                                <AlertCircle size={14} className="shrink-0 mt-0.5 text-blue-500"/>
                                <p>Pisahkan nama dengan koma (cth: Budi, Andi). Kosongkan atau isi (-) jika nihil.</p>
                            </div>
                            <div><label className="block text-xs font-bold text-yellow-600 mb-1">Sakit</label><textarea value={absenInput.sakit} onChange={e => setAbsenInput({ ...absenInput, sakit: e.target.value })} className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg p-3 text-sm h-16 dark:text-white" /></div>
                            <div><label className="block text-xs font-bold text-blue-600 mb-1">Izin</label><textarea value={absenInput.izin} onChange={e => setAbsenInput({ ...absenInput, izin: e.target.value })} className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg p-3 text-sm h-16 dark:text-white" /></div>
                            <div><label className="block text-xs font-bold text-red-600 mb-1">Alpha</label><textarea value={absenInput.alpha} onChange={e => setAbsenInput({ ...absenInput, alpha: e.target.value })} className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg p-3 text-sm h-16 dark:text-white" /></div>
                            <button className="w-full bg-red-600 text-white py-3 rounded-lg font-bold text-sm hover:bg-red-700">Update Data Absensi</button>
                        </form>
                    )}
                </div>
            </Modal>
            {/* MODAL AI ASSISTANT */}
            <Modal isOpen={isAiModalOpen} onClose={() => setIsAiModalOpen(false)} title="TKJ Assistant">
                <div className="flex flex-col h-[50vh] md:h-[400px]">
                    {/* Area Chat */}
                    <div className="flex-1 space-y-4 p-2 overflow-y-auto custom-scrollbar">
                        {chatHistory.map((msg, index) => (
                            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] p-3 rounded-lg text-sm leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-[#002f6c] text-white rounded-br-none' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 rounded-bl-none'}`}>
                                    {msg.image && <img src={msg.image} alt="Upload" className="w-full rounded-lg mb-2 border border-white/20" />}
                                    {msg.role === 'user' ? msg.text : <ReactMarkdown components={{ strong: ({ node, ...props }) => <span className="font-bold text-blue-600" {...props} />, a: ({ node, ...props }) => <a className="text-blue-500 underline" target="_blank" {...props} />, code: ({ node, ...props }) => <code className="bg-slate-200 px-1 py-0.5 rounded text-red-500 font-mono text-xs" {...props} /> }}>{msg.text}</ReactMarkdown>}
                                </div>
                            </div>
                        ))}
                        {isTyping && <div className="flex justify-start"><div className="bg-slate-100 text-slate-500 px-4 py-2 rounded-lg text-xs border border-slate-200 animate-pulse">Mengetik...</div></div>}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Preview Gambar Upload */}
                    {imagePreview && (
                        <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
                            <div className="flex items-center gap-3"><img src={imagePreview} alt="Preview" className="h-12 w-12 rounded object-cover border border-slate-300" /><span className="text-xs text-slate-500">Gambar siap dikirim</span></div>
                            <button onClick={clearImage} className="text-red-500 hover:bg-red-50 rounded-full p-1"><XCircle size={20} /></button>
                        </div>
                    )}

                    {/* Input Form */}
                    <form onSubmit={handleSendChat} className="mt-0 flex gap-2 border-t border-slate-100 pt-3">
                        <button type="button" onClick={() => fileInputRef.current.click()} className="bg-slate-100 hover:bg-slate-200 text-slate-500 p-3 rounded-xl transition-colors"><ImageIcon size={20} /></button>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                        <input value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Tanya / Upload gambar..." className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:border-emerald-500 text-sm" />
                        <button type="submit" disabled={(!chatInput.trim() && !imageFile) || isTyping} className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white p-3 rounded-xl shadow-md"><Send size={20} /></button>
                    </form>
                </div>
            </Modal>
        </div>
    )
}

export default DashboardKelas