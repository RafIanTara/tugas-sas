import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ExternalLink, Search, Users, Image as ImageIcon, Trash2, LayoutDashboard } from 'lucide-react'
import { collection, query, orderBy, getDocs, deleteDoc, doc } from "firebase/firestore"
import { db } from "../services/firebase"
import { useAuth } from '../context/AuthContext'
import { canAccess } from '../utils/permissions'

export default function ShowcasePage() {
  const navigate = useNavigate()
  const { user } = useAuth() 
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  // HANYA PERLU IZIN DELETE (Untuk Admin/Guru)
  const canDelete = canAccess(user, 'MANAGE_USERS'); 

  useEffect(() => {
    const fetchProjects = async () => {
        try {
            const q = query(collection(db, "showcase_sas"), orderBy("createdAt", "desc"));
            const snap = await getDocs(q);
            setProjects(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (error) { console.error("Error:", error); } finally { setLoading(false); }
    }
    fetchProjects();
  }, [])

  // --- LOGIC BARU: DASHBOARD REDIRECT ---
  const handleDashboardRedirect = () => {
      if (!user) {
          // Jika belum login, arahkan ke halaman login
          navigate('/login');
          return;
      }
      
      // Jika user ada, ambil kelasId (default ke 'x' jika null)
      const targetKelas = user.kelasId ? user.kelasId.toLowerCase() : 'x';
      
      // Arahkan sesuai kelas (Contoh: /kelas-xi)
      navigate(`/kelas-${targetKelas}`);
  };

  const handleDelete = async (id, namaKelompok) => {
      if(confirm(`[Admin/Guru] Hapus project "${namaKelompok}"?`)) {
          try {
              await deleteDoc(doc(db, "showcase_sas", id));
              setProjects(prev => prev.filter(p => p.id !== id));
          } catch (error) { alert("Gagal hapus: " + error.message); }
      }
  }

  const filteredProjects = projects.filter(p => p.kelompok.toLowerCase().includes(search.toLowerCase()) || p.anggota.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
        <div className="bg-[#002f6c] text-white py-12 px-4 shadow-lg relative overflow-hidden">
            <div className="max-w-7xl mx-auto relative z-10">
                <button onClick={() => navigate('/')} className="flex items-center gap-2 text-white/80 hover:text-white font-bold mb-4 transition-colors"><ArrowLeft size={20}/> Kembali ke Home</button>
                <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight">Showcase Project SAS</h1>
                        <p className="text-blue-200 mt-2 max-w-xl">Galeri hasil karya Landing Page siswa-siswi TKJ.</p>
                    </div>
                    {/* INFO UNTUK SISWA */}
                    <div className="bg-white/10 backdrop-blur p-4 rounded-xl border border-white/20 text-sm flex flex-col gap-2">
                        <p className="text-blue-100">Ingin mengumpulkan karya?</p>
                        <button 
                            onClick={handleDashboardRedirect} 
                            className="bg-[#00994d] hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all shadow-lg"
                        >
                            <LayoutDashboard size={16}/> Masuk Dashboard
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 -mt-6 relative z-20">
            <div className="bg-white p-2 rounded-xl shadow-md flex items-center gap-2 border border-slate-200">
                <Search className="text-slate-400 ml-2" size={20}/>
                <input type="text" placeholder="Cari nama kelompok..." className="flex-1 p-2 outline-none text-sm font-medium text-slate-700" value={search} onChange={(e) => setSearch(e.target.value)}/>
            </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-10">
            {loading ? <div className="text-center py-20">Loading Gallery...</div> : filteredProjects.length === 0 ? <div className="text-center py-20 text-slate-400">Belum ada project yang dikumpulkan.</div> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredProjects.map((item) => (
                        <div key={item.id} className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all border border-slate-100 overflow-hidden group flex flex-col h-full relative">
                            {canDelete && (
                                <button onClick={() => handleDelete(item.id, item.kelompok)} className="absolute top-3 left-3 z-20 bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg shadow-lg"><Trash2 size={16} /></button>
                            )}
                            <div className="h-48 bg-slate-200 relative overflow-hidden border-b border-slate-100">
                                {item.imageBase64 ? <img src={item.imageBase64} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt={item.kelompok}/> : <div className="w-full h-full flex items-center justify-center text-slate-400 flex-col gap-2"><ImageIcon size={32}/><span className="text-xs">No Preview</span></div>}
                                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-[#002f6c] shadow-sm z-10">{item.kelompok}</div>
                            </div>
                            <div className="p-6 flex flex-col flex-1">
                                <div className="mb-4"><h3 className="font-bold text-lg text-slate-800 mb-1 flex items-center gap-2"><Users size={16} className="text-[#00994d]"/> {item.kelompok}</h3><p className="text-xs text-slate-500 line-clamp-2">{item.anggota}</p></div>
                                <p className="text-sm text-slate-600 mb-6 line-clamp-3 italic flex-1 border-l-2 border-slate-200 pl-3">"{item.deskripsi || 'Mencoba hal baru...'}"</p>
                                <a href={item.link} target="_blank" rel="noreferrer" className="mt-auto w-full bg-slate-50 hover:bg-[#002f6c] text-[#002f6c] hover:text-white border border-slate-200 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all">Kunjungi Website <ExternalLink size={14}/></a>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    </div>
  )
}