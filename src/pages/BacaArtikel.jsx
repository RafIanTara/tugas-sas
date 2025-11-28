import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, User, Calendar, Eye, Download, FileText } from 'lucide-react'
import { doc, getDoc, updateDoc, increment } from "firebase/firestore"
import { db } from "../services/firebase"

export default function BacaArtikel() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDetail = async () => {
        try {
            const docRef = doc(db, "tkj_articles", id);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                setArticle(docSnap.data());
                await updateDoc(docRef, { views: increment(1) });
            } else {
                alert("Materi tidak ditemukan!");
                navigate('/ebook');
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    }
    fetchDetail();
  }, [id, navigate])

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin w-10 h-10 border-4 border-[#002f6c] border-t-transparent rounded-full"></div></div>

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800">
        
        {/* Navbar sticky simple */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-slate-100 z-50 px-4 py-3 shadow-sm">
            <div className="max-w-3xl mx-auto flex justify-between items-center">
                <button onClick={() => navigate('/ebook')} className="flex items-center gap-2 text-slate-500 hover:text-[#002f6c] text-sm font-bold transition-colors">
                    <ArrowLeft size={18}/> Kembali
                </button>
                <span className="text-xs font-bold text-[#00994d] bg-green-50 px-3 py-1 rounded-full uppercase tracking-wider">
                    {article.category || 'Materi'}
                </span>
            </div>
        </div>

        <article className="max-w-3xl mx-auto px-4 py-10">
            {/* Header Artikel */}
            <h1 className="text-3xl md:text-4xl font-black text-[#002f6c] leading-tight mb-6">
                {article.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-xs md:text-sm text-slate-500 mb-8 pb-8 border-b border-slate-100">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[#002f6c] font-bold border border-slate-200">
                        <User size={16}/>
                    </div>
                    <div>
                        <p className="font-bold text-slate-700">{article.author || 'Admin TKJ'}</p>
                        <p className="text-[10px]">Penulis</p>
                    </div>
                </div>
                <div className="h-8 w-px bg-slate-200 hidden md:block"></div>
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-slate-100 rounded text-slate-400"><Calendar size={14}/></div>
                    <span>{new Date(article.createdAt?.seconds * 1000 || Date.now()).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-slate-100 rounded text-slate-400"><Eye size={14}/></div>
                    <span>{article.views || 0} kali dibaca</span>
                </div>
            </div>

            {/* Thumbnail */}
            {article.thumbnail && (
                <div className="rounded-2xl overflow-hidden mb-10 shadow-lg border border-slate-100">
                    <img src={article.thumbnail} alt={article.title} className="w-full h-auto object-cover"/>
                </div>
            )}

            {/* TOMBOL DOWNLOAD (JIKA ADA LINK) */}
            {article.link_download && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 mb-10 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 shrink-0">
                            <FileText size={24}/>
                        </div>
                        <div>
                            <h3 className="font-bold text-[#002f6c]">File Materi Tersedia</h3>
                            <p className="text-sm text-blue-600/80">Silakan unduh materi lengkap dalam format PDF/Dokumen.</p>
                        </div>
                    </div>
                    <a href={article.link_download} target="_blank" rel="noreferrer" className="bg-[#002f6c] hover:bg-blue-900 text-white px-6 py-3 rounded-lg font-bold text-sm flex items-center gap-2 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
                        <Download size={18}/> Download Sekarang
                    </a>
                </div>
            )}

            {/* ISI KONTEN */}
            <div className="prose prose-lg prose-slate max-w-none prose-headings:font-bold prose-headings:text-[#002f6c] prose-a:text-blue-600 prose-img:rounded-xl prose-p:leading-relaxed text-slate-700">
                {/* Render HTML atau Teks biasa dengan Newline */}
                {article.content ? (
                    <div dangerouslySetInnerHTML={{ __html: article.content.replace(/\n/g, '<br/>') }} />
                ) : (
                    <p className="italic text-slate-400 text-center">Tidak ada deskripsi tambahan.</p>
                )}
            </div>

        </article>

        {/* Footer Artikel */}
        <div className="bg-slate-50 border-t border-slate-200 py-10 text-center mt-10">
            <p className="text-slate-400 text-sm font-medium">© E-Library TKJ SMK Muhammadiyah 1 Metro</p>
        </div>
    </div>
  )
}