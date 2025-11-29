import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ExternalLink, Search, Layout, Users, Image as ImageIcon, X, UploadCloud, AlertCircle, Trash2, Lock } from 'lucide-react'
import { collection, query, orderBy, getDocs, addDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore"
import { db } from "../services/firebase"

// --- INTEGRASI AUTH ---
import { useAuth } from '../context/AuthContext'
import { canAccess } from '../utils/permissions'

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null
    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full md:max-w-lg rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border-t-4 border-[#002f6c]">
                <div className="flex justify-between items-center px-6 py-4 bg-slate-50 border-b border-slate-200 shrink-0">
                    <h3 className="text-lg font-bold tracking-wide flex items-center gap-2 uppercase text-[#002f6c]">{title}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-red-500 transition-colors"><X size={20} /></button>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-white text-slate-800">{children}</div>
            </div>
        </div>
    )
}

export default function ShowcasePage() {
  const navigate = useNavigate()
  const { user } = useAuth() // Ambil data user
  
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [inputData, setInputData] = useState({ kelompok: '', anggota: '', link: '', deskripsi: '', imageBase64: '' })
  const [imgPreview, setImgPreview] = useState(null)
  const fileInputRef = useRef(null)

  // IZIN AKSES
  const canUpload = canAccess(user, 'UPLOAD_SHOWCASE');
  const canDelete = canAccess(user, 'MANAGE_USERS'); // Hanya Guru/Admin

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

  // HANDLER UPLOAD (Tanpa PIN, Cek Role Saja)
  const handleOpenUpload = () => {
      if (canUpload) {
          setIsUploadOpen(true);
      } else {
          if(!user) alert("Silakan Login terlebih dahulu!");
          else if(user.status !== 'ACTIVE') alert("Akun kamu masih menunggu persetujuan Guru.");
          else alert("Akses Ditolak.");
      }
  }

  // HANDLER DELETE (Hanya Guru/Admin)
  const handleDelete = async (id, namaKelompok) => {
      if(confirm(`[Admin/Guru] Hapus project "${namaKelompok}" selamanya?`)) {
          try {
              await deleteDoc(doc(db, "showcase_sas", id));
              setProjects(prev => prev.filter(p => p.id !== id));
          } catch (error) { alert("Gagal hapus: " + error.message); }
      }
  }

  const compressImage = (file) => {
    return new Promise((resolve) => {
        const reader = new FileReader(); reader.readAsDataURL(file);
        reader.onload = (event) => { const img = new window.Image(); img.src = event.target.result; img.onload = () => { const canvas = document.createElement('canvas'); const MAX_WIDTH = 600; const scaleSize = MAX_WIDTH / img.width; canvas.width = MAX_WIDTH; canvas.height = img.height * scaleSize; const ctx = canvas.getContext('2d'); ctx.drawImage(img, 0, 0, canvas.width, canvas.height); resolve(canvas.toDataURL('image/jpeg', 0.6)); } }
    });
  }

  const handleImageChange = async (e) => { const file = e.target.files[0]; if(file) { const compressed = await compressImage(file); setImgPreview(compressed); setInputData({...inputData, imageBase64: compressed}); } }

  const handleSubmit = async (e) => {
      e.preventDefault();
      try {
          await addDoc(collection(db, "showcase_sas"), { ...inputData, createdAt: serverTimestamp() });
          alert("✅ Project berhasil dikumpulkan!"); window.location.reload();
      } catch (error) { alert("Gagal submit: " + error.message); }
  }

  const filteredProjects = projects.filter(p => p.kelompok.toLowerCase().includes(search.toLowerCase()) || p.anggota.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
        <div className="bg-[#002f6c] text-white py-12 px-4 shadow-lg relative overflow-hidden">
            <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <button onClick={() => navigate('/')} className="flex items-center gap-2 text-white/80 hover:text-white font-bold mb-4 transition-colors"><ArrowLeft size={20}/> Kembali ke Home</button>
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight">Showcase Project SAS</h1>
                    <p className="text-blue-200 mt-2 max-w-xl">Galeri hasil karya Landing Page siswa-siswi TKJ.</p>
                </div>
                <button onClick={handleOpenUpload} className="bg-[#00994d] hover:bg-[#007a3d] text-white px-6 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2 transition-all transform hover:scale-105">
                    {canUpload ? <UploadCloud size={18}/> : <Lock size={18}/>} Submit Project
                </button>
            </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 -mt-6 relative z-20">
            <div className="bg-white p-2 rounded-xl shadow-md flex items-center gap-2 border border-slate-200">
                <Search className="text-slate-400 ml-2" size={20}/>
                <input type="text" placeholder="Cari nama kelompok..." className="flex-1 p-2 outline-none text-sm font-medium text-slate-700" value={search} onChange={(e) => setSearch(e.target.value)}/>
            </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-10">
            {loading ? <div className="text-center py-20">Loading...</div> : filteredProjects.length === 0 ? <div className="text-center py-20 text-slate-400">Belum ada project.</div> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredProjects.map((item) => (
                        <div key={item.id} className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all border border-slate-100 overflow-hidden group flex flex-col h-full relative">
                            {canDelete && (
                                <button onClick={() => handleDelete(item.id, item.kelompok)} className="absolute top-3 left-3 z-20 bg-red-500/80 hover:bg-red-600 text-white p-1.5 rounded-lg backdrop-blur-sm shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16} /></button>
                            )}
                            <div className="h-48 bg-slate-200 relative overflow-hidden border-b border-slate-100">
                                {item.imageBase64 ? <img src={item.imageBase64} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"/> : <div className="w-full h-full flex items-center justify-center text-slate-400 flex-col gap-2"><ImageIcon size={32}/><span className="text-xs">No Screenshot</span></div>}
                                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-[#002f6c] shadow-sm z-10">{item.kelompok}</div>
                            </div>
                            <div className="p-6 flex flex-col flex-1">
                                <div className="mb-4"><h3 className="font-bold text-lg text-slate-800 mb-1 flex items-center gap-2"><Users size={16} className="text-[#00994d]"/> {item.kelompok}</h3><p className="text-xs text-slate-500 line-clamp-2">{item.anggota}</p></div>
                                <p className="text-sm text-slate-600 mb-6 line-clamp-3 italic flex-1 border-l-2 border-slate-200 pl-3">"{item.deskripsi || 'Tidak ada deskripsi.'}"</p>
                                <a href={item.link} target="_blank" rel="noreferrer" className="mt-auto w-full bg-slate-50 hover:bg-[#002f6c] text-[#002f6c] hover:text-white border border-slate-200 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all">Kunjungi Website <ExternalLink size={14}/></a>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>

        <Modal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} title="Kumpulkan Project SAS">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div><label className="block text-xs font-bold text-slate-500 mb-1">Nama Kelompok</label><input type="text" value={inputData.kelompok} onChange={e => setInputData({...inputData, kelompok: e.target.value})} className="w-full border p-2 rounded text-sm" required/></div>
                <div><label className="block text-xs font-bold text-slate-500 mb-1">Anggota</label><textarea value={inputData.anggota} onChange={e => setInputData({...inputData, anggota: e.target.value})} className="w-full border p-2 rounded text-sm h-20" required/></div>
                <div><label className="block text-xs font-bold text-slate-500 mb-1">Link URL</label><input type="url" value={inputData.link} onChange={e => setInputData({...inputData, link: e.target.value})} className="w-full border p-2 rounded text-sm" required/></div>
                <div><label className="block text-xs font-bold text-slate-500 mb-1">Screenshot</label><input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="w-full text-xs"/></div>
                {imgPreview && <img src={imgPreview} className="h-32 rounded border object-cover"/>}
                <div><label className="block text-xs font-bold text-slate-500 mb-1">Deskripsi</label><textarea value={inputData.deskripsi} onChange={e => setInputData({...inputData, deskripsi: e.target.value})} className="w-full border p-2 rounded text-sm h-20"/></div>
                <button className="w-full bg-[#00994d] text-white py-3 rounded-xl font-bold">Submit Project</button>
            </form>
        </Modal>
    </div>
  )
}