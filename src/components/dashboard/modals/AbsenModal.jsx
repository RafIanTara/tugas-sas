import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "../../../services/firebase";
import { Calendar, Save, Loader2, UserCheck, UserX, FileBarChart } from 'lucide-react';
import ModalWrapper from '../../ui/ModalWrapper';
import Toast from '../../ui/Toast';

export default function AbsenModal({ isOpen, onClose, kelasId, canInput }) {
    const [mode, setMode] = useState('harian'); // 'harian' | 'rekap'
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);

    // Data State
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [siswaList, setSiswaList] = useState([]);
    const [absenData, setAbsenData] = useState({}); 

    // --- 1. FETCH SISWA (Sekali saja saat buka) ---
    useEffect(() => {
        if (isOpen) {
            const fetchStudents = async () => {
                try {
                    const q = query(collection(db, 'students'), where('kelasId', '==', kelasId), orderBy('name', 'asc'));
                    const snap = await getDocs(q);
                    setSiswaList(snap.docs.map(d => ({ id: d.id, name: d.data().name })));
                } catch (e) { console.error("Err fetch students:", e); }
            };
            fetchStudents();
        }
    }, [isOpen, kelasId]);

    // --- 2. FETCH DATA ABSEN (Saat tanggal berubah) ---
    useEffect(() => {
        if (isOpen && siswaList.length > 0) {
            loadAbsensi(selectedDate);
        }
    }, [isOpen, selectedDate, siswaList]);

    const loadAbsensi = async (date) => {
        setLoading(true);
        try {
            const docRef = doc(db, `${kelasId.toLowerCase()}_absensi`, date);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                setAbsenData(docSnap.data().data || {});
            } else {
                // Default semua HADIR jika data belum ada (Biar guru gak capek klik satu2)
                const initData = {};
                siswaList.forEach(s => initData[s.name] = { status: 'H', ket: '' });
                setAbsenData(initData);
            }
        } catch (e) { console.error(e); } 
        finally { setLoading(false); }
    };

    // --- 3. HANDLERS ---
    const handleStatusChange = (name, status) => {
        if (!canInput) return; // SECURITY CHECK
        setAbsenData(prev => ({ ...prev, [name]: { ...prev[name], status } }));
    };

    const handleKetChange = (name, val) => {
        if (!canInput) return;
        setAbsenData(prev => ({ ...prev, [name]: { ...prev[name], ket: val } }));
    };

    const saveAbsensi = async () => {
        setLoading(true);
        try {
            // 1. Simpan History Harian
            await setDoc(doc(db, `${kelasId.toLowerCase()}_absensi`, selectedDate), {
                date: selectedDate,
                data: absenData,
                updatedAt: new Date()
            });

            // 2. Update Widget Dashboard (Hanya jika hari ini)
            const today = new Date().toISOString().split('T')[0];
            if (selectedDate === today) {
                const summary = Object.values(absenData);
                const stats = {
                    hadir: summary.filter(x => x?.status === 'H').length,
                    sakit: summary.filter(x => x?.status === 'S').length,
                    izin: summary.filter(x => x?.status === 'I').length,
                    alpha: summary.filter(x => x?.status === 'A').length,
                };
                
                await setDoc(doc(db, `${kelasId.toLowerCase()}_absensi`, 'harian'), {
                    data: Object.entries(absenData).map(([k, v]) => ({ nama: k, status: v.status })),
                    stats,
                    date: today
                });
            }

            setToast({ message: "Data Tersimpan!", type: "success" });
        } catch (e) { setToast({ message: "Gagal: " + e.message, type: "error" }); }
        finally { setLoading(false); }
    };

    // --- HELPER WARNA ---
    const getStatusColor = (s) => {
        switch(s) {
            case 'H': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'S': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'I': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'A': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-slate-100 text-slate-400';
        }
    };

    return (
        <ModalWrapper isOpen={isOpen} onClose={onClose} title="Jurnal Presensi Kelas">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* HEADER CONTROLS */}
            <div className="flex items-center justify-between mb-4 bg-slate-50 dark:bg-slate-800 p-2 rounded-lg border dark:border-slate-700">
                <input 
                    type="date" 
                    value={selectedDate} 
                    onChange={(e) => setSelectedDate(e.target.value)} 
                    className="bg-transparent text-sm font-bold text-slate-700 dark:text-white outline-none"
                />
                <div className="flex gap-1">
                    <button onClick={()=>setMode('harian')} className={`p-1.5 rounded ${mode==='harian'?'bg-white shadow text-blue-600':'text-slate-400'}`}><UserCheck size={18}/></button>
                    {/* Fitur Rekap kita hidden dulu biar fokus input harian lancar */}
                    {/* <button onClick={()=>setMode('rekap')} className={`p-1.5 rounded ${mode==='rekap'?'bg-white shadow text-blue-600':'text-slate-400'}`}><FileBarChart size={18}/></button> */}
                </div>
            </div>

            {/* LIST SISWA (GRID VIEW) */}
            <div className="max-h-[60vh] overflow-y-auto custom-scrollbar pr-1">
                {siswaList.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 text-xs">Data siswa belum diinput di Settings.</div>
                ) : (
                    <div className="space-y-2">
                        {siswaList.map((siswa, idx) => {
                            const data = absenData[siswa.name] || { status: 'H', ket: '' };
                            return (
                                <div key={siswa.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl shadow-sm hover:shadow-md transition-all">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-bold text-slate-300 w-5">{idx + 1}.</span>
                                        <div>
                                            <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{siswa.name}</p>
                                            {/* Input Keterangan hanya muncul jika bukan Hadir */}
                                            {data.status !== 'H' && (
                                                <input 
                                                    type="text" 
                                                    placeholder="Keterangan..." 
                                                    value={data.ket || ''} 
                                                    onChange={(e) => handleKetChange(siswa.name, e.target.value)}
                                                    disabled={!canInput}
                                                    className="mt-1 text-[10px] w-full border-b border-dashed border-slate-300 bg-transparent outline-none text-slate-500"
                                                />
                                            )}
                                        </div>
                                    </div>

                                    {/* TOMBOL STATUS (Hanya Aktif untuk Guru) */}
                                    <div className="flex gap-1">
                                        {['H', 'S', 'I', 'A'].map((s) => (
                                            <button 
                                                key={s} 
                                                onClick={() => handleStatusChange(siswa.name, s)}
                                                disabled={!canInput} // SISWA GABISA KLIK
                                                className={`w-8 h-8 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center border ${
                                                    data.status === s 
                                                    ? getStatusColor(s) + " shadow-sm scale-105" 
                                                    : "bg-slate-50 text-slate-300 border-transparent hover:bg-slate-100 dark:bg-slate-700 dark:hover:bg-slate-600"
                                                }`}
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* FOOTER ACTION (HANYA GURU) */}
            {canInput && (
                <div className="mt-4 pt-4 border-t dark:border-slate-700">
                    <button 
                        onClick={saveAbsensi} 
                        disabled={loading}
                        className="w-full bg-[#002f6c] hover:bg-blue-800 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
                    >
                        {loading ? <Loader2 className="animate-spin" size={18}/> : <><Save size={18}/> Simpan Data Absen</>}
                    </button>
                </div>
            )}
            
            {/* VIEW MODE UNTUK SISWA (Tampilan Bawah) */}
            {!canInput && (
                <div className="mt-4 text-center text-[10px] text-slate-400 bg-slate-50 p-2 rounded">
                    Anda dalam mode <b>Read Only</b>. Hubungi Guru/Sekretaris untuk mengubah data.
                </div>
            )}
        </ModalWrapper>
    );
}