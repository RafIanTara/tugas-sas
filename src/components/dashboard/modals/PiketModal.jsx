import React, { useState, useEffect } from 'react';
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../services/firebase";
import ModalWrapper from '../../ui/ModalWrapper';
import Toast from '../../ui/Toast';

export default function PiketModal({ isOpen, onClose, kelasId, hari, currentPiket }) {
    const [input, setInput] = useState('');
    const [toast, setToast] = useState(null);

    useEffect(() => {
        if (isOpen && currentPiket) {
            setInput(currentPiket.names.join(', '));
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
        <ModalWrapper isOpen={isOpen} onClose={onClose} title={`Edit Piket (${hari})`}>
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            <form onSubmit={handleSave} className="space-y-4">
                <textarea 
                    value={input} 
                    onChange={e => setInput(e.target.value)} 
                    className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-xl p-3 text-slate-800 dark:text-white h-32 text-sm" 
                    placeholder="Nama siswa pisah koma (contoh: Budi, Siti, Asep)"
                />
                <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-bold">
                    Simpan Piket
                </button>
            </form>
        </ModalWrapper>
    );
}