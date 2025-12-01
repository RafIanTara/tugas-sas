import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../services/firebase";
import { UserCheck, Check, X, Loader2 } from 'lucide-react';
import Toast from '../ui/Toast';

export default function ApprovalList({ currentUser }) {
    const [pendingUsers, setPendingUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);

    // Hanya Fetch jika user adalah Guru atau Admin
    useEffect(() => {
        if (!currentUser || (currentUser.role !== 'GURU' && currentUser.role !== 'ADMIN')) {
            setLoading(false);
            return;
        }

        const fetchPending = async () => {
            try {
                // Cari user yang statusnya 'PENDING'
                const q = query(collection(db, "users"), where("status", "==", "PENDING"));
                const querySnapshot = await getDocs(q);
                const users = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setPendingUsers(users);
            } catch (error) {
                console.error("Error fetching pending users:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPending();
    }, [currentUser]);

    // UPDATE: Menerima targetRole agar bisa mengubah role user dari GUEST ke SISWA/GURU
    const handleApprove = async (userId, name, targetRole) => {
        try {
            // Gunakan targetRole dari database, jika kosong fallback ke "SISWA"
            const newRole = targetRole || "SISWA"; 

            await updateDoc(doc(db, "users", userId), {
                status: "ACTIVE",
                role: newRole // <--- INI PERBAIKAN UTAMANYA
            });

            setPendingUsers(prev => prev.filter(user => user.id !== userId));
            setToast({ message: `${name} disetujui sebagai ${newRole}!`, type: 'success' });
        } catch (error) {
            setToast({ message: "Gagal approve: " + error.message, type: 'error' });
        }
    };

    const handleReject = async (userId, name) => {
        if (!confirm(`Tolak dan hapus akun ${name}?`)) return;

        try {
            await deleteDoc(doc(db, "users", userId));
            setPendingUsers(prev => prev.filter(user => user.id !== userId));
            setToast({ message: `${name} ditolak & dihapus.`, type: 'success' });
        } catch (error) {
            setToast({ message: "Gagal menolak: " + error.message, type: 'error' });
        }
    };

    // Jika tidak ada user pending atau bukan admin/guru, jangan render apa-apa
    if (!loading && pendingUsers.length === 0) return null;
    if (loading) return <div className="p-4 text-center text-xs text-slate-400"><Loader2 className="animate-spin inline mr-2"/> Cek approval...</div>;

    return (
        <div className="bg-white dark:bg-slate-800 border-l-[6px] border-orange-500 rounded-r-lg shadow-sm p-4 mb-6 animate-in slide-in-from-top-2">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            
            <div className="flex items-center gap-2 mb-3">
                <div className="bg-orange-100 p-1.5 rounded text-orange-600">
                    <UserCheck size={18} />
                </div>
                <div>
                    <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Butuh Persetujuan</h3>
                    <p className="text-[10px] text-slate-500">Ada {pendingUsers.length} user baru mendaftar.</p>
                </div>
            </div>

            <div className="space-y-2">
                {pendingUsers.map(user => (
                    <div key={user.id} className="flex justify-between items-center bg-slate-50 dark:bg-slate-700/50 p-2 rounded border border-slate-100 dark:border-slate-700">
                        <div>
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{user.displayName || user.name}</p>
                            
                            {/* Menampilkan Role yang diajukan (targetRole), bukan role saat ini (Guest) */}
                            <p className="text-[10px] text-slate-500 uppercase">
                                Request: {user.targetRole || user.role} - {user.kelasId}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => handleReject(user.id, user.displayName || user.name)}
                                className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                                title="Tolak"
                            >
                                <X size={14} />
                            </button>
                            <button 
                                // UPDATE: Mengirim targetRole ke fungsi approve
                                onClick={() => handleApprove(user.id, user.displayName || user.name, user.targetRole)}
                                className="p-1.5 bg-green-100 text-green-600 rounded hover:bg-green-200 transition-colors"
                                title="Setujui"
                            >
                                <Check size={14} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}