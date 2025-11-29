// src/components/ui/Loader.jsx
import React from 'react';
import { Loader2 } from 'lucide-react';

const Loader = ({ text = "Memuat..." }) => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
            <Loader2 className="animate-spin mr-2" /> {text}
        </div>
    );
};

export default Loader;