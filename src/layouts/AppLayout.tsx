import { Outlet, Navigate, Link } from 'react-router';
import { useAuth } from '@/context/AuthContext';
import { Sidebar } from '@/components/Sidebar';
import { Bell, Plus, Search } from 'lucide-react';
import { db } from '@/services/database';
import { motion } from 'motion/react';
import { useState, useEffect } from 'react';

export function AppLayout() {
  const { user, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    if (!user?.id) return;
    db.getNotifications(user.id).then((notifs) => {
      setUnreadNotifications(notifs.filter(n => !n.read).length);
    });
  }, [user?.id]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-[#FDFBFD]">
      {/* SIDEBAR GLOBAL */}
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        {/* TOP BAR / HEADER */}
        <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between sticky top-0 z-20 h-20">
          
          {/* SISI KIRI: SEARCH BAR */}
          <div className="flex-1 max-w-md pr-4">
            <div className="relative flex items-center bg-[#F3F4F6] rounded-xl p-1 transition-all focus-within:ring-2 focus-within:ring-[#8049FF]/30 focus-within:bg-white border border-transparent focus-within:border-[#8049FF]">
              <div className="p-2 bg-[#E5E7EB] text-[#8049FF] rounded-lg flex items-center justify-center">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Cari Kegiatan.."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent pl-3 pr-4 py-1.5 text-sm text-gray-700 outline-none placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* SISI KANAN: NOTIFIKASI & PROFIL */}
          <div className="flex items-center gap-5 flex-shrink-0">
            <Link
              to="/notifications"
              className="relative p-2.5 text-gray-400 hover:text-[#8049FF] hover:bg-[#F2EDFF] rounded-xl transition-all"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifications > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                  {unreadNotifications}
                </span>
              )}
            </Link>

            <div className="w-10 h-10 bg-[#8049FF] rounded-xl flex items-center justify-center text-white font-bold shadow-sm border border-purple-200">
              {user?.fullName.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* AREA HALAMAN UTAMA */}
        <main className="flex-1 overflow-auto bg-[#F9F8FA]">
          <Outlet context={{ searchQuery }} />
        </main>
      </div>

      {/* FLOATING ACTION BUTTON */}
      <Link
        to="/add-activity"
        className="fixed bottom-8 right-8 w-14 h-14 bg-[#8049FF] text-white rounded-full flex items-center justify-center shadow-lg shadow-purple-200 hover:shadow-xl transition-all z-50 group"
        title="Tambah Kegiatan Baru"
      >
        <motion.div
          whileHover={{ rotate: 90 }}
          transition={{ duration: 0.2 }}
          className="flex items-center justify-center"
        >
          <Plus className="w-7 h-7" />
        </motion.div>
      </Link>
    </div>
  );
}