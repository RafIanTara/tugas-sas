// src/components/ui/Toast.jsx
import React from 'react';
import { motion } from "framer-motion";
import { CheckCircle, AlertCircle, X } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose }) => {
    return (
        <motion.div 
            initial={{ opacity: 0, y: -50, x: 50 }} 
            animate={{ opacity: 1, y: 0, x: 0 }} 
            exit={{ opacity: 0, y: -20, x: 20 }} 
            className={`fixed top-5 right-5 z-[100] flex items-center gap-3 px-4 py-3 rounded-lg shadow-xl border-l-4 min-w-[300px] ${
                type === 'success' 
                ? 'bg-white border-green-500 text-slate-700' 
                : 'bg-white border-red-500 text-slate-700'
            }`}
        >
            {type === 'success' ? (
                <CheckCircle className="text-green-500" size={20} />
            ) : (
                <AlertCircle className="text-red-500" size={20} />
            )}
            <span className="text-sm font-semibold">{message}</span>
            <button onClick={onClose} className="ml-auto text-slate-400 hover:text-slate-600">
                <X size={14} />
            </button>
        </motion.div>
    );
};

export default Toast;