import React from 'react';

export default function RunningText() {
    return (
        // Wrapper Background Hijau Khas (Full Width)
        <div className="w-full bg-[#00994d] border-b border-[#007a3d] text-white overflow-hidden py-2 relative z-30 shadow-sm">
            
            {/* Container Animasi Marquee */}
            <div className="animate-marquee whitespace-nowrap flex gap-16 md:gap-32 font-bold text-xs md:text-sm tracking-wide items-center uppercase">
                
                {/* --- ISI TEKS BERITA DI SINI --- */}
                <span className="flex items-center gap-2">
                    📢 Penerimaan Peserta Didik Baru (PPDB) Tahun 2025 Telah Dibuka!
                </span>
                <span className="flex items-center gap-2 text-yellow-300">
                    🏆 Selamat Kepada Tim Robotik TKJ Meraih Juara 1 Tingkat Nasional
                </span>
                <span className="flex items-center gap-2">
                    📝 Jadwal Ujian Kompetensi Keahlian (UKK) Dimulai Tanggal 20 Mei 2025
                </span>
                <span className="flex items-center gap-2 text-blue-200">
                    💻 Kunjungi Stand Pameran Karya Siswa di Aula Utama
                </span>
                {/* Duplikasi konten agar looping terlihat nyambung (seamless) */}
                <span className="flex items-center gap-2">
                    📢 Penerimaan Peserta Didik Baru (PPDB) Tahun 2025 Telah Dibuka!
                </span>
                 <span className="flex items-center gap-2 text-yellow-300">
                    🏆 Selamat Kepada Tim Robotik TKJ Meraih Juara 1 Tingkat Nasional
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