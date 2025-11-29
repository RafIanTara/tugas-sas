import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Loader2, Clock, LogOut } from 'lucide-react';
import { doc, getDoc, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "../services/firebase";

// Context & Hooks
import { useAuth } from '../context/AuthContext';
import useFirestore from '../hooks/useFirestore';
import { canAccess } from '../utils/permissions';

// Components: Layout & Admin
import HeaderDashboard from '../components/dashboard/layout/HeaderDashboard';
import InfoBoard from '../components/dashboard/layout/InfoBoard';
import ApprovalList from '../components/admin/ApprovalList';

// Components: Widgets
import KasWidget from '../components/dashboard/widgets/KasWidget';
import AbsenWidget from '../components/dashboard/widgets/AbsenWidget';
import QuickMenuWidget from '../components/dashboard/widgets/QuickMenuWidget';
import PiketWidget from '../components/dashboard/widgets/PiketWidget';
import CountdownWidget from '../components/dashboard/widgets/CountdownWidget';
import JadwalWidget from '../components/dashboard/widgets/JadwalWidget';
import TugasWidget from '../components/dashboard/widgets/TugasWidget';

// Components: Modals
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
import ModalWrapper from '../components/ui/ModalWrapper';

export default function DashboardKelas({ kelasId }) {
    const navigate = useNavigate();
    const { user, logout, loading: authLoading } = useAuth();
    const dbPrefix = kelasId.toLowerCase() + '_';

    // --- 1. STATE MANAGEMENT ---
    const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
    const [activeModal, setActiveModal] = useState(null);
    const [hariPilihan, setHariPilihan] = useState(new Date().toLocaleDateString('id-ID', { weekday: 'long' }));
    const [countdownData, setCountdownData] = useState({ title: '', targetDate: '' });

    // --- 2. DATA FETCHING ---
    const { data: daftarTugas } = useFirestore(`${dbPrefix}tugas`);
    const { data: dataJadwal } = useFirestore(`${dbPrefix}jadwal`);
    const { data: dataPiket } = useFirestore(`${dbPrefix}piket`);
    const { data: dataKas } = useFirestore(`${dbPrefix}uang_kas`);
    const { data: dataAbsensi } = useFirestore(`${dbPrefix}absensi`);
    const { data: dataInfo } = useFirestore('pengumuman');

    // --- 3. DERIVED DATA ---
    const jadwalTampil = dataJadwal.find(j => j.id === hariPilihan);
    const piketTampil = dataPiket.find(p => p.id === hariPilihan);
    const absenHariIni = dataAbsensi.find(a => a.id === 'harian') || { sakit: '-', izin: '-', alpha: '-' };
    const totalSaldo = dataKas.reduce((acc, curr) => curr.tipe === 'masuk' ? acc + Number(curr.jumlah) : acc - Number(curr.jumlah), 0);
    const isLibur = hariPilihan === 'Sabtu' || hariPilihan === 'Minggu';

    // --- 4. EFFECTS ---
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

    // --- 5. HANDLERS ---
    const handleLogout = async () => { if (confirm("Yakin keluar?")) { await logout(); navigate('/login'); } };
    const closeModal = () => setActiveModal(null);
    const handleToggleTask = async (id, status) => { await updateDoc(doc(db, `${dbPrefix}tugas`, id), { selesai: !status }); };
    const handleDeleteTask = async (e, id) => { e.stopPropagation(); if(confirm("Hapus?")) await deleteDoc(doc(db, `${dbPrefix}tugas`, id)); };
    const handleSaveInfo = async (e) => {
        e.preventDefault();
        const val = e.target.info.value;
        await updateDoc(doc(db, 'pengumuman', 'info_utama'), { isi: val });
        closeModal();
    };

    // --- 6. AUTH & PENDING CHECK (SATPAM) ---
    if (authLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white"><Loader2 className="animate-spin mr-2"/> Memuat Data User...</div>;
    if (!user) return <Navigate to="/login" replace />;

    // !!! BLOKIR USER PENDING DI SINI !!!
    if (user.status === 'PENDING') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 p-4 font-sans">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border-t-8 border-orange-500">
                    <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Clock size={40} className="text-orange-600 animate-pulse"/>
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 mb-2">Menunggu Persetujuan</h2>
                    <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                        Halo <span className="font-bold text-slate-800">{user.displayName}</span>,<br/>
                        Akun kamu berhasil dibuat tapi statusnya masih <span className="font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded">PENDING</span>.
                        <br/><br/>
                        Silakan hubungi <b>Admin</b> atau <b>Guru Wali Kelas</b> untuk mengaktifkan akunmu agar bisa mengakses Dashboard.
                    </p>
                    <button onClick={async () => { await logout(); navigate('/'); }} className="w-full bg-slate-800 hover:bg-slate-900 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all">
                        <LogOut size={18}/> Logout & Kembali
                    </button>
                </div>
            </div>
        );
    }

    // --- 7. PERMISSIONS ---
    const perms = {
        canInputAbsen: canAccess(user, 'INPUT_ABSEN'),
        canManageKas: canAccess(user, 'MANAGE_KAS'),
        canPostNews: canAccess(user, 'POST_NEWS'),
        canUploadGaleri: canAccess(user, 'UPLOAD_GALERI'),
        canManageTugas: canAccess(user, 'MANAGE_TUGAS'),
        canManagePiket: canAccess(user, 'MANAGE_USERS'),
        canEditSchedule: canAccess(user, 'MANAGE_USERS'),
        canBroadcastInfo: canAccess(user, 'POST_NEWS'),
        canManageUsers: canAccess(user, 'MANAGE_USERS'),
        canApprove: canAccess(user, 'APPROVE_SISWA') || canAccess(user, 'APPROVE_GURU'),
        canViewSettings: canAccess(user, 'VIEW_SETTINGS_CLASS') || canAccess(user, 'VIEW_SETTINGS_ALL'),
        canEditLanding: canAccess(user, 'VIEW_SETTINGS_ALL')
    };

    return (
        <div className="min-h-screen font-sans bg-slate-100 dark:bg-[#0b1121] text-slate-800 dark:text-slate-100 pb-20 md:pb-0 transition-colors duration-300">
            <HeaderDashboard user={user} kelasId={kelasId} isDarkMode={isDarkMode} toggleDarkMode={() => setIsDarkMode(!isDarkMode)} onLogout={handleLogout} onOpenSettings={() => setActiveModal('settings')} canViewSettings={perms.canViewSettings} />

            <div className="p-4 md:p-8 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2"><InfoBoard infoData={dataInfo} canBroadcast={perms.canBroadcastInfo} onEdit={() => setActiveModal('info')} /></div>
                    <div><AbsenWidget data={absenHariIni} canEdit={perms.canInputAbsen} onEdit={() => setActiveModal('absen')} onViewDetail={() => setActiveModal('absen')} /></div>
                </div>

                {perms.canApprove && <div className="md:col-span-12"><ApprovalList currentUser={user} /></div>}

                <div className="md:col-span-4 space-y-6">
                    <KasWidget totalSaldo={totalSaldo} onClick={() => setActiveModal('kas')} />
                    <QuickMenuWidget onOpenNews={() => setActiveModal('news')} onOpenGaleri={() => setActiveModal('galeri')} onOpenAi={() => setActiveModal('ai')} onOpenStruktur={() => setActiveModal('struktur')} permissions={perms} />
                    <PiketWidget piketHariIni={piketTampil} isLibur={isLibur} canEdit={perms.canManagePiket} onEdit={() => setActiveModal('piket')} />
                </div>

                <div className="md:col-span-8 space-y-6">
                    <CountdownWidget targetDate={countdownData.targetDate} title={countdownData.title} canManage={perms.canManageUsers} onEdit={() => setActiveModal('countdown')} />
                    <JadwalWidget jadwal={jadwalTampil} hariPilihan={hariPilihan} setHariPilihan={setHariPilihan} isLibur={isLibur} canEdit={perms.canEditSchedule} onEdit={() => setActiveModal('schedule')} />
                    <TugasWidget daftarTugas={daftarTugas} canManage={perms.canManageTugas} onAdd={() => setActiveModal('tugas')} onToggle={handleToggleTask} onDelete={handleDeleteTask} />
                </div>
            </div>

            {/* MODALS */}
            {activeModal === 'ai' && <AiChatModal isOpen={true} onClose={closeModal} user={user} />}
            {activeModal === 'kas' && <KasModal isOpen={true} onClose={closeModal} kelasId={kelasId} transactions={dataKas} saldoAkhir={totalSaldo} canManage={perms.canManageKas} />}
            {activeModal === 'news' && <NewsModal isOpen={true} onClose={closeModal} user={user} />}
            {activeModal === 'galeri' && <GaleriModal isOpen={true} onClose={closeModal} user={user} />}
            {activeModal === 'absen' && <AbsenModal isOpen={true} onClose={closeModal} kelasId={kelasId} canInput={perms.canInputAbsen} />}
            {activeModal === 'tugas' && <TaskModal isOpen={true} onClose={closeModal} kelasId={kelasId} />}
            {activeModal === 'schedule' && <ScheduleModal isOpen={true} onClose={closeModal} kelasId={kelasId} hari={hariPilihan} currentJadwal={jadwalTampil} />}
            {activeModal === 'piket' && <PiketModal isOpen={true} onClose={closeModal} kelasId={kelasId} hari={hariPilihan} currentPiket={piketTampil} />}
            {activeModal === 'struktur' && <StrukturModal isOpen={true} onClose={closeModal} kelasId={kelasId} canEdit={perms.canManageUsers} />}
            {activeModal === 'countdown' && <CountdownModal isOpen={true} onClose={closeModal} canEditLanding={perms.canEditLanding} />}
            {activeModal === 'settings' && <SettingsModal isOpen={true} onClose={closeModal} kelasId={kelasId} canAccessAI={perms.canEditLanding} canAccessClass={perms.canViewSettings} />}
            
            {activeModal === 'info' && (
                <ModalWrapper isOpen={true} onClose={closeModal} title="Edit Info Sekolah">
                    <form onSubmit={handleSaveInfo} className="space-y-4">
                        <textarea name="info" defaultValue={dataInfo.find(i => i.id === 'info_utama')?.isi} className="w-full bg-slate-50 border rounded-xl p-3 h-32" />
                        <button className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold">Broadcast</button>
                    </form>
                </ModalWrapper>
            )}
        </div>
    );
}