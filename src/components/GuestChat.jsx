import { useState, useEffect, useRef } from 'react'
import { MessageCircle, X, Send, Bot } from 'lucide-react'
import { GoogleGenerativeAI } from "@google/generative-ai"
import { doc, getDoc } from "firebase/firestore"
import { db } from "../services/firebase" 
import { useLocation } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'

export default function GuestChat() {
    const location = useLocation()
    
    // --- SEMUA HOOKS (STATE & REF) WAJIB DIATAS ---
    // Jangan ada "return" sebelum bagian ini selesai
    const [isOpen, setIsOpen] = useState(false)
    const [isTyping, setIsTyping] = useState(false)
    const [input, setInput] = useState('')
    const [messages, setMessages] = useState([
        { role: 'model', text: 'Halo! 👋 Selamat datang di Portal TKJ SMK Muhammadiyah 1 Metro. Ada yang bisa saya bantu jelaskan tentang jurusan kami?' }
    ])
    const chatEndRef = useRef(null)
    const [schoolContext, setSchoolContext] = useState("")
    const [aiConfig, setAiConfig] = useState({ apiKey: "", model: "gemini-1.5-flash" })

    // FETCH CONFIG & CONTEXT SAAT PERTAMA LOAD
    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const s = await getDoc(doc(db, 'settings', 'ai_config'))
                if (s.exists()) {
                    const data = s.data();
                    setAiConfig({
                        apiKey: data.apiKey,
                        model: data.model || "gemini-1.5-flash" // Pakai model dari settingan admin
                    });
                    if (data.guest_context) {
                        setSchoolContext(data.guest_context);
                    }
                }
            } catch (e) {
                console.error("Gagal load config AI Guest", e)
            }
        }
        fetchConfig()
    }, [])

    // AUTO SCROLL
    useEffect(() => { 
        if(isOpen) {
            chatEndRef.current?.scrollIntoView({ behavior: "smooth" }) 
        }
    }, [messages, isOpen])

    // HANDLE SEND MESSAGE
    const handleSend = async (e) => {
        e.preventDefault()
        if (!input.trim()) return

        const userMsg = { role: 'user', text: input }
        setMessages(prev => [...prev, userMsg])
        setInput('')
        setIsTyping(true)

        try {
            // Cek API Key dulu
            if (!aiConfig.apiKey) throw new Error("API Key belum diatur oleh Admin.")

            const genAI = new GoogleGenerativeAI(aiConfig.apiKey)
            // Pakai model dari state (biar sinkron sama dashboard)
            const model = genAI.getGenerativeModel({ model: aiConfig.model })

            // DEFAULT CONTEXT
            const defaultInfo = `
            INFORMASI UMUM:
            - Sekolah: SMK Muhammadiyah 1 Metro
            - Jurusan: TKJ (Teknik Jaringan Komputer & Telekomunikasi)
            - Alamat: Jl. KH. Ahmad Dahlan No. 1, Metro
            
            TUGAS:
            Jawab pertanyaan pengunjung dengan ramah dan sopan sebagai Humas Sekolah.
            Ajak mereka mendaftar.
            Jika pertanyaan tidak ada di data, jawab jujur: "Maaf, saya belum punya informasi detail soal itu. Silahkan hubungi admin."
            `

            const knowledgeBase = schoolContext || defaultInfo;
            const chatHistoryText = messages.map(m => `${m.role === 'user' ? 'Pengunjung' : 'Humas'}: ${m.text}`).join('\n')
            
            const finalPrompt = `
            DATA SEKOLAH (FAKTA):
            ${knowledgeBase}

            RIWAYAT OBROLAN:
            ${chatHistoryText}

            PERTANYAAN PENGUNJUNG: "${userMsg.text}"
            
            INSTRUKSI PENTING:
            1. Jawab berdasarkan DATA SEKOLAH di atas.
            2. Jangan ngarang atau halusinasi info yang tidak ada di data.
            3. Bahasa sopan, formal tapi ramah (Humas).
            `

            const result = await model.generateContent(finalPrompt)
            setMessages(prev => [...prev, { role: 'model', text: result.response.text() }])

        } catch (error) {
            console.error("AI Error:", error)
            setMessages(prev => [...prev, { role: 'model', text: "Maaf, saya sedang istirahat sebentar. (Error: Cek Koneksi/API Key)" }])
        } finally {
            setIsTyping(false)
        }
    }

    // --- LOGIKA PENAMPILAN (BARU BOLEH DI SINI) ---
    // Kalau URL mengandung kata "kelas-", component ini ngerender NULL (hilang)
    // TAPI hooks di atas tetap jalan (jadi React gak marah)
    if (location.pathname.includes('kelas-')) return null;

    return (
        <div className="fixed bottom-6 right-6 z-[100] font-sans">
            {!isOpen && (
                <button onClick={() => setIsOpen(true)} className="bg-[#00994d] hover:bg-[#007a3d] text-white p-4 rounded-full shadow-2xl transition-transform hover:scale-110 flex items-center justify-center animate-bounce">
                    <MessageCircle size={28} />
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-white">Tanya Kami!</span>
                </button>
            )}

            {isOpen && (
                <div className="bg-white w-[350px] h-[500px] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
                    <div className="bg-[#002f6c] p-4 flex justify-between items-center text-white shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-full"><Bot size={20}/></div>
                            <div><h3 className="font-bold text-sm">Humas TKJ Metro</h3><p className="text-[10px] text-green-300 flex items-center gap-1">● Online</p></div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded"><X size={20}/></button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-3 custom-scrollbar">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm ${msg.role === 'user' ? 'bg-[#002f6c] text-white rounded-br-none' : 'bg-white text-slate-700 border border-slate-200 rounded-bl-none'}`}>
                                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                                </div>
                            </div>
                        ))}
                        {isTyping && <div className="flex justify-start"><div className="bg-slate-200 text-slate-500 text-xs px-3 py-2 rounded-full animate-pulse">Sedang mengetik...</div></div>}
                        <div ref={chatEndRef} />
                    </div>
                    <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-100 flex gap-2">
                        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Tanya tentang TKJ..." className="flex-1 bg-slate-100 border-0 rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-[#00994d] outline-none" />
                        <button type="submit" disabled={!input.trim() || isTyping} className="bg-[#00994d] hover:bg-[#007a3d] text-white p-2 rounded-full transition-colors disabled:opacity-50"><Send size={18}/></button>
                    </form>
                </div>
            )}
        </div>
    )
}