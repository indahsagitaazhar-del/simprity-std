import { Link } from 'react-router';
import { motion } from 'motion/react';
import logoSimprity from '@/assets/logo.png'; 

export default function WelcomePage() {
  return (
    // Ditambahkan class 'font-sans' untuk memastikan menggunakan font Inter / Sans-serif modern
    <div className="min-h-screen bg-white flex items-center justify-center p-4 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center w-full max-w-sm"
      >
        {/* Section Logo */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="mb-6 flex justify-center"
        >
          {/* Ganti w-40 h-40 di bawah ini untuk atur ukuran logo:
            - w-32 h-32 (Sedang - 128px)
            - w-40 h-40 (Cukup Besar - 160px - Rekomendasi untuk logo 3D kamu)
            - w-48 h-48 (Besar - 192px)
          */}
          <div className="w-40 h-40 flex items-center justify-center">
            <img 
              src={logoSimprity} 
              alt="SIMPRITY Logo" 
              className="w-full h-full object-contain"
            />
          </div>
        </motion.div>

        {/* Judul Aplikasi */}
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          // Menggunakan font-bold agar tampilan Inter-nya tegas mirip di mockup
          className="text-4xl font-bold mb-12 tracking-wide text-[#8049FF]"
        >
          SIMPRITY
        </motion.h1>

        {/* Tombol Aksi */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-4 px-4"
        >
          {/* Tombol Masuk */}
          <Link
            to="/login"
            className="block w-full py-4 text-white rounded-full font-semibold text-lg transition-all active:scale-95 shadow-sm"
            style={{ backgroundColor: '#AB87FF' }}
          >
            Masuk
          </Link>

          {/* Tombol Daftar Akun */}
          <Link
            to="/register"
            className="block w-full py-4 bg-white rounded-full font-semibold text-lg border transition-all active:scale-95"
            style={{ 
              borderColor: '#AB87FF',
              color: '#8049FF'
            }}
          >
            Daftar Akun
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}