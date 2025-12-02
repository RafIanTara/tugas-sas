import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from "firebase/firestore";
import { db } from "../../../services/firebase"; // Sesuaikan path jika perlu
import { Search, Trash2, Ban, CheckCircle, Loader2, ShieldAlert } from 'lucide-react'; // Tambah icon ShieldAlert
import ModalWrapper from '../../ui/ModalWrapper';
import Toast from '../../ui/Toast';

export default function UserManagementModal({ isOpen, onClose, currentUser }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [toast, setToast] = useState(null);

    useEffect(() => {
        if (isOpen) fetchUsers();
    }, [isOpen]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
            const snap = await getDocs(q);
            const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            // Filter: Jangan tampilkan diri sendiri agar tidak tidak sengaja menghapus akses admin sendiri
            setUsers(data.filter(u => u.uid !== currentUser.uid));
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    // --- FITUR UBAH ROLE ---
    const handleRoleChange = async (uid, newRole, oldRole) => {
        // Konfirmasi keamanan
        if (newRole === 'ADMIN') {
            if (!confirm(`PERINGATAN: Menjadikan user ini ADMIN akan memberi akses penuh. Lanjutkan?`)) {
                fetchUsers(); 
                return;
            }
        } else {
            if (!confirm(`Ubah role user dari ${oldRole} menjadi ${newRole}?`)) {
                fetchUsers();
                return;
            }
        }

        try {
            await updateDoc(doc(db, 'users', uid), { role: newRole });
            
            // Update state lokal agar UI berubah tanpa reload
            setUsers(prev => prev.map(u => u.uid === uid ? { ...u, role: newRole } : u));
            setToast({ message: `Role berhasil diubah menjadi ${newRole}`, type: "success" });
        } catch (e) {
            setToast({ message: "Gagal ubah role: " + e.message, type: "error" });
            fetchUsers(); // Refresh data jika gagal
        }
    };

    const toggleBan = async (uid, currentStatus) => {
        const newStatus = currentStatus === 'BANNED' ? 'ACTIVE' : 'BANNED';
        const actionName = newStatus === 'BANNED' ? 'Banned' : 'Diaktifkan';
        
        if(!confirm(`Yakin user ini akan di-${actionName}?`)) return;

        try {
            await updateDoc(doc(db, 'users', uid), { status: newStatus });
            setUsers(prev => prev.map(u => u.uid === uid ? { ...u, status: newStatus } : u));
            setToast({ message: `User berhasil ${actionName}`, type: "success" });
        } catch (e) {
            setToast({ message: "Gagal update: " + e.message, type: "error" });
        }
    };

    const handleDelete = async (uid, name) => {
        const keyword = prompt(`Ketik "HAPUS" untuk menghapus permanen user: ${name}`);
        if (keyword !== "HAPUS") return;

        try {
            await deleteDoc(doc(db, 'users', uid));
            setUsers(prev => prev.filter(u => u.uid !== uid));
            setToast({ message: "User dihapus permanen.", type: "success" });
        } catch (e) {
            setToast({ message: "Gagal hapus: " + e.message, type: "error" });
        }
    };

    const filteredUsers = users.filter(u => 
        u.displayName?.toLowerCase().includes(search.toLowerCase()) || 
        u.email?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <ModalWrapper isOpen={isOpen} onClose={onClose} title="Manajemen User (Admin)">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            
            <div className="space-y-4 h-[70vh] flex flex-col">
                {/* Search Bar */}
                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-2 rounded-lg border dark:border-slate-700">
                    <Search size={18} className="text-slate-400"/>
                    <input 
                        type="text" 
                        placeholder="Cari Nama atau Email..." 
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="bg-transparent outline-none w-full text-sm dark:text-white"
                    />
                </div>

                {/* Table Container */}
                <div className="flex-1 overflow-y-auto custom-scrollbar border rounded-xl dark:border-slate-700">
                    {loading ? (
                        <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-blue-600"/></div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 text-sm">Tidak ada user ditemukan.</div>
                    ) : (
                        <table className="w-full text-xs text-left">
                            <thead className="bg-slate-50 dark:bg-slate-900 sticky top-0 z-10 font-bold text-slate-500 uppercase">
                                <tr>
                                    <th className="p-3">User Info</th>
                                    <th className="p-3">Role</th>
                                    <th className="p-3 text-center">Status</th>
                                    <th className="p-3 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-800">
                                {filteredUsers.map((u) => (
                                    <tr key={u.uid} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                        <td className="p-3">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-700 dark:text-slate-200 text-sm">{u.displayName}</span>
                                                <span className="text-[10px] text-slate-400">{u.email}</span>
                                                <span className="text-[10px] text-blue-500 font-medium">Kelas: {u.kelasId || '-'}</span>
                                            </div>
                                        </td>
                                        
                                        {/* --- BAGIAN YANG DIUBAH: DROPDOWN ROLE --- */}
                                        <td className="p-3">
                                            <div className="relative">
                                                <select 
                                                    value={u.role} 
                                                    onChange={(e) => handleRoleChange(u.uid, e.target.value, u.role)}
                                                    className={`
                                                        appearance-none cursor-pointer py-1 pl-2 pr-6 rounded font-bold text-[11px] border focus:ring-2 focus:ring-blue-500 outline-none
                                                        ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700 border-purple-200' : 
                                                          u.role === 'GURU' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                                          u.role === 'SISWA' ? 'bg-slate-100 text-slate-700 border-slate-200' :
                                                          'bg-orange-50 text-orange-600 border-orange-200'}
                                                    `}
                                                >
                                                    <option value="ADMIN">ADMIN</option>
                                                    <option value="GURU">GURU</option>
                                                    <option value="SISWA">SISWA</option>
                                                    <option value="GUEST">GUEST</option>
                                                </select>
                                                {/* Ikon panah kecil manual karena appearance-none */}
                                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                                                    <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                                </div>
                                            </div>
                                        </td>
                                        {/* ----------------------------------------- */}

                                        <td className="p-3 text-center">
                                            {u.status === 'ACTIVE' ? (
                                                <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1"><CheckCircle size={10}/> Aktif</span>
                                            ) : u.status === 'BANNED' ? (
                                                <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1"><Ban size={10}/> Banned</span>
                                            ) : (
                                                <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-[10px] font-bold">Pending</span>
                                            )}
                                        </td>
                                        <td className="p-3 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button 
                                                    onClick={() => toggleBan(u.uid, u.status)} 
                                                    className={`p-2 rounded-lg transition-colors border ${u.status === 'BANNED' ? 'bg-green-50 border-green-200 text-green-600 hover:bg-green-100' : 'bg-orange-50 border-orange-200 text-orange-600 hover:bg-orange-100'}`}
                                                    title={u.status === 'BANNED' ? "Aktifkan Kembali" : "Banned User"}
                                                >
                                                    {u.status === 'BANNED' ? <CheckCircle size={16}/> : <Ban size={16}/>}
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(u.uid, u.displayName)} 
                                                    className="p-2 bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                                    title="Hapus User Permanen"
                                                >
                                                    <Trash2 size={16}/>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </ModalWrapper>
    );
}