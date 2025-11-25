import { useState, useEffect, useRef } from 'react'
import { BookOpen, CheckSquare, Plus, Trash2, X, Edit3, Megaphone, Calendar, Link, Wifi, Calculator, Zap, Send, Bot, Globe, Lock, Unlock, LogOut, Image as ImageIcon, XCircle, UserCheck, Coffee, Settings, Key, Quote, Wallet, TrendingUp, TrendingDown, FileSpreadsheet, Download, Filter } from 'lucide-react'
import { collection, doc, updateDoc, addDoc, deleteDoc, setDoc, serverTimestamp, getDoc } from "firebase/firestore"
import { db } from "./services/firebase"
import useFirestore from './hooks/useFirestore'
import { GoogleGenerativeAI } from "@google/generative-ai"
import ReactMarkdown from 'react-markdown'
import { motion, AnimatePresence } from "framer-motion"
import * as XLSX from 'xlsx'

// --- DATA STATIC ---
const DEFAULT_QUOTES = [
  { text: "Jangan lupa bernapas, coding butuh oksigen.", author: "Admin" },
  { text: "Duit kas jangan dipake buat beli cilok.", author: "Bendahara" },
  { text: "Error adalah cara komputer bilang 'Coba Lagi'.", author: "System" }
]

const DATA_PIKET = {
  'Senin': ['Ahmad', 'Budi', 'Cecep', 'Dodi'],
  'Selasa': ['Eko', 'Fajar', 'Gilang', 'Hadi'],
  'Rabu': ['Indra', 'Joko', 'Kiki', 'Lala'],
  'Kamis': ['Mamat', 'Nana', 'Oki', 'Putra'],
  'Jumat': ['Qori', 'Rafa', 'Sandi', 'Tio'],
  'Sabtu': ['Libur', 'Wak', 'Gak', 'Piket'],
  'Minggu': ['Libur', 'Cuy']
}

// --- MODAL COMPONENT ---
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-end md:items-center justify-center z-50 p-0 md:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border-t md:border border-slate-700 w-full md:max-w-md rounded-t-3xl md:rounded-2xl p-6 shadow-2xl animate-in slide-in-from-bottom-10 md:slide-in-from-bottom-0 flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center mb-5 border-b border-slate-800 pb-3 flex-shrink-0">
          <h3 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
            {title === 'TKJ Assistant' ? <Bot size={24} className="text-blue-400"/> : null}
            {title}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors bg-slate-800 p-1 rounded-full"><X size={20} /></button>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  )
}

