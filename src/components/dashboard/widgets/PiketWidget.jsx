import React from 'react';
import { UserCheck, Edit3 } from 'lucide-react';

export default function PiketWidget({ piketHariIni, isLibur, canEdit, onEdit }) {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border-t-4 border-orange-500">
            <div className="px-5 py-3 border-b dark:border-slate-700 flex justify-between items-center">
                <h3 className="text-sm font-bold flex gap-2">
                    <UserCheck size={16} className="text-orange-500"/> Piket Hari Ini
                </h3>
                {canEdit && !isLibur && (
                    <button onClick={onEdit} className="text-slate-400 hover:text-orange-500">
                        <Edit3 size={14}/>
                    </button>
                )}
            </div>
            <div className="p-5 text-center min-h-[100px] flex items-center justify-center flex-col bg-slate-50/50 dark:bg-slate-900/50">
                {isLibur ? (
                    <span className="text-xs text-orange-500 font-bold bg-orange-50 px-3 py-1 rounded-full">Libur</span>
                ) : piketHariIni && piketHariIni.names ? (
                    <div className="flex flex-wrap gap-2 justify-center">
                        {piketHariIni.names.map((n, i) => (
                            <span key={i} className="bg-white dark:bg-slate-700 text-xs font-bold px-3 py-1 rounded shadow-sm border dark:border-slate-600 dark:text-slate-200">
                                {n}
                            </span>
                        ))}
                    </div>
                ) : (
                    <span className="text-xs text-slate-400 italic">Belum ada data piket.</span>
                )}
            </div>
        </div>
    );
}