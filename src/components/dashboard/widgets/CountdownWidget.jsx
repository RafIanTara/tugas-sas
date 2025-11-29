import React, { useState, useEffect } from 'react';
import { Calendar, Edit3, Clock } from 'lucide-react';

export default function CountdownWidget({ targetDate, title, canManage, onEdit }) {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        if (!targetDate) return;
        const iv = setInterval(() => {
            const diff = new Date(targetDate) - new Date();
            if (diff > 0) {
                setTimeLeft({
                    days: Math.floor(diff / (864e5)),
                    hours: Math.floor((diff % 864e5) / 36e5),
                    minutes: Math.floor((diff % 36e5) / 6e4),
                    seconds: Math.floor((diff % 6e4) / 1e3)
                });
            } else {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
            }
        }, 1000);
        return () => clearInterval(iv);
    }, [targetDate]);

    // Jika belum ada countdown diset
    if (!targetDate) {
        if (!canManage) return null; // Siswa gak liat apa2
        return (
            <div onClick={onEdit} className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 text-center cursor-pointer hover:border-[#002f6c] transition-colors group flex flex-col items-center justify-center h-32">
                <Clock size={24} className="text-slate-400 group-hover:text-[#002f6c] mb-2"/>
                <p className="text-sm font-bold text-slate-500 group-hover:text-[#002f6c]">Setup Hitung Mundur Event</p>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-r from-[#002f6c] to-[#004bb5] rounded-xl shadow-lg p-6 text-white relative overflow-hidden group">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 -mr-10 -mt-10 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>
            
            {/* EDIT BUTTON */}
            {canManage && (
                <button 
                    onClick={onEdit} 
                    className="absolute top-3 right-3 bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors z-20" 
                    title="Edit Countdown"
                >
                    <Edit3 size={16}/>
                </button>
            )}

            <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                <div className="text-center md:text-left flex-1 min-w-0">
                    <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                        <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded animate-pulse">Coming Soon</span>
                        <Calendar size={14} className="text-blue-200"/>
                    </div>
                    <h3 className="text-2xl font-black leading-tight mb-1 truncate">{title}</h3>
                    <p className="text-blue-200 text-xs md:text-sm">Persiapkan dirimu, jangan sampai terlewat!</p>
                </div>

                {/* Timer Boxes */}
                <div className="flex flex-wrap justify-center gap-2">
                    {['Hari', 'Jam', 'Mnt', 'Dtk'].map((label, idx) => {
                        const val = [timeLeft.days, timeLeft.hours, timeLeft.minutes, timeLeft.seconds][idx];
                        return (
                            <div key={label} className="bg-white/10 backdrop-blur-md border border-white/20 p-2 rounded-lg text-center w-16">
                                <span className="block text-xl font-black">{val}</span>
                                <span className="text-[9px] uppercase font-bold text-blue-200">{label}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}