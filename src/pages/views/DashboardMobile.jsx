import React from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Import ini
import { Home, Calendar, BookOpen, Menu, User, Bell, Search, Grip } from 'lucide-react';
import InfoBoard from '../../components/dashboard/layout/InfoBoard';
import ApprovalList from '../../components/admin/ApprovalList';
import KasWidget from '../../components/dashboard/widgets/KasWidget';
import AbsenWidget from '../../components/dashboard/widgets/AbsenWidget';
import QuickMenuWidget from '../../components/dashboard/widgets/QuickMenuWidget';
import PiketWidget from '../../components/dashboard/widgets/PiketWidget';
import CountdownWidget from '../../components/dashboard/widgets/CountdownWidget';
import JadwalWidget from '../../components/dashboard/widgets/JadwalWidget';
import TugasWidget from '../../components/dashboard/widgets/TugasWidget';

export default function DashboardMobile({ 
    user, kelasId, isDarkMode, toggleDarkMode, onLogout, 
    handlers, data, perms 
}) {
    const navigate = useNavigate(); // 2. Inisialisasi Hook Navigasi

    // Greeting
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Pagi' : hour < 15 ? 'Siang' : hour < 18 ? 'Sore' : 'Malam';

    return (
        <div className="min-h-screen font-sans bg-slate-50 dark:bg-[#0b1121] text-slate-800 dark:text-slate-100 pb-28">
            
            {/* 1. APP HEADER */}
            <div className="bg-[#002f6c] text-white pt-8 pb-16 px-6 rounded-b-[2.5rem] shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#00994d]/20 rounded-full -ml-10 -mb-5 blur-xl"></div>
                
                <div className="relative z-10 flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                            <User size={20} className="text-white"/>
                        </div>
                        <div>
                            <p className="text-blue-200 text-xs font-medium">Selamat {greeting},</p>
                            <h2 className="font-bold text-lg leading-none">{user.displayName?.split(' ')[0]}</h2>
                        </div>
                    </div>
                    <button onClick={() => handlers.setActiveModal('settings')} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors relative">
                        <Bell size={20} />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-[#002f6c]"></span>
                    </button>
                </div>

                <div className="bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-xl flex items-center gap-3 text-blue-100 text-xs">
                    <Search size={16} className="opacity-70"/>
                    <span>Cari tugas atau materi...</span>
                </div>
            </div>

            {/* 2. FLOATING CONTENT */}
            <div className="px-5 -mt-8 relative z-20">
                <div className="shadow-lg rounded-2xl overflow-hidden">
                    <InfoBoard infoData={data.dataInfo} canBroadcast={perms.canBroadcastInfo} onEdit={() => handlers.setActiveModal('info')} />
                </div>
            </div>

            <div className="p-5 space-y-6">
                
                {/* 3. QUICK MENU */}
                <div>
                    <h3 className="font-bold text-sm text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                        <Grip size={16} className="text-[#002f6c] dark:text-blue-400"/> Menu Kelas
                    </h3>
                    <QuickMenuWidget 
                        onOpenNews={() => handlers.setActiveModal('news')} 
                        onOpenGaleri={() => handlers.setActiveModal('galeri')} 
                        onOpenAi={() => handlers.setActiveModal('ai')} 
                        onOpenStruktur={() => handlers.setActiveModal('struktur')} 
                        onOpenEbook={() => handlers.setActiveModal('ebook')} 
                        onOpenShowcase={() => handlers.setActiveModal('showcase')}
                        onOpenUserManager={() => handlers.setActiveModal('users')}
                        permissions={perms} 
                    />
                </div>

                {/* 4. MAIN WIDGETS */}
                <AbsenWidget data={data.absenHariIni} canEdit={perms.canInputAbsen} onEdit={() => handlers.setActiveModal('absen')} onViewDetail={() => handlers.setActiveModal('absen')} />
                
                {perms.canApprove && <ApprovalList currentUser={user} />}

                <JadwalWidget jadwal={data.jadwalTampil} hariPilihan={data.hariPilihan} setHariPilihan={handlers.setHariPilihan} isLibur={data.isLibur} canEdit={perms.canEditSchedule} onEdit={() => handlers.setActiveModal('schedule')} />

                {/* 5. TUGAS & WIDGETS LAIN */}
                <TugasWidget daftarTugas={data.daftarTugas} canManage={perms.canManageTugas} onAdd={() => handlers.setActiveModal('tugas')} onToggle={handlers.handleToggleTask} onDelete={handlers.handleDeleteTask} />

                <div className="grid grid-cols-2 gap-3">
                    <KasWidget totalSaldo={data.totalSaldo} onClick={() => handlers.setActiveModal('kas')} />
                    <PiketWidget piketHariIni={data.piketTampil} isLibur={data.isLibur} canEdit={perms.canManagePiket} onEdit={() => handlers.setActiveModal('piket')} />
                </div>

                <CountdownWidget targetDate={data.countdownData.targetDate} title={data.countdownData.title} canManage={perms.canManageCountdown} onEdit={() => handlers.setActiveModal('countdown')} />
            </div>

            {/* 6. BOTTOM NAVIGATION (FIXED) */}
            <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t dark:border-slate-800 shadow-[0_-8px_30px_rgba(0,0,0,0.05)] px-6 py-2 z-50 md:hidden">
                <div className="flex justify-between items-center">
                    
                    {/* PERBAIKAN DI SINI: Navigasi ke Landing Page ('/') */}
                    <button onClick={() => navigate('/')} className="flex flex-col items-center gap-1 p-2 text-blue-600 dark:text-blue-400">
                        <Home size={22} strokeWidth={2.5} />
                        <span className="text-[9px] font-bold">Home</span>
                    </button>

                    <button onClick={() => handlers.setActiveModal('schedule')} className="flex flex-col items-center gap-1 p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                        <Calendar size={22} />
                        <span className="text-[9px] font-bold">Jadwal</span>
                    </button>

                    {/* Tombol Tengah Floating */}
                    <div className="relative -top-6">
                        <button onClick={() => handlers.setActiveModal('tugas')} className="bg-gradient-to-tr from-[#002f6c] to-blue-600 text-white p-4 rounded-2xl shadow-xl shadow-blue-500/30 border-4 border-slate-50 dark:border-slate-900 active:scale-95 transition-transform">
                            <BookOpen size={24} />
                        </button>
                    </div>

                    <button onClick={() => handlers.setActiveModal('absen')} className="flex flex-col items-center gap-1 p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                        <User size={22} />
                        <span className="text-[9px] font-bold">Absen</span>
                    </button>

                    <button onClick={() => handlers.setActiveModal('settings')} className="flex flex-col items-center gap-1 p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                        <Menu size={22} />
                        <span className="text-[9px] font-bold">Menu</span>
                    </button>
                </div>
            </div>
        </div>
    );
}