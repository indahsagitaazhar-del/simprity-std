import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/services/database';
import { GraduationCap, Users, User, Calendar, Timer } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion'; // disesuaikan ke framer-motion/motion jika ada kendala import

type Category = 'Akademik' | 'Organisasi' | 'Pribadi';
type Importance = 'Normal' | 'Sedang' | 'Penting';
type Consequence = 'Santai' | 'Sedang' | 'Bahaya';

export default function AddActivityPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State netral/kosong di awal
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category | ''>('');
  const [deadline, setDeadline] = useState('');
  const [estimatedTime, setEstimatedTime] = useState<number | ''>('');
  const [importance, setImportance] = useState<Importance | ''>('');
  const [consequence, setConsequence] = useState<Consequence | ''>('');
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi input wajib diisi
    if (!category) { toast.error('Mohon pilih kategori kegiatan'); return; }
    if (!deadline) { toast.error('Mohon pilih tenggat waktu'); return; }
    if (estimatedTime === '') { toast.error('Mohon isi estimasi waktu'); return; }
    if (!importance) { toast.error('Mohon pilih tingkat kepentingan'); return; }
    if (!consequence) { toast.error('Mohon pilih konsekuensi telat'); return; }

    setLoading(true);
    try {
      await db.addActivity(user.id, {
        name,
        category,
        deadline: new Date(deadline),
        estimatedTime,
        importance,
        consequence,
        status: 'pending',
        completed: false,
      });
      toast.success('Kegiatan berhasil ditambahkan!');
      navigate('/activities');
    } catch (error) {
      toast.error('Gagal menambahkan kegiatan');
    } finally {
      setLoading(false);
    }
  };

  const categoryIcons = { 
    Akademik: GraduationCap, 
    Organisasi: Users, 
    Pribadi: User 
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-8 px-8 mb-8">
        <h1 className="text-3xl font-bold">Tambah Kegiatan</h1>
      </div>
      <div className="max-w-6xl mx-auto px-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Ilustrasi & Tips Kiri */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="w-full h-48 bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl mb-4 flex items-center justify-center">
                <svg viewBox="0 0 200 200" className="w-40 h-40">
                  <circle cx="100" cy="100" r="80" fill="#E9D5FF" opacity="0.5"/>
                  <circle cx="100" cy="100" r="60" fill="#C084FC" opacity="0.7"/>
                  <path d="M100 50 L100 100 L130 100" stroke="white" strokeWidth="8" strokeLinecap="round" fill="none"/>
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Tambah Kegiatan</h2>
              <p className="text-gray-600 mb-4">Isi informasi kegiatan dengan lengkap dan tentukan tingkat kepentingan serta konsekuensi jika terjadi keterlambatan</p>
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <h3 className="font-bold text-purple-900 mb-2">Tips</h3>
                <p className="text-sm text-purple-700">Semakin tinggi tingkat kepentingan dan konsekuensi telat, semakin diperioritaskan dalam jadwal anda</p>
              </div>
            </div>
          </motion.div>

          {/* Form Utama Kanan */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-xl p-8 border border-gray-200 space-y-6">
              
              {/* Nama Kegiatan */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Nama Kegiatan</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Isi Nama Kegiatan" required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none" />
              </div>

              {/* Kategori */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Kategori</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['Akademik', 'Organisasi', 'Pribadi'] as Category[]).map(cat => {
                    const Icon = categoryIcons[cat];
                    return (
                      <button key={cat} type="button" onClick={() => setCategory(cat)}
                        className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${category === cat ? 'border-purple-600 bg-purple-50' : 'border-gray-200 hover:border-gray-300'}`}>
                        <Icon className={`w-6 h-6 ${category === cat ? 'text-purple-600' : 'text-gray-600'}`} />
                        <span className={`font-medium ${category === cat ? 'text-purple-600' : 'text-gray-700'}`}>{cat}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Deadline & Estimasi */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Tenggat Waktu</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type="datetime-local" value={deadline} onChange={e => setDeadline(e.target.value)} required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Estimasi Waktu (Jam)</label>
                  <div className="relative">
                    <Timer className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type="number" value={estimatedTime} onChange={e => setEstimatedTime(e.target.value === '' ? '' : parseInt(e.target.value))} min="1" max="24" required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none" />
                  </div>
                </div>
              </div>

              {/* Tingkat Kepentingan */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Tingkat Kepentingan</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['Normal', 'Sedang', 'Penting'] as Importance[]).map(imp => (
                    <button key={imp} type="button" onClick={() => setImportance(imp)}
                      className={`py-3 rounded-lg border-2 font-medium transition-all ${importance === imp ? 'border-purple-600 bg-purple-600 text-white' : 'border-gray-200 text-gray-700 hover:border-gray-300'}`}>
                      {imp}
                    </button>
                  ))}
                </div>
              </div>

              {/* Konsekuensi Telat */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Konsekuensi Telat</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['Santai', 'Sedang', 'Bahaya'] as Consequence[]).map(cons => (
                    <button key={cons} type="button" onClick={() => setConsequence(cons)}
                      className={`py-3 rounded-lg border-2 font-medium transition-all ${consequence === cons ? 'border-red-600 bg-red-600 text-white' : 'border-gray-200 text-gray-700 hover:border-gray-300'}`}>
                      {cons}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tombol Simpan */}
              <button type="submit" disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed">
                {loading ? 'Menyimpan...' : 'Simpan'}
              </button>
            </form>
          </motion.div>

        </div>
      </div>
    </div>
  );
}