function App() {
  const [time, setTime] = useState(new Date())
  const namaHariIni = new Date().toLocaleDateString('id-ID', { weekday: 'long' })
  const [hariPilihan, setHariPilihan] = useState(namaHariIni)
  const [greeting, setGreeting] = useState('')
  
  const [quote, setQuote] = useState(DEFAULT_QUOTES[0])
  const [newQuoteText, setNewQuoteText] = useState('') 

  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  const [pinInput, setPinInput] = useState('')
  const [apiKeyInput, setApiKeyInput] = useState('')
  const [selectedModel, setSelectedModel] = useState('gemini-1.5-flash')

  // MODAL STATES
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)
  const [isPiketModalOpen, setIsPiketModalOpen] = useState(false)
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false)
  const [isAiModalOpen, setIsAiModalOpen] = useState(false)
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false)
  const [isKasModalOpen, setIsKasModalOpen] = useState(false)
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false)

  // INPUT STATES
  const [newTask, setNewTask] = useState({ judul: '', mapel: '' })
  const [scheduleInput, setScheduleInput] = useState('')
  const [piketInput, setPiketInput] = useState('') 
  const [infoInput, setInfoInput] = useState('')
  
  // KAS STATES & FILTER (UPDATED: Mingguan)
  const [kasInput, setKasInput] = useState({ 
      tanggal: new Date().toISOString().split('T')[0], 
      nama: '', jumlah: '', tipe: 'masuk', keterangan: '' 
  })
  const [filterBulan, setFilterBulan] = useState(new Date().getMonth() + 1)
  const [filterTahun, setFilterTahun] = useState(new Date().getFullYear())
  const [filterMinggu, setFilterMinggu] = useState('all') // NEW: Filter Minggu

  // AI & PDF STATES
  const [chatInput, setChatInput] = useState('')
  const [chatHistory, setChatHistory] = useState([{ role: 'model', text: 'Halo Wak! Gue asisten AI TKJ. 😎' }])
  const [isTyping, setIsTyping] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [pdfImages, setPdfImages] = useState([])
  
  const fileInputRef = useRef(null)
  const chatEndRef = useRef(null)

  // FIREBASE HOOKS
  const { data: daftarTugas, loading: loadingTugas } = useFirestore('tugas')
  const { data: dataJadwal, loading: loadingJadwal } = useFirestore('jadwal')
  const { data: dataPiket, loading: loadingPiket } = useFirestore('piket') 
  const { data: dataInfo } = useFirestore('pengumuman')
  const { data: dataQuotes, loading: loadingQuotes } = useFirestore('quotes')
  const { data: dataKas, loading: loadingKas } = useFirestore('uang_kas')
  
  const jadwalTampil = dataJadwal.find(j => j.id === hariPilihan)
  const piketTampil = dataPiket.find(p => p.id === hariPilihan)
  const activeQuotes = dataQuotes.length > 0 ? dataQuotes : DEFAULT_QUOTES

  // --- LOGIC KAS & FILTER MINGGUAN ---
  const totalSaldo = dataKas.reduce((acc, curr) => curr.tipe === 'masuk' ? acc + Number(curr.jumlah) : acc - Number(curr.jumlah), 0)
  const formatRupiah = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)

  // Helper: Hitung Minggu ke-berapa dalam bulan itu
  const getWeekOfMonth = (date) => {
      const d = new Date(date);
      const dateNum = d.getDate();
      return Math.ceil(dateNum / 7);
  }

  // Filter Data (Bulan + Tahun + Minggu)
  const filteredKas = dataKas.filter(item => {
      if (!item.tanggal) return false;
      const date = new Date(item.tanggal);
      const isMonthMatch = (date.getMonth() + 1) === parseInt(filterBulan);
      const isYearMatch = date.getFullYear() === parseInt(filterTahun);
      // Kalau 'all', lolos. Kalau pilih minggu, cek minggu ke-berapa
      const isWeekMatch = filterMinggu === 'all' || getWeekOfMonth(date) === parseInt(filterMinggu);
      
      return isMonthMatch && isYearMatch && isWeekMatch;
  }).sort((a,b) => new Date(b.tanggal) - new Date(a.tanggal));

  const handleJumlahChange = (e) => {
    let rawValue = e.target.value.replace(/[^0-9]/g, '');
    if (rawValue) {
        let formatted = parseInt(rawValue).toLocaleString('id-ID');
        setKasInput({ ...kasInput, jumlah: formatted });
    } else {
        setKasInput({ ...kasInput, jumlah: '' });
    }
  }

  useEffect(() => {
    const savedAuth = localStorage.getItem('tkj_admin_auth'); if (savedAuth === 'true') setIsAdmin(true)
    const loadSettings = async () => { try { const docSnap = await getDoc(doc(db, 'settings', 'ai_config')); if (docSnap.exists() && docSnap.data().model) setSelectedModel(docSnap.data().model); } catch (e) {} }; loadSettings();
    window.addEventListener('online', () => setIsOnline(true)); window.addEventListener('offline', () => setIsOnline(false))
    const clockInterval = setInterval(() => {
      const now = new Date(); setTime(now); const h = now.getHours();
      if (h < 11) setGreeting('Selamat Pagi ☀️'); else if (h < 15) setGreeting('Selamat Siang 🌤️'); else if (h < 18) setGreeting('Selamat Sore 🌥️'); else setGreeting('Selamat Malam 🌙')
    }, 1000)
    return () => { clearInterval(clockInterval); window.removeEventListener('online', () => setIsOnline(true)); window.removeEventListener('offline', () => setIsOnline(false)) }
  }, [])

  useEffect(() => {
    const quoteInterval = setInterval(() => {
      setQuote(prev => { if (activeQuotes.length <= 1) return activeQuotes[0]; let r; do { r = Math.floor(Math.random() * activeQuotes.length) } while (activeQuotes[r].text === prev.text); return activeQuotes[r]; })
    }, 5000)
    return () => clearInterval(quoteInterval)
  }, [activeQuotes])

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }) }, [chatHistory, isAiModalOpen, imagePreview])

  // HANDLERS
  const handleLogin = (e) => { e.preventDefault(); if (pinInput === 'tkj123') { setIsAdmin(true); localStorage.setItem('tkj_admin_auth', 'true'); setIsLoginModalOpen(false); setPinInput(''); alert("Akses Admin Diberikan! 🔓") } else { alert("PIN Salah! ⛔"); setPinInput('') } }
  const handleLogout = () => { if(confirm("Keluar mode admin?")) { setIsAdmin(false); localStorage.removeItem('tkj_admin_auth') } }
  const handleSaveSettings = async (e) => { e.preventDefault(); if (!apiKeyInput.trim()) { alert("API Key kosong!"); return; } try { await setDoc(doc(db, 'settings', 'ai_config'), { apiKey: apiKeyInput, model: selectedModel, updatedAt: serverTimestamp() }); alert(`Setting tersimpan!`); setIsSettingsModalOpen(false); setApiKeyInput('') } catch (error) { alert("Gagal simpan.") } }
  const handleAddQuote = async (e) => { e.preventDefault(); if (!newQuoteText.trim()) return; try { await addDoc(collection(db, 'quotes'), { text: newQuoteText, author: "Admin", createdAt: serverTimestamp() }); setNewQuoteText('') } catch (error) { console.error(error) } }
  const handleDeleteQuote = async (id) => { if (confirm("Hapus kata-kata ini?")) { try { await deleteDoc(doc(db, 'quotes', id)) } catch (error) { console.error(error) } } }
  
  // KAS HANDLERS
  const handleAddKas = async (e) => {
      e.preventDefault();
      if (!kasInput.nama || !kasInput.jumlah) return;
      const cleanJumlah = parseInt(kasInput.jumlah.replace(/\./g, ''));
      try {
          await addDoc(collection(db, 'uang_kas'), {
              tanggal: kasInput.tanggal,
              nama: kasInput.nama,
              jumlah: cleanJumlah,
              tipe: kasInput.tipe,
              keterangan: kasInput.keterangan || '-',
              createdAt: serverTimestamp()
          });
          setKasInput({ ...kasInput, nama: '', jumlah: '', keterangan: '' });
          alert("Data dicatat!");
      } catch (err) { alert("Gagal simpan."); }
  }
  
  const handleDeleteKas = async (id) => { if (confirm("Hapus transaksi ini?")) try { await deleteDoc(doc(db, 'uang_kas', id)) } catch (err) {} }
  
  const handleExportExcel = () => {
      const dataToExport = filteredKas.map(item => ({
          "Tanggal": item.tanggal || '-',
          "Minggu Ke": getWeekOfMonth(new Date(item.tanggal)), // Tambahan Info Minggu
          "Nama Siswa": item.nama,
          "Jenis": item.tipe === 'masuk' ? 'PEMASUKAN' : 'PENGELUARAN',
          "Jumlah (Rp)": formatRupiah(item.jumlah),
          "Keterangan": item.keterangan
      }));

      // Info File
      let fileName = `Laporan_Kas_${filterBulan}_${filterTahun}`;
      if (filterMinggu !== 'all') fileName += `_Minggu_${filterMinggu}`;

      const ws = XLSX.utils.json_to_sheet(dataToExport);
      const wscols = [{wch: 12}, {wch: 10}, {wch: 20}, {wch: 15}, {wch: 15}, {wch: 25}];
      ws['!cols'] = wscols;
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Laporan Kas");
      XLSX.writeFile(wb, `${fileName}.xlsx`);
  }

  // PDF LOGIC
  const handlePdfImageChange = (e) => { if (e.target.files) { const files = Array.from(e.target.files).map(file => ({ file, url: URL.createObjectURL(file) })); setPdfImages(prev => [...prev, ...files]); } }
  const handleGeneratePdf = () => { setPdfImages([]); setIsPdfModalOpen(false); alert("Fitur PDF Placeholder"); } 
  const removePdfImage = (idx) => { const newImg = [...pdfImages]; newImg.splice(idx, 1); setPdfImages(newImg); }
  const handleFileChange = (e) => { const f = e.target.files[0]; if(f){ setImageFile(f); const r = new FileReader(); r.onloadend=()=>setImagePreview(r.result); r.readAsDataURL(f); } }
  const clearImage = () => { setImageFile(null); setImagePreview(null); if(fileInputRef.current) fileInputRef.current.value=''; }
  async function fileToGenerativePart(file) { const r = new FileReader(); const p = new Promise(res => r.onloadend=()=>res(r.result.split(',')[1])); r.readAsDataURL(file); return { inlineData: { data: await p, mimeType: file.type } }; }
  const handleSendChat = async (e) => { e.preventDefault(); if (!chatInput.trim() && !imageFile) return; 
    const currentText = chatInput; setChatHistory(prev => [...prev, {role:'user', text:currentText, image:imagePreview}]); setChatInput(''); setImageFile(null); setImagePreview(null); setIsTyping(true);
    try {
        const s = await getDoc(doc(db,'settings','ai_config')); if(!s.exists()) throw new Error("No API Key");
        const genAI = new GoogleGenerativeAI(s.data().apiKey); const model = genAI.getGenerativeModel({model: s.data().model || 'gemini-1.5-flash'});
        const ctx = chatHistory.slice(-6).map(m=>`${m.role==='user'?'User':'AI'}: ${m.text}`).join('\n');
        const res = await model.generateContent(imageFile ? [currentText||"Jelasin", await fileToGenerativePart(imageFile)] : `Kamu Asisten TKJ. Context:\n${ctx}\nUser: "${currentText}"`);
        setChatHistory(p => [...p, {role:'model', text: res.response.text()}]);
    } catch(err) { setChatHistory(p => [...p, {role:'model', text: `Error: ${err.message}`}]); } finally { setIsTyping(false); }
  }

  const handleAddTask = async (e) => { e.preventDefault(); if (!newTask.judul) return; await addDoc(collection(db, 'tugas'), { judul: newTask.judul, mapel: newTask.mapel||'Umum', selesai: false, createdAt: serverTimestamp() }); setNewTask({judul:'', mapel:''}); setIsTaskModalOpen(false); }
  const handleDeleteTask = async (e, id) => { e.stopPropagation(); if(confirm('Hapus?')) await deleteDoc(doc(db, 'tugas', id)); }
  const handleToggleTask = async (id, status) => { await updateDoc(doc(db, 'tugas', id), { selesai: !status }); }
  const handleSaveSchedule = async (e) => { e.preventDefault(); const mapel = scheduleInput.split(',').map(i=>i.trim()).filter(i=>i!==''); await setDoc(doc(db, 'jadwal', hariPilihan), { mapel, updatedAt: serverTimestamp() }); setIsScheduleModalOpen(false); }
  const handleSaveInfo = async (e) => { e.preventDefault(); await setDoc(doc(db, 'pengumuman', 'info_utama'), { isi: infoInput, updatedAt: serverTimestamp() }); setIsInfoModalOpen(false); }
  const handleSavePiket = async (e) => { e.preventDefault(); const piketArray = piketInput.split(',').map(item => item.trim()).filter(item => item !== ''); try { await setDoc(doc(db, 'piket', hariPilihan), { names: piketArray, updatedAt: serverTimestamp() }); setIsPiketModalOpen(false) } catch (err) { console.error(err) } }

  const openScheduleModal = () => { setScheduleInput(jadwalTampil ? jadwalTampil.mapel.join(', ') : ''); setIsScheduleModalOpen(true); }
  const openPiketModal = () => { setPiketInput(piketTampil ? piketTampil.names.join(', ') : ''); setIsPiketModalOpen(true); }
  const openInfoModal = () => { const info = dataInfo.find(i=>i.id==='info_utama')||dataInfo[0]; setInfoInput(info?info.isi:''); setIsInfoModalOpen(true); }
  
  const isLibur = hariPilihan === 'Sabtu' || hariPilihan === 'Minggu';

  return (
    <div className="min-h-screen text-white font-sans pb-20 md:pb-0">
      <div className="pt-6 px-4 pb-2 md:p-8 md:pb-0 max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div className="flex-1 w-full">
            <div className="flex justify-between items-center mb-1">
                <p className="text-blue-400 font-medium text-xs md:text-base tracking-wide uppercase flex items-center gap-2">
                    {greeting} {isAdmin ? <span className="bg-green-500/20 text-green-400 text-[10px] px-2 py-0.5 rounded border border-green-500/50 flex items-center gap-1 cursor-pointer" onClick={handleLogout}><Unlock size={10}/> ADMIN</span> : <span className="bg-slate-700 text-slate-400 text-[10px] px-2 py-0.5 rounded border border-slate-600 flex items-center gap-1 cursor-pointer" onClick={() => setIsLoginModalOpen(true)}><Lock size={10}/> GUEST</span>}
                </p>
                {isAdmin && (<button onClick={() => setIsSettingsModalOpen(true)} className="bg-slate-800 hover:bg-slate-700 text-slate-400 p-1.5 rounded-full transition-colors"><Settings size={16}/></button>)}
            </div>
            <div className="flex justify-between items-end">
                <div><h1 className="text-3xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 tracking-tighter drop-shadow-sm">XI <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">TKJ</span></h1></div>
                <div className="hidden md:block bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 p-4 rounded-2xl text-right"><div className="text-3xl font-bold font-mono text-white">{time.toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}</div><div className="text-sm text-slate-400">{time.toLocaleDateString('id-ID', {weekday: 'long', day: 'numeric', month: 'long'})}</div></div>
            </div>
          </div>
        </header>
      </div>

      <div className="p-4 md:p-8 pt-4 max-w-7xl mx-auto flex flex-col md:grid md:grid-cols-12 gap-4 md:gap-6">
        <div className="order-1 md:col-span-4 md:order-1"><div className="h-full bg-gradient-to-br from-indigo-900/80 to-slate-900/80 backdrop-blur-md p-5 rounded-3xl border border-indigo-500/30 relative overflow-hidden group shadow-lg"><div className="flex items-center justify-between mb-2 relative z-10"><div className="flex items-center gap-2 bg-indigo-500/20 px-3 py-1 rounded-full border border-indigo-500/30"><Megaphone size={14} className="text-indigo-300" /> <span className="text-xs font-bold text-indigo-100 uppercase">Broadcast</span></div>{isAdmin && <button onClick={openInfoModal} className="opacity-60 hover:opacity-100 hover:text-white transition-opacity"><Edit3 size={16} /></button>}</div><div className="relative z-10">{dataInfo.length > 0 ? (<p className="text-indigo-50 text-sm font-medium leading-relaxed whitespace-pre-wrap line-clamp-3 hover:line-clamp-none transition-all cursor-pointer">{dataInfo.find(i => i.id === 'info_utama')?.isi || dataInfo[0]?.isi}</p>) : <div className="text-white/40 italic text-sm">Info kosong.</div>}</div></div></div>
        
        <div className="order-2 md:col-span-4 md:order-2">
           <div className="bg-slate-900/60 backdrop-blur-md p-4 md:p-5 rounded-3xl border border-slate-700/50 flex md:justify-around items-center gap-4 overflow-x-auto scrollbar-hide">
              <div onClick={() => setIsAiModalOpen(true)} className="flex flex-col items-center gap-2 cursor-pointer group min-w-[60px]"><div className="p-3 rounded-2xl bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 shadow-[0_0_10px_rgba(250,204,21,0.2)]"><Zap size={20} fill="currentColor" /></div><span className="text-[10px] font-medium text-slate-400">AI Chat</span></div>
              <div onClick={() => window.open('https://rafiantara.fun', '_blank')} className="flex flex-col items-center gap-2 cursor-pointer group min-w-[60px]"><div className="p-3 rounded-2xl bg-green-400/10 text-green-400 border border-white/5"><Globe size={20} /></div><span className="text-[10px] font-medium text-slate-400">Creator</span></div>
              <div onClick={() => setIsPdfModalOpen(true)} className="flex flex-col items-center gap-2 cursor-pointer group min-w-[60px]"><div className="p-3 rounded-2xl bg-red-500/10 text-red-400 border border-red-500/20"><FileSpreadsheet size={20} /></div><span className="text-[10px] font-medium text-slate-400">PDF</span></div>
              <div className="flex flex-col items-center gap-2 cursor-pointer group opacity-50 min-w-[60px]"><div className="p-3 rounded-2xl bg-blue-400/10 text-blue-400 border border-white/5"><Wifi size={20} /></div><span className="text-[10px] font-medium text-slate-400">WiFi</span></div>
           </div>
        </div>

        <div className="order-3 md:col-span-4 md:order-3"><div className="bg-gradient-to-br from-orange-900/40 to-slate-900 p-5 rounded-3xl border border-orange-500/20 relative overflow-hidden group shadow-lg flex flex-col h-full"><div className="flex items-center justify-between mb-4"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center border border-orange-600/30"><UserCheck size={20} className="text-orange-400" /></div><div><h3 className="font-bold text-white text-sm">Piket</h3><p className="text-[10px] text-slate-400">{hariPilihan}</p></div></div>{isAdmin && !isLibur && (<button onClick={openPiketModal} className="text-orange-400 hover:text-orange-300 bg-slate-800 p-2 rounded-full"><Edit3 size={14} /></button>)}</div><div className="bg-slate-800/50 p-3 rounded-xl border border-white/5 text-center">{isLibur ? <span className="text-xs text-orange-200">Libur Cuy! ☕</span> : piketTampil ? (<div className="flex flex-wrap gap-2 justify-center">{piketTampil.names.map((nama, idx) => (<span key={idx} className="bg-orange-500/20 text-orange-200 text-xs px-2 py-1 rounded-md border border-orange-500/30">{nama}</span>))}</div>) : <span className="text-xs text-slate-500 italic">Kosong.</span>}</div></div></div>

        <div className="order-4 md:col-span-4 md:order-4"><div className="bg-gradient-to-br from-green-900/40 to-slate-900 p-5 rounded-3xl border border-green-500/20 relative overflow-hidden group shadow-lg flex flex-col h-full justify-center cursor-pointer hover:border-green-500/40 transition-all" onClick={() => setIsKasModalOpen(true)}><div className="flex items-center gap-3 mb-3"><div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center border border-green-600/30"><Wallet size={24} className="text-green-400" /></div><div><h3 className="font-bold text-white">Buku Kas</h3><p className="text-xs text-slate-400">Klik untuk detail</p></div></div><div className="bg-slate-800/50 p-3 rounded-xl border border-white/5 text-center"><p className="text-2xl font-bold text-green-300 tracking-tight">{formatRupiah(totalSaldo)}</p></div></div></div>

        <div className="order-5 md:col-span-8 md:order-5"><div className="bg-slate-900/60 backdrop-blur-md p-5 rounded-3xl border border-slate-700/50 shadow-xl h-full flex flex-col"><div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4"><div className="flex items-center gap-3"><div className="p-2 bg-blue-500/10 rounded-lg"><BookOpen size={20} className="text-blue-400" /></div><div><h2 className="font-bold text-lg text-white">Jadwal</h2><p className="text-[10px] text-slate-500 uppercase tracking-wider">{hariPilihan}</p></div></div><div className="w-full md:w-auto flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">{['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'].map((hari) => (<button key={hari} onClick={() => {setHariPilihan(hari)}} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border whitespace-nowrap ${hariPilihan === hari ? 'bg-blue-600 border-blue-500 text-white' : 'bg-transparent border-slate-700 text-slate-400'}`}>{hari}</button>))}{isAdmin && !isLibur && <button onClick={openScheduleModal} className="px-3 py-1.5 bg-slate-800 rounded-lg border border-slate-700 text-slate-400"><Edit3 size={14} /></button>}</div></div><div className="grid grid-cols-2 md:grid-cols-4 gap-2">{isLibur ? <div className="col-span-full py-8 text-center text-slate-500 border-2 border-dashed border-slate-800 rounded-xl"><Coffee size={32} className="mx-auto mb-2 opacity-50"/><p className="text-xs">Libur.</p></div> : loadingJadwal ? <p className="text-slate-500 text-xs">Loading...</p> : jadwalTampil ? (jadwalTampil.mapel.map((mapel, index) => (<div key={index} className="bg-slate-800/40 border border-slate-700/50 p-3 rounded-lg flex items-center gap-2"><span className="w-6 h-6 rounded bg-slate-900 flex items-center justify-center text-[10px] font-bold text-slate-500">{index + 1}</span><span className="font-medium text-slate-300 text-sm truncate">{mapel}</span></div>))) : <div className="col-span-full py-4 text-center text-slate-500 text-sm border-2 border-dashed border-slate-800 rounded-xl">Jadwal Kosong.</div>}</div></div></div>
        
        <div className="order-6 md:col-span-4 md:order-6"><div className="h-full bg-slate-900/60 backdrop-blur-md p-4 rounded-3xl border border-slate-700/50 flex flex-col justify-center text-center relative overflow-hidden min-h-[100px]">{isAdmin && (<button onClick={() => setIsQuoteModalOpen(true)} className="absolute top-3 right-3 text-slate-500 hover:text-blue-400 p-1 bg-slate-800/50 rounded-full z-10"><Edit3 size={12} /></button>)}<AnimatePresence mode="wait"><motion.div key={quote.text} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5 }} className="flex flex-col items-center px-2"><Quote size={20} className="text-blue-500/30 mb-1"/><p className="text-slate-300 italic font-serif text-sm leading-relaxed">"{quote.text}"</p><p className="text-slate-500 text-[10px] mt-2 font-bold uppercase tracking-widest">— {quote.author}</p></motion.div></AnimatePresence></div></div>
        
        <div className="order-7 md:col-span-8 md:order-7"><div className="bg-slate-900/60 backdrop-blur-md p-5 rounded-3xl border border-slate-700/50 shadow-xl min-h-[300px]"><div className="flex items-center justify-between mb-4"><div className="flex items-center gap-3"><div className="bg-green-500/10 p-2 rounded-lg text-green-400"><CheckSquare size={20} /></div><h2 className="font-bold text-lg">Tugas <span className="text-slate-500 text-sm font-normal">({daftarTugas.filter(t => !t.selesai).length})</span></h2></div>{isAdmin && <button onClick={() => setIsTaskModalOpen(true)} className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-xl font-bold text-xs shadow-lg flex items-center gap-1"><Plus size={14} /> Baru</button>}</div><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">{!loadingTugas && daftarTugas.length === 0 && <div className="col-span-full text-center text-slate-500 py-8 text-sm">Tugas Bersih! ✨</div>}{daftarTugas.map((tugas) => (<div key={tugas.id} onClick={() => isAdmin && handleToggleTask(tugas.id, tugas.selesai)} className={`relative p-4 rounded-2xl border transition-all cursor-pointer group hover:-translate-y-1 hover:shadow-lg ${tugas.selesai ? 'bg-slate-900/30 border-slate-800 opacity-50' : 'bg-slate-800/40 border-slate-700 hover:border-blue-500/50'} ${!isAdmin ? 'cursor-default hover:translate-y-0' : ''}`}><div className="flex justify-between items-start"><div className="flex-1 min-w-0 pr-2"><h3 className={`font-semibold text-sm mb-1 truncate ${tugas.selesai ? 'line-through text-slate-500' : 'text-white'}`}>{tugas.judul}</h3><div className="inline-block px-2 py-0.5 rounded-md bg-slate-900 text-[10px] text-slate-400 border border-slate-800">{tugas.mapel}</div></div><div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${tugas.selesai ? 'bg-green-500 border-green-500' : 'border-slate-600'}`}>{tugas.selesai && <CheckSquare size={10} className="text-white" />}</div></div>{isAdmin && <button onClick={(e) => handleDeleteTask(e, tugas.id)} className="absolute bottom-3 right-3 text-slate-500 hover:text-red-400 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/50 p-1 rounded-full"><Trash2 size={14} /></button>}</div>))}</div></div></div>
        
        <footer className="order-last md:col-span-12 text-center text-slate-600 text-[10px] mt-4 mb-8 font-medium"><p>Class Dashboard XI TKJ • Developed by <a href="https://rafiantara.fun" target="_blank" className="text-blue-500 hover:text-blue-400 hover:underline">Rafiantara</a></p></footer>
      </div>

      {/* MODALS */}
      <Modal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} title="Admin Access"><form onSubmit={handleLogin} className="space-y-4 pt-2"><div className="text-center mb-4"><div className="bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3"><Lock size={32} className="text-slate-400"/></div><p className="text-sm text-slate-400">Masukkan PIN rahasia.</p></div><input type="password" value={pinInput} onChange={e => setPinInput(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-center text-white tracking-[5px] text-xl focus:outline-none focus:border-blue-500" placeholder="••••" autoFocus maxLength={6}/><button className="w-full bg-blue-600 py-3 rounded-xl font-bold text-white hover:bg-blue-500 transition-colors">Buka Gembok</button></form></Modal>
      <Modal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} title="AI Configuration"><form onSubmit={handleSaveSettings} className="space-y-4"><div className="bg-yellow-500/10 p-3 rounded-lg border border-yellow-500/20 mb-4"><p className="text-xs text-yellow-400 flex items-center gap-2"><Key size={14}/> <b>PENTING:</b> Masukkan API Key Gemini baru di sini jika Chatbot error/limit.</p></div><div><label className="block text-xs text-slate-400 mb-1">Gemini API Key</label><input type="text" value={apiKeyInput} onChange={e => setApiKeyInput(e.target.value)} className="w-full bg-slate-800 border-slate-700 rounded-xl p-3 text-white focus:border-green-500 focus:outline-none text-sm" placeholder="Paste key disini..." /></div><div><label className="block text-xs text-slate-400 mb-1">Model AI</label><select value={selectedModel} onChange={e => setSelectedModel(e.target.value)} className="w-full bg-slate-800 border-slate-700 rounded-xl p-3 text-white focus:border-green-500 focus:outline-none text-sm"><option value="gemini-1.5-flash">Gemini 1.5 Flash (Stabil & Gratis)</option><option value="gemini-2.5-flash">Gemini 2.5 Flash (Baru/Experimental)</option><option value="gemini-pro">Gemini Pro (Klasik)</option></select></div><button className="w-full bg-green-600 py-3 rounded-xl font-bold text-white hover:bg-green-500">Simpan Konfigurasi</button></form></Modal>
      <Modal isOpen={isAiModalOpen} onClose={() => setIsAiModalOpen(false)} title="TKJ Assistant"><div className="flex flex-col h-[50vh] md:h-[400px]"><div className="flex-1 space-y-4 p-2 overflow-y-auto custom-scrollbar">{chatHistory.map((msg, index) => (<div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-none'}`}>{msg.image && <img src={msg.image} alt="User Upload" className="w-full rounded-lg mb-2 border border-white/20" />}{msg.role === 'user' ? msg.text : <ReactMarkdown components={{ strong: ({node, ...props}) => <span className="font-bold text-yellow-400" {...props} />, a: ({node, ...props}) => <a className="text-blue-400 underline" target="_blank" {...props} />, ul: ({node, ...props}) => <ul className="list-disc ml-4 mt-1" {...props} />, li: ({node, ...props}) => <li className="mb-1" {...props} />, code: ({node, ...props}) => <code className="bg-slate-950 px-1 py-0.5 rounded text-green-400 font-mono text-xs border border-slate-700" {...props} /> }}>{msg.text}</ReactMarkdown>}</div></div>))}{isTyping && <div className="flex justify-start"><div className="bg-slate-800 text-slate-400 px-4 py-2 rounded-2xl text-xs border border-slate-700 flex items-center gap-2"><div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div><div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-75"></div><div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-150"></div></div></div>}<div ref={chatEndRef} /></div>{imagePreview && (<div className="px-4 py-2 bg-slate-800 border-t border-slate-700 flex justify-between items-center"><div className="flex items-center gap-3"><img src={imagePreview} alt="Preview" className="h-12 w-12 rounded object-cover border border-slate-600" /><span className="text-xs text-slate-400">Gambar siap dikirim</span></div><button onClick={clearImage} className="text-red-400 hover:text-red-300"><XCircle size={20}/></button></div>)}<form onSubmit={handleSendChat} className="mt-0 flex gap-2 border-t border-slate-800 pt-3"><button type="button" onClick={() => fileInputRef.current.click()} className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-3 rounded-xl transition-colors"><ImageIcon size={20} /></button><input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" /><input value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Tanya / Upload gambar..." className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 text-sm" /><button type="submit" disabled={(!chatInput.trim() && !imageFile) || isTyping} className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white p-3 rounded-xl"><Send size={20} /></button></form></div></Modal>
      <Modal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} title="Tugas Baru"><form onSubmit={handleAddTask} className="space-y-4"><input value={newTask.judul} onChange={e => setNewTask({...newTask, judul: e.target.value})} className="w-full bg-slate-800 border-slate-700 rounded-xl p-3 text-white" placeholder="Judul..." autoFocus /><input value={newTask.mapel} onChange={e => setNewTask({...newTask, mapel: e.target.value})} className="w-full bg-slate-800 border-slate-700 rounded-xl p-3 text-white" placeholder="Mapel..." /><button className="w-full bg-blue-600 py-3 rounded-xl font-bold text-white">Simpan</button></form></Modal>
      <Modal isOpen={isScheduleModalOpen} onClose={() => setIsScheduleModalOpen(false)} title="Edit Jadwal"><form onSubmit={handleSaveSchedule} className="space-y-4"><textarea value={scheduleInput} onChange={e => setScheduleInput(e.target.value)} className="w-full bg-slate-800 border-slate-700 rounded-xl p-3 text-white h-32" placeholder="Mapel pisah koma..." /><button className="w-full bg-green-600 py-3 rounded-xl font-bold text-white">Update</button></form></Modal>
      <Modal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} title="Broadcast"><form onSubmit={handleSaveInfo} className="space-y-4"><textarea value={infoInput} onChange={e => setInfoInput(e.target.value)} className="w-full bg-slate-800 border-slate-700 rounded-xl p-3 text-white h-32" /><button className="w-full bg-purple-600 py-3 rounded-xl font-bold text-white">Kirim</button></form></Modal>
      <Modal isOpen={isPiketModalOpen} onClose={() => setIsPiketModalOpen(false)} title={`Edit Piket (${hariPilihan})`}><form onSubmit={handleSavePiket} className="space-y-4"><div className="text-slate-400 text-xs mb-2">Tulis nama dipisahkan dengan koma (Contoh: Budi, Andi, Siti)</div><textarea value={piketInput} onChange={e => setPiketInput(e.target.value)} className="w-full bg-slate-800 border-slate-700 rounded-xl p-3 text-white h-32 focus:border-orange-500 focus:outline-none" placeholder="Nama siswa..." /><button className="w-full bg-orange-600 py-3 rounded-xl font-bold text-white hover:bg-orange-500">Simpan Piket</button></form></Modal>
      <Modal isOpen={isQuoteModalOpen} onClose={() => setIsQuoteModalOpen(false)} title="Manage Quotes"><div className="space-y-6"><form onSubmit={handleAddQuote} className="space-y-3 pb-4 border-b border-slate-800"><input type="text" value={newQuoteText} onChange={e => setNewQuoteText(e.target.value)} className="w-full bg-slate-800 border-slate-700 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-blue-500" placeholder="Kata-kata hari ini..." /><button className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg text-sm font-medium">Tambah Quote</button></form><div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar"><h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Quotes DB ({dataQuotes.length})</h4>{loadingQuotes ? <p className="text-xs text-slate-500">Loading...</p> : dataQuotes.length === 0 ? <p className="text-xs text-slate-500 italic">Belum ada.</p> : dataQuotes.map((q) => (<div key={q.id} className="flex items-start justify-between p-3 bg-slate-800/50 rounded-xl border border-slate-800 group"><div><p className="text-sm text-slate-200 line-clamp-2">"{q.text}"</p><span className="text-[10px] text-slate-500">{q.author}</span></div><button onClick={() => handleDeleteQuote(q.id)} className="text-slate-600 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14}/></button></div>))}</div></div></Modal>

      {/* MODAL BUKU KAS (DENGAN FILTER MINGGUAN) */}
      <Modal isOpen={isKasModalOpen} onClose={() => setIsKasModalOpen(false)} title="Buku Kas Kelas 💰">
          <div className="space-y-6">
              <div className="bg-gradient-to-r from-green-600 to-emerald-800 p-4 rounded-2xl shadow-lg text-center relative overflow-hidden">
                  <div className="relative z-10"><p className="text-green-100 text-xs font-medium uppercase tracking-wider mb-1">Total Saldo Kas</p><h2 className="text-3xl font-bold text-white">{formatRupiah(totalSaldo)}</h2></div>
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl"></div>
              </div>

              {/* FILTER BAR (MINGGU ADDED) */}
              <div className="flex gap-2 items-center bg-slate-800 p-2 rounded-lg">
                  <Filter size={16} className="text-slate-400 ml-2"/>
                  <select value={filterBulan} onChange={(e) => setFilterBulan(e.target.value)} className="bg-slate-700 text-white text-[10px] p-1.5 rounded outline-none border border-slate-600 flex-1">
                      {Array.from({length: 12}, (_, i) => i + 1).map(m => <option key={m} value={m}>Bln {m}</option>)}
                  </select>
                  <select value={filterTahun} onChange={(e) => setFilterTahun(e.target.value)} className="bg-slate-700 text-white text-[10px] p-1.5 rounded outline-none border border-slate-600 flex-1">
                      {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                  {/* DROPDOWN MINGGU BARU */}
                  <select value={filterMinggu} onChange={(e) => setFilterMinggu(e.target.value)} className="bg-slate-700 text-white text-[10px] p-1.5 rounded outline-none border border-slate-600 flex-1">
                      <option value="all">Semua</option>
                      {[1,2,3,4,5].map(w => <option key={w} value={w}>Mgg {w}</option>)}
                  </select>
                  <button onClick={handleExportExcel} className="ml-auto text-[10px] bg-green-600 hover:bg-green-500 text-white px-2 py-1.5 rounded flex items-center gap-1"><FileSpreadsheet size={12}/> XLS</button>
              </div>

              {isAdmin && (
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                    <form onSubmit={handleAddKas} className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <input type="date" value={kasInput.tanggal} onChange={e => setKasInput({...kasInput, tanggal: e.target.value})} className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white" />
                            <select value={kasInput.tipe} onChange={e => setKasInput({...kasInput, tipe: e.target.value})} className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:border-green-500"><option value="masuk">Masuk (+)</option><option value="keluar">Keluar (-)</option></select>
                        </div>
                        <div className="flex gap-2">
                            <input type="text" value={kasInput.nama} onChange={e => setKasInput({...kasInput, nama: e.target.value})} placeholder="Nama" className="w-1/3 bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none" />
                            <input type="text" value={kasInput.jumlah} onChange={handleJumlahChange} placeholder="Rp" className="w-1/3 bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none" />
                            <input type="text" value={kasInput.keterangan} onChange={e => setKasInput({...kasInput, keterangan: e.target.value})} placeholder="Ket" className="w-1/3 bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none" />
                        </div>
                        <button className="w-full bg-green-600 hover:bg-green-500 text-white py-2 rounded-lg text-xs font-bold">Simpan</button>
                    </form>
                </div>
              )}

              <div className="max-h-[200px] overflow-y-auto custom-scrollbar space-y-2">
                  {filteredKas.length === 0 ? <p className="text-center text-xs text-slate-500 py-4">Tidak ada data di periode ini.</p> :
                   filteredKas.map((item) => (
                      <div key={item.id} className="flex justify-between items-center p-2 bg-slate-800/30 rounded-lg border border-slate-700">
                          <div className="flex items-center gap-3">
                              <div className={`p-1.5 rounded-full ${item.tipe === 'masuk' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>{item.tipe === 'masuk' ? <TrendingUp size={14}/> : <TrendingDown size={14}/>}</div>
                              <div><p className="text-xs font-bold text-white">{item.nama}</p><p className="text-[10px] text-slate-500">{item.tanggal} (Mgg {getWeekOfMonth(new Date(item.tanggal))})</p></div>
                          </div>
                          <div className="text-right">
                              <p className={`text-xs font-bold ${item.tipe === 'masuk' ? 'text-green-400' : 'text-red-400'}`}>{item.tipe === 'masuk' ? '+' : '-'} {formatRupiah(item.jumlah)}</p>
                              {isAdmin && <button onClick={() => handleDeleteKas(item.id)} className="text-slate-600 hover:text-red-400 text-[9px]">Hapus</button>}
                          </div>
                      </div>
                   ))
                  }
              </div>
          </div>
      </Modal>

      <Modal isOpen={isPdfModalOpen} onClose={() => setIsPdfModalOpen(false)} title="PDF Tool"><div className="space-y-4"><div className="bg-slate-800 p-4 rounded-xl border border-slate-700 text-center"><input type="file" multiple accept="image/*" onChange={handlePdfImageChange} className="hidden" id="pdfInput"/><label htmlFor="pdfInput" className="cursor-pointer flex flex-col items-center gap-2"><ImageIcon size={32} className="text-blue-400"/><span className="text-sm text-slate-300">Klik pilih Foto</span></label></div><div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">{pdfImages.map((img, idx) => (<div key={idx} className="flex justify-between items-center bg-slate-800 p-2 rounded-lg"><span className="text-xs text-slate-300 truncate max-w-[200px]">{img.file.name}</span><button onClick={() => removePdfImage(idx)} className="text-red-400 hover:text-red-300"><XCircle size={16}/></button></div>))}</div><button onClick={handleGeneratePdf} disabled={pdfImages.length === 0} className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"><Download size={18}/> Download PDF</button></div></Modal>

    </div>
  )
}

export default App