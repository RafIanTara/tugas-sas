import React, { useState, useRef, useEffect } from 'react';
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../../services/firebase";
import { compressImage } from '../../../utils/helpers';
import { UploadCloud, X, Loader2 } from 'lucide-react';
import ModalWrapper from '../../ui/ModalWrapper';
import Toast from '../../ui/Toast';

export default function EbookModal({ isOpen, onClose, user }) {
    // 1. Tentukan Nama Penulis Otomatis
    const defaultAuthor = user ? `${user.displayName} (${user.role} - ${user.kelasId})` : 'Admin TKJ';

    // 2. State Form
    const [inputData, setInputData] = useState({ 
        title: '', 
        category: 'Modul', 
        desc: '',        // <--- Pastikan key ini 'desc', bukan 'description'
        content: '', 
        link_download: '', 
        thumbnail: '' 
    });
    
    const [imgPreview, setImgPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const fileInputRef = useRef(null);

    // 3. Reset Penulis saat modal dibuka
    useEffect(() => {
        if(isOpen) {
            setInputData(prev => ({...prev, author: defaultAuthor}));
        }
    }, [isOpen, defaultAuthor]);

    // 4. Handle Perubahan Input Teks (Universal & Aman)
    const handleChange = (e) => {
        const { name, value } = e.target;
        setInputData(prev => ({
            ...prev,
            [name]: value // Mengupdate state berdasarkan atribut 'name' di input
        }));
    };

    // 5. Handle Gambar
    const handleImageChange = async (e) => { 
        const f = e.target.files[0]; 
        if(f) { 
            try {
                const c = await compressImage(f); 
                setImgPreview(c); 
                setInputData(prev => ({...prev, thumbnail: c})); 
            } catch (err) {
                setToast({message: "Gagal kompres gambar", type: "error"});
            }
        } 
    };

    // 6. Submit ke Firebase
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try { 
            await addDoc(collection(db, "tkj_articles"), { 
                ...inputData, 
                author: defaultAuthor, // Timpa lagi biar pasti
                views: 0, 
                createdAt: serverTimestamp() 
            }); 
            
            setToast({message: "Materi Berhasil Terbit!", type: "success"}); 
            
            // Reset Form setelah sukses
            setTimeout(() => {
                onClose();
                setInputData({ title: '', category: 'Modul', desc: '', content: '', link_download: '', thumbnail: '' });
                setImgPreview(null);
            }, 1500);

        } catch (error) { 
            setToast({message: "Gagal: " + error.message, type: "error"}); 
        } finally {
            setLoading(false);
        }
    };

    return (
        <ModalWrapper isOpen={isOpen} onClose={onClose} title="Upload Materi Baru">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            
            <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in">
                {/* Info Penulis */}
                <div className="bg-blue-50 text-blue-800 text-xs p-2 rounded border border-blue-200">
                    Penulis: <b>{defaultAuthor}</b>
                </div>

                {/* Judul */}
                <div>
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Judul Materi</label>
                    <input 
                        type="text" 
                        name="title" // Penting: name harus sama dengan key di state
                        value={inputData.title} 
                        onChange={handleChange} 
                        className="w-full border p-2 rounded text-sm dark:bg-slate-800 dark:border-slate-700 dark:text-white" 
                        required
                    />
                </div>
                
                {/* Kategori */}
                <div>
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Kategori</label>
                    <select 
                        name="category"
                        value={inputData.category} 
                        onChange={handleChange} 
                        className="w-full border p-2 rounded text-sm dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    >
                        <option>Modul</option>
                        <option>E-Book</option>
                        <option>Tutorial</option>
                        <option>Tugas</option>
                    </select>
                </div>

                {/* Link Download */}
                <div>
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Link Download (PDF/Drive)</label>
                    <input 
                        type="url" 
                        name="link_download"
                        value={inputData.link_download} 
                        onChange={handleChange} 
                        className="w-full border p-2 rounded text-sm dark:bg-slate-800 dark:border-slate-700 dark:text-white" 
                        placeholder="https://..."
                    />
                </div>

                {/* Thumbnail */}
                <div>
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Thumbnail</label>
                    <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="w-full text-xs dark:text-slate-300"/>
                </div>
                {imgPreview && <img src={imgPreview} className="h-32 object-cover rounded border dark:border-slate-600"/>}

                {/* Deskripsi Singkat (FIXED) */}
                <div>
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Deskripsi Singkat</label>
                    <textarea 
                        name="desc" // Kuncinya ada di sini (harus 'desc')
                        value={inputData.desc} 
                        onChange={handleChange} 
                        className="w-full border p-2 rounded text-sm h-20 dark:bg-slate-800 dark:border-slate-700 dark:text-white" 
                        required
                    />
                </div>

                {/* Isi Materi */}
                <div>
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Isi Materi (Teks/HTML)</label>
                    <textarea 
                        name="content"
                        value={inputData.content} 
                        onChange={handleChange} 
                        className="w-full border p-2 rounded text-sm h-32 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    />
                </div>

                <button disabled={loading} className="w-full bg-[#00994d] hover:bg-green-700 text-white py-3 rounded-xl font-bold disabled:opacity-50 transition-all flex justify-center gap-2">
                    {loading ? <Loader2 className="animate-spin"/> : "Terbitkan Materi"}
                </button>
            </form>
        </ModalWrapper>
    );
}