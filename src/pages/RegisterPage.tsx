import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '@/context/AuthContext';
import { Mail, Lock, User, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import logoSimprity from '@/assets/logo.png'; 

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const { register } = useAuth();
  // navigate kept for future use (e.g. if email confirmation is disabled)
  const navigate = useNavigate();
  void navigate;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await register(email, password, fullName);
      // Supabase mengirim email konfirmasi sebelum sesi aktif.
      // Jangan langsung set user / navigate ke dashboard — tampilkan
      // layar sukses agar user tahu harus mengklik link di email.
      setRegistered(true);
      toast.success('Akun dibuat! Cek email Anda untuk konfirmasi.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal mendaftar');
    } finally {
      setIsLoading(false);
    }
  };

  // Layar sukses setelah register — menggantikan navigate langsung ke dashboard
  if (registered) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-sm px-8"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Pendaftaran Berhasil!</h2>
          <p className="text-gray-500 mb-6">
            Kami mengirimkan link konfirmasi ke <strong>{email}</strong>.
            Silakan cek inbox (dan folder spam) Anda, lalu klik link tersebut untuk mengaktifkan akun.
          </p>
          <Link
            to="/login"
            className="inline-block w-full py-3 text-white rounded-lg font-semibold text-center"
            style={{ backgroundColor: '#AB87FF' }}
          >
            Kembali ke Halaman Masuk
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-white">
      {/* SISI KIRI: Tagline & Logo dengan Background Pastel Lembut */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="hidden lg:flex lg:w-1/2 p-12 flex-col justify-center items-center bg-[#F9F7FF]"
      >
        <div className="w-40 h-40 mb-6 flex items-center justify-center filter drop-shadow-sm">
          <img 
            src={logoSimprity} 
            alt="SIMPRITY Logo" 
            className="w-full h-full object-contain"
          />
        </div>
        <h2 className="text-3xl font-bold mb-3 text-gray-900 text-center">
          Selamat Datang di Simprity!
        </h2>
        <p className="text-gray-500 text-center max-w-sm leading-relaxed text-base">
          Buat akun baru untuk mulai pengalaman yang lebih mudah dan terintegrasi
        </p>
      </motion.div>

      {/* SISI KANAN: Form Input Tetap Putih Bersih */}
      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white"
      >
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="lg:hidden w-24 h-24 mx-auto mb-4 bg-[#F9F7FF] rounded-2xl p-2 flex items-center justify-center">
              <img 
                src={logoSimprity} 
                alt="SIMPRITY Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Buat Akun Baru</h2>
            <p className="text-gray-600">Daftar untuk menggunakan Simprity</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Input Nama Lengkap */}
            <div>
              <label htmlFor="fullname" className="block text-sm font-semibold text-gray-700 mb-2">
                NAMA LENGKAP
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  id="fullname"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Isi Nama Lengkap.."
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AB87FF] focus:border-transparent outline-none"
                />
              </div>
            </div>

            {/* Input Email */}
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
                  placeholder="Isi Email.."
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AB87FF] focus:border-transparent outline-none"
                />
              </div>
            </div>

            {/* Input Password */}
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
                  minLength={6}
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

            {/* Tombol Daftar */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 text-white rounded-lg font-semibold shadow-md hover:opacity-90 transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#AB87FF' }}
            >
              {isLoading ? 'Memproses...' : 'Daftar'}
            </button>

            {/* Link Masuk */}
            <p className="text-center text-gray-600">
              Sudah punya akun?{' '}
              <Link to="/login" className="font-semibold hover:underline" style={{ color: '#AB87FF' }}>
                Masuk
              </Link>
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
