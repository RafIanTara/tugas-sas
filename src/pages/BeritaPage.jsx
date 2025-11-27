import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Calendar, ChevronRight, Tag, Newspaper, Trash2, CheckCircle, AlertCircle, X } from 'lucide-react'
import { collection, query, orderBy, getDocs, deleteDoc, doc } from "firebase/firestore"
import { db } from "../services/firebase"
import { motion, AnimatePresence } from "framer-motion"

// --- COMPONENT TOAST (Notifikasi) ---
const Toast = ({ message, type, onClose }) => {
    return (
        <motion.div 
            initial={{ opacity: 0, y: -50, x: 50 }} 
            animate={{ opacity: 1, y: 0, x: 0 }} 
            exit={{ opacity: 0, y: -20, x: 20 }} 
            className={`fixed top-5 right-5 z-[100] flex items-center gap-3 px-4 py-3 rounded-lg shadow-xl border-l-4 min-w-[300px] ${type === 'success' ? 'bg-white border-green-500 text-slate-700' : 'bg-white border-red-500 text-slate-700'}`}
        >
            {type === 'success' ? <CheckCircle className="text-green-500" size={20} /> : <AlertCircle className="text-red-500" size={20} />}
            <span className="text-sm font-semibold">{message}</span>
            <button onClick={onClose} className="ml-auto text-slate-400 hover:text-slate-600"><X size={14} /></button>
        </motion.div>
    )
}

export default function BeritaPage() {
  const navigate = useNavigate()
  const [newsList, setNewsList] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedNews, setSelectedNews] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [toast, setToast] = useState(null)

  // Helper Toast
  const triggerToast = (msg, type = 'success') => { 
      setToast({ message: msg, type }); 
      setTimeout(() => setToast(null), 3000); 
  }

  // Cek Admin & Fetch Data
  useEffect(() => {
    // Cek apakah user sudah login sebagai admin (dari localStorage dashboard)
    const checkAdmin = localStorage.getItem('tkj_admin_auth') === 'true';
    setIsAdmin(checkAdmin);

    const fetchNews = async () => {
        try {
            const q = query(collection(db, "berita_sekolah"), orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(q);
            const newsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setNewsList(newsData);
        } catch (error) {
            console.error("Error fetch:", error);
        } finally {
            setLoading(false);
        }
    }
    fetchNews();
  }, [])

  // Handler Delete
  const handleDelete = async (e, id) => {
      e.stopPropagation(); // Biar gak ngebuka modal detail saat klik tombol hapus
      
      if(confirm("Yakin mau hapus berita ini permanen?")) {
          try {
              await deleteDoc(doc(db, "berita_sekolah", id));
              // Update state langsung biar gak perlu refresh
              setNewsList(prev => prev.filter(item => item.id !== id));
              triggerToast("Berita berhasil dihapus!", "success");
          } catch (error) {
              triggerToast("Gagal menghapus: " + error.message, "error");
          }
      }
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
        <AnimatePresence>
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </AnimatePresence>

        {/* Header */}
        <div className="bg-[#002f6c] text-white py-10 px-4 shadow-md">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-start">
                    <div>
                        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-white/80 hover:text-white font-bold mb-4 transition-colors"><ArrowLeft size={20}/> Kembali</button>
                        <h1 className="text-3xl font-black">Arsip Berita & Kegiatan</h1>
                        <p className="text-blue-200 mt-2">Kumpulan informasi terkini seputar jurusan TKJ.</p>
                    </div>
                    {isAdmin && (
                        <div className="bg-white/10 px-4 py-2 rounded-lg border border-white/20 text-xs font-bold text-green-300 flex items-center gap-2">
                            <CheckCircle size={14}/> Mode Admin Aktif
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto px-4 py-10">
            {loading ? (
                <div className="text-center py-20"><div className="animate-spin w-10 h-10 border-4 border-[#002f6c] border-t-transparent rounded-full mx-auto"></div></div>
            ) : newsList.length === 0 ? (
                <div className="text-center py-20 text-slate-400 bg-white rounded-xl border border-dashed border-slate-300">
                    <Newspaper size={48} className="mx-auto mb-2 opacity-50"/>
                    <p>Belum ada berita yang diposting.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {newsList.map((item) => (
                        <div key={item.id} onClick={() => setSelectedNews(item)} className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all border border-slate-100 flex flex-col h-full cursor-pointer relative">
                            
                            {/* TOMBOL HAPUS (HANYA ADMIN) */}
                            {isAdmin && (
                                <button 
                                    onClick={(e) => handleDelete(e, item.id)} 
                                    className="absolute top-2 right-2 z-20 bg-red-600 text-white p-2 rounded-full shadow-lg hover:bg-red-700 hover:scale-110 transition-all"
                                    title="Hapus Berita"
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}

                            <div className="h-48 overflow-hidden relative bg-slate-100">
                                {item.image ? (
                                    <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"/>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300"><Tag size={40}/></div>
                                )}
                                <div className="absolute top-3 left-3 bg-[#002f6c] text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">{item.category}</div>
                            </div>
                            <div className="p-5 flex flex-col flex-1">
                                <div className="text-[10px] font-bold text-slate-400 mb-2 flex items-center gap-1"><Calendar size={10}/> {item.dateString}</div>
                                <h3 className="text-base font-bold text-slate-800 mb-3 leading-snug group-hover:text-[#00994d] transition-colors line-clamp-2">{item.title}</h3>
                                <p className="text-xs text-slate-500 line-clamp-3 mb-4 flex-1">{item.content}</p>
                                <div className="mt-auto pt-3 border-t border-slate-100 flex justify-between items-center">
                                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">{item.author}</span>
                                    <span className="text-xs font-bold text-[#00994d] hover:text-[#007a3d] flex items-center gap-1">Baca <ChevronRight size={12}/></span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>

        {/* MODAL DETAIL BERITA */}
        {selectedNews && (
            <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200" onClick={() => setSelectedNews(null)}>
                <div className="bg-white w-full md:max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                    <div className="relative h-64 shrink-0 bg-slate-100">
                        {selectedNews.image && <img src={selectedNews.image} alt={selectedNews.title} className="w-full h-full object-cover"/>}
                        <button onClick={() => setSelectedNews(null)} className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-red-500 transition-colors"><X size={20}/></button>
                        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-6 pt-20">
                            <span className="bg-[#00994d] text-white text-xs font-bold px-3 py-1 rounded-full mb-2 inline-block">{selectedNews.category}</span>
                            <h2 className="text-2xl font-bold text-white leading-tight">{selectedNews.title}</h2>
                            <div className="flex items-center gap-4 mt-2 text-white/80 text-xs font-medium">
                                <span className="flex items-center gap-1"><Calendar size={12}/> {selectedNews.dateString}</span>
                                <span>Oleh: {selectedNews.author}</span>
                            </div>
                        </div>
                    </div>
                    <div className="p-8 overflow-y-auto custom-scrollbar">
                        <p className="text-slate-700 leading-relaxed whitespace-pre-line text-base">{selectedNews.content}</p>
                    </div>
                </div>
            </div>
        )}
    </div>
  )
}