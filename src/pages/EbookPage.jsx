import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, BookOpen, User, Eye, Home, Plus, X, UploadCloud, Link as LinkIcon, Trash2 } from 'lucide-react'
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

export default function EbookPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [inputData, setInputData] = useState({ title: '', category: 'Modul', author: 'Admin TKJ', desc: '', content: '', link_download: '', thumbnail: '' })
  const [imgPreview, setImgPreview] = useState(null)
  const fileInputRef = useRef(null)

  // PERMISSIONS
  // Kita pakai permission 'POST_NEWS' karena sifatnya sama (Publish Konten)
  const canManageEbook = canAccess(user, 'POST_NEWS'); 

  useEffect(() => {
    const fetchArticles = async () => {
        try {
            const q = query(collection(db, "tkj_articles"), orderBy("createdAt", "desc"));
            const snap = await getDocs(q);
            setArticles(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (error) { console.error("Error:", error); } finally { setLoading(false); }
    }
    fetchArticles();
  }, [])

  const handleOpenUpload = () => {
      if (canManageEbook) setIsUploadOpen(true);
      else alert("Hanya Guru/Admin yang boleh upload materi.");
  }

  const handleDelete = async (e, id) => {
      e.stopPropagation();
      if(confirm("Hapus materi ini?")) {
          try { await deleteDoc(doc(db, "tkj_articles", id)); setArticles(p => p.filter(x => x.id !== id)); }
          catch(e) { alert(e.message); }
      }
  }

  const compressImage = (file) => {
    return new Promise((resolve) => {
        const reader = new FileReader(); reader.readAsDataURL(file);
        reader.onload = (event) => { const img = new window.Image(); img.src = event.target.result; img.onload = () => { const canvas = document.createElement('canvas'); const MAX_WIDTH = 800; const scaleSize = MAX_WIDTH / img.width; canvas.width = MAX_WIDTH; canvas.height = img.height * scaleSize; const ctx = canvas.getContext('2d'); ctx.drawImage(img, 0, 0, canvas.width, canvas.height); resolve(canvas.toDataURL('image/jpeg', 0.7)); } }
    });
  }

  const handleImageChange = async (e) => { const f = e.target.files[0]; if(f) { const c = await compressImage(f); setImgPreview(c); setInputData({...inputData, thumbnail: c}); } }

  const handleSubmit = async (e) => {
      e.preventDefault();
      try { await addDoc(collection(db, "tkj_articles"), { ...inputData, views: 0, createdAt: serverTimestamp() }); alert("Materi ditambahkan!"); window.location.reload(); } 
      catch (error) { alert("Gagal: " + error.message); }
  }

  const filteredArticles = articles.filter(a => a.title.toLowerCase().includes(search.toLowerCase()) || a.desc.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
        <div className="bg-[#002f6c] text-white py-10 px-4 shadow-lg">
            <div className="max-w-5xl mx-auto">
                <div className="flex justify-between items-start mb-4">
                    <button onClick={() => navigate('/')} className="flex items-center gap-2 text-blue-200 hover:text-white text-sm font-bold transition-colors"><Home size={16}/> Kembali</button>
                    {canManageEbook && (
                        <button onClick={handleOpenUpload} className="bg-[#00994d] hover:bg-[#007a3d] text-white px-4 py-2 rounded-lg text-xs font-bold shadow-md flex items-center gap-2 transition-all"><Plus size={16}/> Tambah Materi</button>
                    )}
                </div>
                <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                    <div><h1 className="text-3xl font-black tracking-tight mb-2">E-Library & Modul TKJ</h1><p className="text-blue-100 max-w-xl text-sm">Kumpulan materi, tutorial, dan e-book.</p></div>
                    <div className="bg-white/10 p-1.5 rounded-xl border border-white/20 flex items-center w-full md:w-auto min-w-[300px]"><Search className="text-blue-200 ml-2" size={18}/><input type="text" placeholder="Cari materi..." className="bg-transparent border-none outline-none text-white text-sm px-3 py-1.5 w-full placeholder:text-blue-200/50" value={search} onChange={(e) => setSearch(e.target.value)}/></div>
                </div>
            </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-12">
            {loading ? <div className="text-center">Loading...</div> : filteredArticles.length === 0 ? <div className="text-center py-20 text-slate-400">Belum ada materi.</div> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredArticles.map((item) => (
                        <div key={item.id} onClick={() => navigate(`/artikel/${item.id}`)} className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group flex flex-col h-full relative">
                            {canManageEbook && <button onClick={(e) => handleDelete(e, item.id)} className="absolute top-2 right-2 z-10 bg-red-600 text-white p-1.5 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14}/></button>}
                            <div className="h-40 bg-slate-100 relative overflow-hidden">
                                {item.thumbnail ? <img src={item.thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/> : <div className="w-full h-full flex items-center justify-center bg-slate-100"><BookOpen size={40} className="text-slate-300"/></div>}
                                <div className="absolute top-3 left-3 bg-[#00994d] text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">{item.category}</div>
                            </div>
                            <div className="p-5 flex flex-col flex-1">
                                <h3 className="font-bold text-lg text-slate-800 leading-snug mb-2 line-clamp-2 group-hover:text-[#002f6c]">{item.title}</h3>
                                <p className="text-xs text-slate-500 line-clamp-3 mb-4 flex-1">{item.desc}</p>
                                <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-auto">
                                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase"><span className="flex items-center gap-1"><User size={12}/> {item.author}</span></div>
                                    <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1"><Eye size={12}/> {item.views || 0}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>

        <Modal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} title="Tambah Materi Baru">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div><label className="text-xs font-bold text-slate-500">Judul</label><input type="text" value={inputData.title} onChange={e => setInputData({...inputData, title: e.target.value})} className="w-full border p-2 rounded text-sm" required/></div>
                <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-xs font-bold text-slate-500">Kategori</label><select value={inputData.category} onChange={e => setInputData({...inputData, category: e.target.value})} className="w-full border p-2 rounded text-sm"><option>Modul</option><option>E-Book</option><option>Tutorial</option><option>Tugas</option></select></div>
                    <div><label className="text-xs font-bold text-slate-500">Penulis</label><input type="text" value={inputData.author} onChange={e => setInputData({...inputData, author: e.target.value})} className="w-full border p-2 rounded text-sm"/></div>
                </div>
                <div><label className="text-xs font-bold text-slate-500">Link Download (PDF/Drive)</label><input type="url" value={inputData.link_download} onChange={e => setInputData({...inputData, link_download: e.target.value})} className="w-full border p-2 rounded text-sm" placeholder="https://..."/></div>
                <div><label className="text-xs font-bold text-slate-500">Thumbnail</label><input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="w-full text-xs"/></div>
                {imgPreview && <img src={imgPreview} className="h-32 object-cover rounded"/>}
                <div><label className="text-xs font-bold text-slate-500">Deskripsi Singkat</label><textarea value={inputData.desc} onChange={e => setInputData({...inputData, desc: e.target.value})} className="w-full border p-2 rounded text-sm h-20" required/></div>
                <div><label className="text-xs font-bold text-slate-500">Isi Materi</label><textarea value={inputData.content} onChange={e => setInputData({...inputData, content: e.target.value})} className="w-full border p-2 rounded text-sm h-32"/></div>
                <button className="w-full bg-[#00994d] text-white py-3 rounded-xl font-bold">Publish Materi</button>
            </form>
        </Modal>
    </div>
  )
}