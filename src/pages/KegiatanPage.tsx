import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db, Activity } from '@/services/database';
import { Plus, CheckSquare, Square, Search, Trash2, ArrowUpDown, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default function KegiatanPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('Semua');
  const [sortBy, setSortBy] = useState('deadline');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    if (!user?.id) return;
    db.getActivities(user.id).then(setActivities);
  }, [user?.id]);

  const reload = async () => {
    if (!user?.id) return;
    const data = await db.getActivities(user.id);
    setActivities(data);
  };

  if (!user) return null;

  const processedActivities = useMemo(() => {
    return activities
      .filter(a =>
        (filterCategory === 'Semua' || a.category === filterCategory) &&
        (a.name.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      .sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        if (sortBy === 'deadline') return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        const p = { 'Tinggi': 1, 'Sedang': 2, 'Rendah': 3 };
        return (p[a.priority] || 2) - (p[b.priority] || 2);
      });
  }, [activities, filterCategory, searchTerm, sortBy]);

  const handleToggle = async (activity: Activity) => {
    await db.updateActivity(activity.id, { completed: !activity.completed });
    await reload();
  };

  const handleDelete = async (id: string) => {
    await db.deleteActivity(id);
    await reload();
  };

  const getPriorityColor = (priority: string) => {
    const colors = { 'Tinggi': 'bg-red-100 text-red-700 border-red-200', 'Sedang': 'bg-yellow-100 text-yellow-700 border-yellow-200', 'Rendah': 'bg-green-100 text-green-700 border-green-200' };
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Kegiatan</h1>
          <p className="text-gray-600">Kelola semua kegiatanmu di sini.</p>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Cari kegiatan..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none" />
        </div>
        <div className="flex gap-2">
          {['Semua', 'Akademik', 'Organisasi', 'Pribadi'].map(cat => (
            <button key={cat} onClick={() => setFilterCategory(cat)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${filterCategory === cat ? 'bg-[#8049FF] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-purple-300'}`}>
              {cat}
            </button>
          ))}
        </div>
        <div className="relative">
          <button onClick={() => setIsSortOpen(!isSortOpen)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:border-purple-300 transition-all">
            <ArrowUpDown className="w-4 h-4" /> Urutkan
          </button>
          {isSortOpen && (
            <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden">
              {[{ value: 'deadline', label: 'Deadline' }, { value: 'priority', label: 'Prioritas' }].map(opt => (
                <button key={opt.value} onClick={() => { setSortBy(opt.value); setIsSortOpen(false); }}
                  className={`w-full text-left px-4 py-3 text-sm hover:bg-purple-50 transition-colors ${sortBy === opt.value ? 'text-purple-600 font-bold' : 'text-gray-700'}`}>
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        <AnimatePresence>
          {processedActivities.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
              <p className="text-gray-400 font-medium">Tidak ada kegiatan ditemukan</p>
            </div>
          ) : processedActivities.map(activity => (
            <motion.div key={activity.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}
              className={`bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex items-center gap-4 transition-all ${activity.completed ? 'opacity-60' : ''}`}>
              <button onClick={() => handleToggle(activity)} className="flex-shrink-0 text-gray-300 hover:text-purple-600 transition-colors">
                {activity.completed ? <CheckSquare className="w-6 h-6 text-purple-600" /> : <Square className="w-6 h-6" />}
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getPriorityColor(activity.priority)}`}>{activity.priority.toUpperCase()}</span>
                  <span className="text-xs text-gray-400">{activity.category}</span>
                </div>
                <h3 className={`font-bold text-gray-900 ${activity.completed ? 'line-through text-gray-400' : ''}`}>{activity.name}</h3>
                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                  <Clock className="w-3 h-3" /> {format(new Date(activity.deadline), 'EEEE, dd MMM yyyy HH:mm', { locale: id })}
                </p>
              </div>
              <button onClick={() => handleDelete(activity.id)} className="flex-shrink-0 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                <Trash2 className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
