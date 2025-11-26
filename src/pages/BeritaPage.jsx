import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function BeritaPage() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <button onClick={() => navigate('/')} className="flex items-center gap-2 font-bold text-[#002f6c] mb-8"><ArrowLeft/> Kembali</button>
      <h1 className="text-3xl font-black text-[#002f6c] mb-4">Arsip Berita</h1>
      <p>Halaman ini akan menampilkan semua berita yang diupload admin.</p>
      {/* Nanti copy logic fetch firebase disini tapi tanpa limit slice */}
    </div>
  )
}