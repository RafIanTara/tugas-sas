import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, BookOpen, User, Eye, Home, Plus, X, UploadCloud, Link as LinkIcon, Image as ImageIcon, AlertCircle } from 'lucide-react'
import { collection, query, orderBy, getDocs, addDoc, serverTimestamp } from "firebase/firestore"
import { db } from "../services/firebase"

// KOMPONEN MODAL (Reusable)
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
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  // State Upload
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [imgPreview, setImgPreview] = useState(null)
  const fileInputRef = useRef(null)
  const [inputData, setInputData] = useState({
      title: '',
      category: 'Modul',
      author: 'Admin TKJ',
      desc: '',
      content: '',
      link_download: '', // Link Google Drive/PDF
      thumbnail: ''
  })

  // FETCH DATA
  useEffect(() => {
    const fetchArticles = async () => {
        try {
            const q = query(collection(db, "tkj_articles"), orderBy("createdAt", "desc"));
            const snap = await getDocs(q);
            setArticles(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    }
    fetchArticles();
  }, [])

  // PROTEKSI PIN
  const handleOpenUpload = () => {
      const pin = prompt("🔐 Masukkan PIN Admin untuk Menambah Materi:");
      if (pin === 'tkj123') { 
          setIsUploadOpen(true);
      } else if (pin !== null) {
          alert("❌ PIN Salah!");
      }
  }

  // COMPRESS IMAGE
  const compressImage = (file) => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new window.Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 800; 
                const scaleSize = MAX_WIDTH / img.width;
                canvas.width = MAX_WIDTH;
                canvas.height = img.height * scaleSize;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL('image/jpeg', 0.7));
            }
        }
    });
  }

  const handleImageChange = async (e) => {
      const file = e.target.files[0];
      if(file) {
          const compressed = await compressImage(file);
          setImgPreview(compressed);
          setInputData({...inputData, thumbnail: compressed});
      }
  }

  // SUBMIT DATA
  const handleSubmit = async (e) => {
      e.preventDefault();
      if(!inputData.title || !inputData.desc) return alert("Judul dan Deskripsi wajib diisi!");
      
      try {
          await addDoc(collection(db, "tkj_articles"), {
              ...inputData,
              views: 0,
              createdAt: serverTimestamp() // Penting buat sorting
          });
          alert("✅ Materi berhasil ditambahkan!");
          window.location.reload();
      } catch (error) {
          alert("Gagal: " + error.message);
      }
  }

  // Filter Pencarian
  const filteredArticles = articles.filter(a => 
      a.title.toLowerCase().includes(search.toLowerCase()) || 
      a.desc.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
        
        {/* HEADER */}
        <div className="bg-[#002f6c] text-white py-10 px-4 shadow-lg">
            <div className="max-w-5xl mx-auto">
                <div className="flex justify-between items-start mb-4">
                    <button onClick={() => navigate('/')} className="flex items-center gap-2 text-blue-200 hover:text-white text-sm font-bold transition-colors">
                        <Home size={16}/> Kembali ke Beranda
                    </button>
                    {/* TOMBOL TAMBAH (ADMIN) */}
                    <button onClick={handleOpenUpload} className="bg-[#00994d] hover:bg-[#007a3d] text-white px-4 py-2 rounded-lg text-xs font-bold shadow-md flex items-center gap-2 transition-all">
                        <Plus size={16}/> Tambah Materi
                    </button>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight mb-2">E-Library & Modul TKJ</h1>
                        <p className="text-blue-100 max-w-xl text-sm">Kumpulan materi, tutorial, dan e-book seputar Teknik Komputer & Jaringan.</p>
                    </div>
                    
                    {/* Search Bar */}
                    <div className="bg-white/10 p-1.5 rounded-xl border border-white/20 flex items-center w-full md:w-auto min-w-[300px]">
                        <Search className="text-blue-200 ml-2" size={18}/>
                        <input 
                            type="text" 
                            placeholder="Cari materi (misal: Mikrotik)..." 
                            className="bg-transparent border-none outline-none text-white text-sm px-3 py-1.5 w-full placeholder:text-blue-200/50"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            </div>
        </div>

        {/* CONTENT GRID */}
        <div className="max-w-5xl mx-auto px-4 py-12">
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1,2,3].map(i => <div key={i} className="h-64 bg-slate-200 rounded-2xl animate-pulse"></div>)}
                </div>
            ) : filteredArticles.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                    <BookOpen size={48} className="mx-auto text-slate-300 mb-3"/>
                    <p className="text-slate-500 font-medium">Belum ada materi yang ditemukan.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredArticles.map((item) => (
                        <div key={item.id} onClick={() => navigate(`/artikel/${item.id}`)} className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group flex flex-col h-full">
                            
                            {/* Thumbnail */}
                            <div className="h-40 bg-slate-100 relative overflow-hidden">
                                {item.thumbnail ? (
                                    <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100">
                                        <BookOpen size={40} className="text-blue-200"/>
                                    </div>
                                )}
                                <div className="absolute top-3 left-3 bg-[#00994d] text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">
                                    {item.category || 'Umum'}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-5 flex flex-col flex-1">
                                <h3 className="font-bold text-lg text-slate-800 leading-snug mb-2 line-clamp-2 group-hover:text-[#002f6c] transition-colors">
                                    {item.title}
                                </h3>
                                <p className="text-xs text-slate-500 line-clamp-3 mb-4 flex-1">
                                    {item.desc}
                                </p>
                                
                                <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-auto">
                                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase">
                                        <span className="flex items-center gap-1"><User size={12}/> {item.author || 'Admin'}</span>
                                    </div>
                                    <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                                        <Eye size={12}/> {item.views || 0}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>

        {/* MODAL FORM UPLOAD */}
        <Modal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} title="Tambah Materi Baru">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Judul Materi</label>
                    <input type="text" value={inputData.title} onChange={e => setInputData({...inputData, title: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:border-[#002f6c] outline-none" placeholder="Contoh: Modul Dasar Mikrotik" required/>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Kategori</label>
                        <select value={inputData.category} onChange={e => setInputData({...inputData, category: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:border-[#002f6c] outline-none">
                            <option>Modul</option>
                            <option>E-Book</option>
                            <option>Tutorial</option>
                            <option>Tugas</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Penulis</label>
                        <input type="text" value={inputData.author} onChange={e => setInputData({...inputData, author: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:border-[#002f6c] outline-none"/>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Link Download (Google Drive/PDF)</label>
                    <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden">
                        <div className="bg-slate-100 p-2.5 border-r border-slate-300 text-slate-500"><LinkIcon size={16}/></div>
                        <input type="url" value={inputData.link_download} onChange={e => setInputData({...inputData, link_download: e.target.value})} className="flex-1 p-2.5 text-sm outline-none text-blue-600" placeholder="https://..."/>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">*Opsional. Isi jika ada file yang bisa didownload.</p>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Cover / Thumbnail</label>
                    <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                </div>
                {imgPreview && (
                    <div className="h-32 w-full rounded-lg overflow-hidden border border-slate-200 relative">
                        <img src={imgPreview} className="w-full h-full object-cover"/>
                        <button type="button" onClick={() => {setImgPreview(null); setInputData({...inputData, thumbnail: ''}); fileInputRef.current.value=''}} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"><X size={12}/></button>
                    </div>
                )}

                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Deskripsi Singkat</label>
                    <textarea value={inputData.desc} onChange={e => setInputData({...inputData, desc: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:border-[#002f6c] outline-none h-20 resize-none" placeholder="Ringkasan isi materi..." required/>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Isi Materi (Teks/Artikel)</label>
                    <textarea value={inputData.content} onChange={e => setInputData({...inputData, content: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:border-[#002f6c] outline-none h-32 resize-none" placeholder="Isi materi lengkap di sini (Boleh HTML sederhana)..."/>
                </div>

                <button type="submit" className="w-full bg-[#00994d] hover:bg-[#007a3d] text-white py-3 rounded-xl font-bold shadow-md flex items-center justify-center gap-2 mt-2 transition-all">
                    <UploadCloud size={18}/> Publish Materi
                </button>
            </form>
        </Modal>
    </div>
  )
}