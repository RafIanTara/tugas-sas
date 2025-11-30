import React, { useState, useEffect } from 'react';
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../services/firebase";
import ModalWrapper from '../../ui/ModalWrapper';
import Toast from '../../ui/Toast';
import { Save, BookOpen } from 'lucide-react';

export default function ScheduleModal({ isOpen, onClose, kelasId, hari, currentJadwal, canEdit = false }) {
    const [input, setInput] = useState('');
    const [toast, setToast] = useState(null);

    useEffect(() => {
        if (isOpen && currentJadwal) {
            setInput(currentJadwal.mapel ? currentJadwal.mapel.join(', ') : '');
        } else {
            setInput('');
        }
    }, [isOpen, currentJadwal]);

    const handleSave = async (e) => {
        e.preventDefault();
        const mapelArray = input.split(',').map(i => i.trim()).filter(i => i);
        try {
            await setDoc(doc(db, `${kelasId.toLowerCase()}_jadwal`, hari), {
                mapel: mapelArray,
                updatedAt: serverTimestamp()
            });
            setToast({message: "Jadwal Diupdate!", type: "success"});
            setTimeout(onClose, 1000);
        } catch (e) {
            setToast({message: "Gagal: " + e.message, type: "error"});
        }
    };

    return (
        <ModalWrapper isOpen={isOpen} onClose={onClose} title={`Jadwal: ${hari}`}>
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            
            {!canEdit ? (
                <div className="space-y-4">
                     <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800">
                        <div className="flex flex-col gap-3">
                            {input ? input.split(',').map((mapel, i) => (
                                <div key={i} className="flex items-center gap-3 bg-white dark:bg-slate-800 p-3 rounded-lg shadow-sm">
                                    <div className="bg-emerald-100 text-emerald-600 p-2 rounded-full font-bold text-xs w-8 h-8 flex items-center justify-center">
                                        {i + 1}
                                    </div>
                                    <span className="font-bold text-slate-700 dark:text-slate-200 text-sm">{mapel.trim()}</span>
                                </div>
                            )) : <p className="text-center text-slate-400 text-xs">Tidak ada jadwal.</p>}
                        </div>
                     </div>
                </div>
            ) : (
                <form onSubmit={handleSave} className="space-y-4">
                     <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-xs mb-2">
                        Masukkan mata pelajaran urut dari jam pertama, pisahkan dengan <b>koma</b>.
                    </div>
                    <textarea 
                        value={input} 
                        onChange={e => setInput(e.target.value)} 
                        className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl p-3 text-slate-800 dark:text-white h-32 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" 
                        placeholder="Contoh: MTK, B.Indo, Istirahat, PJOK..."
                    />
                    <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2">
                        <Save size={16}/> Update Jadwal
                    </button>
                </form>
            )}
        </ModalWrapper>
    );
}