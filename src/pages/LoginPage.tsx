import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '@/context/AuthContext';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import logoSimprity from '@/assets/logo.png'; 

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      toast.success('Berhasil masuk!');
      navigate('/home');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal masuk');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* SISI KIRI: Logo & Tagline dengan Background Pastel Lembut */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="hidden lg:flex lg:w-1/2 p-12 flex-col justify-center items-center bg-[#F9F7FF] border-r border-gray-100"
      >
        {/* Logo diletakkan di atas tagline */}
        <div className="w-40 h-40 mb-6 flex items-center justify-center">
          <img 
            src={logoSimprity} 
            alt="SIMPRITY Logo" 
            className="w-full h-full object-contain"
          />
        </div>
        <h2 className="text-3xl font-bold mb-3 text-gray-900 text-center">Selamat Datang Kembali</h2>
        <p className="text-gray-600 text-center max-w-sm leading-relaxed">
          Masuk untuk melanjutkan pengalaman menggunakan Simprity
        </p>
      </motion.div>

      {/* SISI KANAN: Form Input Tetap Putih Bersih */}
      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white"
      >
        <div className="w-full max-w-md">
          {/* Header Form khusus untuk Mobile View */}
          <div className="mb-8 lg:hidden text-center">
            <div className="w-24 h-24 mx-auto mb-4 bg-[#F9F7FF] rounded-2xl p-2 flex items-center justify-center">
              <img 
                src={logoSimprity} 
                alt="SIMPRITY Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Selamat Datang</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                EMAIL
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Masukan Email.."
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AB87FF] focus:border-transparent outline-none"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                PASSWORD
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Isi Password.."
                  required
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AB87FF] focus:border-transparent outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Tombol Masuk dengan warna #AB87FF */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 text-white rounded-lg font-semibold shadow-md hover:opacity-90 transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#AB87FF' }}
            >
              {isLoading ? 'Memproses...' : 'Masuk'}
            </button>

            {/* Link Daftar dengan warna #AB87FF */}
            <p className="text-center text-gray-600">
              Belum punya akun?{' '}
              <Link to="/register" className="font-semibold hover:underline" style={{ color: '#AB87FF' }}>
                Daftar
              </Link>
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  );
}