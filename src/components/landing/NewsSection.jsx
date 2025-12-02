import React from 'react';
import { ArrowRight, Tag, Calendar } from 'lucide-react';

export default function NewsSection({ featuredNews, navigate }) {
    return (
        // UBAH BACKGROUND: Gradient tipis hijau ke putih
        <section className="py-16 md:py-24 bg-gradient-to-b from-[#f0fdf4] to-white w-full border-t border-emerald-50 relative z-10">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
                    <div>
                        <span className="text-[#00994d] font-bold tracking-widest text-xs uppercase mb-2 block">Informasi Sekolah</span>
                        <h2 className="text-3xl md:text-4xl font-black text-[#002f6c] mb-2">Berita & Kegiatan</h2>
                        <p className="text-slate-500 text-sm md:text-base">Update terbaru seputar jurusan Teknik Komputer & Jaringan</p>
                    </div>
                    
                    <button onClick={() => navigate('/berita')} className="hidden md:flex bg-white text-[#002f6c] px-6 py-3 rounded-xl border border-blue-100 text-sm font-bold hover:bg-[#002f6c] hover:text-white transition-all items-center gap-2 shadow-sm">
                        Lihat Semua <ArrowRight size={16} />
                    </button>
                </div>

                {/* Grid Content */}
                <div className="grid md:grid-cols-3 gap-8">
                    {featuredNews.map((item) => (
                        <div key={item.id} onClick={() => navigate('/berita')} className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-xl hover:shadow-emerald-500/10 transition-all cursor-pointer group border border-slate-100 flex flex-col h-full hover:-translate-y-1 duration-300">
                            {/* Image Wrapper */}
                            <div className="h-56 bg-slate-200 overflow-hidden relative">
                                {item.image ? (
                                    <img src={item.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={item.title} />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-100"><Tag size={40} /></div>
                                )}
                                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur px-3 py-1 rounded-lg text-[10px] font-black text-[#00994d] uppercase shadow-sm tracking-wide">
                                    {item.category}
                                </div>
                            </div>

                            {/* Text Content */}
                            <div className="p-6 flex flex-col flex-1 relative">
                                <div className="flex items-center gap-2 text-xs text-slate-400 font-bold mb-3">
                                    <Calendar size={14} className="text-[#00994d]" /> {item.dateString}
                                </div>
                                <h3 className="font-bold text-lg md:text-xl text-slate-800 mb-3 line-clamp-2 group-hover:text-[#002f6c] transition-colors leading-snug">
                                    {item.title}
                                </h3>
                                <span className="text-[#00994d] text-xs font-bold flex items-center gap-1 mt-auto group-hover:gap-2 transition-all">
                                    Baca Selengkapnya <ArrowRight size={14} />
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Mobile Button (Muncul hanya di HP di bawah) */}
                <div className="mt-8 md:hidden">
                    <button onClick={() => navigate('/berita')} className="w-full bg-white text-[#002f6c] px-6 py-4 rounded-xl border border-blue-100 text-sm font-bold hover:bg-slate-50 transition-all flex justify-center items-center gap-2 shadow-sm">
                        Lihat Semua Berita <ArrowRight size={16} />
                    </button>
                </div>
            </div>
        </section>
    );
}