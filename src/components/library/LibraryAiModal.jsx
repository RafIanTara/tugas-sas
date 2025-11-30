import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Send, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../services/firebase"; 
import ModalWrapper from "../ui/ModalWrapper";

export default function LibraryAiModal({ isOpen, onClose, articleTitle, articleContent }) {
    const [chatInput, setChatInput] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const chatEndRef = useRef(null);

    // Pesan Pembuka
    useEffect(() => {
        if (isOpen && chatHistory.length === 0) {
            setChatHistory([{ 
                role: 'model', 
                text: `Halo! ada yang mau ditanya tentang **"${articleTitle}"**? Ada bagian yang kurang jelas? Tanyakan saja, saya akan jelaskan lebih detail!` 
            }]);
        }
    }, [isOpen, articleTitle]);

    // Auto Scroll
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatHistory, isTyping]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!chatInput.trim()) return;

        const userMsg = chatInput;
        setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
        setChatInput('');
        setIsTyping(true);

        try {
            // Ambil API Key (Shared dengan Dashboard)
            const s = await getDoc(doc(db, 'settings', 'ai_config'));
            if (!s.exists()) throw new Error("API Key belum diset admin.");
            
            const genAI = new GoogleGenerativeAI(s.data().apiKey);
            const model = genAI.getGenerativeModel({ model: s.data().model || 'gemini-1.5-flash' });

            // PROMPT KHUSUS E-LIBRARY (CONTEXT AWARE)
            const prompt = `
            Role: Kamu adalah Tutor Privat yang cerdas dan ramah untuk siswa TKJ.
            Context Materi: Berikut adalah isi materi yang sedang dibaca siswa:
            """
            ${articleContent}
            """
            
            Instruksi:
            1. Jawab pertanyaan user berkaitan dengan materi di atas.
            2. Jika materi di atas kurang lengkap, KAMU BOLEH menggunakan pengetahuan umummu atau mencari referensi luas untuk menjelaskan lebih detail dan mudah dimengerti.
            3. Gunakan bahasa Indonesia yang santai tapi edukatif.
            4. Jangan jawab "saya tidak tahu" jika itu pengetahuan umum TKJ, jelaskan saja.

            User bertanya: "${userMsg}"
            `;

            const result = await model.generateContent(prompt);
            setChatHistory(prev => [...prev, { role: 'model', text: result.response.text() }]);

        } catch (error) {
            setChatHistory(prev => [...prev, { role: 'model', text: "Maaf, sistem sedang sibuk atau API Key belum diatur. (" + error.message + ")" }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <ModalWrapper isOpen={isOpen} onClose={onClose} title="Diskusi Materi AI">
            <div className="flex flex-col h-[60vh] md:h-[500px]">
                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-4">
                    {chatHistory.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] p-3 rounded-lg text-sm leading-relaxed shadow-sm ${
                                msg.role === 'user' 
                                ? 'bg-[#002f6c] text-white rounded-br-none' 
                                : 'bg-slate-100 border border-slate-200 text-slate-800 rounded-bl-none'
                            }`}>
                                <ReactMarkdown>{msg.text}</ReactMarkdown>
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex justify-start">
                            <div className="bg-slate-50 text-slate-500 px-4 py-2 rounded-lg text-xs flex items-center gap-2">
                                <Loader2 size={14} className="animate-spin"/> Sedang menganalisis materi...
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>

                {/* Input Area */}
                <form onSubmit={handleSend} className="mt-2 pt-2 border-t flex gap-2">
                    <input 
                        value={chatInput} 
                        onChange={e => setChatInput(e.target.value)} 
                        placeholder="Bagian mana yang bingung? Tanya sini..." 
                        className="flex-1 bg-slate-50 border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#002f6c]"
                    />
                    <button type="submit" disabled={isTyping || !chatInput.trim()} className="bg-[#00994d] hover:bg-green-700 text-white p-3 rounded-xl disabled:opacity-50 transition-all">
                        <Send size={20} />
                    </button>
                </form>
            </div>
        </ModalWrapper>
    );
}