import React from 'react';
import { UserMinus, Calendar, ChevronRight } from 'lucide-react';

export default function AbsenWidget({ data, canEdit, onEdit, onViewDetail }) {
    // 1. Logika Pinter untuk hitung stats (Bisa baca Format Baru & Lama)
    let stats = { hadir: 0, sakit: 0, izin: 0, alpha: 0 };

    if (data) {
        if (data.stats) {
            // SKENARIO A: Data Format Baru (Sudah ada ringkasan stats dari Modal)
            stats = data.stats;
        } else if (Array.isArray(data.data)) {
            // SKENARIO B: Data Format Baru (Hitung manual dari array siswa)
            const list = data.data;
            stats = {
                hadir: list.filter(s => s.status === 'H').length,
                sakit: list.filter(s => s.status === 'S').length,
                izin: list.filter(s => s.status === 'I').length,
                alpha: list.filter(s => s.status === 'A').length
            };
        } else if (data.sakit && typeof data.sakit === 'string') {
            // SKENARIO C: Data Format Lama (String dipisah koma)
            const count = (str) => (!str || str === '-') ? 0 : str.split(',').filter(x => x.trim()).length;
            stats = {
                hadir: 0, // Format lama gak nyatet hadir
                sakit: count(data.sakit),
                izin: count(data.izin),
                alpha: count(data.alpha)
            };
        }
    }

    const today = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' });

    return (
        <div className="bg-white dark:bg-slate-800 border-t-4 border-blue-600 rounded-lg shadow-sm p-5 relative overflow-hidden">
            <div className="flex justify-between items-start mb-4 relative z-10">
                <div>
                    <h3 className="font-bold text-sm flex gap-2 items-center dark:text-white">
                        <UserMinus size={16} className="text-blue-600"/> Presensi Siswa
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                        <Calendar size={10}/> {today}
                    </p>
                </div>
                {canEdit && (
                    <button onClick={onEdit} className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-bold hover:bg-blue-100 transition-colors">
                        Isi Absen
                    </button>
                )}
            </div>

            <div className="grid grid-cols-4 gap-2 text-center relative z-10">
                <div className="bg-emerald-50 dark:bg-emerald-900/20 p-2 rounded-lg">
                    <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">{stats.hadir}</span>
                    <span className="text-[9px] text-slate-500 font-bold block">Hadir</span>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded-lg">
                    <span className="text-xl font-black text-yellow-600 dark:text-yellow-400">{stats.sakit}</span>
                    <span className="text-[9px] text-slate-500 font-bold block">Sakit</span>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg">
                    <span className="text-xl font-black text-blue-600 dark:text-blue-400">{stats.izin}</span>
                    <span className="text-[9px] text-slate-500 font-bold block">Izin</span>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">
                    <span className="text-xl font-black text-red-600 dark:text-red-400">{stats.alpha}</span>
                    <span className="text-[9px] text-slate-500 font-bold block">Alpha</span>
                </div>
            </div>

            <button onClick={onViewDetail} className="w-full mt-4 pt-3 border-t dark:border-slate-700 text-slate-500 hover:text-blue-600 text-xs font-bold flex justify-between items-center group">
                Lihat Rekap Bulanan <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform"/>
            </button>
        </div>
    );
}