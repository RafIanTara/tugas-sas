import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Loader2, Clock, LogOut, ShieldBan } from 'lucide-react';
import { doc, getDoc, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import { useAuth } from '../context/AuthContext';
import useFirestore from '../hooks/useFirestore';
import useIsMobile from '../hooks/useIsMobile';
import { canAccess } from '../utils/permissions';
import ModalWrapper from '../components/ui/ModalWrapper';

// Views
import DashboardDesktop from './views/DashboardDesktop';
import DashboardMobile from './views/DashboardMobile';

// Modals
import AiChatModal from '../components/dashboard/modals/AiChatModal';
import KasModal from '../components/dashboard/modals/KasModal';
import NewsModal from '../components/dashboard/modals/NewsModal';
import GaleriModal from '../components/dashboard/modals/GaleriModal';
import AbsenModal from '../components/dashboard/modals/AbsenModal';
import TaskModal from '../components/dashboard/modals/TaskModal';
import ScheduleModal from '../components/dashboard/modals/ScheduleModal';
import PiketModal from '../components/dashboard/modals/PiketModal';
import StrukturModal from '../components/dashboard/modals/StrukturModal';
import CountdownModal from '../components/dashboard/modals/CountdownModal';
import SettingsModal from '../components/dashboard/modals/SettingsModal';
import EbookModal from '../components/dashboard/modals/EbookModal';
import ShowcaseModal from '../components/dashboard/modals/ShowcaseModal';
import UserManagementModal from '../components/dashboard/modals/UserManagementModal'; // NEW

export default function DashboardKelas({ kelasId }) {
    const navigate = useNavigate();
    const { user, logout, loading: authLoading } = useAuth();
    const isMobile = useIsMobile();
    const dbPrefix = kelasId.toLowerCase() + '_';

    const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
    const [activeModal, setActiveModal] = useState(null);
    const [hariPilihan, setHariPilihan] = useState(new Date().toLocaleDateString('id-ID', { weekday: 'long' }));
    const [countdownData, setCountdownData] = useState({ title: '', targetDate: '' });

    const { data: daftarTugas } = useFirestore(`${dbPrefix}tugas`);
    const { data: dataJadwal } = useFirestore(`${dbPrefix}jadwal`);
    const { data: dataPiket } = useFirestore(`${dbPrefix}piket`);
    const { data: dataKas } = useFirestore(`${dbPrefix}uang_kas`);
    const { data: dataAbsensi } = useFirestore(`${dbPrefix}absensi`);
    const { data: dataInfo } = useFirestore('pengumuman');

    const jadwalTampil = dataJadwal.find(j => j.id === hariPilihan);
    const piketTampil = dataPiket.find(p => p.id === hariPilihan);
    const absenHariIni = dataAbsensi.find(a => a.id === 'harian') || { sakit: '-', izin: '-', alpha: '-' };
    const totalSaldo = dataKas.reduce((acc, curr) => curr.tipe === 'masuk' ? acc + Number(curr.jumlah) : acc - Number(curr.jumlah), 0);
    const isLibur = hariPilihan === 'Sabtu' || hariPilihan === 'Minggu';

    useEffect(() => {
        if (isDarkMode) { document.documentElement.classList.add('dark'); localStorage.setItem('theme', 'dark'); } 
        else { document.documentElement.classList.remove('dark'); localStorage.setItem('theme', 'light'); }
    }, [isDarkMode]);

    useEffect(() => {
        const fetchCD = async () => {
            const snap = await getDoc(doc(db, 'settings', 'countdown'));
            if(snap.exists()) setCountdownData(snap.data());
        };
        fetchCD();
    }, [activeModal]);

    const handlers = {
        setActiveModal,
        setHariPilihan,
        handleLogout: async () => { if (confirm("Yakin keluar?")) { await logout(); navigate('/login'); } },
        handleToggleTask: async (id, status) => { await updateDoc(doc(db, `${dbPrefix}tugas`, id), { selesai: !status }); },
        handleDeleteTask: async (e, id) => { e.stopPropagation(); if(confirm("Hapus?")) await deleteDoc(doc(db, `${dbPrefix}tugas`, id)); },
        handleSaveInfo: async (e) => {
            e.preventDefault();
            const val = e.target.info.value;
            await updateDoc(doc(db, 'pengumuman', 'info_utama'), { isi: val });
            setActiveModal(null);
        }
    };

    if (authLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white"><Loader2 className="animate-spin mr-2"/> Memuat Data...</div>;
    if (!user) return <Navigate to="/login" replace />;
    
    // --- LAYAR BANNED ---
    if (user.status === 'BANNED') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 p-4 font-sans text-center">
                <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full border-t-8 border-red-600">
                    <ShieldBan size={64} className="text-red-600 mx-auto mb-6 animate-pulse"/>
                    <h2 className="text-3xl font-black text-slate-800 mb-2">AKSES DIBEKUKAN!</h2>
                    <p className="text-slate-500 mb-8 leading-relaxed">Mohon maaf <b>{user.displayName}</b>, akun Anda telah dinonaktifkan oleh Administrator.</p>
                    <button onClick={handlers.handleLogout} className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"><LogOut size={20}/> Keluar Sekarang</button>
                </div>
            </div>
        );
    }
    
    // --- LAYAR PENDING ---
    if (user.status === 'PENDING') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md text-center border-t-8 border-orange-500">
                    <Clock size={40} className="text-orange-600 mx-auto mb-4 animate-pulse"/>
                    <h2 className="text-2xl font-black text-slate-800 mb-2">Menunggu Persetujuan</h2>
                    <p className="text-slate-500 mb-6">Akun {user.displayName} sedang diverifikasi Admin.</p>
                    <button onClick={handlers.handleLogout} className="w-full bg-slate-800 text-white py-2 rounded-lg font-bold flex justify-center items-center gap-2"><LogOut size={18}/> Logout</button>
                </div>
            </div>
        );
    }

    const perms = {
        canInputAbsen: canAccess(user, 'INPUT_ABSEN'),
        canManageKas: canAccess(user, 'MANAGE_KAS'),
        canManageTugas: canAccess(user, 'MANAGE_TUGAS'),
        canManagePiket: canAccess(user, 'MANAGE_PIKET'),
        canEditSchedule: canAccess(user, 'MANAGE_JADWAL'),
        canManageUsers: canAccess(user, 'MANAGE_STRUKTUR'),
        canPostNews: canAccess(user, 'POST_NEWS'),
        canUploadGaleri: canAccess(user, 'UPLOAD_GALERI'),
        canBroadcastInfo: canAccess(user, 'BROADCAST_INFO'),
        canManageCountdown: canAccess(user, 'MANAGE_COUNTDOWN'),
        canApprove: canAccess(user, 'APPROVE_USER'),
        canViewSettingsClass: canAccess(user, 'MANAGE_CLASS_SETTINGS'),
        canConfigureAI: canAccess(user, 'CONFIGURE_AI_SYSTEM'),
        canUploadShowcase: canAccess(user, 'UPLOAD_SHOWCASE'),
        canUseAI: canAccess(user, 'USE_AI_CHAT'),
        canManageAllUsers: canAccess(user, 'MANAGE_ALL_USERS'), // NEW
    };

    const viewProps = {
        user, kelasId, isDarkMode, 
        toggleDarkMode: () => setIsDarkMode(!isDarkMode), 
        onLogout: handlers.handleLogout,
        handlers, perms,
        data: { daftarTugas, jadwalTampil, piketTampil, absenHariIni, totalSaldo, isLibur, dataInfo, countdownData, hariPilihan }
    };

    return (
        <>
            {isMobile ? <DashboardMobile {...viewProps} /> : <DashboardDesktop {...viewProps} />}

            {activeModal === 'ai' && <AiChatModal isOpen={true} onClose={()=>setActiveModal(null)} user={user} />}
            {activeModal === 'kas' && <KasModal isOpen={true} onClose={()=>setActiveModal(null)} kelasId={kelasId} transactions={dataKas} saldoAkhir={totalSaldo} canManage={perms.canManageKas} />}
            {activeModal === 'news' && <NewsModal isOpen={true} onClose={()=>setActiveModal(null)} user={user} />}
            {activeModal === 'galeri' && <GaleriModal isOpen={true} onClose={()=>setActiveModal(null)} user={user} />}
            {activeModal === 'absen' && <AbsenModal isOpen={true} onClose={()=>setActiveModal(null)} kelasId={kelasId} canInput={perms.canInputAbsen} />}
            {activeModal === 'tugas' && <TaskModal isOpen={true} onClose={()=>setActiveModal(null)} kelasId={kelasId} />}
            {activeModal === 'schedule' && <ScheduleModal isOpen={true} onClose={()=>setActiveModal(null)} kelasId={kelasId} hari={hariPilihan} currentJadwal={jadwalTampil} canEdit={perms.canEditSchedule} />}
            {activeModal === 'piket' && <PiketModal isOpen={true} onClose={()=>setActiveModal(null)} kelasId={kelasId} hari={hariPilihan} currentPiket={piketTampil} canEdit={perms.canManagePiket} />}
            {activeModal === 'struktur' && <StrukturModal isOpen={true} onClose={()=>setActiveModal(null)} kelasId={kelasId} canEdit={perms.canManageUsers} />}
            {activeModal === 'countdown' && <CountdownModal isOpen={true} onClose={()=>setActiveModal(null)} canEditLanding={perms.canManageCountdown} />}
            {activeModal === 'settings' && <SettingsModal isOpen={true} onClose={()=>setActiveModal(null)} kelasId={kelasId} canAccessAI={perms.canConfigureAI} canAccessClass={perms.canViewSettingsClass} />}
            {activeModal === 'ebook' && <EbookModal isOpen={true} onClose={()=>setActiveModal(null)} kelasId={kelasId} user={user} />}
            {activeModal === 'showcase' && <ShowcaseModal isOpen={true} onClose={()=>setActiveModal(null)} user={user} />}
            
            {/* NEW MODAL */}
            {activeModal === 'users' && <UserManagementModal isOpen={true} onClose={()=>setActiveModal(null)} currentUser={user} />}

            {activeModal === 'info' && (
                <ModalWrapper isOpen={true} onClose={()=>setActiveModal(null)} title="Edit Info Sekolah">
                    <form onSubmit={handlers.handleSaveInfo} className="space-y-4">
                        <textarea name="info" defaultValue={dataInfo.find(i => i.id === 'info_utama')?.isi} className="w-full bg-slate-50 border rounded-xl p-3 h-32" />
                        <button className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold">Broadcast</button>
                    </form>
                </ModalWrapper>
            )}
        </>
    );
}