import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Send, Image as ImageIcon, XCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../services/firebase";
import { fileToGenerativePart } from '../../../utils/helpers';
import ModalWrapper from '../../ui/ModalWrapper';

export default function AiChatModal({ isOpen, onClose, user }) {
    const [chatInput, setChatInput] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const fileInputRef = useRef(null);
    const chatEndRef = useRef(null);

    // Init Chat History
    useEffect(() => {
        if (user && isOpen && chatHistory.length === 0) {
            setChatHistory([{ 
                role: 'model', 
                text: `Assalamualaikum ${user.displayName || 'Wak'}! Gue Asisten AI TKJ nih. Ada yang bisa gue bantu? Spill aja!` 
            }]);
        }
    }, [user, isOpen]);

    // Auto scroll ke bawah
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatHistory, isTyping]);

    const handleFileChange = (e) => {
        const f = e.target.files[0];
        if (f) {
            setImageFile(f);
            const r = new FileReader();
            r.onloadend = () => setImagePreview(r.result);
            r.readAsDataURL(f);
        }
    };

    const clearImage = () => {
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSendChat = async (e) => {
        e.preventDefault();
        if (!chatInput.trim() && !imageFile) return;

        const msg = { role: 'user', text: chatInput, image: imagePreview };
        setChatHistory(p => [...p, msg]);
        setChatInput('');
        setImageFile(null);
        setImagePreview(null);
        setIsTyping(true);

        try {
            const s = await getDoc(doc(db, 'settings', 'ai_config'));
            if (!s.exists()) throw new Error("API Key belum diset oleh Admin.");
            
            const genAI = new GoogleGenerativeAI(s.data().apiKey);
            const model = genAI.getGenerativeModel({ model: s.data().model || 'gemini-1.5-flash' });
            
            // Context Awareness (Simple)
            const ctx = chatHistory.slice(-6).map(x => `${x.role === 'user' ? 'Siswa' : 'AI'}: ${x.text}`).join('\n');
            const prompt = `Role: "TKJ Assistant", AI asisten SMK TKJ.\nStyle: Gaul tapi SOPAN,pakai Wak selalu biar keliatan gaul. NO SARA/PORNO/JUDI.\nContext:\n${ctx}\nUser: "${msg.text}"`;
            
            const result = await model.generateContent(
                imageFile ? [prompt, await fileToGenerativePart(imageFile)] : prompt
            );
            
            setChatHistory(p => [...p, { role: 'model', text: result.response.text() }]);
        } catch (e) {
            setChatHistory(p => [...p, { role: 'model', text: `Error: ${e.message}` }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <ModalWrapper isOpen={isOpen} onClose={onClose} title="TKJ Assistant">
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

                <form onSubmit={handleSendChat} className="mt-0 flex gap-2 border-t pt-3 dark:border-slate-700">
                    <button type="button" onClick={() => fileInputRef.current.click()} className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-500 p-3 rounded-xl"><ImageIcon size={20} /></button>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                    <input value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Tanya sesuatu..." className="flex-1 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-xl px-4 py-3 text-slate-700 dark:text-white text-sm" />
                    <button type="submit" disabled={(!chatInput.trim() && !imageFile) || isTyping} className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white p-3 rounded-xl"><Send size={20} /></button>
                </form>
            </div>
        </ModalWrapper>
    );
}