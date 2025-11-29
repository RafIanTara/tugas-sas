import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "../../../services/firebase";
import { Calendar, Save, Loader2, FileSpreadsheet } from 'lucide-react';
import ModalWrapper from '../../ui/ModalWrapper';
import Toast from '../../ui/Toast';

export default function AbsenModal({ isOpen, onClose, kelasId, canInput }) {
    // === STATE UTAMA ===
    const [viewMode, setViewMode] = useState('input'); // 'input' | 'rekap'
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);

    // === STATE INPUT HARIAN ===
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [siswaList, setSiswaList] = useState([]);
    const [absenData, setAbsenData] = useState({}); 

    // === STATE REKAP BULANAN ===
    const [rekapMonth, setRekapMonth] = useState(new Date().getMonth() + 1);
    const [rekapYear, setRekapYear] = useState(new Date().getFullYear());
    const [rekapData, setRekapData] = useState([]); 

    // Helper: Cek apakah tanggal yg dipilih adalah HARI INI
    const isToday = (dateStr) => {
        const todayStr = new Date().toISOString().split('T')[0];
        return dateStr === todayStr;
    };

    // 1. FETCH SISWA
    useEffect(() => {
        if (isOpen) {
            const fetchStudents = async () => {
                try {
                    const q = query(collection(db, 'students'), where('kelasId', '==', kelasId), orderBy('name', 'asc'));
                    const snap = await getDocs(q);
                    setSiswaList(snap.docs.map(d => ({ id: d.id, name: d.data().name })));
                } catch (e) { console.error("Error students:", e); }
            };
            fetchStudents();
        }
    }, [isOpen, kelasId]);

    // 2. LOGIC INPUT HARIAN (Load Data saat tanggal berubah)
    useEffect(() => {
        if (isOpen && viewMode === 'input' && siswaList.length > 0) {
            const fetchAbsenHariIni = async () => {
                setLoading(true);
                try {
                    const docRef = doc(db, `${kelasId.toLowerCase()}_absensi`, selectedDate);
                    const docSnap = await getDoc(docRef);
                    
                    if (docSnap.exists()) {
                        setAbsenData(docSnap.data().data || {});
                    } else {
                        const defaultAbsen = {};
                        siswaList.forEach(s => { defaultAbsen[s.name] = { status: 'H', ket: '' }; });
                        setAbsenData(defaultAbsen);
                    }
                } catch (e) { console.error(e); } 
                finally { setLoading(false); }
            };
            fetchAbsenHariIni();
        }
    }, [isOpen, selectedDate, kelasId, viewMode, siswaList]);

    const updateStatus = (nama, status) => {
        setAbsenData(prev => ({ ...prev, [nama]: { ...prev[nama], status: status } }));
    };

    const updateKet = (nama, ket) => {
        setAbsenData(prev => ({ ...prev, [nama]: { ...prev[nama], ket: ket } }));
    };

    // === SIMPAN DATA (DIPERBAIKI) ===
    const handleSaveHarian = async () => {
        setLoading(true);
        try {
            const summary = Object.values(absenData);
            
            // 1. SELALU Simpan ke Dokumen History (Sesuai Tanggal yang dipilih)
            // Ini yang dipakai untuk Rekap Bulanan
            await setDoc(doc(db, `${kelasId.toLowerCase()}_absensi`, selectedDate), {
                date: selectedDate,
                data: absenData,
                lastUpdated: new Date()
            });

            // 2. CEK LOGIKA WIDGET: Hanya update Widget Dashboard jika yang diedit adalah HARI INI
            if (isToday(selectedDate)) {
                const stats = {
                    hadir: summary.filter(x => x.status === 'H').length,
                    sakit: summary.filter(x => x.status === 'S').length,
                    izin: summary.filter(x => x.status === 'I').length,
                    alpha: summary.filter(x => x.status === 'A').length,
                };
                const widgetData = Object.entries(absenData).map(([nama, val]) => ({ nama, status: val.status }));
                
                // Overwrite dokumen 'harian'
                await setDoc(doc(db, `${kelasId.toLowerCase()}_absensi`, 'harian'), {
                    data: widgetData,
                    stats: stats,
                    date: selectedDate
                });
            }

            setToast({ message: "Absensi Tersimpan!", type: "success" });
        } catch (e) {
            setToast({ message: "Gagal: " + e.message, type: "error" });
        } finally {
            setLoading(false);
        }
    };

    // 3. LOGIC REKAP BULANAN (Selalu fetch ulang saat Tab Rekap dibuka)
    useEffect(() => {
        if (isOpen && viewMode === 'rekap' && siswaList.length > 0) {
            fetchRekapData();
        }
    }, [isOpen, viewMode, rekapMonth, rekapYear, siswaList]);

    const fetchRekapData = async () => {
        setLoading(true);
        try {
            const strMonth = String(rekapMonth).padStart(2, '0');
            const startStr = `${rekapYear}-${strMonth}-01`;
            const endStr = `${rekapYear}-${strMonth}-31`;

            const q = query(
                collection(db, `${kelasId.toLowerCase()}_absensi`),
                where('date', '>=', startStr),
                where('date', '<=', endStr)
            );

            const snap = await getDocs(q);
            const docs = snap.docs.map(d => d.data());

            const processed = siswaList.map(siswa => {
                const row = {
                    name: siswa.name,
                    dates: {}, 
                    stats: { H: 0, S: 0, I: 0, A: 0 }
                };

                docs.forEach(dayDoc => {
                    // Filter dokumen sampah (misal dokumen 'harian' yg tidak punya format tanggal YYYY-MM-DD)
                    if(dayDoc.date === 'harian' || !dayDoc.date.includes('-')) return;

                    const dayPart = dayDoc.date.split('-')[2];
                    const dayNum = parseInt(dayPart, 10); 
                    const studentRecord = dayDoc.data[siswa.name];
                    const status = studentRecord ? studentRecord.status : '-';

                    row.dates[String(dayNum)] = status;

                    if (status === 'H') row.stats.H++;
                    else if (status === 'S') row.stats.S++;
                    else if (status === 'I') row.stats.I++;
                    else if (status === 'A') row.stats.A++;
                });
                return row;
            });

            setRekapData(processed);
        } catch (e) {
            console.error("Error rekap:", e);
        } finally {
            setLoading(false);
        }
    };

    const daysInMonth = new Date(rekapYear, rekapMonth, 0).getDate();
    const dateHeaders = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    return (
        <ModalWrapper isOpen={isOpen} onClose={onClose} title="Jurnal Absensi">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-lg mb-4">
                <button onClick={() => setViewMode('input')} className={`flex-1 py-2 text-xs font-bold rounded ${viewMode==='input'?'bg-white dark:bg-slate-800 shadow text-blue-600':''}`}>Input Harian</button>
                <button onClick={() => setViewMode('rekap')} className={`flex-1 py-2 text-xs font-bold rounded ${viewMode==='rekap'?'bg-white dark:bg-slate-800 shadow text-blue-600':''}`}>Rekap Bulanan</button>
            </div>

            {/* INPUT HARIAN */}
            {viewMode === 'input' && (
                <div className="space-y-4 animate-in fade-in">
                    <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800">
                        <div className="flex items-center gap-2">
                            <Calendar size={18} className="text-blue-600"/>
                            <span className="text-xs font-bold text-slate-500">Tanggal Absen:</span>
                        </div>
                        <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="bg-transparent border-b border-blue-300 text-sm font-bold text-slate-700 dark:text-white outline-none"/>
                    </div>
                    {/* INFO LOGIC WIDGET */}
                    {!isToday(selectedDate) && (
                        <div className="text-[10px] text-orange-600 bg-orange-50 p-2 rounded text-center">
                            Anda sedang mengedit absen lampau. Data ini tidak akan mengubah Widget Dashboard (Hanya History).
                        </div>
                    )}

                    <div className="border rounded-lg overflow-hidden dark:border-slate-600">
                        <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                            {siswaList.length === 0 ? <div className="p-8 text-center text-xs text-slate-400">Belum ada data siswa.</div> : (
                                <table className="w-full text-xs text-left">
                                    <thead className="bg-slate-50 dark:bg-slate-700 sticky top-0 z-10 shadow-sm text-slate-500 font-bold uppercase">
                                        <tr>
                                            <th className="p-3 w-8 text-center">No</th>
                                            <th className="p-3">Nama Siswa</th>
                                            <th className="p-3 text-center">Status</th>
                                            <th className="p-3">Ket</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700 bg-white dark:bg-slate-800">
                                        {siswaList.map((siswa, index) => {
                                            const status = absenData[siswa.name]?.status || 'H';
                                            const ket = absenData[siswa.name]?.ket || '';
                                            return (
                                                <tr key={siswa.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                                    <td className="p-3 text-center font-bold text-slate-400">{index + 1}</td>
                                                    <td className="p-3 font-bold text-slate-700 dark:text-slate-200">{siswa.name}</td>
                                                    <td className="p-3 text-center">
                                                        <div className="flex justify-center bg-slate-100 dark:bg-slate-900 rounded-lg p-1 gap-1 w-fit mx-auto">
                                                            {['H', 'S', 'I', 'A'].map((s) => (
                                                                <button key={s} onClick={() => canInput && updateStatus(siswa.name, s)} disabled={!canInput} className={`w-6 h-6 rounded flex items-center justify-center font-bold transition-all ${status === s ? (s==='H'?'bg-emerald-500 text-white': s==='S'?'bg-yellow-400 text-white': s==='I'?'bg-blue-500 text-white':'bg-red-500 text-white') : 'text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>{s}</button>
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td className="p-3"><input type="text" value={ket} onChange={(e) => updateKet(siswa.name, e.target.value)} disabled={!canInput} className="w-full bg-transparent border-b border-slate-200 dark:border-slate-600 outline-none text-slate-600 dark:text-slate-300"/></td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                    {canInput && siswaList.length > 0 && (
                        <button onClick={handleSaveHarian} disabled={loading} className="w-full bg-[#002f6c] hover:bg-blue-800 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg">{loading ? <Loader2 className="animate-spin" size={18}/> : <><Save size={18}/> Simpan Absensi</>}</button>
                    )}
                </div>
            )}

            {/* REKAP BULANAN */}
            {viewMode === 'rekap' && (
                <div className="space-y-4 animate-in fade-in">
                    <div className="flex gap-2">
                        <select value={rekapMonth} onChange={e=>setRekapMonth(parseInt(e.target.value))} className="flex-1 border p-2 rounded text-xs dark:bg-slate-800 dark:border-slate-600 dark:text-white outline-none">
                            {[...Array(12)].map((_, i) => <option key={i} value={i+1}>{new Date(0, i).toLocaleString('id-ID', {month:'long'})}</option>)}
                        </select>
                        <select value={rekapYear} onChange={e=>setRekapYear(parseInt(e.target.value))} className="w-24 border p-2 rounded text-xs dark:bg-slate-800 dark:border-slate-600 dark:text-white outline-none">
                            {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                        <button className="bg-green-600 text-white p-2 rounded hover:bg-green-700"><FileSpreadsheet size={18}/></button>
                    </div>
                    <div className="border rounded-lg overflow-hidden dark:border-slate-600 bg-white dark:bg-slate-800">
                        <div className="max-h-[400px] overflow-auto custom-scrollbar">
                            {loading ? <div className="p-10 text-center"><Loader2 className="animate-spin mx-auto"/> Memuat Rekap...</div> : (
                                <table className="w-full text-xs text-left border-collapse">
                                    <thead className="bg-slate-100 dark:bg-slate-900 sticky top-0 z-20 shadow-sm text-slate-600 font-bold">
                                        <tr>
                                            <th className="p-2 border dark:border-slate-700 sticky left-0 z-30 bg-slate-100 dark:bg-slate-900 min-w-[150px]">Nama Siswa</th>
                                            {dateHeaders.map(d => <th key={d} className="p-1 text-center border dark:border-slate-700 min-w-[28px]">{d}</th>)}
                                            <th className="p-1 text-center border dark:border-slate-700 bg-emerald-50 text-emerald-700 min-w-[35px]">H</th>
                                            <th className="p-1 text-center border dark:border-slate-700 bg-yellow-50 text-yellow-700 min-w-[35px]">S</th>
                                            <th className="p-1 text-center border dark:border-slate-700 bg-blue-50 text-blue-700 min-w-[35px]">I</th>
                                            <th className="p-1 text-center border dark:border-slate-700 bg-red-50 text-red-700 min-w-[35px]">A</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                        {rekapData.map((row, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                                <td className="p-2 border dark:border-slate-700 font-bold sticky left-0 z-10 bg-white dark:bg-slate-800 dark:text-slate-200 whitespace-nowrap shadow-sm">{row.name}</td>
                                                {dateHeaders.map(d => {
                                                    const stat = row.dates[String(d)] || '-';
                                                    let colorClass = "text-slate-300", bgClass = "";
                                                    if (stat === 'H') { colorClass = "text-emerald-600 font-black"; bgClass = "bg-emerald-100"; }
                                                    if (stat === 'S') { colorClass = "text-yellow-600 font-black"; bgClass = "bg-yellow-100"; }
                                                    if (stat === 'I') { colorClass = "text-blue-600 font-black"; bgClass = "bg-blue-100"; }
                                                    if (stat === 'A') { colorClass = "text-red-600 font-black"; bgClass = "bg-red-100"; }
                                                    return <td key={d} className={`p-1 text-center border dark:border-slate-700 ${bgClass}`}><span className={colorClass}>{stat !== '-' ? stat : ''}</span></td>
                                                })}
                                                <td className="p-1 text-center border font-bold dark:border-slate-700 bg-emerald-50 text-emerald-700">{row.stats.H}</td>
                                                <td className="p-1 text-center border font-bold dark:border-slate-700 bg-yellow-50 text-yellow-700">{row.stats.S}</td>
                                                <td className="p-1 text-center border font-bold dark:border-slate-700 bg-blue-50 text-blue-700">{row.stats.I}</td>
                                                <td className="p-1 text-center border font-bold dark:border-slate-700 bg-red-50 text-red-700">{row.stats.A}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </ModalWrapper>
    );
}