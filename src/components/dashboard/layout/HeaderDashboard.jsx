import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, LogOut, Moon, Sun, Settings } from 'lucide-react';
import logoJurusan from '../../../assets/images/logotkj.jpg'; // Sesuaikan path jika beda

export default function HeaderDashboard({ user, kelasId, isDarkMode, toggleDarkMode, onLogout, onOpenSettings, canViewSettings }) {
    const navigate = useNavigate();

    return (
        <div className="bg-[#002f6c] dark:bg-[#0f172a]/80 backdrop-blur-md text-white shadow-md sticky top-0 z-40 border-b-4 border-[#00994d] dark:border-blue-600 transition-colors">
            <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div className="hidden md:block h-16 w-auto p-1 bg-white/10 rounded-lg">
                        <img src={logoJurusan} alt="Logo" className="h-full w-full object-cover rounded-lg" />
                    </div>
                    <div>
                        <h1 className="text-xl md:text-2xl font-extrabold tracking-wider uppercase leading-none">
                            {kelasId} TKJ <span className="text-[#00994d] dark:text-blue-400">DASHBOARD</span>
                        </h1>
                        <p className="text-[11px] text-blue-200 opacity-90 hidden md:block font-light tracking-wide mt-1">
                            Hi, {user.displayName} ({user.role}{user.jabatan !== 'MEMBER' ? ` - ${user.jabatan}` : ''})
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={toggleDarkMode} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                        {isDarkMode ? <Sun size={18} className="text-yellow-300" /> : <Moon size={18} />}
                    </button>
                    <button onClick={() => navigate('/')} className="bg-blue-600 px-3 py-2 rounded-lg text-xs font-bold flex gap-1 items-center hover:bg-blue-500 transition-colors">
                        <Home size={16}/> <span className="hidden md:inline">Home</span>
                    </button>
                    <button onClick={onLogout} className="bg-red-600 px-3 py-2 rounded-lg text-xs font-bold flex gap-1 items-center hover:bg-red-500 transition-colors">
                        <LogOut size={16}/> <span className="hidden md:inline">Logout</span>
                    </button>
                    {canViewSettings && (
                        <button onClick={onOpenSettings} className="bg-slate-700 hover:bg-slate-600 p-2 rounded-lg transition-colors">
                            <Settings size={18} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}