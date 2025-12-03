import React from 'react';
import { Calendar, Quote } from 'lucide-react'; 
import HeaderDashboard from '../../components/dashboard/layout/HeaderDashboard';
import InfoBoard from '../../components/dashboard/layout/InfoBoard';
import ApprovalList from '../../components/admin/ApprovalList';
import KasWidget from '../../components/dashboard/widgets/KasWidget';
import AbsenWidget from '../../components/dashboard/widgets/AbsenWidget';
import QuickMenuWidget from '../../components/dashboard/widgets/QuickMenuWidget';
import PiketWidget from '../../components/dashboard/widgets/PiketWidget';
import CountdownWidget from '../../components/dashboard/widgets/CountdownWidget';
import JadwalWidget from '../../components/dashboard/widgets/JadwalWidget';
import TugasWidget from '../../components/dashboard/widgets/TugasWidget';

export default function DashboardDesktop({ 
    user, kelasId, isDarkMode, toggleDarkMode, onLogout, 
    handlers, data, perms 
}) {
    // Helper: Greeting Time
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Selamat Pagi' : hour < 15 ? 'Selamat Siang' : hour < 18 ? 'Selamat Sore' : 'Selamat Malam';

    return (
        <div className="min-h-screen font-sans bg-slate-50 dark:bg-[#0f172a] text-slate-800 dark:text-slate-100 transition-colors duration-300 pb-20">
            {/* Header */}
            <HeaderDashboard 
                user={user} 
                kelasId={kelasId} 
                isDarkMode={isDarkMode} 
                toggleDarkMode={toggleDarkMode} 
                onLogout={onLogout} 
                onOpenSettings={() => handlers.setActiveModal('settings')} 
                canViewSettings={perms.canViewSettingsClass || perms.canConfigureAI} 
            />

            <div className="max-w-7xl mx-auto px-6 pt-8">
                
                {/* 1. HEADER SECTION & TANGGAL */}
                <div className="flex justify-between items-end mb-6">
                    <div>
                        <h1 className="text-3xl font-black text-[#002f6c] dark:text-white tracking-tight">
                            {greeting}, {user.displayName?.split(' ')[0]}! 👋
                        </h1>
                        
                    </div>
                    <div className="hidden md:block">
                        <div className="inline-flex items-center gap-2 bg-white dark:bg-slate-800 px-5 py-2.5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                            <div className="bg-blue-100 text-blue-600 p-1.5 rounded-lg">
                                <Calendar size={18} />
                            </div>
                            <div className="text-right">
                                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hari Ini</span>
                                <span className="block text-sm font-bold text-slate-700 dark:text-slate-200 leading-none">
                                    {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. MAIN LAYOUT GRID (8 : 4 Ratio) */}
                <div className="grid grid-cols-12 gap-8">
                    
                    {/* === LEFT COLUMN (MAIN WORKSPACE) - SPAN 8 === */}
                    <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
                        
                        {/* A. Quick Menu */}
                        <QuickMenuWidget 
                            onOpenNews={() => handlers.setActiveModal('news')} 
                            onOpenGaleri={() => handlers.setActiveModal('galeri')} 
                            onOpenAi={() => handlers.setActiveModal('ai')} 
                            onOpenStruktur={() => handlers.setActiveModal('struktur')} 
                            onOpenEbook={() => handlers.setActiveModal('ebook')} 
                            onOpenShowcase={() => handlers.setActiveModal('showcase')}
                            onOpenUserManager={() => handlers.setActiveModal('users')}
                            permissions={perms} 
                            minimal={true} 
                        />

                        {/* B. Approval List (Jika Ada) */}
                        {perms.canApprove && <ApprovalList currentUser={user} />}

                        {/* C. Info Board */}
                        <div className="h-fit">
                            <InfoBoard infoData={data.dataInfo} canBroadcast={perms.canBroadcastInfo} onEdit={() => handlers.setActiveModal('info')} />
                        </div>

                        {/* D. Split Jadwal & Tugas (Berdampingan) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <JadwalWidget jadwal={data.jadwalTampil} hariPilihan={data.hariPilihan} setHariPilihan={handlers.setHariPilihan} isLibur={data.isLibur} canEdit={perms.canEditSchedule} onEdit={() => handlers.setActiveModal('schedule')} />
                            <TugasWidget daftarTugas={data.daftarTugas} canManage={perms.canManageTugas} onAdd={() => handlers.setActiveModal('tugas')} onToggle={handlers.handleToggleTask} onDelete={handlers.handleDeleteTask} />
                        </div>
                    </div>

                    {/* === RIGHT COLUMN (SIDEBAR WIDGETS) - SPAN 4 === */}
                    <div className="col-span-12 lg:col-span-4 space-y-6">
                        {/* Sticky Container: Biar kalau discroll ke bawah, sidebar ini ikut turun */}
                        <div className="sticky top-24 space-y-6">
                            
                            {/* 1. Absensi (Paling Penting) */}
                            <AbsenWidget data={data.absenHariIni} canEdit={perms.canInputAbsen} onEdit={() => handlers.setActiveModal('absen')} onViewDetail={() => handlers.setActiveModal('absen')} />

                            {/* 2. Countdown */}
                            <CountdownWidget targetDate={data.countdownData.targetDate} title={data.countdownData.title} canManage={perms.canManageCountdown} onEdit={() => handlers.setActiveModal('countdown')} />

                            {/* 3. Grid Kecil: Kas & Piket */}
                            <div className="grid grid-cols-2 gap-4">
                                <KasWidget totalSaldo={data.totalSaldo} onClick={() => handlers.setActiveModal('kas')} />
                                <PiketWidget piketHariIni={data.piketTampil} isLibur={data.isLibur} canEdit={perms.canManagePiket} onEdit={() => handlers.setActiveModal('piket')} />
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}