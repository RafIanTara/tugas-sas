import React from 'react';
import { ArrowRight, BookOpen, Wifi } from 'lucide-react';

export default function HeroSection({ navigate, user, onDashboardClick }) {
    return (
        <header className="relative bg-slate-50 pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden w-full">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-200/40 rounded-full blur-[100px] -mr-20 -mt-20 mix-blend-multiply"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-green-200/40 rounded-full blur-[100px] -ml-20 -mb-20 mix-blend-multiply"></div>
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                    <div className="text-center lg:text-left space-y-8">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-[#002f6c] text-xs font-bold uppercase tracking-wide shadow-sm">
                            <span className="w-2 h-2 rounded-full bg-[#00994d] animate-pulse"></span> Portal Resmi Jurusan TKJ
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-[#002f6c] leading-tight tracking-tight">
                            Masa Depan <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00994d] to-emerald-500">Digital</span> Dimulai.
                        </h1>
                        <p className="text-lg text-slate-600 leading-relaxed max-w-lg mx-auto lg:mx-0 font-medium">
                            Pusat informasi, pembelajaran, dan kreativitas siswa Teknik Komputer & Jaringan SMK Muhammadiyah 1 Metro.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
                            <button onClick={onDashboardClick} className="bg-[#002f6c] hover:bg-[#001a3d] text-white px-8 py-4 rounded-xl font-bold shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2">
                                {user ? 'Buka Dashboard Kelas' : 'Login Sekarang'} <ArrowRight size={18} />
                            </button>
                            <button onClick={() => navigate('/galeri')} className="bg-white border border-slate-200 text-[#002f6c] hover:bg-slate-50 px-8 py-4 rounded-xl font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2">
                                <BookOpen size={18} /> Galeri Foto
                            </button>
                        </div>
                    </div>
                    <div className="relative hidden lg:block group">
                        <div className="relative rounded-3xl overflow-hidden shadow-2xl border-[6px] border-white rotate-2 group-hover:rotate-0 transition-transform duration-700 bg-slate-200">
                            <img src="https://smkmuh1metro.sch.id/wp-content/uploads/2017/02/simulasi4_mini.jpg" alt="Lab TKJ" className="w-full h-[500px] object-cover scale-110 group-hover:scale-100 transition-transform duration-700" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#002f6c]/90 via-transparent to-transparent opacity-90"></div>
                            <div className="absolute bottom-8 left-8 text-white max-w-xs">
                                <div className="flex items-center gap-2 mb-2">
                                    <Wifi size={18} className="text-[#00994d]" /><span className="text-xs font-bold uppercase tracking-wider text-green-300">Fasilitas Utama</span>
                                </div>
                                <p className="font-bold text-2xl leading-tight">Laboratorium Jaringan Standar Industri</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}