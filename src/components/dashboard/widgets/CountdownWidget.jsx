import React, { useState, useEffect } from 'react';
import { Edit3, Clock, Rocket } from 'lucide-react';

export default function CountdownWidget({ targetDate, title, canManage, onEdit }) {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        if (!targetDate) return;

        const interval = setInterval(() => {
            const now = new Date();
            const target = new Date(targetDate);
            const diff = target - now;

            if (diff > 0) {
                setTimeLeft({
                    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((diff / 1000 / 60) % 60),
                    seconds: Math.floor((diff / 1000) % 60),
                });
            } else {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                clearInterval(interval);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [targetDate]);

    // Jika tidak ada event
    if (!targetDate && !canManage) return null;

    if (!targetDate && canManage) return (
        <div onClick={onEdit} className="bg-white dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:border-blue-500 hover:text-blue-500 transition-all group h-full min-h-[160px]">
            <Clock size={24} className="mb-2 group-hover:scale-110 transition-transform"/>
            <span className="text-xs font-bold">Set Countdown Event</span>
        </div>
    );

    return (
        <div className="bg-gradient-to-br from-[#002f6c] to-blue-900 rounded-xl p-5 text-white relative overflow-hidden shadow-lg group">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/20 rounded-full blur-xl -ml-10 -mb-5 pointer-events-none"></div>

            {/* Tombol Edit (Hanya muncul jika punya izin) */}
            {canManage && (
                <button 
                    onClick={onEdit} 
                    className="absolute top-3 right-3 p-1.5 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-sm transition-all z-20"
                >
                    <Edit3 size={14} className="text-white"/>
                </button>
            )}

            {/* Konten Utama: FLEX COL (Vertikal) biar muat di sidebar */}
            <div className="relative z-10 flex flex-col h-full justify-between gap-4">
                
                {/* 1. Header Title */}
                <div>
                    <div className="inline-flex items-center gap-1.5 bg-white/10 px-2 py-0.5 rounded text-[10px] font-bold text-blue-200 mb-2 border border-white/10">
                        <Rocket size={10} className="animate-pulse"/> Coming Soon
                    </div>
                    <h3 className="text-lg font-black leading-tight line-clamp-2" title={title}>
                        {title || "Event Mendatang"}
                    </h3>
                    <p className="text-[10px] text-blue-200 mt-1 opacity-80">
                        Persiapkan dirimu, jangan sampai terlewat!
                    </p>
                </div>

                {/* 2. Timer Grid */}
                <div className="grid grid-cols-4 gap-2">
                    <TimeBox val={timeLeft.days} label="HARI" />
                    <TimeBox val={timeLeft.hours} label="JAM" />
                    <TimeBox val={timeLeft.minutes} label="MNT" />
                    <TimeBox val={timeLeft.seconds} label="DTK" />
                </div>
            </div>
        </div>
    );
}

// Komponen Kecil untuk Kotak Waktu
function TimeBox({ val, label }) {
    return (
        <div className="flex flex-col items-center bg-white/10 border border-white/10 rounded-lg p-1.5 backdrop-blur-sm">
            <span className="text-sm md:text-base font-black tabular-nums tracking-tight">
                {String(val).padStart(2, '0')}
            </span>
            <span className="text-[8px] font-bold text-blue-200 mt-0.5">{label}</span>
        </div>
    );
}