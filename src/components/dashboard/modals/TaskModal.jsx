import React, { useState } from 'react';
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../../services/firebase";
import ModalWrapper from '../../ui/ModalWrapper';
import Toast from '../../ui/Toast';

export default function TaskModal({ isOpen, onClose, kelasId }) {
    const [task, setTask] = useState({ judul: '', mapel: '' });
    const [toast, setToast] = useState(null);

    const handleAddTask = async (e) => {
        e.preventDefault();
        try {
            await addDoc(collection(db, `${kelasId.toLowerCase()}_tugas`), {
                ...task,
                selesai: false,
                createdAt: serverTimestamp()
            });
            setToast({message: "Tugas ditambahkan!", type: "success"});
            setTask({ judul: '', mapel: '' });
            setTimeout(onClose, 1000);
        } catch (e) {
            setToast({message: "Gagal: " + e.message, type: "error"});
        }
    };

    return (
        <ModalWrapper isOpen={isOpen} onClose={onClose} title="Tambah Tugas">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            <form onSubmit={handleAddTask} className="space-y-3">
                <input placeholder="Judul Tugas" value={task.judul} onChange={e=>setTask({...task, judul: e.target.value})} className="w-full border p-2 rounded text-xs dark:bg-slate-800 dark:border-slate-700 dark:text-white" required/>
                <input placeholder="Mata Pelajaran" value={task.mapel} onChange={e=>setTask({...task, mapel: e.target.value})} className="w-full border p-2 rounded text-xs dark:bg-slate-800 dark:border-slate-700 dark:text-white" required/>
                <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded text-xs font-bold">Simpan Tugas</button>
            </form>
        </ModalWrapper>
    );
}