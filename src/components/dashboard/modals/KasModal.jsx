import React, { useState } from 'react';
import { addDoc, collection, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../services/firebase";
import { formatRupiah } from '../../../utils/helpers';
import ModalWrapper from '../../ui/ModalWrapper';
import Toast from '../../ui/Toast';

export default function KasModal({ isOpen, onClose, kelasId, transactions, saldoAkhir, canManage }) {
    const [tab, setTab] = useState('laporan');
    const [input, setInput] = useState({ 
        tanggal: new Date().toISOString().split('T')[0], 
        nama: '', 
        jumlah: '', 
        tipe: 'masuk', 
        keterangan: '' 
    });
    const [buktiPreview, setBuktiPreview] = useState(null);
    const [toast, setToast] = useState(null);

    const handleBuktiChange = (e) => {
        const f = e.target.files[0];
        if (f) {
            const r = new FileReader();
            r.onloadend = () => setBuktiPreview(r.result);
            r.readAsDataURL(f);
        }
    };

    const handleAddKas = async (e) => {
        e.preventDefault();
        try {
            await addDoc(collection(db, `${kelasId.toLowerCase()}_uang_kas`), { 
                ...input, 
                jumlah: parseInt(input.jumlah.replace(/\./g, '')), 
                createdAt: serverTimestamp(), 
                buktiFoto: buktiPreview 
            });
            setToast({ message: "Transaksi Berhasil!", type: "success" });
            setInput({...input, nama: '', jumlah: ''});
            setBuktiPreview(null);
        } catch (error) {
            setToast({ message: "Gagal: " + error.message, type: "error" });
        }
    };

    const handleDelete = async (id) => {
        if(confirm("Hapus history ini?")) {
            await deleteDoc(doc(db, `${kelasId.toLowerCase()}_uang_kas`, id));
        }
    };

    const handleJumlahChange = (e) => {
        let r = e.target.value.replace(/[^0-9]/g, '');
        setInput({ ...input, jumlah: r ? parseInt(r).toLocaleString('id-ID') : '' });
    };

    return (
        <ModalWrapper isOpen={isOpen} onClose={onClose} title={`Kas Kelas ${kelasId}`}>
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            
            <div className="space-y-4">
                <div className="bg-[#00994d] p-4 rounded-lg shadow-md text-center text-white">
                    <h2 className="text-3xl font-bold">{formatRupiah(saldoAkhir)}</h2>
                    <p className="text-xs">Saldo Akhir</p>
                </div>

                <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-lg">
                    <button onClick={() => setTab('laporan')} className={`flex-1 py-1 text-xs font-bold rounded ${tab==='laporan' ? 'bg-white dark:bg-slate-800 shadow' : ''}`}>Laporan</button>
                    {canManage && <button onClick={() => setTab('input')} className={`flex-1 py-1 text-xs font-bold rounded ${tab==='input' ? 'bg-white dark:bg-slate-800 shadow' : ''}`}>Input</button>}
                </div>

                {tab === 'input' && canManage ? (
                    <form onSubmit={handleAddKas} className="space-y-3 bg-slate-50 dark:bg-slate-700/50 p-3 rounded border dark:border-slate-600">
                        <div className="flex gap-2">
                            <input type="date" value={input.tanggal} onChange={e=>setInput({...input, tanggal: e.target.value})} className="border p-2 rounded text-xs dark:bg-slate-800 dark:border-slate-600 dark:text-white"/> 
                            <select value={input.tipe} onChange={e=>setInput({...input, tipe: e.target.value})} className="border p-2 rounded text-xs dark:bg-slate-800 dark:border-slate-600 dark:text-white">
                                <option value="masuk">Masuk</option>
                                <option value="keluar">Keluar</option>
                            </select>
                        </div>
                        <input type="text" placeholder="Nama / Keterangan" value={input.nama} onChange={e=>setInput({...input, nama: e.target.value})} className="w-full border p-2 rounded text-xs dark:bg-slate-800 dark:border-slate-600 dark:text-white" required/>
                        <input type="text" placeholder="Jumlah (Rp)" value={input.jumlah} onChange={handleJumlahChange} className="w-full border p-2 rounded text-xs dark:bg-slate-800 dark:border-slate-600 dark:text-white" required/>
                        <div className="border-t pt-2 dark:border-slate-600">
                            <label className="text-xs font-bold block mb-1 dark:text-slate-300">Bukti Foto (Opsional)</label>
                            <input type="file" onChange={handleBuktiChange} className="text-xs dark:text-slate-300"/>
                        </div>
                        <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded text-xs font-bold">Simpan Transaksi</button>
                    </form>
                ) : (
                    <div className="max-h-60 overflow-y-auto space-y-2 custom-scrollbar">
                        {transactions.map(t => (
                            <div key={t.id} className="flex justify-between items-center p-2 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded text-xs">
                                <div>
                                    <span className="font-bold block dark:text-slate-200">{t.nama}</span>
                                    <span className="text-[10px] text-slate-500">{t.tanggal}</span>
                                </div>
                                <div className="text-right">
                                    <span className={t.tipe==='masuk'?'text-green-600 font-bold block':'text-red-600 font-bold block'}>
                                        {t.tipe === 'keluar' ? '-' : '+'} {formatRupiah(t.jumlah)}
                                    </span>
                                    {canManage && <button onClick={() => handleDelete(t.id)} className="text-[9px] text-red-400 underline hover:text-red-600">Hapus</button>}
                                </div>
                            </div>
                        ))}
                        {transactions.length === 0 && <p className="text-center text-xs text-slate-400">Belum ada data bulan ini.</p>}
                    </div>
                )}
            </div>
        </ModalWrapper>
    );
}   