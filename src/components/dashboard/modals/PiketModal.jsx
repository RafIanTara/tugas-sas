import React, { useState, useEffect } from 'react';
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../services/firebase";
import ModalWrapper from '../../ui/ModalWrapper';
import Toast from '../../ui/Toast';
import { Save } from 'lucide-react';

// PASTIKAN PROPS INI DITERIMA: canEdit
export default function PiketModal({ isOpen, onClose, kelasId, hari, currentPiket, canEdit = false }) {
    const [input, setInput] = useState('');
    const [toast, setToast] = useState(null);

    useEffect(() => {
        if (isOpen && currentPiket) {
            // Join array jadi string koma
            setInput(currentPiket.names ? currentPiket.names.join(', ') : '');
        } else {
            setInput('');
        }
    }, [isOpen, currentPiket]);

    const handleSave = async (e) => {
        e.preventDefault();
        const namesArray = input.split(',').map(i => i.trim()).filter(i => i);
        try {
            await setDoc(doc(db, `${kelasId.toLowerCase()}_piket`, hari), {
                names: namesArray,
                updatedAt: serverTimestamp()
            });
            setToast({message: "Piket Diupdate!", type: "success"});
            setTimeout(onClose, 1000);
        } catch (e) {
            setToast({message: "Gagal: " + e.message, type: "error"});
        }
    };

    return (
        <ModalWrapper isOpen={isOpen} onClose={onClose} title={`Jadwal Piket: ${hari}`}>
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            
            {/* VIEW MODE (SISWA) */}
            {!canEdit ? (
                <div className="space-y-4">
                    <div className="bg-orange-50 dark:bg-orange-900/20 p-6 rounded-xl text-center border-2 border-dashed border-orange-200 dark:border-orange-800">
                        <h4 className="text-xs font-bold text-orange-600 mb-4 uppercase tracking-wider">Petugas Kebersihan</h4>
                        {input ? (
                            <div className="flex flex-wrap gap-2 justify-center">
                                {input.split(',').map((nama, i) => (
                                    <span key={i} className="bg-white dark:bg-slate-800 px-3 py-1 rounded-full text-sm font-bold shadow-sm text-slate-700 dark:text-slate-200">
                                        {nama.trim()}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-slate-400 text-xs italic">Belum ada data piket.</p>
                        )}
                    </div>
                    <p className="text-[10px] text-center text-slate-400">Hubungi Guru untuk mengubah jadwal.</p>
                </div>
            ) : (
                /* EDIT MODE (GURU) */
                <form onSubmit={handleSave} className="space-y-4">
                    <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-xs mb-2">
                        Tips: Masukkan nama siswa dipisahkan dengan <b>koma</b>.
                    </div>
                    <textarea 
                        value={input} 
                        onChange={e => setInput(e.target.value)} 
                        className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl p-4 text-slate-800 dark:text-white h-32 text-sm focus:ring-2 focus:ring-orange-500 outline-none" 
                        placeholder="Contoh: Budi, Siti, Asep..."
                    />
                    <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-bold flex justify-center items-center gap-2">
                        <Save size={16}/> Simpan Data Piket
                    </button>
                </form>
            )}
        </ModalWrapper>
    );
}