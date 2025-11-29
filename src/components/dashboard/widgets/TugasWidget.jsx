import React from 'react';
import { CheckSquare, Plus, Trash2 } from 'lucide-react';

export default function TugasWidget({ daftarTugas, canManage, onAdd, onToggle, onDelete }) {
    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border-t-4 border-purple-600">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded text-purple-700">
                        <CheckSquare size={20}/>
                    </div>
                    <h3 className="font-bold dark:text-white">Tugas</h3>
                </div>
                {canManage && (
                    <button onClick={onAdd} className="bg-[#002f6c] hover:bg-blue-800 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex gap-1 items-center transition-colors">
                        <Plus size={14}/> Tambah
                    </button>
                )}
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                {daftarTugas.length === 0 && (
                    <div className="text-center py-6 text-xs text-slate-400 border border-dashed rounded bg-slate-50 dark:bg-slate-900/50 dark:border-slate-700">
                        Tidak ada tugas (Aman).
                    </div>
                )}
                {daftarTugas.map(t => (
                    <div 
                        key={t.id} 
                        onClick={() => canManage && onToggle(t.id, t.selesai)} 
                        className={`p-3 rounded-lg border dark:border-slate-700 flex justify-between items-center transition-all ${
                            t.selesai 
                            ? 'bg-slate-50 dark:bg-slate-900 opacity-60' 
                            : 'bg-white dark:bg-slate-700 shadow-sm'
                        } ${canManage ? 'cursor-pointer hover:border-purple-300' : ''}`}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                                t.selesai ? 'bg-green-500 border-green-500' : 'bg-white dark:bg-slate-600'
                            }`}>
                                {t.selesai && <CheckSquare size={10} className="text-white"/>}
                            </div>
                            <div>
                                <h4 className={`font-bold text-sm dark:text-slate-200 ${t.selesai && 'line-through text-slate-400'}`}>
                                    {t.judul}
                                </h4>
                                <span className="text-[10px] bg-slate-100 dark:bg-slate-900 px-2 rounded border dark:border-slate-600 text-slate-500">
                                    {t.mapel}
                                </span>
                            </div>
                        </div>
                        {canManage && (
                            <button 
                                onClick={(e) => onDelete(e, t.id)} 
                                className="text-slate-300 hover:text-red-500 p-1 rounded hover:bg-red-50 transition-colors"
                            >
                                <Trash2 size={14}/>
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}