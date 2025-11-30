import React from 'react';
import { Newspaper, Image as ImageIcon, Cpu, Users, BookOpen, MonitorPlay, Zap, ShieldAlert } from 'lucide-react';

export default function QuickMenuWidget({ 
    onOpenNews, onOpenGaleri, onOpenAi, onOpenStruktur, onOpenEbook, onOpenShowcase, 
    onOpenUserManager, // Prop baru
    permissions, minimal = false 
}) {
    const containerClass = minimal 
        ? "bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700" 
        : "bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border-t-4 border-purple-500";

    const title = minimal ? (
        <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 bg-purple-100 rounded-lg"><Zap size={16} className="text-purple-600 fill-purple-600"/></div>
            <h3 className="font-bold text-sm text-slate-700 dark:text-white">Akses Cepat</h3>
        </div>
    ) : (
        <h3 className="font-bold text-sm text-slate-700 dark:text-white mb-4">Menu Cepat</h3>
    );

    const gridClass = minimal ? "grid grid-cols-3 md:grid-cols-6 gap-4" : "grid grid-cols-3 gap-3";

    return (
        <div className={containerClass}>
            {title}
            <div className={gridClass}>
                {permissions.canPostNews && (
                    <MenuButton icon={Newspaper} color="text-orange-600" bg="bg-orange-50 hover:bg-orange-100 dark:bg-orange-900/20" label="Mading" onClick={onOpenNews} />
                )}
                
                {permissions.canUploadGaleri && (
                    <MenuButton icon={ImageIcon} color="text-pink-600" bg="bg-pink-50 hover:bg-pink-100 dark:bg-pink-900/20" label="Galeri" onClick={onOpenGaleri} />
                )}

                {permissions.canUseAI && (
                    <MenuButton icon={Cpu} color="text-blue-600" bg="bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20" label="AI Otak" onClick={onOpenAi} />
                )}

                <MenuButton icon={Users} color="text-emerald-600" bg="bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20" label="Struktur" onClick={onOpenStruktur} />
                
                <MenuButton icon={BookOpen} color="text-cyan-600" bg="bg-cyan-50 hover:bg-cyan-100 dark:bg-cyan-900/20" label="E-Book" onClick={onOpenEbook} />

                {permissions.canUploadShowcase && (
                    <MenuButton icon={MonitorPlay} color="text-indigo-600" bg="bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20" label="Upload SAS" onClick={onOpenShowcase} />
                )}

                {/* TOMBOL KHUSUS ADMIN */}
                {permissions.canManageAllUsers && (
                    <MenuButton icon={ShieldAlert} color="text-red-600" bg="bg-red-50 hover:bg-red-100 dark:bg-red-900/20" label="User Manager" onClick={onOpenUserManager} />
                )}
            </div>
        </div>
    );
}

function MenuButton({ icon: Icon, color, bg, label, onClick }) {
    return (
        <button onClick={onClick} className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl transition-all duration-200 group ${bg}`}>
            <div className="p-1 rounded-full bg-white/50 dark:bg-black/10 group-hover:scale-110 transition-transform">
                <Icon size={24} className={`${color} shrink-0`} />
            </div>
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 whitespace-nowrap">{label}</span>
        </button>
    )
}