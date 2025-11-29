import React, { useState, useRef } from 'react';
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../../services/firebase";
import { compressImage } from '../../../utils/helpers';
import ModalWrapper from '../../ui/ModalWrapper';
import Toast from '../../ui/Toast';

export default function GaleriModal({ isOpen, onClose, user }) {
    const [input, setInput] = useState({ caption: '', imageBase64: '' });
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

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!input.imageBase64) return setToast({message: "Pilih foto dulu!", type: "error"});
        
        setLoading(true);
        try {
            await addDoc(collection(db, 'galeri_sekolah'), {
                ...input,
                image: input.imageBase64,
                author: user.displayName,
                createdAt: serverTimestamp()
            });
            setToast({message: "Foto berhasil diupload!", type: "success"});
            setTimeout(() => {
                onClose();
                setInput({caption: '', imageBase64: ''});
                setImgPreview(null);
            }, 1500);
        } catch (e) {
            setToast({message: "Gagal: " + e.message, type: "error"});
        } finally {
            setLoading(false);
        }
    };

    return (
        <ModalWrapper isOpen={isOpen} onClose={onClose} title="Upload Galeri">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            <form onSubmit={handleUpload} className="space-y-3">
                <input type="text" placeholder="Caption Foto..." value={input.caption} onChange={e=>setInput({...input, caption: e.target.value})} className="w-full border p-2 rounded text-xs dark:bg-slate-800 dark:border-slate-700 dark:text-white"/>
                <div>
                    <input type="file" ref={fileInputRef} onChange={handleImageChange} className="text-xs dark:text-slate-300"/>
                </div>
                {imgPreview && <img src={imgPreview} className="h-40 w-full object-cover rounded border dark:border-slate-600"/>}
                <button disabled={loading} className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded text-xs font-bold disabled:opacity-50">
                    {loading ? "Mengupload..." : "Upload Foto"}
                </button>
            </form>
        </ModalWrapper>
    );
}