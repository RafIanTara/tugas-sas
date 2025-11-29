import React from 'react';
import { Hourglass, Edit3 } from 'lucide-react';

export default function EventBanner({ landingCountdown, timeLeftEvent, isAdmin, onEdit }) {
    // Jika tidak ada target date DAN bukan admin, sembunyikan banner
    if ((!landingCountdown.targetDate || new Date(landingCountdown.targetDate) <= new Date()) && !isAdmin) return null;

    return (
        <div className="bg-white py-8 border-b border-slate-100 w-full">
            <div className="max-w-7xl mx-auto px-4">
                <div className="bg-gradient-to-r from-[#00994d] to-emerald-600 rounded-2xl p-1 shadow-lg relative overflow-hidden group">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                    
                    {/* TOMBOL EDIT (Hanya Admin) */}
                    {isAdmin && (
                        <button onClick={onEdit} className="absolute top-3 right-3 z-30 bg-white/20 hover:bg-white text-white hover:text-[#00994d] p-2 rounded-full transition-all backdrop-blur-sm shadow-md cursor-pointer" title="Edit Countdown">
                            <Edit3 size={18}/>
                        </button>
                    )}

                    <div className="bg-[#002f6c] rounded-xl p-6 md:p-8 relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="text-center md:text-left flex-1">
                            <div className="inline-flex items-center gap-2 bg-white/10 text-emerald-300 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2 border border-emerald-500/30">
                                <Hourglass size={12} className="animate-spin-slow"/> Sedang Berjalan
                            </div>
                            <h3 className="text-xl md:text-2xl font-black text-white leading-tight">
                                {landingCountdown.title || "Belum ada Event"}
                            </h3>
                            {isAdmin && !landingCountdown.targetDate && (
                                <p className="text-xs text-yellow-300 mt-1">*Klik ikon pensil di pojok kanan untuk set waktu.</p>
                            )}
                        </div>
                        
                        {landingCountdown.targetDate ? (
                            <div className="flex gap-3 justify-center">
                                {[{ l: 'HARI', v: timeLeftEvent.d }, { l: 'JAM', v: timeLeftEvent.h }, { l: 'MENIT', v: timeLeftEvent.m }, { l: 'DETIK', v: timeLeftEvent.s }].map((item, i) => (
                                    <div key={i} className="flex flex-col items-center">
                                        <div className="w-12 h-12 md:w-14 md:h-14 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center shadow-inner backdrop-blur-sm">
                                            <span className="text-lg md:text-xl font-black text-white tabular-nums">{item.v}</span>
                                        </div>
                                        <span className="text-[8px] font-bold text-emerald-400 mt-1 tracking-wider">{item.l}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-white/50 text-sm italic">Waktu belum diset</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}