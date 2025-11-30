import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, BookOpen, User, Eye, Home, Trash2 } from 'lucide-react'
import { collection, query, orderBy, getDocs, deleteDoc, doc } from "firebase/firestore"
import { db } from "../services/firebase"
import { useAuth } from '../context/AuthContext'
import { canAccess } from '../utils/permissions'

export default function EbookPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  // Izin Hapus (Admin/Guru)
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

  const handleDelete = async (e, id) => {
      e.stopPropagation();
      if(confirm("Hapus materi ini secara permanen?")) {
          try { await deleteDoc(doc(db, "tkj_articles", id)); setArticles(p => p.filter(x => x.id !== id)); }
          catch(e) { alert(e.message); }
      }
  }

  const filteredArticles = articles.filter(a => a.title.toLowerCase().includes(search.toLowerCase()) || a.desc.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
        {/* HEADER */}
        <div className="bg-[#002f6c] text-white py-10 px-4 shadow-lg">
            <div className="max-w-5xl mx-auto">
                <div className="flex justify-between items-start mb-4">
                    <button onClick={() => navigate('/')} className="flex items-center gap-2 text-blue-200 hover:text-white text-sm font-bold transition-colors"><Home size={16}/> Kembali</button>
                </div>
                <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight mb-2">E-Library & Modul TKJ</h1>
                        <p className="text-blue-100 max-w-xl text-sm">Kumpulan materi, tutorial, dan e-book.</p>
                    </div>
                    <div className="bg-white/10 p-1.5 rounded-xl border border-white/20 flex items-center w-full md:w-auto min-w-[300px]">
                        <Search className="text-blue-200 ml-2" size={18}/>
                        <input type="text" placeholder="Cari materi..." className="bg-transparent border-none outline-none text-white text-sm px-3 py-1.5 w-full placeholder:text-blue-200/50" value={search} onChange={(e) => setSearch(e.target.value)}/>
                    </div>
                </div>
            </div>
        </div>

        {/* LIST MATERI */}
        <div className="max-w-5xl mx-auto px-4 py-12">
            {loading ? <div className="text-center">Loading...</div> : filteredArticles.length === 0 ? <div className="text-center py-20 text-slate-400">Belum ada materi.</div> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredArticles.map((item) => (
                        <div key={item.id} onClick={() => navigate(`/artikel/${item.id}`)} className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group flex flex-col h-full relative">
                            {/* TOMBOL HAPUS (Hanya muncul jika punya akses) */}
                            {canManageEbook && (
                                <button onClick={(e) => handleDelete(e, item.id)} className="absolute top-2 right-2 z-10 bg-red-600 text-white p-1.5 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110">
                                    <Trash2 size={14}/>
                                </button>
                            )}
                            
                            <div className="h-40 bg-slate-100 relative overflow-hidden">
                                {item.thumbnail ? <img src={item.thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/> : <div className="w-full h-full flex items-center justify-center bg-slate-100"><BookOpen size={40} className="text-slate-300"/></div>}
                                <div className="absolute top-3 left-3 bg-[#00994d] text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">{item.category}</div>
                            </div>
                            <div className="p-5 flex flex-col flex-1">
                                <h3 className="font-bold text-lg text-slate-800 leading-snug mb-2 line-clamp-2 group-hover:text-[#002f6c]">{item.title}</h3>
                                <p className="text-xs text-slate-500 line-clamp-3 mb-4 flex-1">{item.desc}</p>
                                <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-auto">
                                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase"><span className="flex items-center gap-1"><User size={12}/> {item.author || 'Admin'}</span></div>
                                    <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1"><Eye size={12}/> {item.views || 0}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    </div>
  )
}