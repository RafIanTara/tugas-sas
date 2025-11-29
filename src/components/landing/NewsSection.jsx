import React from 'react';
import { ArrowRight, Tag, Calendar } from 'lucide-react';

export default function NewsSection({ featuredNews, navigate }) {
    return (
        <section className="py-24 bg-slate-50 w-full">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-black text-[#002f6c] mb-2">Berita & Kegiatan</h2>
                        <p className="text-slate-500">Update terbaru seputar jurusan Teknik Komputer & Jaringan</p>
                    </div>
                    <button onClick={() => navigate('/berita')} className="bg-white text-[#002f6c] px-6 py-3 rounded-xl border border-slate-200 text-sm font-bold hover:shadow-md transition-all flex items-center gap-2">
                        Lihat Semua <ArrowRight size={16} />
                    </button>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                    {featuredNews.map((item) => (
                        <div key={item.id} onClick={() => navigate('/berita')} className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-xl transition-all cursor-pointer group border border-slate-100 flex flex-col h-full hover:-translate-y-1 duration-300">
                            <div className="h-56 bg-slate-200 overflow-hidden relative">
                                {item.image ? (
                                    <img src={item.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={item.title} />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-100"><Tag size={40} /></div>
                                )}
                                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg text-[10px] font-bold text-[#00994d] uppercase shadow-sm">
                                    {item.category}
                                </div>
                            </div>
                            <div className="p-6 flex flex-col flex-1">
                                <div className="flex items-center gap-2 text-xs text-slate-400 font-bold mb-3">
                                    <Calendar size={14} /> {item.dateString}
                                </div>
                                <h3 className="font-bold text-xl text-slate-800 mb-3 line-clamp-2 group-hover:text-[#002f6c] transition-colors leading-snug">
                                    {item.title}
                                </h3>
                                <span className="text-[#00994d] text-sm font-bold flex items-center gap-1 mt-auto">
                                    Baca Selengkapnya <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}