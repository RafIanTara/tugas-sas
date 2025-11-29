import React, { useState, useEffect } from 'react';
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../services/firebase";
import { Clock, Monitor } from 'lucide-react';
import ModalWrapper from '../../ui/ModalWrapper';
import Toast from '../../ui/Toast';

export default function CountdownModal({ isOpen, onClose, canEditLanding }) {
    const [dashData, setDashData] = useState({ title: '', targetDate: '' });
    const [landingData, setLandingData] = useState({ title: '', targetDate: '' });
    const [toast, setToast] = useState(null);

    useEffect(() => {
        if (isOpen) {
            // Fetch current data
            const load = async () => {
                const dSnap = await getDoc(doc(db, 'settings', 'countdown'));
                if (dSnap.exists()) setDashData(dSnap.data());
                
                if (canEditLanding) {
                    const lSnap = await getDoc(doc(db, 'settings', 'landing_countdown'));
                    if (lSnap.exists()) setLandingData(lSnap.data());
                }
            }
            load();
        }
    }, [isOpen, canEditLanding]);

    const saveDashboard = async (e) => {
        e.preventDefault();
        try {
            await setDoc(doc(db, 'settings', 'countdown'), { ...dashData, updatedAt: serverTimestamp() });
            setToast({message: "Dashboard Updated!", type: "success"});
        } catch (e) { setToast({message: "Error: " + e.message, type: "error"}); }
    };

    const saveLanding = async (e) => {
        e.preventDefault();
        try {
            await setDoc(doc(db, 'settings', 'landing_countdown'), { ...landingData, updatedAt: serverTimestamp() });
            setToast({message: "Landing Page Updated!", type: "success"});
        } catch (e) { setToast({message: "Error: " + e.message, type: "error"}); }
    };

    const handleDelete = async (type) => {
        if(!confirm("Hapus countdown ini?")) return;
        const col = type === 'landing' ? 'landing_countdown' : 'countdown';
        const resetState = { title: '', targetDate: '' };
        try {
            await setDoc(doc(db, 'settings', col), resetState);
            if(type === 'landing') setLandingData(resetState); else setDashData(resetState);
            setToast({message: "Countdown dihapus.", type: "success"});
        } catch (e) { setToast({message: "Error", type: "error"}); }
    };

    return (
        <ModalWrapper isOpen={isOpen} onClose={onClose} title="Edit Hitung Mundur">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            
            <div className="space-y-6 animate-in fade-in">
                {/* 1. DASHBOARD SETTING */}
                <form onSubmit={saveDashboard} className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
                    <div className="flex items-center gap-2 mb-3 border-b border-slate-200 dark:border-slate-600 pb-2">
                        <Clock size={16} className="text-blue-600 dark:text-blue-400" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Widget Dashboard (Siswa)</h4>
                    </div>
                    <div className="space-y-3">
                        <input type="text" value={dashData.title} onChange={e => setDashData({...dashData, title: e.target.value})} className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg p-2 text-xs dark:text-white" placeholder="Judul Event (Misal: PAS Ganjil)" required/>
                        <input type="datetime-local" value={dashData.targetDate} onChange={e => setDashData({...dashData, targetDate: e.target.value})} className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg p-2 text-xs dark:text-white" required/>
                        <div className="flex gap-2">
                            <button type="button" onClick={() => handleDelete('dash')} className="px-3 py-2 bg-red-100 text-red-600 rounded-lg text-xs font-bold">Hapus</button>
                            <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-xs font-bold">Simpan Dashboard</button>
                        </div>
                    </div>
                </form>

                {/* 2. LANDING PAGE SETTING (Admin Only) */}
                {canEditLanding && (
                    <form onSubmit={saveLanding} className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="flex items-center gap-2 mb-3 border-b border-green-200 dark:border-green-800 pb-2">
                            <Monitor size={16} className="text-green-600 dark:text-green-400" />
                            <h4 className="text-xs font-bold uppercase tracking-wider text-green-800 dark:text-green-300">Widget Landing Page (Publik)</h4>
                        </div>
                        <div className="space-y-3">
                            <input type="text" value={landingData.title} onChange={e => setLandingData({...landingData, title: e.target.value})} className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg p-2 text-xs dark:text-white" placeholder="Judul Event Publik" required/>
                            <input type="datetime-local" value={landingData.targetDate} onChange={e => setLandingData({...landingData, targetDate: e.target.value})} className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg p-2 text-xs dark:text-white" required/>
                            <div className="flex gap-2">
                                <button type="button" onClick={() => handleDelete('landing')} className="px-3 py-2 bg-red-100 text-red-600 rounded-lg text-xs font-bold">Hapus</button>
                                <button type="submit" className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-xs font-bold">Simpan ke Publik</button>
                            </div>
                        </div>
                    </form>
                )}
            </div>
        </ModalWrapper>
    );
}