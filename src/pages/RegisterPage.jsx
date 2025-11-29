import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    targetRole: 'SISWA', // Default Siswa
    kelasId: 'X'         // Default Kelas X
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await register(
        formData.email, 
        formData.password, 
        formData.name, 
        formData.targetRole, 
        formData.kelasId
      );
      alert("Registrasi Berhasil! Silakan tunggu persetujuan Admin/Guru.");
      navigate('/'); // Balik ke landing page atau dashboard
    } catch (err) {
      setError("Gagal mendaftar: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border-t-4 border-[#002f6c]">
        <h2 className="text-2xl font-bold text-[#002f6c] mb-6 flex items-center gap-2">
          <UserPlus /> Daftar Akun Baru
        </h2>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Nama Lengkap</label>
            <input type="text" required className="w-full border p-2 rounded" 
              onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Email</label>
            <input type="email" required className="w-full border p-2 rounded" 
              onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Password</label>
            <input type="password" required className="w-full border p-2 rounded" minLength={6}
              onChange={e => setFormData({...formData, password: e.target.value})} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Daftar Sebagai</label>
              <select className="w-full border p-2 rounded" 
                onChange={e => setFormData({...formData, targetRole: e.target.value})}>
                <option value="SISWA">Siswa</option>
                <option value="GURU">Guru</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Kelas</label>
              <select className="w-full border p-2 rounded"
                onChange={e => setFormData({...formData, kelasId: e.target.value})}>
                <option value="X">Kelas X</option>
                <option value="XI">Kelas XI</option>
                <option value="XII">Kelas XII</option>
              </select>
            </div>
          </div>

          <button disabled={isLoading} className="w-full bg-[#002f6c] text-white py-3 rounded-lg font-bold hover:bg-blue-900 transition flex justify-center">
            {isLoading ? <Loader2 className="animate-spin" /> : "Daftar Sekarang"}
          </button>
        </form>
        
        <p className="text-center text-sm mt-4 text-slate-600">
          Sudah punya akun? <Link to="/login" className="text-blue-600 font-bold hover:underline">Login disini</Link>
        </p>
      </div>
    </div>
  );
}