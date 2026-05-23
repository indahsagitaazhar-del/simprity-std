import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db, Activity } from '@/services/database';
import { Clock, Trash2, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default function EditActivitiesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    if (!user?.id) return;
    db.getActivities(user.id).then(data => setActivities(data.filter(a => !a.completed)));
  }, [user?.id]);

  if (!user) return null;

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedIds(newSelected);
  };

  const handleDelete = async (id: string) => {
    await db.deleteActivity(id);
    setActivities(prev => prev.filter(a => a.id !== id));
    toast.success('Kegiatan dihapus');
  };

  const handleMarkDone = async (id: string) => {
    await db.updateActivity(id, { completed: true });
    setActivities(prev => prev.filter(a => a.id !== id));
    toast.success('Kegiatan ditandai selesai!');
  };

  const handleBulkDelete = async () => {
    for (const id of selectedIds) await db.deleteActivity(id);
    setActivities(prev => prev.filter(a => !selectedIds.has(a.id)));
    setSelectedIds(new Set());
    toast.success(`${selectedIds.size} kegiatan dihapus`);
  };

  const getPriorityColor = (priority: string) => {
    const colors = { 'Tinggi': 'border-red-300 bg-red-50', 'Sedang': 'border-yellow-300 bg-yellow-50', 'Rendah': 'border-green-300 bg-green-50' };
    return colors[priority as keyof typeof colors] || 'border-gray-200 bg-white';
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Edit Kegiatan</h1>
          <p className="text-gray-600">Pilih kegiatan untuk dihapus atau tandai selesai.</p>
        </div>
        {selectedIds.size > 0 && (
          <button onClick={handleBulkDelete} className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-all">
            <Trash2 className="w-4 h-4" /> Hapus {selectedIds.size} Dipilih
          </button>
        )}
      </div>

      <div className="space-y-3">
        {activities.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <p className="text-gray-400">Tidak ada kegiatan aktif.</p>
          </div>
        ) : activities.map(activity => (
          <motion.div key={activity.id} layout
            className={`border-l-4 rounded-xl p-5 flex items-center gap-4 transition-all cursor-pointer ${getPriorityColor(activity.priority)} ${selectedIds.has(activity.id) ? 'ring-2 ring-purple-400' : ''}`}
            onClick={() => toggleSelection(activity.id)}>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-gray-500 uppercase">{activity.priority}</span>
                <span className="text-xs text-gray-400">• {activity.category}</span>
              </div>
              <h3 className="font-bold text-gray-900">{activity.name}</h3>
              <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                <Clock className="w-3 h-3" /> {format(new Date(activity.deadline), 'dd MMM yyyy HH:mm', { locale: id })}
              </p>
            </div>
            <div className="flex gap-2" onClick={e => e.stopPropagation()}>
              <button onClick={() => handleMarkDone(activity.id)} className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-all" title="Tandai selesai">
                <CheckCircle className="w-5 h-5" />
              </button>
              <button onClick={() => handleDelete(activity.id)} className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-all" title="Hapus">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
