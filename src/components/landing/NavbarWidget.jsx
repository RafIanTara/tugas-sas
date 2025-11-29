import React from 'react';
import { Clock } from 'lucide-react';

export default function NavbarWidget({ currentTime, nextPrayer }) {
    return (
        <div className="hidden xl:flex items-center justify-center">
            <div className="flex items-center bg-slate-50/90 backdrop-blur-md border border-slate-200 rounded-full shadow-sm px-4 py-1.5 gap-3">
                <div className="flex items-center gap-2">
                    <Clock size={16} className="text-[#002f6c]" />
                    <span className="text-sm font-black text-[#002f6c] font-mono tracking-tight whitespace-nowrap">
                        {currentTime} <span className="text-[10px] text-slate-400 font-bold">WIB</span>
                    </span>
                </div>
                <div className="w-px h-4 bg-slate-300"></div>
                <div className="flex items-center gap-1.5 whitespace-nowrap">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Menuju</span>
                    <span className="text-sm font-bold text-[#00994d]">{nextPrayer.name}</span>
                    <span className="bg-green-100 text-[#00994d] text-[10px] font-bold px-1.5 py-0.5 rounded border border-green-200">
                        {nextPrayer.time}
                    </span>
                </div>
            </div>
        </div>
    );
}