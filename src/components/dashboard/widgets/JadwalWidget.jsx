import React from 'react';
import { BookOpen, Edit3 } from 'lucide-react';

export default function JadwalWidget({ jadwal, hariPilihan, setHariPilihan, isLibur, canEdit, onEdit }) {
    const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border-t-4 border-[#002f6c]">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded text-[#002f6c]">
                        <BookOpen size={20}/>
                    </div>
                    <div>
                        <h2 className="font-bold text-lg dark:text-white">Jadwal</h2>
                        <p className="text-xs font-bold uppercase text-[#002f6c] dark:text-blue-400">{hariPilihan}</p>
                    </div>
                </div>
                <div className="flex gap-1 flex-wrap justify-end">
                    {days.map(h => (
                        <button 
                            key={h} 
                            onClick={() => setHariPilihan(h)} 
                            className={`px-3 py-1 rounded text-[10px] font-bold transition-colors ${
                                hariPilihan === h 
                                ? 'bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-blue-200' 
                                : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                            }`}
                        >
                            {h}
                        </button>
                    ))}
                    {canEdit && !isLibur && (
                        <button onClick={onEdit} className="px-2 bg-slate-100 dark:bg-slate-700 rounded ml-2 hover:text-blue-500">
                            <Edit3 size={12}/>
                        </button>
                    )}
                </div>
            </div>
            
            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border dark:border-slate-700">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {isLibur ? (
                        <div className="col-span-full py-6 text-center text-xs text-slate-400">
                            Libur Wak, healing dulu. 🏖️
                        </div>
                    ) : jadwal ? (
                        jadwal.mapel.map((m, i) => (
                            <div key={i} className="p-3 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded shadow-sm text-xs font-bold flex gap-2 dark:text-slate-200">
                                <span className="text-[#002f6c] dark:text-blue-400">{i+1}.</span> {m}
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full text-center text-xs text-slate-400">
                            Jadwal Kosong.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}