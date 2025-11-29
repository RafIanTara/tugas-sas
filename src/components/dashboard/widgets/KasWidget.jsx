import React from 'react';
import { Wallet } from 'lucide-react';
import { formatRupiah } from '../../../utils/helpers';

export default function KasWidget({ totalSaldo, onClick }) {
    return (
        <div 
            onClick={onClick} 
            className="bg-white dark:bg-slate-800 p-5 rounded-lg shadow-md border-t-4 border-[#00994d] cursor-pointer hover:shadow-xl transition-all relative overflow-hidden group"
        >
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Wallet size={60} className="text-[#00994d]" />
            </div>
            <h3 className="font-bold text-sm uppercase flex items-center gap-2 mb-2">
                <Wallet size={16} className="text-[#00994d]" /> Keuangan
            </h3>
            <p className="text-3xl font-black text-slate-800 dark:text-slate-100">
                {formatRupiah(totalSaldo)}
            </p>
            <div className="mt-3 bg-green-50 dark:bg-slate-700 px-3 py-1 text-[10px] text-green-700 font-bold rounded w-fit group-hover:bg-[#00994d] group-hover:text-white transition-colors">
                Lihat Detail &rarr;
            </div>
        </div>
    );
}