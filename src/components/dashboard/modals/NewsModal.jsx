import React, { useState } from 'react';
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../../services/firebase";
import { compressImage } from '../../../utils/helpers';
import ModalWrapper from '../../ui/ModalWrapper';
import Toast from '../../ui/Toast';

export default function NewsModal({ isOpen, onClose, user }) {
    const [input, setInput] = useState({ title: '', category: 'Kegiatan', content: '', imageBase64: '' });
    const [imgPreview, setImgPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const b64 = await compressImage(file);
                setImgPreview(b64);
                setInput({ ...input, imageBase64: b64 });
            } catch {
                setToast({message: "Gagal kompres gambar", type: "error"});
            }
        }
    };

    const handlePost = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await addDoc(collection(db, 'berita_sekolah'), {
                ...input,
                image: input.imageBase64 || null,
                author: user.displayName,
                createdAt: serverTimestamp(),
                dateString: new Date().toLocaleDateString('id-ID')
            });
            setToast({message: "Berita berhasil diposting!", type: "success"});
            setTimeout(() => { onClose(); setInput({title:'', category:'Kegiatan', content:'', imageBase64:''}); setImgPreview(null); }, 1500);
        } catch (e) {
            setToast({message: "Gagal: " + e.message, type: "error"});
        } finally {
            setLoading(false);
        }
    };

    return (
        <ModalWrapper isOpen={isOpen} onClose={onClose} title="Posting Mading">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            <form onSubmit={handlePost} className="space-y-3">
                <input type="text" placeholder="Judul Berita" value={input.title} onChange={e=>setInput({...input, title: e.target.value})} className="w-full border p-2 rounded text-xs dark:bg-slate-800 dark:border-slate-700 dark:text-white" required/>
                <select value={input.category} onChange={e=>setInput({...input, category: e.target.value})} className="w-full border p-2 rounded text-xs dark:bg-slate-800 dark:border-slate-700 dark:text-white">
                    <option>Kegiatan</option><option>Prestasi</option><option>Karya Siswa</option><option>Info Sekolah</option>
                </select>
                <textarea placeholder="Isi Berita..." value={input.content} onChange={e=>setInput({...input, content: e.target.value})} className="w-full border p-2 rounded text-xs h-24 dark:bg-slate-800 dark:border-slate-700 dark:text-white" required/>
                <div>
                    <label className="text-xs font-bold block mb-1 dark:text-slate-400">Gambar Cover (Opsional)</label>
                    <input type="file" onChange={handleImageChange} className="text-xs dark:text-slate-300"/>
                </div>
                {imgPreview && <img src={imgPreview} className="h-24 object-cover rounded border"/>}
                <button disabled={loading} className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded text-xs font-bold disabled:opacity-50">
                    {loading ? "Mengirim..." : "Posting Berita"}
                </button>
            </form>
        </ModalWrapper>
    );
}