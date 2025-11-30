import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from "firebase/firestore";
import { db } from "../../../services/firebase";
import { Search, Trash2, Ban, CheckCircle, Loader2 } from 'lucide-react';
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
            // Filter: Jangan tampilkan diri sendiri
            setUsers(data.filter(u => u.uid !== currentUser.uid));
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
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
                                            <p className="font-bold text-slate-700 dark:text-slate-200">{u.displayName}</p>
                                            <p className="text-[10px] text-slate-400">{u.email}</p>
                                            <p className="text-[10px] text-blue-500">{u.kelasId || '-'}</p>
                                        </td>
                                        <td className="p-3 font-bold text-slate-600 dark:text-slate-400">{u.role}</td>
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
                                                <button onClick={() => toggleBan(u.uid, u.status)} className={`p-2 rounded-lg transition-colors ${u.status === 'BANNED' ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-orange-50 text-orange-600 hover:bg-orange-100'}`}>
                                                    {u.status === 'BANNED' ? <CheckCircle size={16}/> : <Ban size={16}/>}
                                                </button>
                                                <button onClick={() => handleDelete(u.uid, u.displayName)} className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"><Trash2 size={16}/></button>
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