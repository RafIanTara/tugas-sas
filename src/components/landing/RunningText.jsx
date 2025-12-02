import React from 'react';

export default function RunningText() {
    return (
        // Wrapper Background Hijau Khas (Full Width)
        <div className="w-full bg-[#00994d] border-b border-[#007a3d] text-white overflow-hidden py-2 relative z-30 shadow-sm">
            
            {/* Container Animasi Marquee */}
            <div className="animate-marquee whitespace-nowrap flex gap-16 md:gap-32 font-bold text-xs md:text-sm tracking-wide items-center uppercase">
                
                {/* --- ISI TEKS BERITA DI SINI --- */}
                <span className="flex items-center gap-2">
                    📢 Gtw mau isi apaan, intinya, Welcome to Landing Page TKJ
                </span>
                

            </div>

            {/* Style CSS Internal untuk Animasi */}
            <style>{`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); } 
                }
                .animate-marquee {
                    display: flex;
                    width: max-content;
                    animation: marquee 30s linear infinite;
                }
                /* Pause animasi saat mouse diarahkan (hover) */
                .animate-marquee:hover {
                    animation-play-state: paused;
                }
            `}</style>
        </div>
    );
}