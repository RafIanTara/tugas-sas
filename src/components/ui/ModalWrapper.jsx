// src/components/ui/ModalWrapper.jsx
import React from 'react';
import { X } from 'lucide-react';

const ModalWrapper = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-800 w-full md:max-w-lg rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border-t-4 border-[#002f6c] dark:border-blue-500">
                {/* Header Modal */}
                <div className="flex justify-between items-center px-6 py-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 shrink-0">
                    <h3 className="text-lg font-bold tracking-wide flex items-center gap-2 uppercase text-[#002f6c] dark:text-blue-400">
                        {title}
                    </h3>
                    <button 
                        onClick={onClose} 
                        className="text-slate-400 hover:text-red-500 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>
                
                {/* Body Modal (Scrollable) */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default ModalWrapper;