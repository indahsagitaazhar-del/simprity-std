import { useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { LogOut, ChevronRight, Edit2, Bell, Moon, Sun, Settings, X, Check, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router';
import { supabase } from '@/services/supabase';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(user?.fullName || '');
  const [isSaving, setIsSaving] = useState(false);
  const [displayName, setDisplayName] = useState(user?.fullName || '');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    (user as any)?.user_metadata?.avatar_url || null
  );
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Berhasil keluar');
    navigate('/');
  };

  const handleSaveProfile = async () => {
    if (!newName.trim()) { toast.error('Nama tidak boleh kosong'); return; }
    setIsSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ data: { full_name: newName.trim() } });
      if (error) throw error;
      setDisplayName(newName.trim());
      setIsEditing(false);
      toast.success('Profil berhasil diperbarui!');
    } catch {
      toast.error('Gagal memperbarui profil');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;
    if (file.size > 2 * 1024 * 1024) { toast.error('Ukuran foto maksimal 2MB'); return; }
    if (!file.type.startsWith('image/')) { toast.error('File harus berupa gambar'); return; }

    setIsUploadingPhoto(true);
    try {
      const ext = file.name.split('.').pop();
      const filePath = `${user.id}/avatar.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars').upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const publicUrl = `${data.publicUrl}?t=${Date.now()}`;

      const { error: updateError } = await supabase.auth.updateUser({ data: { avatar_url: publicUrl } });
      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      toast.success('Foto profil berhasil diperbarui!');
    } catch {
      toast.error('Gagal mengupload foto');
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const ToggleItem = ({ icon: Icon, title, desc, active, onToggle, color }: any) => (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${color}`}><Icon className="w-5 h-5" /></div>
        <div>
          <h4 className="font-bold text-gray-900">{title}</h4>
          <p className="text-xs text-gray-500">{desc}</p>
        </div>
      </div>
      <button onClick={onToggle} className={`w-12 h-6 rounded-full transition-colors relative ${active ? 'bg-purple-600' : 'bg-gray-300'}`}>
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
        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm text-center">

            {/* Avatar */}
            <div className="relative w-24 h-24 mx-auto mb-4" style={{ isolation: 'isolate' }}>
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="w-24 h-24 rounded-full object-cover border-4 border-purple-100" />
              ) : (
                <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center text-3xl font-bold text-purple-600">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingPhoto}
                className="absolute bottom-0 right-0 z-10 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center shadow-md hover:bg-purple-700 transition-all disabled:opacity-60"
                title="Ganti foto"
              >
                {isUploadingPhoto
                  ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <Camera className="w-4 h-4" />}
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
            </div>

            <AnimatePresence mode="wait">
              {isEditing ? (
                <motion.div key="editing" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-4">
                  <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Nama lengkap" autoFocus
                    className="w-full text-center px-4 py-2 border-2 border-purple-400 rounded-xl font-bold text-gray-900 outline-none focus:ring-2 focus:ring-purple-300 mb-1" />
                  <p className="text-xs text-gray-400">{user?.email}</p>
                </motion.div>
              ) : (
                <motion.div key="display" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mb-6">
                  <h2 className="text-xl font-bold text-gray-900">{displayName}</h2>
                  <p className="text-gray-500 text-sm">{user?.email}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {isEditing ? (
              <div className="flex gap-2">
                <button onClick={() => { setIsEditing(false); setNewName(displayName); }}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all flex items-center justify-center gap-2">
                  <X className="w-4 h-4" /> Batal
                </button>
                <button onClick={handleSaveProfile} disabled={isSaving}
                  className="flex-1 py-2.5 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                  <Check className="w-4 h-4" /> {isSaving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            ) : (
              <button onClick={() => { setIsEditing(true); setNewName(displayName); }}
                className="w-full py-2.5 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-all flex items-center justify-center gap-2">
                <Edit2 className="w-4 h-4" /> Edit Profil
              </button>
            )}

            <p className="text-xs text-gray-400 mt-3">Klik ikon 📷 untuk ganti foto (maks. 2MB)</p>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-6 border-b border-gray-50 pb-4">
              <Settings className="text-purple-600" />
              <h3 className="text-lg font-bold text-gray-900">Pengaturan</h3>
            </div>
            <div className="space-y-4">
              <ToggleItem icon={Bell} title="Notifikasi" desc="Izinkan aplikasi mengirimkan pengingat"
                color="bg-blue-50 text-blue-600" active={notificationsEnabled} onToggle={() => setNotificationsEnabled(!notificationsEnabled)} />
              <ToggleItem icon={isDarkMode ? Moon : Sun} title="Mode Tema"
                desc={isDarkMode ? "Gunakan tampilan gelap" : "Gunakan tampilan terang"}
                color="bg-amber-50 text-amber-600" active={isDarkMode} onToggle={() => setIsDarkMode(!isDarkMode)} />
            </div>
          </div>

          <button onClick={handleLogout}
            className="w-full flex items-center justify-between p-6 bg-red-50 text-red-600 rounded-2xl font-bold hover:bg-red-100 transition-colors">
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
