import React, { useState, useRef } from 'react';
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../../services/firebase";
import { compressImage } from '../../../utils/helpers'; // Pastikan helper ini ada
import { UploadCloud, Loader2 } from 'lucide-react';
import ModalWrapper from '../../ui/ModalWrapper';
import Toast from '../../ui/Toast';

export default function ShowcaseModal({ isOpen, onClose, user }) {
    const [input, setInput] = useState({ 
        kelompok: '', 
        anggota: '', 
        link: '', 
        deskripsi: '', 
        imageBase64: '' 
    });
    const [imgPreview, setImgPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const fileInputRef = useRef(null);

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await addDoc(collection(db, "showcase_sas"), {
                ...input,
                uploadedBy: user.uid,     // Rekam ID uploader
                authorClass: user.kelasId, // Rekam Kelas uploader
                createdAt: serverTimestamp()
            });
            setToast({message: "Project Berhasil Dikumpulkan!", type: "success"});
            
            setTimeout(() => {
                onClose();
                setInput({ kelompok: '', anggota: '', link: '', deskripsi: '', imageBase64: '' });
                setImgPreview(null);
            }, 1500);
        } catch (error) {
            setToast({message: "Gagal: " + error.message, type: "error"});
        } finally {
            setLoading(false);
        }
    };

    return (
        <ModalWrapper isOpen={isOpen} onClose={onClose} title="Upload Project SAS">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            
            <form onSubmit={handleSubmit} className="space-y-3 animate-in fade-in">
                <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">Nama Kelompok</label>
                    <input type="text" value={input.kelompok} onChange={e => setInput({...input, kelompok: e.target.value})} className="w-full border p-2 rounded text-xs dark:bg-slate-800 dark:border-slate-700 dark:text-white" required placeholder="Contoh: Kelompok 1 (Cyber Team)"/>
                </div>
                
                <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">Anggota Kelompok</label>
                    <textarea value={input.anggota} onChange={e => setInput({...input, anggota: e.target.value})} className="w-full border p-2 rounded text-xs h-16 dark:bg-slate-800 dark:border-slate-700 dark:text-white" required placeholder="Nama anggota pisahkan koma..."/>
                </div>

                <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">Link Website (Vercel/Netlify)</label>
                    <input type="url" value={input.link} onChange={e => setInput({...input, link: e.target.value})} className="w-full border p-2 rounded text-xs dark:bg-slate-800 dark:border-slate-700 dark:text-white" required placeholder="https://..."/>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-bold text-slate-500 block mb-1">Screenshot Web</label>
                        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="w-full text-xs dark:text-slate-300"/>
                    </div>
                    {imgPreview && <img src={imgPreview} className="h-20 w-full object-cover rounded border dark:border-slate-600"/>}
                </div>

                <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">Deskripsi Singkat</label>
                    <textarea value={input.deskripsi} onChange={e => setInput({...input, deskripsi: e.target.value})} className="w-full border p-2 rounded text-xs h-16 dark:bg-slate-800 dark:border-slate-700 dark:text-white" placeholder="Ceritakan sedikit tentang project ini..."/>
                </div>

                <button disabled={loading} className="w-full bg-[#00994d] hover:bg-green-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all">
                    {loading ? <Loader2 className="animate-spin"/> : <><UploadCloud size={18}/> Submit Project</>}
                </button>
            </form>
        </ModalWrapper>
    );
}