import React from 'react';
import { Newspaper, Image as ImageIcon, Bot, Users, BookOpen } from 'lucide-react';

export default function QuickMenuWidget({ onOpenNews, onOpenGaleri, onOpenAi, onOpenStruktur, permissions, onOpenEbook }) {
    const { canPostNews, canUploadGaleri } = permissions;

    return (
        <div className="grid grid-cols-2 gap-3">
            <button onClick={onOpenNews} className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm flex flex-col items-center gap-2 hover:border-orange-400 border border-transparent transition-all">
                <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center">
                    <Newspaper size={20} />
                </div>
                <span className="text-xs font-bold dark:text-slate-200">Mading {canPostNews && '(+)'}</span>
            </button>
            <button onClick={onOpenGaleri} className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm flex flex-col items-center gap-2 hover:border-purple-400 border border-transparent transition-all">
                <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center">
                    <ImageIcon size={20} />
                </div>
                <span className="text-xs font-bold dark:text-slate-200">Galeri {canUploadGaleri && '(+)'}</span>
            </button>
            <button onClick={onOpenAi} className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm flex flex-col items-center gap-2 hover:border-yellow-400 border border-transparent transition-all">
                <div className="w-10 h-10 bg-yellow-50 text-yellow-600 rounded-full flex items-center justify-center">
                    <Bot size={20} />
                </div>
                <span className="text-xs font-bold dark:text-slate-200">AI Chat</span>
            </button>
            <button onClick={onOpenStruktur} className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm flex flex-col items-center gap-2 hover:border-teal-400 border border-transparent transition-all">
                <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center">
                    <Users size={20} />
                </div>
                <span className="text-xs font-bold dark:text-slate-200">Struktur</span>
            </button>
            <button onClick={onOpenEbook} className="col-span-2 bg-white dark:bg-slate-800 p-3 rounded-lg shadow-sm flex items-center justify-center gap-2 hover:border-blue-400 border border-transparent transition-all">
                <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                    <BookOpen size={16} />
                </div>
                <span className="text-xs font-bold dark:text-slate-200">Upload Materi</span>
            </button>
        </div>
    );
}