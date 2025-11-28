import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ExternalLink, Plus, Search, Layout, Users, Image as ImageIcon, X, UploadCloud, AlertCircle, Trash2, Lock } from 'lucide-react'
import { collection, query, orderBy, getDocs, addDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore"
import { db } from "../services/firebase"

// COMPONENT MODAL
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
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  
  // State Upload
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [inputData, setInputData] = useState({
      kelompok: '',
      anggota: '',
      link: '',
      deskripsi: '',
      imageBase64: ''
  })
  const [imgPreview, setImgPreview] = useState(null)
  const fileInputRef = useRef(null)

  // FETCH PROJECTS
  useEffect(() => {
    const fetchProjects = async () => {
        try {
            const q = query(collection(db, "showcase_sas"), orderBy("createdAt", "desc"));
            const snap = await getDocs(q);
            setProjects(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    }
    fetchProjects();
  }, [])

  // --- FUNGSI BUKA MODAL DENGAN PIN (SECURITY) ---
  const handleOpenUpload = () => {
      const pin = prompt("🔒 Masukkan PIN Akses untuk Upload Project(Hint, nama grub pemrograman):");
      
      // PIN Sederhana (Bisa diganti sesuai kesepakatan kelas)
      if (pin === 'KORBAN NGODING') { 
          setIsUploadOpen(true);
      } else if (pin !== null) {
          alert("❌ PIN Salah! Minta PIN ke Ketua Kelas atau Guru.");
      }
  }

  // --- FUNGSI DELETE DENGAN PIN ---
  const handleDelete = async (id, namaKelompok) => {
      const pin = prompt(`⚠️ HAPUS DATA\nMasukkan PIN Admin untuk menghapus "${namaKelompok}":`);
      
      if (pin === 'tkj123') { 
          if(confirm("Yakin mau hapus project ini selamanya?")) {
              try {
                  await deleteDoc(doc(db, "showcase_sas", id));
                  setProjects(prevProjects => prevProjects.filter(p => p.id !== id));
                  alert("✅ Project berhasil dihapus!");
              } catch (error) {
                  alert("Gagal hapus: " + error.message);
              }
          }
      } else if (pin !== null) {
          alert("❌ PIN Salah Wak! Jangan iseng ya.");
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
                const MAX_WIDTH = 600; 
                const scaleSize = MAX_WIDTH / img.width;
                canvas.width = MAX_WIDTH;
                canvas.height = img.height * scaleSize;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
                resolve(dataUrl);
            }
        }
    });
  }

  const handleImageChange = async (e) => {
      const file = e.target.files[0];
      if(file) {
          if(file.size > 10 * 1024 * 1024) { alert("File max 10MB"); return; }
          const compressed = await compressImage(file);
          setImgPreview(compressed);
          setInputData({...inputData, imageBase64: compressed});
      }
  }

  const handleSubmit = async (e) => {
      e.preventDefault();
      if(!inputData.kelompok || !inputData.link) return alert("Isi data wajib!");
      
      try {
          await addDoc(collection(db, "showcase_sas"), {
              ...inputData,
              createdAt: serverTimestamp()
          });
          alert("✅ Project berhasil dikumpulkan! Good Luck! 🔥");
          window.location.reload();
      } catch (error) {
          alert("Gagal submit: " + error.message);
      }
  }

  // FILTER SEARCH
  const filteredProjects = projects.filter(p => 
      p.kelompok.toLowerCase().includes(search.toLowerCase()) || 
      p.anggota.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
        {/* Header */}
        <div className="bg-[#002f6c] text-white py-12 px-4 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-10 -mt-10 blur-3xl"></div>
            <div className="max-w-7xl mx-auto relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-white/80 hover:text-white font-bold mb-4 transition-colors"><ArrowLeft size={20}/> Kembali ke Home</button>
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight">Showcase Project SAS</h1>
                        <p className="text-blue-200 mt-2 max-w-xl">Galeri hasil karya Landing Page siswa-siswi TKJ. Lihat kreativitas teman-temanmu disini!</p>
                    </div>
                    {/* BUTTON DENGAN PROTEKSI PIN */}
                    <button onClick={handleOpenUpload} className="bg-[#00994d] hover:bg-[#007a3d] text-white px-6 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2 transition-all transform hover:scale-105">
                        <Lock size={18} className="text-white/80"/> Submit Project
                    </button>
                </div>
            </div>
        </div>

        {/* Search Bar */}
        <div className="max-w-7xl mx-auto px-4 -mt-6 relative z-20">
            <div className="bg-white p-2 rounded-xl shadow-md flex items-center gap-2 border border-slate-200">
                <Search className="text-slate-400 ml-2" size={20}/>
                <input 
                    type="text" 
                    placeholder="Cari nama kelompok atau anggota..." 
                    className="flex-1 p-2 outline-none text-sm font-medium text-slate-700"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
        </div>

        {/* Content Grid */}
        <div className="max-w-7xl mx-auto px-4 py-10">
            {loading ? (
                <div className="text-center py-20"><div className="animate-spin w-10 h-10 border-4 border-[#002f6c] border-t-transparent rounded-full mx-auto"></div></div>
            ) : filteredProjects.length === 0 ? (
                <div className="text-center py-20 text-slate-400 bg-white rounded-xl border border-dashed border-slate-300">
                    <Layout size={48} className="mx-auto mb-2 opacity-50"/>
                    <p>Belum ada project yang dikumpulkan.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredProjects.map((item) => (
                        <div key={item.id} className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all border border-slate-100 overflow-hidden group flex flex-col h-full relative">
                            
                            {/* TOMBOL DELETE (ADMIN ONLY - PROTECTED) */}
                            <button 
                                onClick={() => handleDelete(item.id, item.kelompok)}
                                className="absolute top-3 left-3 z-20 bg-red-500/80 hover:bg-red-600 text-white p-1.5 rounded-lg backdrop-blur-sm transition-all shadow-sm opacity-0 group-hover:opacity-100"
                                title="Hapus Project (Admin)"
                            >
                                <Trash2 size={16} />
                            </button>

                            {/* Image Thumbnail */}
                            <div className="h-48 bg-slate-200 relative overflow-hidden border-b border-slate-100">
                                {item.imageBase64 ? (
                                    <img src={item.imageBase64} alt={item.kelompok} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"/>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-400 flex-col gap-2">
                                        <ImageIcon size={32}/>
                                        <span className="text-xs">No Screenshot</span>
                                    </div>
                                )}
                                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-[#002f6c] shadow-sm z-10">
                                    {item.kelompok}
                                </div>
                            </div>
                            
                            {/* Content */}
                            <div className="p-6 flex flex-col flex-1">
                                <div className="mb-4">
                                    <h3 className="font-bold text-lg text-slate-800 mb-1 flex items-center gap-2">
                                        <Users size={16} className="text-[#00994d]"/> {item.kelompok}
                                    </h3>
                                    <p className="text-xs text-slate-500 line-clamp-2">{item.anggota}</p>
                                </div>
                                
                                <p className="text-sm text-slate-600 mb-6 line-clamp-3 italic flex-1 border-l-2 border-slate-200 pl-3">
                                    "{item.deskripsi || 'Tidak ada deskripsi.'}"
                                </p>

                                <a href={item.link} target="_blank" rel="noreferrer" className="mt-auto w-full bg-slate-50 hover:bg-[#002f6c] text-[#002f6c] hover:text-white border border-slate-200 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all">
                                    Kunjungi Website <ExternalLink size={14}/>
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>

        {/* MODAL UPLOAD */}
        <Modal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} title="Kumpulkan Project SAS">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-3 items-start">
                    <AlertCircle className="text-blue-600 shrink-0 mt-0.5" size={16}/>
                    <p className="text-xs text-blue-800">Pastikan link project sudah bisa diakses publik (Vercel/Netlify). Screenshot tampilan website agar lebih menarik.</p>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Nama Kelompok / Siswa</label>
                    <input type="text" value={inputData.kelompok} onChange={e => setInputData({...inputData, kelompok: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:border-[#002f6c] outline-none" placeholder="Contoh: Kelompok 1 (Rafa, Budi)" required/>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Anggota Lengkap</label>
                    <textarea value={inputData.anggota} onChange={e => setInputData({...inputData, anggota: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:border-[#002f6c] outline-none h-20 resize-none" placeholder="Tulis nama lengkap semua anggota..." required/>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Link Project (URL)</label>
                    <input type="url" value={inputData.link} onChange={e => setInputData({...inputData, link: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:border-[#002f6c] outline-none text-blue-600 font-medium" placeholder="https://..." required/>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Screenshot Website (Opsional)</label>
                    <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                </div>

                {imgPreview && (
                    <div className="relative h-32 w-full rounded-lg overflow-hidden border border-slate-200 mt-2">
                        <img src={imgPreview} alt="Preview" className="w-full h-full object-cover"/>
                        <button type="button" onClick={() => {setImgPreview(null); setInputData({...inputData, imageBase64: ''}); if(fileInputRef.current) fileInputRef.current.value='';}} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full shadow-md hover:bg-red-600"><X size={12}/></button>
                    </div>
                )}

                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Deskripsi Singkat</label>
                    <textarea value={inputData.deskripsi} onChange={e => setInputData({...inputData, deskripsi: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:border-[#002f6c] outline-none h-24 resize-none" placeholder="Ceritakan sedikit tentang websitemu..."/>
                </div>

                <button type="submit" className="w-full bg-[#00994d] hover:bg-[#007a3d] text-white py-3 rounded-xl font-bold shadow-md flex items-center justify-center gap-2 mt-2 transition-all">
                    <UploadCloud size={18}/> Submit Project
                </button>
            </form>
        </Modal>
    </div>
  )
}