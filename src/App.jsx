import { useState, useEffect, useRef } from 'react'
import { BookOpen, CheckSquare, Plus, Trash2, X, Edit3, Megaphone, Calendar, Link, Wifi, Calculator, Zap, Send, Bot, Globe, Lock, Unlock, LogOut, Image as ImageIcon, XCircle, UserCheck } from 'lucide-react'
import { collection, doc, updateDoc, addDoc, deleteDoc, setDoc, serverTimestamp } from "firebase/firestore"
import { db } from "./services/firebase"
import useFirestore from './hooks/useFirestore'
import { GoogleGenerativeAI } from "@google/generative-ai"
import ReactMarkdown from 'react-markdown'
import { motion, AnimatePresence } from "framer-motion"

const QUOTES_LIST = [
  { text: "Jangan lupa bernapas, coding butuh oksigen.", author: "Admin" },
  { text: "Error adalah cara komputer bilang 'Coba Lagi'.", author: "Anonim" },
  { text: "Kalau bisa dikerjakan besok, kenapa harus sekarang?", author: "Deadliners" },
  { text: "Minimal mandi sebelum ngoding.", author: "Info Kesehatan" },
  { text: "Sabar, loading itu ujian iman.", author: "Pak Ustadz" },
  { text: "Satu titik koma hilang, satu hari terbuang.", author: "Pengalaman Pribadi" },
  { text: "Jadilah seperti CSS, yang selalu mempercantik suasana.", author: "Frontend Dev" },
  { text: "Ngoding itu gampang, yang susah nyari errornya.", author: "Maniak Bug" }
]

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
  const [hariPilihan, setHariPilihan] = useState(namaHariIni === 'Sabtu' || namaHariIni === 'Minggu' ? 'Senin' : namaHariIni)
  const [greeting, setGreeting] = useState('')
  const [quote, setQuote] = useState(QUOTES_LIST[0])
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [pinInput, setPinInput] = useState('')

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)
  const [isPiketModalOpen, setIsPiketModalOpen] = useState(false) // NEW MODAL PIKET
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false)
  const [isAiModalOpen, setIsAiModalOpen] = useState(false)

  const [newTask, setNewTask] = useState({ judul: '', mapel: '' })
  const [scheduleInput, setScheduleInput] = useState('')
  const [piketInput, setPiketInput] = useState('') // NEW INPUT PIKET 
  const [infoInput, setInfoInput] = useState('')

  const [chatInput, setChatInput] = useState('')
  const [chatHistory, setChatHistory] = useState([
    { role: 'model', text: 'Halo Wak! Gue asisten AI TKJ. Bisa baca gambar juga loh sekarang. Coba upload foto alat jaringan atau error kodingan! 😎' }
  ])
  const [isTyping, setIsTyping] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const fileInputRef = useRef(null)
  const chatEndRef = useRef(null)

  // FIREBASE HOOKS
  const { data: daftarTugas, loading: loadingTugas } = useFirestore('tugas')
  const { data: dataJadwal, loading: loadingJadwal } = useFirestore('jadwal')
  const { data: dataPiket, loading: loadingPiket } = useFirestore('piket') // NEW HOOK
  const { data: dataInfo } = useFirestore('pengumuman')
  
  const jadwalTampil = dataJadwal.find(j => j.id === hariPilihan)
  const piketTampil = dataPiket.find(p => p.id === hariPilihan) // Cari piket sesuai hari yg dipilih

  useEffect(() => {
    const savedAuth = localStorage.getItem('tkj_admin_auth')
    if (savedAuth === 'true') setIsAdmin(true)

    window.addEventListener('online', () => setIsOnline(true))
    window.addEventListener('offline', () => setIsOnline(false))

    const clockInterval = setInterval(() => {
      const now = new Date()
      setTime(now)
      const hour = now.getHours()
      if (hour < 11) setGreeting('Selamat Pagi ☀️')
      else if (hour < 15) setGreeting('Selamat Siang 🌤️')
      else if (hour < 18) setGreeting('Selamat Sore 🌥️')
      else setGreeting('Selamat Malam 🌙')
    }, 1000)

    return () => {
      clearInterval(clockInterval)
      window.removeEventListener('online', () => setIsOnline(true))
      window.removeEventListener('offline', () => setIsOnline(false))
    }
  }, [])

  useEffect(() => {
    const quoteInterval = setInterval(() => {
      setQuote(prevQuote => {
        let randomIndex;
        do { randomIndex = Math.floor(Math.random() * QUOTES_LIST.length) } 
        while (QUOTES_LIST[randomIndex].text === prevQuote.text);
        return QUOTES_LIST[randomIndex];
      })
    }, 5000)
    return () => clearInterval(quoteInterval)
  }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatHistory, isAiModalOpen, imagePreview])

  const handleLogin = (e) => {
    e.preventDefault()
    if (pinInput === 'tkj123') {
      setIsAdmin(true); localStorage.setItem('tkj_admin_auth', 'true'); setIsLoginModalOpen(false); setPinInput(''); alert("Akses Admin Diberikan! 🔓")
    } else { alert("PIN Salah! ⛔"); setPinInput('') }
  }

  const handleLogout = () => {
    if(confirm("Keluar mode admin?")) { setIsAdmin(false); localStorage.removeItem('tkj_admin_auth') }
  }

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => { setImagePreview(reader.result); };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => { setImageFile(null); setImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; };

  async function fileToGenerativePart(file) {
    const base64EncodedDataPromise = new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(',')[1]);
      reader.readAsDataURL(file);
    });
    return { inlineData: { data: await base64EncodedDataPromise, mimeType: file.type } };
  }

  const handleSendChat = async (e) => {
    e.preventDefault()
    if (!chatInput.trim() && !imageFile) return

    const currentImageFile = imageFile;
    const currentImagePreview = imagePreview;
    const currentText = chatInput;

    const userMessage = { role: 'user', text: currentText, image: currentImagePreview }
    setChatHistory(prev => [...prev, userMessage])
    setChatInput(''); setImageFile(null); setImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; setIsTyping(true)

    const apiKeys = [import.meta.env.VITE_GEMINI_KEY_1, import.meta.env.VITE_GEMINI_KEY_2, import.meta.env.VITE_GEMINI_KEY_3].filter(k => k && k.length > 10)

    if (apiKeys.length === 0) {
        setChatHistory(prev => [...prev, { role: 'model', text: "API Key belum dipasang! Cek .env" }])
        setIsTyping(false); return
    }

    try {
        let responseText = "";
        let success = false;
        let lastError = null;

        for (const key of apiKeys) {
            try {
                const genAI = new GoogleGenerativeAI(key);
                try {
                    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
                    let result;
                    if (currentImageFile) {
                        const imagePart = await fileToGenerativePart(currentImageFile);
                        const prompt = currentText || "Jelaskan gambar ini";
                        result = await model.generateContent([prompt, imagePart]);
                    } else {
                        result = await model.generateContent(currentText || "Halo");
                    }
                    responseText = await result.response.text();
                    success = true; break;
                } catch (err) {
                    const modelBackup = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
                    let resultBackup;
                    if (currentImageFile) { 
                        const imagePart = await fileToGenerativePart(currentImageFile);
                        resultBackup = await modelBackup.generateContent([currentText || "Info gambar", imagePart]);
                    } else { resultBackup = await modelBackup.generateContent(currentText); }
                    responseText = await resultBackup.response.text();
                    success = true; break;
                }
            } catch (error) { lastError = error; }
        }
        if (!success) throw lastError;
        setChatHistory(prev => [...prev, { role: 'model', text: responseText }])
    } catch (error) {
        setChatHistory(prev => [...prev, { role: 'model', text: "Server AI sibuk / Error." }])
    } finally { setIsTyping(false) }
  }

  // CRUD Handlers
  const handleAddTask = async (e) => { e.preventDefault(); if (!newTask.judul) return; try { await addDoc(collection(db, 'tugas'), { judul: newTask.judul, mapel: newTask.mapel || 'Umum', selesai: false, createdAt: serverTimestamp() }); setNewTask({ judul: '', mapel: '' }); setIsTaskModalOpen(false) } catch (err) { console.error(err) } }
  const handleDeleteTask = async (e, id) => { e.stopPropagation(); if (confirm('Hapus?')) { try { await deleteDoc(doc(db, 'tugas', id)) } catch (err) { console.error(err) } } }
  const handleToggleTask = async (id, status) => { try { await updateDoc(doc(db, 'tugas', id), { selesai: !status }) } catch (err) { console.error(err) } }
  const handleSaveSchedule = async (e) => { e.preventDefault(); const mapelArray = scheduleInput.split(',').map(item => item.trim()).filter(item => item !== ''); try { await setDoc(doc(db, 'jadwal', hariPilihan), { mapel: mapelArray, updatedAt: serverTimestamp() }); setIsScheduleModalOpen(false) } catch (err) { console.error(err) } }
  const handleSaveInfo = async (e) => { e.preventDefault(); try { await setDoc(doc(db, 'pengumuman', 'info_utama'), { isi: infoInput, updatedAt: serverTimestamp() }); setIsInfoModalOpen(false) } catch (err) { console.error(err) } }
  
  // NEW: HANDLE SAVE PIKET
  const handleSavePiket = async (e) => {
    e.preventDefault()
    // Ubah string input jadi array
    const piketArray = piketInput.split(',').map(item => item.trim()).filter(item => item !== '')
    try {
      // Simpan ke koleksi 'piket', ID dokumen = Nama Hari (Senin, Selasa...)
      await setDoc(doc(db, 'piket', hariPilihan), {
        names: piketArray,
        updatedAt: serverTimestamp()
      })
      setIsPiketModalOpen(false)
    } catch (err) { console.error(err) }
  }

  const openScheduleModal = () => { setScheduleInput(jadwalTampil ? jadwalTampil.mapel.join(', ') : ''); setIsScheduleModalOpen(true) }
  // NEW: OPEN PIKET MODAL
  const openPiketModal = () => { setPiketInput(piketTampil ? piketTampil.names.join(', ') : ''); setIsPiketModalOpen(true) }
  const openInfoModal = () => { const info = dataInfo.find(i => i.id === 'info_utama') || dataInfo[0]; setInfoInput(info ? info.isi : ''); setIsInfoModalOpen(true) }

  return (
    <div className="min-h-screen text-white font-sans pb-10 md:pb-0">
      {/* HEADER */}
      <div className="pt-8 px-5 pb-2 md:p-8 md:pb-0 max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div className="flex-1">
            <p className="text-blue-400 font-medium text-sm md:text-base tracking-wide uppercase mb-1 flex items-center gap-2">
                {greeting} 
                {isAdmin ? <span className="bg-green-500/20 text-green-400 text-[10px] px-2 py-0.5 rounded border border-green-500/50 flex items-center gap-1 cursor-pointer" onClick={handleLogout}><Unlock size={10}/> ADMIN</span> : <span className="bg-slate-700 text-slate-400 text-[10px] px-2 py-0.5 rounded border border-slate-600 flex items-center gap-1 cursor-pointer" onClick={() => setIsLoginModalOpen(true)}><Lock size={10}/> GUEST</span>}
            </p>
            <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 tracking-tighter drop-shadow-sm">XI <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">TKJ</span></h1>
            <p className="text-slate-400 text-sm mt-1 flex items-center gap-2">
              <span className="relative flex h-2 w-2"><span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isOnline ? 'bg-green-400' : 'bg-red-400'}`}></span><span className={`relative inline-flex rounded-full h-2 w-2 ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></span></span>
              Server Status: <span className={`font-bold ${isOnline ? 'text-green-400' : 'text-red-400'}`}>{isOnline ? 'Online' : 'Offline'}</span>
            </p>
          </div>
          <div className="w-full md:w-auto bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 p-4 rounded-2xl flex items-center justify-between md:block">
             <div className="md:text-right"><div className="text-2xl md:text-3xl font-bold font-mono text-white">{time.toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}</div><div className="text-xs md:text-sm text-slate-400">{time.toLocaleDateString('id-ID', {weekday: 'long', day: 'numeric', month: 'long'})}</div></div>
             <div className="md:hidden bg-slate-800 p-2 rounded-full"><Calendar size={20} className="text-blue-400"/></div>
          </div>
        </header>
      </div>

      {/* CONTENT */}
      <div className="p-4 md:p-8 pt-6 max-w-7xl mx-auto flex flex-col md:grid md:grid-cols-12 gap-5 md:gap-6">
        
        {/* 1. JADWAL PIKET (DYNAMIC + EDITABLE) */}
        <div className="md:col-span-4 order-3 md:order-1">
          <div className="bg-gradient-to-br from-orange-900/40 to-slate-900 p-5 rounded-3xl border border-orange-500/20 relative overflow-hidden group shadow-lg flex flex-col h-full justify-center">
            <div className="flex items-center justify-between mb-3">
               <div className="flex items-center gap-3">
                   <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center border border-orange-600/30">
                      <UserCheck size={24} className="text-orange-400" />
                   </div>
                   <div>
                     <h3 className="font-bold text-white">Jadwal Piket</h3>
                     <p className="text-xs text-slate-400">{hariPilihan}</p>
                   </div>
               </div>
               {/* TOMBOL EDIT PIKET (ADMIN ONLY) */}
               {isAdmin && (
                  <button onClick={openPiketModal} className="text-orange-400 hover:text-orange-300 bg-slate-800 p-2 rounded-full transition-colors">
                    <Edit3 size={16} />
                  </button>
               )}
            </div>
            <div className="bg-slate-800/50 p-3 rounded-xl border border-white/5">
               {loadingPiket ? <p className="text-xs text-slate-500 text-center">Loading...</p> : 
                 piketTampil ? (
                   <div className="flex flex-wrap gap-2 justify-center">
                     {piketTampil.names.map((nama, idx) => (
                       <span key={idx} className="bg-orange-500/20 text-orange-200 text-xs px-2 py-1 rounded-md border border-orange-500/30">{nama}</span>
                     ))}
                   </div>
                 ) : (
                   <p className="text-sm font-medium text-slate-500 leading-relaxed text-center italic">
                     Belum ada data piket {hariPilihan}.
                   </p>
                 )
               }
            </div>
          </div>
        </div>
        
        {/* 2. LINKS */}
        <div className="md:col-span-4 order-4 md:order-2"><div className="h-full bg-slate-900/60 backdrop-blur-md p-5 rounded-3xl border border-slate-700/50 flex justify-around items-center"><div onClick={() => setIsAiModalOpen(true)} className="flex flex-col items-center gap-2 cursor-pointer group"><div className="p-3 rounded-2xl bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 group-hover:scale-110 group-hover:bg-yellow-400 group-hover:text-black transition-all shadow-[0_0_15px_rgba(250,204,21,0.2)]"><Zap size={20} fill="currentColor" /></div><span className="text-[10px] font-medium text-slate-400 group-hover:text-yellow-400 transition-colors">AI Chat</span></div><div onClick={() => window.open('https://rafiantara.fun', '_blank')} className="flex flex-col items-center gap-2 cursor-pointer group"><div className="p-3 rounded-2xl bg-green-400/10 text-green-400 border border-white/5 group-hover:scale-110 group-hover:bg-green-400 group-hover:text-black transition-all shadow-[0_0_15px_rgba(74,222,128,0.2)]"><Globe size={20} /></div><span className="text-[10px] font-medium text-slate-400 group-hover:text-green-400 transition-colors">Creator</span></div><div className="flex flex-col items-center gap-2 cursor-pointer group opacity-50"><div className="p-3 rounded-2xl bg-blue-400/10 text-blue-400 border border-white/5"><Wifi size={20} /></div><span className="text-[10px] font-medium text-slate-400">WiFi</span></div><div className="flex flex-col items-center gap-2 cursor-pointer group opacity-50"><div className="p-3 rounded-2xl bg-purple-400/10 text-purple-400 border border-white/5"><Calculator size={20} /></div><span className="text-[10px] font-medium text-slate-400">Calc</span></div></div></div>
        {/* 3. INFO */}
        <div className="md:col-span-4 order-1 md:order-3"><div className="h-full bg-gradient-to-br from-indigo-900/80 to-slate-900/80 backdrop-blur-md p-6 rounded-3xl border border-indigo-500/30 relative overflow-hidden group shadow-lg"><div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-[60px] rounded-full animate-pulse"></div><div className="flex items-center justify-between mb-2 relative z-10"><div className="flex items-center gap-2 bg-indigo-500/20 px-3 py-1 rounded-full border border-indigo-500/30"><Megaphone size={14} className="text-indigo-300" /> <span className="text-xs font-bold text-indigo-100 uppercase">Broadcast</span></div>{isAdmin && <button onClick={openInfoModal} className="opacity-60 hover:opacity-100 hover:text-white transition-opacity"><Edit3 size={16} /></button>}</div><div className="relative z-10">{dataInfo.length > 0 ? (<p className="text-indigo-50 text-sm font-medium leading-relaxed whitespace-pre-wrap line-clamp-2 hover:line-clamp-none transition-all cursor-pointer">{dataInfo.find(i => i.id === 'info_utama')?.isi || dataInfo[0]?.isi}</p>) : <div className="text-white/40 italic text-sm">Info kosong.</div>}</div></div></div>
        {/* 4. JADWAL */}
        <div className="md:col-span-8 order-2 md:order-4"><div className="bg-slate-900/60 backdrop-blur-md p-5 rounded-3xl border border-slate-700/50 shadow-xl h-full flex flex-col"><div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4"><div className="flex items-center gap-3"><div className="p-2 bg-blue-500/10 rounded-lg"><BookOpen size={20} className="text-blue-400" /></div><div><h2 className="font-bold text-lg text-white">Jadwal</h2><p className="text-[10px] text-slate-500 uppercase tracking-wider">{hariPilihan}</p></div></div><div className="w-full md:w-auto flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">{['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'].map((hari) => (<button key={hari} onClick={() => setHariPilihan(hari)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border whitespace-nowrap ${hariPilihan === hari ? 'bg-blue-600 border-blue-500 text-white' : 'bg-transparent border-slate-700 text-slate-400'}`}>{hari}</button>))}{isAdmin && <button onClick={openScheduleModal} className="px-3 py-1.5 bg-slate-800 rounded-lg border border-slate-700 text-slate-400"><Edit3 size={14} /></button>}</div></div><div className="grid grid-cols-2 md:grid-cols-4 gap-2">{loadingJadwal ? <p className="text-slate-500 text-xs">Loading...</p> : jadwalTampil ? (jadwalTampil.mapel.map((mapel, index) => (<div key={index} className="bg-slate-800/40 border border-slate-700/50 p-2 rounded-lg flex items-center gap-2"><span className="w-6 h-6 rounded bg-slate-900 flex items-center justify-center text-[10px] font-bold text-slate-500">{index + 1}</span><span className="font-medium text-slate-300 text-sm truncate">{mapel}</span></div>))) : <div className="col-span-full py-4 text-center text-slate-500 text-sm border-2 border-dashed border-slate-800 rounded-xl">Kosong</div>}</div></div></div>
        {/* 5. QUOTE */}
        <div className="md:col-span-4 order-5"><div className="h-full bg-slate-900/60 backdrop-blur-md p-6 rounded-3xl border border-slate-700/50 flex flex-col justify-center text-center relative overflow-hidden"><div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div><AnimatePresence mode="wait"><motion.div key={quote.text} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5 }} className="flex flex-col items-center"><p className="text-slate-300 italic font-serif text-lg leading-relaxed">"{quote.text}"</p><p className="text-slate-500 text-xs mt-3 font-bold uppercase tracking-widest">— {quote.author}</p></motion.div></AnimatePresence></div></div>
        {/* 6. TUGAS */}
        <div className="md:col-span-12 order-6"><div className="bg-slate-900/60 backdrop-blur-md p-6 rounded-3xl border border-slate-700/50 shadow-xl"><div className="flex items-center justify-between mb-6"><div className="flex items-center gap-3"><div className="bg-green-500/10 p-2 rounded-lg text-green-400"><CheckSquare size={20} /></div><h2 className="font-bold text-lg">Daftar Tugas <span className="text-slate-500 text-sm font-normal">({daftarTugas.filter(t => !t.selesai).length})</span></h2></div>{isAdmin && <button onClick={() => setIsTaskModalOpen(true)} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg flex items-center gap-2"><Plus size={16} /> <span className="hidden md:inline">Baru</span></button>}</div><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{!loadingTugas && daftarTugas.length === 0 && <div className="col-span-full text-center text-slate-500 py-8">Tugas Bersih! ✨</div>}{daftarTugas.map((tugas) => (<div key={tugas.id} onClick={() => isAdmin && handleToggleTask(tugas.id, tugas.selesai)} className={`relative p-4 rounded-2xl border transition-all cursor-pointer group hover:-translate-y-1 hover:shadow-lg ${tugas.selesai ? 'bg-slate-900/30 border-slate-800 opacity-50' : 'bg-slate-800/40 border-slate-700 hover:border-blue-500/50'} ${!isAdmin ? 'cursor-default hover:translate-y-0' : ''}`}><div className="flex justify-between items-start"><div className="flex-1 min-w-0 pr-2"><h3 className={`font-semibold text-sm md:text-base mb-1 truncate ${tugas.selesai ? 'line-through text-slate-500' : 'text-white'}`}>{tugas.judul}</h3><div className="inline-block px-2 py-0.5 rounded-md bg-slate-900 text-[10px] text-slate-400 border border-slate-800">{tugas.mapel}</div></div><div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${tugas.selesai ? 'bg-green-500 border-green-500' : 'border-slate-600'}`}>{tugas.selesai && <CheckSquare size={10} className="text-white" />}</div></div>{isAdmin && <button onClick={(e) => handleDeleteTask(e, tugas.id)} className="absolute bottom-4 right-4 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16} /></button>}</div>))}</div></div></div>
        {/* FOOTER */}
        <footer className="md:col-span-12 text-center text-slate-600 text-[10px] md:text-xs mt-4 pb-8 md:pb-0 font-medium"><p>Class Dashboard XI TKJ • Developed by <a href="https://rafiantara.fun" target="_blank" className="text-blue-500 hover:text-blue-400 hover:underline">Rafiantara</a></p></footer>
      </div>

      {/* MODALS */}
      <Modal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} title="Admin Access"><form onSubmit={handleLogin} className="space-y-4 pt-2"><div className="text-center mb-4"><div className="bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3"><Lock size={32} className="text-slate-400"/></div><p className="text-sm text-slate-400">Masukkan PIN rahasia.</p></div><input type="password" value={pinInput} onChange={e => setPinInput(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-center text-white tracking-[5px] text-xl focus:outline-none focus:border-blue-500" placeholder="••••" autoFocus maxLength={6}/><button className="w-full bg-blue-600 py-3 rounded-xl font-bold text-white hover:bg-blue-500 transition-colors">Buka Gembok</button></form></Modal>
      
      <Modal isOpen={isAiModalOpen} onClose={() => setIsAiModalOpen(false)} title="TKJ Assistant"><div className="flex flex-col h-[50vh] md:h-[400px]"><div className="flex-1 space-y-4 p-2 overflow-y-auto custom-scrollbar">{chatHistory.map((msg, index) => (<div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-none'}`}>{msg.image && <img src={msg.image} alt="User Upload" className="w-full rounded-lg mb-2 border border-white/20" />}{msg.role === 'user' ? msg.text : <ReactMarkdown components={{ strong: ({node, ...props}) => <span className="font-bold text-yellow-400" {...props} />, a: ({node, ...props}) => <a className="text-blue-400 underline" target="_blank" {...props} />, ul: ({node, ...props}) => <ul className="list-disc ml-4 mt-1" {...props} />, li: ({node, ...props}) => <li className="mb-1" {...props} />, code: ({node, ...props}) => <code className="bg-slate-950 px-1 py-0.5 rounded text-green-400 font-mono text-xs border border-slate-700" {...props} /> }}>{msg.text}</ReactMarkdown>}</div></div>))}{isTyping && <div className="flex justify-start"><div className="bg-slate-800 text-slate-400 px-4 py-2 rounded-2xl text-xs border border-slate-700 flex items-center gap-2"><div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div><div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-75"></div><div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-150"></div></div></div>}<div ref={chatEndRef} /></div>{imagePreview && (<div className="px-4 py-2 bg-slate-800 border-t border-slate-700 flex justify-between items-center"><div className="flex items-center gap-3"><img src={imagePreview} alt="Preview" className="h-12 w-12 rounded object-cover border border-slate-600" /><span className="text-xs text-slate-400">Gambar siap dikirim</span></div><button onClick={clearImage} className="text-red-400 hover:text-red-300"><XCircle size={20}/></button></div>)}<form onSubmit={handleSendChat} className="mt-0 flex gap-2 border-t border-slate-800 pt-3"><button type="button" onClick={() => fileInputRef.current.click()} className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-3 rounded-xl transition-colors"><ImageIcon size={20} /></button><input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" /><input value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Tanya / Upload gambar..." className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 text-sm" /><button type="submit" disabled={(!chatInput.trim() && !imageFile) || isTyping} className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white p-3 rounded-xl"><Send size={20} /></button></form></div></Modal>
      <Modal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} title="Tugas Baru"><form onSubmit={handleAddTask} className="space-y-4"><input value={newTask.judul} onChange={e => setNewTask({...newTask, judul: e.target.value})} className="w-full bg-slate-800 border-slate-700 rounded-xl p-3 text-white" placeholder="Judul..." autoFocus /><input value={newTask.mapel} onChange={e => setNewTask({...newTask, mapel: e.target.value})} className="w-full bg-slate-800 border-slate-700 rounded-xl p-3 text-white" placeholder="Mapel..." /><button className="w-full bg-blue-600 py-3 rounded-xl font-bold text-white">Simpan</button></form></Modal>
      <Modal isOpen={isScheduleModalOpen} onClose={() => setIsScheduleModalOpen(false)} title="Edit Jadwal"><form onSubmit={handleSaveSchedule} className="space-y-4"><textarea value={scheduleInput} onChange={e => setScheduleInput(e.target.value)} className="w-full bg-slate-800 border-slate-700 rounded-xl p-3 text-white h-32" placeholder="Mapel pisah koma..." /><button className="w-full bg-green-600 py-3 rounded-xl font-bold text-white">Update</button></form></Modal>
      <Modal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} title="Broadcast"><form onSubmit={handleSaveInfo} className="space-y-4"><textarea value={infoInput} onChange={e => setInfoInput(e.target.value)} className="w-full bg-slate-800 border-slate-700 rounded-xl p-3 text-white h-32" /><button className="w-full bg-purple-600 py-3 rounded-xl font-bold text-white">Kirim</button></form></Modal>
      
      {/* NEW: MODAL EDIT PIKET */}
      <Modal isOpen={isPiketModalOpen} onClose={() => setIsPiketModalOpen(false)} title={`Edit Piket (${hariPilihan})`}>
        <form onSubmit={handleSavePiket} className="space-y-4">
          <div className="text-slate-400 text-xs mb-2">Tulis nama dipisahkan dengan koma (Contoh: Budi, Andi, Siti)</div>
          <textarea value={piketInput} onChange={e => setPiketInput(e.target.value)} className="w-full bg-slate-800 border-slate-700 rounded-xl p-3 text-white h-32 focus:border-orange-500 focus:outline-none" placeholder="Nama siswa..." />
          <button className="w-full bg-orange-600 py-3 rounded-xl font-bold text-white hover:bg-orange-500">Simpan Piket</button>
        </form>
      </Modal>

    </div>
  )
}

export default App