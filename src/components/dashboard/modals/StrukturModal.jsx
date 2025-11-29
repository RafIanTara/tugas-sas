import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../../services/firebase";
import { Edit3, X } from 'lucide-react';
import ModalWrapper from '../../ui/ModalWrapper';
import Toast from '../../ui/Toast';

export default function StrukturModal({ isOpen, onClose, kelasId, canEdit }) {
    const [data, setData] = useState({ kajur: '-', wali_kelas: '-', ketua: '-', wakil: '-', sekretaris: '-', bendahara: '-' });
    const [isEditing, setIsEditing] = useState(false);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        if (isOpen) {
            const fetch = async () => {
                const snap = await getDoc(doc(db, 'struktur_kelas', kelasId));
                if (snap.exists()) setData(snap.data());
            };
            fetch();
        }
    }, [isOpen, kelasId]);

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            await setDoc(doc(db, 'struktur_kelas', kelasId), data);
            setToast({message: "Struktur Disimpan!", type: "success"});
            setIsEditing(false);
        } catch (e) {
            setToast({message: "Gagal: " + e.message, type: "error"});
        }
    };

    return (
        <ModalWrapper isOpen={isOpen} onClose={onClose} title={`Struktur Organisasi ${kelasId}`}>
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            
            {canEdit && (
                <div className="flex justify-end mb-2">
                    <button onClick={() => setIsEditing(!isEditing)} className={`text-xs font-bold px-3 py-1 rounded flex items-center gap-1 transition-colors ${isEditing ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
                        {isEditing ? <X size={14}/> : <Edit3 size={14}/>} {isEditing ? 'Batal' : 'Edit'}
                    </button>
                </div>
            )}

            {isEditing ? (
                <form onSubmit={handleSave} className="space-y-3 animate-in fade-in">
                    {['kajur', 'wali_kelas', 'ketua', 'wakil', 'sekretaris', 'bendahara'].map(field => (
                        <div key={field}>
                            <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">{field.replace('_', ' ')}</label>
                            <input type="text" value={data[field]} onChange={e => setData({...data, [field]: e.target.value})} className="w-full border p-2 rounded text-xs dark:bg-slate-800 dark:border-slate-600 dark:text-white"/>
                        </div>
                    ))}
                    <button className="w-full bg-[#002f6c] text-white py-2 rounded text-xs font-bold mt-2">Simpan Perubahan</button>
                </form>
            ) : (
                <div className="flex flex-col items-center py-4 w-full text-center space-y-4">
                    <div className="w-3/4 border-b-4 border-blue-800 bg-[#002f6c] text-white py-2 rounded shadow">
                        <span className="text-[9px] opacity-70 block uppercase">Kajur</span>
                        <span className="text-sm font-bold">{data.kajur}</span>
                    </div>
                    <div className="h-4 w-0.5 bg-slate-300"></div>
                    <div className="w-3/4 border-2 border-[#00994d] bg-white dark:bg-slate-700 text-slate-800 dark:text-white py-2 rounded shadow">
                        <span className="text-[9px] text-[#00994d] block uppercase">Wali Kelas</span>
                        <span className="text-sm font-bold">{data.wali_kelas}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 w-full">
                        {['ketua', 'wakil', 'sekretaris', 'bendahara'].map(role => (
                            <div key={role} className="bg-slate-50 dark:bg-slate-800 border p-2 rounded shadow-sm">
                                <span className="text-[9px] text-slate-400 block uppercase">{role}</span>
                                <span className="text-xs font-bold dark:text-white">{data[role]}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </ModalWrapper>
    );
}