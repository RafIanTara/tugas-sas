import React from 'react';
import { useNavigate } from 'react-router-dom';
import imgDaus from '../assets/images/daus.jpg';
import {
    Github,
    Instagram,
    MessageCircle,
    User,
    ArrowLeft,
    Code2,
    Cpu,
    Sparkles
} from 'lucide-react';

export default function InfoAnggotaPage() {
    const navigate = useNavigate();

    // --- DATA ANGGOTA (TIDAK DIUBAH SAMA SEKALI) ---
    const members = [
        {
            id: 1,
            name: "Daus (Ketua)",
            role: "Fullstack Developer",
            image: imgDaus,
            github: "https://github.com/RafIanTara/",
            wa: "https://wa.me/62895632876627",
            instagram: "https://www.instagram.com/firdaus_ke_1?igsh=MTJnNXNwbmYzeXJmcQ==",
            desc: "Bertanggung jawab atas frontend dan backend sederhana.",
            webProfil: "https://rafiantara.fun/",
            linkBiodata: "https://biodata-blush.vercel.app/"
        },
        {
            id: 2,
            name: "Ravita",
            role: "UI/UX Designer",
            image: "https://ui-avatars.com/api/?name=Ravita&background=00994d&color=fff",
            github: "https://github.com/",
            wa: "https://wa.me/628xxxxxx",
            instagram: "https://instagram.com/",
            desc: "Mendesain antarmuka yang user-friendly dan estetis.",
            linkBiodata: ""
        },
        {
            id: 3,
            name: "Dicky ",
            role: "Frontend Engineer",
            image: "https://ui-avatars.com/api/?name=DC&background=0f172a&color=fff",
            github: "https://github.com/",
            wa: "https://wa.me/628xxxxxx",
            instagram: "https://instagram.com/",
            desc: "Mengimplementasikan desain ke dalam kode React.",
            linkBiodata: ""
        },
    ];

    const handleBiodataClick = (memberId) => {
        alert(`Membuka biodata detail untuk ID: ${memberId}`);
    };

    return (
        <div className="min-h-screen bg-slate-50/50 pb-20 font-sans text-slate-800">

            {/* --- HEADER / NAVBAR --- */}
            <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-slate-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <button
                            onClick={() => navigate('/')}
                            className="group flex items-center gap-2 text-slate-500 hover:text-[#002f6c] transition-all duration-300 font-bold text-sm"
                        >
                            <div className="p-1.5 rounded-full group-hover:bg-blue-50 transition-colors">
                                <ArrowLeft size={20} />
                            </div>
                            <span>Kembali</span>
                        </button>
                        <div className="flex items-center gap-2">
                            {/* Sedikit hiasan titik hijau khas */}
                            <div className="w-2 h-2 rounded-full bg-[#00994d] animate-pulse"></div>
                            <div className="text-[#002f6c] font-black text-lg tracking-tight font-serif">
                                ANGGOTA KELOMPOK
                            </div>
                        </div>
                        <div className="w-10"></div>
                    </div>
                </div>
            </div>

            {/* --- HERO SECTION (STYLE MUHAMMADIYAH: NAVY & GOLDEN LIGHT) --- */}
            <div className="relative bg-[#002f6c] text-white py-16 px-4 mb-12 overflow-hidden">
                {/* Background Pattern Abstrak (Cahaya Surya) */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full opacity-20 pointer-events-none">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent blur-2xl"></div>
                </div>
                {/* Dekorasi Garis Hijau */}
                <div className="absolute bottom-0 left-0 w-full h-1.5 bg-[#00994d]"></div>

                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center gap-2 bg-[#00994d]/20 border border-[#00994d]/50 rounded-full px-4 py-1.5 mb-6 backdrop-blur-sm">
                        <Sparkles size={14} className="text-[#00994d] text-green-300" />
                        <span className="text-xs font-bold text-green-100 tracking-wide uppercase">The Builders</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight leading-tight">
                        The <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-green-200">Developers</span>
                    </h1>
                    <p className="text-slate-300 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
                        Orang-orang dibalik layar yang membangun sistem ini dengan dedikasi tinggi.
                    </p>
                </div>
            </div>

            {/* --- GRID ANGGOTA --- */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {members.map((member) => (
                        <div
                            key={member.id}
                            className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 border-t-4 border-t-[#00994d] overflow-hidden hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group relative"
                        >
                            {/* Hiasan Background Card Header */}
                            <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-slate-50 to-white z-0"></div>

                            <div className="relative z-10 p-6 flex flex-col items-center text-center">
                                {/* Foto Profile */}
                                <div className="relative mb-5">
                                    <div className="w-28 h-28 rounded-full p-1 bg-gradient-to-br from-[#002f6c] via-[#00994d] to-[#002f6c] shadow-lg">
                                        <img
                                            src={member.image}
                                            alt={member.name}
                                            className="w-full h-full rounded-full object-cover border-4 border-white bg-slate-100"
                                        />
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 bg-[#002f6c] text-white p-2 rounded-full border-4 border-white shadow-md">
                                        <Code2 size={16} />
                                    </div>
                                </div>

                                {/* Nama & Role */}
                                <h3 className="text-xl font-bold text-slate-800 group-hover:text-[#002f6c] transition-colors mb-1">
                                    {member.name}
                                </h3>
                                <span className="inline-block px-3 py-1 rounded-md bg-[#00994d]/10 text-[#00994d] text-xs font-bold uppercase tracking-wider border border-[#00994d]/20">
                                    {member.role}
                                </span>
                                <p className="text-slate-500 text-sm mt-4 leading-relaxed px-2 min-h-[40px]">
                                    {member.desc}
                                </p>
                            </div>

                            {/* Social Media Links */}
                            <div className="px-6 pb-2">
                                <div className="flex justify-center gap-3 mb-6">
                                    <a href={member.github} target="_blank" rel="noreferrer" className="p-2.5 bg-slate-50 text-slate-500 rounded-full hover:bg-slate-800 hover:text-white transition-all duration-300 border border-slate-200 hover:border-slate-800 hover:scale-110">
                                        <Github size={18} />
                                    </a>
                                    <a href={member.wa} target="_blank" rel="noreferrer" className="p-2.5 bg-slate-50 text-slate-500 rounded-full hover:bg-[#25D366] hover:text-white transition-all duration-300 border border-slate-200 hover:border-[#25D366] hover:scale-110">
                                        <MessageCircle size={18} />
                                    </a>
                                    <a href={member.instagram} target="_blank" rel="noreferrer" className="p-2.5 bg-slate-50 text-slate-500 rounded-full hover:bg-pink-600 hover:text-white transition-all duration-300 border border-slate-200 hover:border-pink-600 hover:scale-110">
                                        <Instagram size={18} />
                                    </a>
                                </div>

                                {/* Buttons Action */}
                                <div className="flex flex-col gap-3 pb-6">
                                    {member.webProfil && (
                                        <a
                                            href={member.webProfil}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="w-full py-2.5 rounded-xl border-2 border-[#002f6c] text-[#002f6c] hover:bg-[#002f6c] hover:text-white text-sm font-bold flex items-center justify-center gap-2 transition-all duration-300 shadow-sm hover:shadow-md"
                                        >
                                            <Cpu size={18} />
                                            <span>Buka Web Profil</span>
                                        </a>
                                    )}
                                    <a
                                        href={member.linkBiodata}
                                        target="_blank"
                                        rel="noreferrer"
                                        className={`w-full py-3 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2 transition-all duration-300 shadow-md hover:shadow-lg active:scale-95
                                            ${member.webProfil 
                                                ? 'bg-[#00994d] hover:bg-[#007a3d] shadow-green-900/10' // Jika ada 2 tombol, yang biodata jadi Hijau (Kontras)
                                                : 'bg-[#002f6c] hover:bg-[#001f4d] shadow-blue-900/20' // Jika sendiri, tetap Navy
                                            }`}
                                    >
                                        <User size={18} />
                                        <span>Lihat Biodata Lengkap</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}