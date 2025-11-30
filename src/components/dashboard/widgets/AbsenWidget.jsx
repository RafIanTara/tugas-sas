import React from 'react';
import { UserMinus, Calendar, ChevronRight, BarChart3 } from 'lucide-react';

export default function AbsenWidget({ data, canEdit, onEdit, onViewDetail }) {
    // 1. Logika Cerdas: Deteksi Format Data (Lama vs Baru)
    let stats = { hadir: 0, sakit: 0, izin: 0, alpha: 0 };

    if (data) {
        if (data.stats) {
            // SKENARIO A: Format Baru (Langsung baca statistik dari Modal Baru)
            stats = data.stats;
        } else if (Array.isArray(data.data)) {
            // SKENARIO B: Format Baru (Hitung manual dari array jika stats hilang)
            const list = data.data;
            stats = {
                hadir: list.filter(s => s.status === 'H').length,
                sakit: list.filter(s => s.status === 'S').length,
                izin: list.filter(s => s.status === 'I').length,
                alpha: list.filter(s => s.status === 'A').length
            };
        } else if (typeof data.sakit === 'string') {
            // SKENARIO C: Format Lama (String dipisah koma)
            // Fallback untuk data sebelum update sistem
            const count = (str) => (!str || str === '-') ? 0 : str.split(',').filter(x => x.trim()).length;
            stats = {
                hadir: 0, // Format lama tidak mencatat jumlah hadir
                sakit: count(data.sakit),
                izin: count(data.izin),
                alpha: count(data.alpha)
            };
        }
    }

    const today = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' });

    return (
        <div className="bg-white dark:bg-slate-800 border-t-4 border-blue-600 rounded-xl shadow-sm p-5 relative overflow-hidden transition-colors duration-300">
            {/* Header Widget */}
            <div className="flex justify-between items-start mb-5 relative z-10">
                <div>
                    <h3 className="font-bold text-sm flex gap-2 items-center text-slate-800 dark:text-white">
                        <UserMinus size={18} className="text-blue-600"/> 
                        Presensi Hari Ini
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1 font-medium">
                        <Calendar size={10}/> {today}
                    </p>
                </div>
                
                {/* Tombol "Isi Absen" HANYA Muncul jika punya izin (Guru/Admin) */}
                {canEdit && (
                    <button 
                        onClick={onEdit} 
                        className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-[10px] font-bold hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                    >
                        Isi Jurnal
                    </button>
                )}
            </div>

            {/* Grid Statistik */}
            <div className="grid grid-cols-4 gap-3 text-center relative z-10">
                {/* HADIR */}
                <div className="bg-emerald-50 dark:bg-emerald-900/20 p-2 rounded-xl border border-emerald-100 dark:border-emerald-800/30">
                    <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 block mb-1">
                        {stats.hadir}
                    </span>
                    <span className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Hadir</span>
                </div>

                {/* SAKIT */}
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded-xl border border-yellow-100 dark:border-yellow-800/30">
                    <span className="text-xl font-black text-yellow-600 dark:text-yellow-400 block mb-1">
                        {stats.sakit}
                    </span>
                    <span className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Sakit</span>
                </div>

                {/* IZIN */}
                <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-xl border border-blue-100 dark:border-blue-800/30">
                    <span className="text-xl font-black text-blue-600 dark:text-blue-400 block mb-1">
                        {stats.izin}
                    </span>
                    <span className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Izin</span>
                </div>

                {/* ALPHA */}
                <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded-xl border border-red-100 dark:border-red-800/30">
                    <span className="text-xl font-black text-red-600 dark:text-red-400 block mb-1">
                        {stats.alpha}
                    </span>
                    <span className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Alpha</span>
                </div>
            </div>

            {/* Tombol Detail (Muncul untuk Siswa & Guru) */}
            <button 
                onClick={onViewDetail} 
                className="w-full mt-5 pt-3 border-t dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 text-xs font-bold flex justify-between items-center group transition-colors"
            >
                <span className="flex items-center gap-2">
                    <BarChart3 size={14}/> Lihat Rekap Bulanan
                </span>
                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform"/>
            </button>
        </div>
    );
}