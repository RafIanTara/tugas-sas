import { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { CheckCircle, XCircle, UserCheck, Loader2 } from 'lucide-react';

const ApprovalList = ({ currentUser }) => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Email Super Admin (Hardcode untuk keamanan lapis ganda)
  const SUPER_ADMIN_EMAIL = "rafiantara@gmail.com"; 

  // FETCH DATA YANG PERLU DI-ACC
  useEffect(() => {
    const fetchPending = async () => {
      try {
        let q;
        
        // 1. LOGIKA ADMIN: Melihat semua calon GURU yang pending
        if (currentUser.role === 'ADMIN' || currentUser.email === SUPER_ADMIN_EMAIL) {
          q = query(
            collection(db, "users"), 
            where("status", "==", "PENDING"),
            where("targetRole", "==", "GURU") // Admin hanya urus Guru
          );
        } 
        // 2. LOGIKA GURU: Melihat calon SISWA di kelasnya sendiri
        else if (currentUser.role === 'GURU') {
          // Pastikan Guru punya kelasId. Kalau tidak, tidak bisa fetch.
          if (!currentUser.kelasId) {
             setLoading(false); return;
          }
          
          q = query(
            collection(db, "users"), 
            where("status", "==", "PENDING"),
            where("targetRole", "==", "SISWA"),
            where("kelasId", "==", currentUser.kelasId) // Hanya kelas dia
          );
        } else {
          // Siswa/Guest tidak punya akses ke sini
          setLoading(false);
          return; 
        }

        const snap = await getDocs(q);
        setPendingUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (error) {
        console.error("Gagal ambil data approval:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPending();
  }, [currentUser]);

  // FUNGSI TERIMA USER (ACC)
  const handleApprove = async (userId, targetRole, userName) => {
    if(!confirm(`Terima ${userName} sebagai ${targetRole}?`)) return;

    try {
      await updateDoc(doc(db, "users", userId), {
        status: 'ACTIVE',
        role: targetRole, // Ubah Guest jadi GURU atau SISWA sesuai permintaan
      });
      
      // Refresh list: Hapus user yang barusan di-acc dari tampilan
      setPendingUsers(prev => prev.filter(u => u.id !== userId));
      alert(`${userName} berhasil diterima!`);
    } catch (e) {
      alert("Error: " + e.message);
    }
  };

  // FUNGSI TOLAK USER
  const handleReject = async (userId, userName) => {
    if(!confirm(`Tolak permintaan ${userName}? Akun akan tetap ada tapi status REJECTED.`)) return;

    try {
        await updateDoc(doc(db, "users", userId), {
            status: 'REJECTED'
        });
        setPendingUsers(prev => prev.filter(u => u.id !== userId));
    } catch (e) {
        alert("Error: " + e.message);
    }
  }

  if (loading) return <div className="p-4 text-center text-xs text-slate-400">Cek permintaan...</div>;
  if (pendingUsers.length === 0) return null; // Sembunyikan jika kosong

  return (
    <div className="bg-white border-l-4 border-orange-500 shadow-md rounded-r-lg p-5 mb-8 animate-in slide-in-from-top-5">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg flex items-center gap-2 text-slate-800">
            <UserCheck className="text-orange-500" /> 
            Permintaan Bergabung ({pendingUsers.length})
        </h3>
        <span className="text-[10px] bg-orange-100 text-orange-600 px-2 py-1 rounded-full font-bold uppercase">Perlu Tindakan</span>
      </div>
      
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {pendingUsers.map(u => (
          <div key={u.id} className="flex flex-col justify-between bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div className="mb-3">
              <p className="font-bold text-sm text-slate-800">{u.displayName}</p>
              <p className="text-xs text-slate-500 truncate">{u.email}</p>
              <div className="mt-2 flex items-center gap-2">
                 <span className="text-[10px] font-bold border border-slate-300 px-1.5 rounded text-slate-500">Kelas {u.kelasId}</span>
                 <span className="text-[10px] font-bold bg-blue-100 text-blue-600 px-1.5 rounded">Calon {u.targetRole}</span>
              </div>
            </div>
            <div className="flex gap-2 mt-auto">
              <button 
                onClick={() => handleApprove(u.id, u.targetRole, u.displayName)}
                className="flex-1 bg-green-600 text-white py-1.5 rounded text-xs font-bold flex items-center justify-center gap-1 hover:bg-green-700 transition">
                <CheckCircle size={14}/> Terima
              </button>
              <button 
                onClick={() => handleReject(u.id, u.displayName)}
                className="px-3 bg-red-100 text-red-600 py-1.5 rounded text-xs font-bold hover:bg-red-200 transition">
                <XCircle size={14}/>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ApprovalList;