import React from 'react';
import { Megaphone, Edit3 } from 'lucide-react';

export default function InfoBoard({ infoData, canBroadcast, onEdit }) {
    const textInfo = infoData.find(i => i.id === 'info_utama')?.isi || "Belum ada info terbaru.";

    return (
        <div className="bg-white dark:bg-slate-800 border-l-[6px] border-[#002f6c] dark:border-blue-500 p-6 rounded-r-lg shadow-sm flex flex-col justify-between h-full">
            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                    <span className="bg-[#002f6c] text-white text-[10px] px-2 py-0.5 rounded font-bold uppercase flex items-center gap-1">
                        <Megaphone size={10} /> Info Sekolah
                    </span>
                </div>
                <p className="text-sm font-medium border-l-2 pl-3 dark:text-slate-200 whitespace-pre-line">
                    {textInfo}
                </p>
            </div>
            {canBroadcast && (
                <button onClick={onEdit} className="text-blue-500 text-xs font-bold mt-4 flex gap-1 w-fit hover:underline">
                    <Edit3 size={12}/> Edit Info
                </button>
            )}
        </div>
    );
}