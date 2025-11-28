import { useState, useEffect, useRef } from 'react'
import { MessageCircle, X, Send, Bot } from 'lucide-react'
import { GoogleGenerativeAI } from "@google/generative-ai"
import { doc, getDoc, collection, query, orderBy, limit, getDocs } from "firebase/firestore"
import { db } from "../services/firebase" 
import { useLocation } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'

export default function GuestChat() {
    const location = useLocation()
    
    // --- STATE HOOKS ---
    const [isOpen, setIsOpen] = useState(false)
    const [isTyping, setIsTyping] = useState(false)
    const [input, setInput] = useState('')
    const [messages, setMessages] = useState([
        { role: 'model', text: 'Halo! 👋 Saya Asisten Virtual TKJ. Bingung cara pakai website ini atau mau tanya info sekolah? Tanyakan saja!' }
    ])
    const chatEndRef = useRef(null)
    const [aiConfig, setAiConfig] = useState({ apiKey: "", model: "gemini-1.5-flash" })
    
    const [knowledgeBase, setKnowledgeBase] = useState("")

    // 1. FETCH SEMUA DATA
    useEffect(() => {
        const buildKnowledgeBase = async () => {
            try {
                // A. Config & Context Manual (DB)
                const settingsSnap = await getDoc(doc(db, 'settings', 'ai_config'))
                let manualContext = "";
                if (settingsSnap.exists()) {
                    const data = settingsSnap.data();
                    setAiConfig({ apiKey: data.apiKey, model: data.model || "gemini-1.5-flash" });
                    manualContext = data.guest_context || "";
                }

                // B. Berita Terbaru (DB)
                const qNews = query(collection(db, "berita_sekolah"), orderBy("createdAt", "desc"), limit(3));
                const newsSnap = await getDocs(qNews);
                let newsContext = "BERITA TERBARU:\n";
                newsSnap.forEach(doc => {
                    const data = doc.data();
                    newsContext += `- ${data.title} (${data.category})\n`;
                });

                // C. Jadwal Sholat (API)
                const date = new Date();
                const today = date.toISOString().split('T')[0].split('-').reverse().join('-');
                let sholatContext = "";
                try {
                    const res = await fetch(`https://api.aladhan.com/v1/timingsByCity/${today}?city=Metro&country=Indonesia&method=20`);
                    const data = await res.json();
                    const t = data.data.timings;
                    sholatContext = `JADWAL SHOLAT HARI INI: Subuh ${t.Fajr}, Dzuhur ${t.Dhuhr}, Ashar ${t.Asr}, Maghrib ${t.Maghrib}, Isya ${t.Isha}.`;
                } catch(e) {}

                // D. PANDUAN WEBSITE (HARDCODED - INI YANG BARU)
                const websiteGuide = `
                PANDUAN FITUR WEBSITE TKJ CENTER:
                1. PORTAL SISWA (Dashboard Kelas):
                   - Ini area khusus siswa aktif (Kelas X, XI, XII).
                   - Isinya: Jadwal Pelajaran, Tugas Harian, Data Uang Kas, dan Absensi Digital.
                   - Cara Masuk: Klik menu "Portal" di atas, pilih kelas, dan masukkan PIN Keamanan.
                
                2. SHOWCASE PROJECT:
                   - Ini galeri hasil karya siswa TKJ (Web Landing Page).
                   - Siswa bisa mengumpulkan tugas mereka di sini dengan menekan tombol "Submit Project".
                   - Syarat Upload: Harus punya PIN akses dari guru.
                
                3. E-LIBRARY (Perpustakaan Digital):
                   - Tempat download modul, e-book, dan tutorial TKJ gratis.
                   - Materi bisa dibaca langsung atau didownload (PDF).
                
                4. NAVIGASI:
                   - Widget Jam & Sholat ada di bagian atas (Navbar).
                   - Berita Sekolah ada di menu "Berita".
                   - Galeri Foto kegiatan ada di menu "Galeri".
                `;

                // E. GABUNGKAN SEMUA
                const finalKnowledge = `
                ${websiteGuide}

                INFORMASI UMUM SEKOLAH (DARI ADMIN):
                ${manualContext}

                ${newsContext}

                ${sholatContext}
                `;

                setKnowledgeBase(finalKnowledge);

            } catch (e) { console.error("Error building AI brain", e) }
        }
        buildKnowledgeBase()
    }, [])

    // AUTO SCROLL
    useEffect(() => { 
        if(isOpen) chatEndRef.current?.scrollIntoView({ behavior: "smooth" }) 
    }, [messages, isOpen])

    // HANDLE SEND
    const handleSend = async (e) => {
        e.preventDefault()
        if (!input.trim()) return

        const userMsg = { role: 'user', text: input }
        setMessages(prev => [...prev, userMsg])
        setInput('')
        setIsTyping(true)

        try {
            if (!aiConfig.apiKey) throw new Error("API Key belum diatur.")

            const genAI = new GoogleGenerativeAI(aiConfig.apiKey)
            const model = genAI.getGenerativeModel({ model: aiConfig.model })

            const chatHistoryText = messages.slice(-6).map(m => `${m.role === 'user' ? 'Tamu' : 'AI'}: ${m.text}`).join('\n')
            
            const finalPrompt = `
            PERAN: Kamu adalah Asisten Pintar & Humas Website "TKJ Center" SMK Muhammadiyah 1 Metro.
            TUJUAN: Membantu pengunjung memahami cara menggunakan website dan memberikan info sekolah.
            
            DATABASE PENGETAHUAN (GUNAKAN INI SEBAGAI SUMBER UTAMA):
            ${knowledgeBase}

            RIWAYAT CHAT:
            ${chatHistoryText}

            PERTANYAAN BARU: "${userMsg.text}"
            
            INSTRUKSI MENJAWAB:
            1. Jika ditanya "Cara pakai website" atau "Fitur", jelaskan dari bagian PANDUAN FITUR WEBSITE.
            2. Jika ditanya "Berita" atau "Info Sekolah", ambil dari bagian BERITA/INFORMASI UMUM.
            3. Jawab dengan ramah, santai, tapi tetap sopan.
            4. Jika info tidak ada di database, jawab jujur: "Maaf, saya belum punya info detail soal itu. Coba cek menu lain atau hubungi admin ya."
            `

            const result = await model.generateContent(finalPrompt)
            setMessages(prev => [...prev, { role: 'model', text: result.response.text() }])

        } catch (error) {
            setMessages(prev => [...prev, { role: 'model', text: "Maaf, otak saya lagi loading... (Cek Koneksi/API)" }])
        } finally {
            setIsTyping(false)
        }
    }

    if (location.pathname.includes('kelas-')) return null;

    return (
        <div className="fixed bottom-6 right-6 z-[100] font-sans">
            {!isOpen && (
                <button onClick={() => setIsOpen(true)} className="bg-[#00994d] hover:bg-[#007a3d] text-white p-4 rounded-full shadow-2xl transition-transform hover:scale-110 flex items-center justify-center animate-bounce-slow group">
                    <MessageCircle size={28} />
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-white shadow-sm group-hover:scale-110 transition-transform">Tanya AI</span>
                </button>
            )}

            {isOpen && (
                <div className="bg-white w-[320px] md:w-[350px] h-[500px] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
                    <div className="bg-[#002f6c] p-4 flex justify-between items-center text-white shrink-0 shadow-md">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-full border border-white/10"><Bot size={20}/></div>
                            <div>
                                <h3 className="font-bold text-sm">Asisten TKJ</h3>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                    <p className="text-[10px] text-blue-100">Siap Membantu</p>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1.5 rounded-lg transition-colors"><X size={18}/></button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4 custom-scrollbar">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                                <div className={`max-w-[85%] p-3 rounded-2xl text-xs md:text-sm shadow-sm leading-relaxed ${msg.role === 'user' ? 'bg-[#002f6c] text-white rounded-br-none' : 'bg-white text-slate-700 border border-slate-200 rounded-bl-none'}`}>
                                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-slate-200 text-slate-500 text-xs px-3 py-2 rounded-full animate-pulse flex items-center gap-1">
                                    <span>Sedang mengetik</span><span className="animate-bounce">.</span><span className="animate-bounce delay-100">.</span><span className="animate-bounce delay-200">.</span>
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-100 flex gap-2">
                        <input 
                            value={input} 
                            onChange={(e) => setInput(e.target.value)} 
                            placeholder="Contoh: Cara kumpul tugas?" 
                            className="flex-1 bg-slate-100 border-transparent focus:bg-white border focus:border-[#00994d] rounded-full px-4 py-2.5 text-sm outline-none transition-all placeholder:text-slate-400 text-slate-700" 
                        />
                        <button 
                            type="submit" 
                            disabled={!input.trim() || isTyping} 
                            className="bg-[#00994d] hover:bg-[#007a3d] disabled:bg-slate-300 disabled:cursor-not-allowed text-white p-2.5 rounded-full transition-all shadow-sm transform active:scale-95"
                        >
                            <Send size={18}/>
                        </button>
                    </form>
                </div>
            )}
        </div>
    )
}