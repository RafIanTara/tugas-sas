import React, { useState, useEffect } from 'react';
import { doc, setDoc, getDoc, addDoc, deleteDoc, collection, query, where, getDocs, orderBy, serverTimestamp } from "firebase/firestore";
import { db } from "../../../services/firebase";
import { Trash2, UserPlus, Save, Loader2, Cpu } from 'lucide-react'; // Tambah icon Cpu
import ModalWrapper from '../../ui/ModalWrapper';
import Toast from '../../ui/Toast';

export default function SettingsModal({ isOpen, onClose, kelasId, canAccessAI, canAccessClass }) {
    const [tab, setTab] = useState(canAccessClass ? 'siswa' : 'ai');
    const [toast, setToast] = useState(null);
    const [loadingSave, setLoadingSave] = useState(false);

    // Default model kita set ke 1.5 Flash
    const [aiConfig, setAiConfig] = useState({ apiKey: '', model: 'gemini-1.5-flash', context: '' });
    const [kasConfig, setKasConfig] = useState({ saldoAwal: '', nominal: '' });
    const [students, setStudents] = useState([]);
    const [newStudent, setNewStudent] = useState('');
    const [loadingStudent, setLoadingStudent] = useState(false);

    useEffect(() => {
        if (!isOpen) return;
        if (tab === 'siswa') fetchStudents();
        if (tab === 'kas') fetchKasConfig();
        if (tab === 'ai') fetchAiConfig();
    }, [isOpen, tab, kelasId]);

    const fetchStudents = async () => {
        try {
            const q = query(collection(db, 'students'), where('kelasId', '==', kelasId), orderBy('name', 'asc'));
            const snap = await getDocs(q);
            setStudents(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        } catch (e) { console.error(e); }
    };

    const fetchKasConfig = async () => {
        try {
            const snap = await getDoc(doc(db, 'settings', `${kelasId.toLowerCase()}_kas_config`));
            if (snap.exists()) setKasConfig({ saldoAwal: snap.data().saldoAwal, nominal: snap.data().nominal });
        } catch (e) { console.error(e); }
    };

    const fetchAiConfig = async () => {
        try {
            const snap = await getDoc(doc(db, 'settings', 'ai_config'));
            if (snap.exists()) {
                setAiConfig({
                    apiKey: snap.data().apiKey || '',
                    model: snap.data().model || 'gemini-1.5-flash', // Fallback ke 1.5
                    context: snap.data().context || ''
                });
            }
        } catch (e) { console.error(e); }
    };

    const handleAddStudent = async (e) => {
        e.preventDefault();
        if(!newStudent.trim()) return;
        setLoadingStudent(true);
        try {
            await addDoc(collection(db, 'students'), { name: newStudent, kelasId: kelasId, createdAt: serverTimestamp() });
            setToast({message: "Siswa ditambahkan!", type: "success"});
            setNewStudent('');
            fetchStudents();
        } catch (e) { setToast({message: "Gagal: " + e.message, type: "error"}); } 
        finally { setLoadingStudent(false); }
    };

    const handleDeleteStudent = async (id) => {
        if(!confirm("Hapus data siswa ini?")) return;
        try {
            await deleteDoc(doc(db, 'students', id));
            setStudents(prev => prev.filter(s => s.id !== id));
            setToast({message: "Siswa dihapus.", type: "success"});
        } catch (e) { setToast({message: "Gagal hapus.", type: "error"}); }
    };

    const saveAI = async (e) => {
        e.preventDefault();
        setLoadingSave(true);
        try {
            // Kita simpan semua config (apiKey, model, context)
            await setDoc(doc(db, 'settings', 'ai_config'), { ...aiConfig, updatedAt: serverTimestamp() }, { merge: true });
            setToast({message: "AI Config Terupdate!", type: "success"});
        } catch (e) { 
            setToast({message: "Error: " + e.message, type: "error"}); 
        } finally {
            setLoadingSave(false);
        }
    };

    const saveKas = async (e) => {
        e.preventDefault();
        setLoadingSave(true);
        try {
            await setDoc(doc(db, 'settings', `${kelasId.toLowerCase()}_kas_config`), { 
                saldoAwal: parseInt(kasConfig.saldoAwal), 
                nominal: parseInt(kasConfig.nominal), 
                updatedAt: serverTimestamp() 
            });
            setToast({message: "Data Keuangan Disimpan!", type: "success"});
        } catch (e) { 
            setToast({message: "Error: " + e.message, type: "error"}); 
        } finally {
            setLoadingSave(false);
        }
    };

    return (
        <ModalWrapper isOpen={isOpen} onClose={onClose} title="Pengaturan Kelas">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            
            <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-lg mb-4 overflow-x-auto">
                {canAccessClass && <button onClick={() => setTab('siswa')} className={`flex-1 py-2 px-2 text-xs font-bold rounded whitespace-nowrap ${tab==='siswa'?'bg-white dark:bg-slate-800 shadow text-blue-600':''}`}>Data Siswa</button>}
                {canAccessClass && <button onClick={() => setTab('kas')} className={`flex-1 py-2 px-2 text-xs font-bold rounded whitespace-nowrap ${tab==='kas'?'bg-white dark:bg-slate-800 shadow text-blue-600':''}`}>Keuangan</button>}
                {canAccessAI && <button onClick={() => setTab('ai')} className={`flex-1 py-2 px-2 text-xs font-bold rounded whitespace-nowrap ${tab==='ai'?'bg-white dark:bg-slate-800 shadow text-blue-600':''}`}>AI System</button>}
            </div>

            {/* TAB SISWA */}
            {tab === 'siswa' && canAccessClass && (
                <div className="space-y-4 animate-in fade-in">
                    <form onSubmit={handleAddStudent} className="flex gap-2">
                        <input type="text" placeholder="Nama Siswa Baru..." value={newStudent} onChange={e=>setNewStudent(e.target.value)} className="flex-1 text-xs p-2 border rounded dark:bg-slate-800 dark:border-slate-600 dark:text-white"/>
                        <button disabled={loadingStudent} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-xs font-bold flex items-center gap-1 disabled:opacity-50">
                            <UserPlus size={16}/> Tambah
                        </button>
                    </form>
                    <div className="max-h-60 overflow-y-auto custom-scrollbar border rounded-lg dark:border-slate-600">
                        {students.length === 0 ? <div className="p-4 text-center text-xs text-slate-400">Belum ada data siswa.</div> : (
                            <ul className="divide-y divide-slate-100 dark:divide-slate-700">
                                {students.map((s, idx) => (
                                    <li key={s.id} className="p-3 flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                        <div className="flex items-center gap-3"><span className="text-xs font-bold text-slate-400 w-4">{idx + 1}.</span><span className="text-xs font-bold text-slate-700 dark:text-slate-200">{s.name}</span></div>
                                        <button onClick={() => handleDeleteStudent(s.id)} className="text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={14}/></button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            )}

            {/* TAB AI (ADMIN) */}
            {tab === 'ai' && canAccessAI && (
                 <form onSubmit={saveAI} className="space-y-4 animate-in fade-in">
                     <div className="flex items-center gap-2 mb-2 pb-2 border-b dark:border-slate-600">
                        <Cpu size={18} className="text-blue-600"/>
                        <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300">Konfigurasi Otak AI</h4>
                     </div>
                     
                     {/* PILIHAN MODEL AI (BARU) */}
                     <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Model AI</label>
                        <select 
                            value={aiConfig.model} 
                            onChange={e => setAiConfig({...aiConfig, model: e.target.value})}
                            className="w-full text-xs p-2 border rounded bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white"
                        >
                            <option value="gemini-1.5-flash">Gemini 1.5 Flash (Cepat & Stabil)</option>
                            <option value="gemini-2.0-flash-exp">Gemini 2.0 Flash (Experimental/Terbaru)</option>
                            <option value="gemini-2.5-flash">Gemini 2.5 Flash (Custom/Future)</option>
                        </select>
                     </div>

                     <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">API Key Gemini</label>
                        <input 
                            type="text" 
                            placeholder="Paste API Key..." 
                            value={aiConfig.apiKey}
                            onChange={e=>setAiConfig({...aiConfig, apiKey: e.target.value})} 
                            className="w-full text-xs p-2 border rounded dark:bg-slate-800 dark:border-slate-600 dark:text-white"
                        />
                     </div>

                     <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Context / Kepribadian AI</label>
                        <textarea 
                            placeholder="Contoh: Kamu adalah asisten TKJ..." 
                            value={aiConfig.context}
                            onChange={e=>setAiConfig({...aiConfig, context: e.target.value})} 
                            className="w-full text-xs p-2 border rounded h-24 dark:bg-slate-800 dark:border-slate-600 dark:text-white"
                        />
                        <p className="text-[10px] text-slate-400 mt-1">*Deskripsikan tugas AI di sini agar jawabannya relevan.</p>
                     </div>

                     <button disabled={loadingSave} className="w-full bg-[#002f6c] hover:bg-blue-800 text-white py-2 rounded text-xs font-bold flex justify-center items-center gap-2">
                        {loadingSave ? <Loader2 className="animate-spin" size={14}/> : <><Save size={14}/> Simpan Konfigurasi</>}
                     </button>
                 </form>
            )}
            
            {/* TAB KAS (GURU) */}
            {tab === 'kas' && canAccessClass && (
                <form onSubmit={saveKas} className="space-y-3 animate-in fade-in">
                     <h4 className="font-bold text-sm text-green-800 dark:text-green-400">Data Keuangan</h4>
                     <div>
                        <label className="text-[10px] font-bold text-slate-500">Saldo Awal Kas</label>
                        <input type="number" placeholder="Rp" value={kasConfig.saldoAwal} onChange={e=>setKasConfig({...kasConfig, saldoAwal: e.target.value})} className="w-full text-xs p-2 border rounded dark:bg-slate-800 dark:border-slate-600 dark:text-white"/>
                     </div>
                     <div>
                        <label className="text-[10px] font-bold text-slate-500">Nominal Wajib</label>
                        <input type="number" placeholder="Rp" value={kasConfig.nominal} onChange={e=>setKasConfig({...kasConfig, nominal: e.target.value})} className="w-full text-xs p-2 border rounded dark:bg-slate-800 dark:border-slate-600 dark:text-white"/>
                     </div>
                     <button disabled={loadingSave} className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded text-xs font-bold flex justify-center items-center gap-2">
                        {loadingSave ? <Loader2 className="animate-spin" size={14}/> : <><Save size={14}/> Update Data Kelas</>}
                     </button>
                </form>
            )}
        </ModalWrapper>
    );
}