import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { LogOut, ChevronRight, Edit2, Bell, Moon, Sun, Settings } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Berhasil keluar');
    navigate('/');
  };

  const ToggleItem = ({ icon: Icon, title, desc, active, onToggle, color }: any) => (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-bold text-gray-900">{title}</h4>
          <p className="text-xs text-gray-500">{desc}</p>
        </div>
      </div>
      <button 
        onClick={onToggle}
        className={`w-12 h-6 rounded-full transition-colors relative ${active ? 'bg-purple-600' : 'bg-gray-300'}`}
      >
        <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${active ? 'left-7' : 'left-1'}`} />
      </button>
    </div>
  );

  return (
    <div className="p-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Profil</h1>
        <p className="text-gray-600">Kelola informasi pribadi dan pusat kendali aplikasi.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Kolom Kiri: Info Profil */}
        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm text-center">
            <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center text-3xl font-bold text-purple-600 mx-auto mb-4">
              {user?.fullName.charAt(0)}
            </div>
            <h2 className="text-xl font-bold text-gray-900">{user?.fullName}</h2>
            <p className="text-gray-500 text-sm mb-6">{user?.email}</p>
            <button className="w-full py-2.5 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-all flex items-center justify-center gap-2">
              <Edit2 className="w-4 h-4" /> Edit Profil
            </button>
          </div>
        </div>

        {/* Kolom Kanan: Pusat Kendali */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-6 border-b border-gray-50 pb-4">
              <Settings className="text-purple-600" />
              <h3 className="text-lg font-bold text-gray-900">Pengaturan</h3>
            </div>
            
            <div className="space-y-4">
              <ToggleItem 
                icon={Bell} 
                title="Notifikasi" 
                desc="Izinkan aplikasi mengirimkan pengingat"
                color="bg-blue-50 text-blue-600"
                active={notificationsEnabled} 
                onToggle={() => setNotificationsEnabled(!notificationsEnabled)} 
              />
              <ToggleItem 
                icon={isDarkMode ? Moon : Sun} 
                title="Mode Tema" 
                desc={isDarkMode ? "Gunakan tampilan gelap" : "Gunakan tampilan terang"}
                color="bg-amber-50 text-amber-600"
                active={isDarkMode} 
                onToggle={() => setIsDarkMode(!isDarkMode)} 
              />
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between p-6 bg-red-50 text-red-600 rounded-2xl font-bold hover:bg-red-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <LogOut className="w-5 h-5" />
              <span>Keluar Akun</span>
            </div>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}