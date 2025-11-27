import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Image, X } from 'lucide-react'
import { collection, query, orderBy, getDocs } from "firebase/firestore"
import { db } from "../services/firebase"

export default function GaleriPage() {
  const navigate = useNavigate()
  const [galeri, setGaleri] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedImg, setSelectedImg] = useState(null)

  useEffect(() => {
    const fetchGaleri = async () => {
        try {
            const q = query(collection(db, "galeri_sekolah"), orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(q);
            const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setGaleri(data);
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    }
    fetchGaleri();
  }, [])

  return (
    <div className="min-h-screen bg-slate-50">
        <div className="bg-[#002f6c] text-white py-10 px-4 shadow-md">
            <div className="max-w-6xl mx-auto">
                <button onClick={() => navigate('/')} className="flex items-center gap-2 text-white/80 hover:text-white font-bold mb-4 transition-colors"><ArrowLeft size={20}/> Kembali</button>
                <h1 className="text-3xl font-black">Galeri Kegiatan TKJ</h1>
                <p className="text-blue-200 mt-2">Dokumentasi aktivitas dan karya siswa.</p>
            </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-10">
            {loading ? (
                <div className="text-center py-20"><div className="animate-spin w-10 h-10 border-4 border-[#002f6c] border-t-transparent rounded-full mx-auto"></div></div>
            ) : galeri.length === 0 ? (
                <div className="text-center py-20 text-slate-400 bg-white rounded-xl border border-dashed border-slate-300">
                    <Image size={48} className="mx-auto mb-2 opacity-50"/>
                    <p>Belum ada foto di galeri.</p>
                </div>
            ) : (
                <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                    {galeri.map((item) => (
                        <div key={item.id} className="break-inside-avoid bg-white rounded-xl shadow-sm overflow-hidden group cursor-pointer hover:shadow-lg transition-all" onClick={() => setSelectedImg(item)}>
                            <img src={item.image} alt={item.caption} className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"/>
                            <div className="p-3 bg-white">
                                <p className="text-sm font-medium text-slate-700 line-clamp-2">{item.caption}</p>
                                <p className="text-[10px] text-slate-400 mt-1">Oleh: {item.author}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>

        {/* LIGHTBOX MODAL */}
        {selectedImg && (
            <div className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setSelectedImg(null)}>
                <button className="absolute top-4 right-4 text-white bg-white/10 p-2 rounded-full hover:bg-white/20"><X size={24}/></button>
                <div className="max-w-4xl w-full">
                    <img src={selectedImg.image} className="max-w-full max-h-[80vh] mx-auto rounded-lg shadow-2xl border-2 border-white/10"/>
                    <div className="text-center text-white mt-4">
                        <p className="font-bold text-lg">{selectedImg.caption}</p>
                        <p className="text-sm opacity-70 mt-1">Diunggah oleh {selectedImg.author}</p>
                    </div>
                </div>
            </div>
        )}
    </div>
  )
}