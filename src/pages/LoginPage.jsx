import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
      // Setelah login berhasil, arahkan ke landing page atau dashboard
      navigate('/'); 
    } catch (err) {
      setError("Login Gagal: Periksa email/password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border-t-4 border-[#00994d]">
        <h2 className="text-2xl font-bold text-[#00994d] mb-6 flex items-center gap-2">
          <LogIn /> Login Portal
        </h2>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Email</label>
            <input type="email" required className="w-full border p-2 rounded" 
              onChange={e => setEmail(e.target.value)} />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Password</label>
            <input type="password" required className="w-full border p-2 rounded"
              onChange={e => setPassword(e.target.value)} />
          </div>

          <button disabled={isLoading} className="w-full bg-[#00994d] text-white py-3 rounded-lg font-bold hover:bg-green-700 transition flex justify-center">
            {isLoading ? <Loader2 className="animate-spin" /> : "Masuk"}
          </button>
        </form>

        <p className="text-center text-sm mt-4 text-slate-600">
          Belum punya akun? <Link to="/register" className="text-blue-600 font-bold hover:underline">Daftar disini</Link>
        </p>
      </div>
    </div>
  );
}