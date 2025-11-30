import React from 'react';
import { UserPlus, ArrowRight, Sparkles } from 'lucide-react';

export default function JoinCTA() {
    return (
        <section className="py-16 bg-slate-50 w-full relative overflow-hidden">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="bg-[#002f6c] rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8 group">
                    
                    {/* Hiasan Background (Biar gak kosong kayak hati) */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-white/10 transition-all duration-700"></div>
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#00994d]/20 rounded-full blur-2xl -ml-10 -mb-10"></div>

                    {/* Konten Teks */}
                    <div className="relative z-10 max-w-xl space-y-4">
                        <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-emerald-300 text-xs font-bold uppercase tracking-wider border border-emerald-500/30">
                            <Sparkles size={14} className="animate-pulse"/> Penerimaan Siswa Baru
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black text-white leading-tight">
                            Siap Menjadi Ahli IT Masa Depan?
                        </h2>
                        <p className="text-blue-100 text-sm md:text-base leading-relaxed">
                            Jangan ragu untuk melangkah. Gabung bersama Teknik Komputer & Jaringan SMK Muhammadiyah 1 Metro. Fasilitas lengkap, guru kompeten, dan siap kerja!
                        </p>
                    </div>

                    {/* Tombol Aksi */}
                    <div className="relative z-10">
                        <a 
                            href="https://ppdb.smkmuh1metro.sch.id/login" 
                            target="_blank" 
                            rel="noreferrer"
                            className="inline-flex items-center justify-center gap-3 bg-[#00994d] hover:bg-emerald-600 text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-emerald-500/30 transition-all transform hover:-translate-y-1 group/btn"
                        >
                            <UserPlus size={20}/>
                            <span>Daftar PPDB Sekarang</span>
                            <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform"/>
                        </a>
                        
                    </div>

                </div>
            </div>
        </section>
    );
}