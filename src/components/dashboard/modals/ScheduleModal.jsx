import React, { useState, useEffect } from 'react';
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../services/firebase";
import ModalWrapper from '../../ui/ModalWrapper';
import Toast from '../../ui/Toast';

export default function ScheduleModal({ isOpen, onClose, kelasId, hari, currentJadwal }) {
    const [input, setInput] = useState('');
    const [toast, setToast] = useState(null);

    // Load data saat modal dibuka
    useEffect(() => {
        if (isOpen && currentJadwal) {
            setInput(currentJadwal.mapel.join(', '));
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
        <ModalWrapper isOpen={isOpen} onClose={onClose} title={`Edit Jadwal (${hari})`}>
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            <form onSubmit={handleSave} className="space-y-4">
                <textarea 
                    value={input} 
                    onChange={e => setInput(e.target.value)} 
                    className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-xl p-3 text-slate-800 dark:text-white h-32 text-sm" 
                    placeholder="Masukkan mapel dipisahkan koma (contoh: MTK, B.Indo, PJOK)"
                />
                <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold">
                    Update Jadwal
                </button>
            </form>
        </ModalWrapper>
    );
}