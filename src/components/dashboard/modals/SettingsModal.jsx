import React, { useState, useEffect } from 'react';
import { doc, setDoc, addDoc, deleteDoc, collection, query, where, getDocs, orderBy, serverTimestamp } from "firebase/firestore";
import { db } from "../../../services/firebase";
import { Trash2, UserPlus, Users } from 'lucide-react';
import ModalWrapper from '../../ui/ModalWrapper';
import Toast from '../../ui/Toast';

export default function SettingsModal({ isOpen, onClose, kelasId, canAccessAI, canAccessClass }) {
    // Default tab ke 'siswa' jika guru, 'ai' jika admin
    const [tab, setTab] = useState(canAccessClass ? 'siswa' : 'ai');
    
    // Config States
    const [aiConfig, setAiConfig] = useState({ apiKey: '', model: 'gemini-1.5-flash', context: '' });
    const [kasConfig, setKasConfig] = useState({ saldoAwal: '', nominal: '' });
    
    // Student States
    const [students, setStudents] = useState([]);
    const [newStudent, setNewStudent] = useState('');
    const [loadingStudent, setLoadingStudent] = useState(false);

    const [toast, setToast] = useState(null);

    // FETCH DATA SISWA SAAT TAB SISWA DIBUKA
    useEffect(() => {
        if (isOpen && tab === 'siswa') {
            fetchStudents();
        }
    }, [isOpen, tab, kelasId]);

    const fetchStudents = async () => {
        try {
            const q = query(
                collection(db, 'students'), 
                where('kelasId', '==', kelasId),
                orderBy('name', 'asc')
            );
            const snap = await getDocs(q);
            setStudents(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        } catch (e) {
            console.error("Error fetch students:", e);
        }
    };

    const handleAddStudent = async (e) => {
        e.preventDefault();
        if(!newStudent.trim()) return;
        setLoadingStudent(true);
        try {
            await addDoc(collection(db, 'students'), {
                name: newStudent,
                kelasId: kelasId,
                createdAt: serverTimestamp()
            });
            setToast({message: "Siswa berhasil ditambahkan!", type: "success"});
            setNewStudent('');
            fetchStudents(); // Refresh list
        } catch (e) {
            setToast({message: "Gagal: " + e.message, type: "error"});
        } finally {
            setLoadingStudent(false);
        }
    };

    const handleDeleteStudent = async (id) => {
        if(!confirm("Yakin hapus siswa ini? Data absennya mungkin masih tersisa.")) return;
        try {
            await deleteDoc(doc(db, 'students', id));
            setStudents(prev => prev.filter(s => s.id !== id));
            setToast({message: "Siswa dihapus.", type: "success"});
        } catch (e) {
            setToast({message: "Gagal hapus.", type: "error"});
        }
    };

    const saveAI = async (e) => {
        e.preventDefault();
        try {
            await setDoc(doc(db, 'settings', 'ai_config'), { ...aiConfig, updatedAt: serverTimestamp() }, { merge: true });
            setToast({message: "AI Config Saved!", type: "success"});
        } catch (e) { setToast({message: "Error: " + e.message, type: "error"}); }
    };

    const saveKas = async (e) => {
        e.preventDefault();
        try {
            await setDoc(doc(db, 'settings', `${kelasId.toLowerCase()}_kas_config`), { 
                saldoAwal: parseInt(kasConfig.saldoAwal), 
                nominal: parseInt(kasConfig.nominal), 
                updatedAt: serverTimestamp() 
            });
            setToast({message: "Kas Config Saved!", type: "success"});
        } catch (e) { setToast({message: "Error: " + e.message, type: "error"}); }
    };

    return (
        <ModalWrapper isOpen={isOpen} onClose={onClose} title="Pengaturan Kelas">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            
            <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-lg mb-4 overflow-x-auto">
                {canAccessClass && <button onClick={() => setTab('siswa')} className={`flex-1 py-2 px-2 text-xs font-bold rounded whitespace-nowrap ${tab==='siswa'?'bg-white dark:bg-slate-800 shadow text-blue-600':''}`}>Data Siswa</button>}
                {canAccessClass && <button onClick={() => setTab('kas')} className={`flex-1 py-2 px-2 text-xs font-bold rounded whitespace-nowrap ${tab==='kas'?'bg-white dark:bg-slate-800 shadow text-blue-600':''}`}>Keuangan</button>}
                {canAccessAI && <button onClick={() => setTab('ai')} className={`flex-1 py-2 px-2 text-xs font-bold rounded whitespace-nowrap ${tab==='ai'?'bg-white dark:bg-slate-800 shadow text-blue-600':''}`}>AI System</button>}
            </div>

            {/* TAB DATA SISWA (BARU) */}
            {tab === 'siswa' && canAccessClass && (
                <div className="space-y-4 animate-in fade-in">
                    <form onSubmit={handleAddStudent} className="flex gap-2">
                        <input 
                            type="text" 
                            placeholder="Nama Siswa Baru..." 
                            value={newStudent} 
                            onChange={e=>setNewStudent(e.target.value)} 
                            className="flex-1 text-xs p-2 border rounded dark:bg-slate-800 dark:border-slate-600 dark:text-white"
                        />
                        <button disabled={loadingStudent} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-xs font-bold flex items-center gap-1 disabled:opacity-50">
                            <UserPlus size={16}/> Tambah
                        </button>
                    </form>

                    <div className="max-h-60 overflow-y-auto custom-scrollbar border rounded-lg dark:border-slate-600">
                        {students.length === 0 ? (
                            <div className="p-4 text-center text-xs text-slate-400">Belum ada data siswa.</div>
                        ) : (
                            <ul className="divide-y divide-slate-100 dark:divide-slate-700">
                                {students.map((s, idx) => (
                                    <li key={s.id} className="p-3 flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs font-bold text-slate-400 w-4">{idx + 1}.</span>
                                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{s.name}</span>
                                        </div>
                                        <button onClick={() => handleDeleteStudent(s.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                                            <Trash2 size={14}/>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            )}

            {/* TAB AI (ADMIN) */}
            {tab === 'ai' && canAccessAI && (
                 <form onSubmit={saveAI} className="space-y-3 animate-in fade-in">
                     <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300">Konfigurasi AI (Admin)</h4>
                     <input type="text" placeholder="API Key Gemini..." value={aiConfig.apiKey} onChange={e=>setAiConfig({...aiConfig, apiKey: e.target.value})} className="w-full text-xs p-2 border rounded dark:bg-slate-800 dark:border-slate-600 dark:text-white"/>
                     <textarea placeholder="Context Otak AI..." value={aiConfig.context} onChange={e=>setAiConfig({...aiConfig, context: e.target.value})} className="w-full text-xs p-2 border rounded h-20 dark:bg-slate-800 dark:border-slate-600 dark:text-white"/>
                     <button className="w-full bg-[#002f6c] text-white py-2 rounded text-xs font-bold">Simpan AI Config</button>
                 </form>
            )}
            
            {/* TAB KAS (GURU) */}
            {tab === 'kas' && canAccessClass && (
                <form onSubmit={saveKas} className="space-y-3 animate-in fade-in">
                     <h4 className="font-bold text-sm text-green-800 dark:text-green-400">Data Keuangan</h4>
                     <input type="number" placeholder="Saldo Awal Kas (Rp)" value={kasConfig.saldoAwal} onChange={e=>setKasConfig({...kasConfig, saldoAwal: e.target.value})} className="w-full text-xs p-2 border rounded dark:bg-slate-800 dark:border-slate-600 dark:text-white"/>
                     <input type="number" placeholder="Nominal Wajib per Minggu (Rp)" value={kasConfig.nominal} onChange={e=>setKasConfig({...kasConfig, nominal: e.target.value})} className="w-full text-xs p-2 border rounded dark:bg-slate-800 dark:border-slate-600 dark:text-white"/>
                     <button className="w-full bg-green-600 text-white py-2 rounded text-xs font-bold">Update Data Kelas</button>
                </form>
            )}
        </ModalWrapper>
    );
}