import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db, Activity } from '@/services/database';
import { Clock, CheckCircle, AlertTriangle, Trash2, CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { useOutletContext, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths } from 'date-fns';
import { id } from 'date-fns/locale';

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { searchQuery } = useOutletContext<{ searchQuery: string }>();

  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedActivities, setSelectedActivities] = useState<Activity[]>([]);
  const [activeActivity, setActiveActivity] = useState<Activity | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    if (!user?.id) return;
    db.getActivities(user.id).then(setActivities);
  }, [user?.id]);

  if (!user) return null;

  const totalActivities = activities.length;
  const completedCount = activities.filter(a => a.completed).length;
  const progressPercentage = totalActivities > 0 ? (completedCount / totalActivities) * 100 : 0;
  const inReviewCount = activities.filter(a => !a.completed).length;

  const filteredActivities = activities.filter(activity =>
    activity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    activity.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const upcomingActivities = filteredActivities.filter(a => !a.completed).slice(0, 3);
  const urgentActivity = activities.find(a => a.priority === 'Tinggi' && !a.completed);

  const daysInMonth = eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) });

  const getPriorityColor = (priority: string) => {
    const colors = { 'Tinggi': 'border-red-400 bg-red-50/50', 'Sedang': 'border-yellow-400 bg-yellow-50/50', 'Rendah': 'border-green-400 bg-green-50/50' };
    return colors[priority as keyof typeof colors] || 'border-gray-200 bg-gray-50';
  };

  const getPriorityTag = (priority: string) => {
    const tags = { 'Tinggi': { label: 'TINGGI', color: 'bg-red-100 text-red-700' }, 'Sedang': { label: 'SEDANG', color: 'bg-yellow-100 text-yellow-700' }, 'Rendah': { label: 'RENDAH', color: 'bg-green-100 text-green-700' } };
    return tags[priority as keyof typeof tags] || tags['Rendah'];
  };

  const formatDeadline = (deadline: Date) => {
    const diff = deadline.getTime() - new Date().getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 24) return `Hari ini, ${format(deadline, 'HH:mm')}`;
    return format(deadline, 'EEEE, dd MMM', { locale: id });
  };

  const handleMarkDone = async (activity: Activity) => {
    await db.updateActivity(activity.id, { completed: true });
    const updated = await db.getActivities(user.id);
    setActivities(updated);
    setActiveActivity(null);
  };

  const handleDelete = async (activity: Activity) => {
    await db.deleteActivity(activity.id);
    const updated = await db.getActivities(user.id);
    setActivities(updated);
    setActiveActivity(null);
  };

  return (
    <div className="p-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Halo, {user.fullName?.split(' ')[0] || 'User'}!</h1>
        <p className="text-gray-600">Kelola prioritas kegiatanmu hari ini.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {urgentActivity && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white border-2 border-red-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-bold text-red-900 mb-1">PRIORITAS TINGGI</h3>
                  <p className="text-red-700">Tugas "{urgentActivity.name}" butuh perhatianmu segera!</p>
                </div>
              </div>
            </motion.div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#F2EDFF] rounded-xl p-6 shadow-sm border border-purple-100 flex items-center gap-4">
              <div className="p-3 bg-white rounded-xl shadow-sm"><CheckCircle className="w-6 h-6 text-[#8049FF]" /></div>
              <div><h3 className="text-3xl font-bold text-[#8049FF]">{completedCount}</h3><p className="text-gray-600 text-sm font-medium">Selesai</p></div>
            </div>
            <div className="bg-gray-50 rounded-xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="p-3 bg-white rounded-xl shadow-sm"><Clock className="w-6 h-6 text-gray-500" /></div>
              <div><h3 className="text-3xl font-bold text-gray-800">{inReviewCount}</h3><p className="text-gray-600 text-sm font-medium">Belum Selesai</p></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Kegiatan Mendatang</h2>
              <button onClick={() => navigate('/activities')} className="text-sm font-semibold text-[#8049FF] hover:text-purple-700 transition-colors">Lihat Semua →</button>
            </div>
            <div className="space-y-3">
              {upcomingActivities.length > 0 ? upcomingActivities.map((activity) => {
                const tag = getPriorityTag(activity.priority);
                return (
                  <motion.div key={activity.id} layout onClick={() => setActiveActivity(activity)} className={`${getPriorityColor(activity.priority)} border-l-4 rounded-xl p-5 shadow-sm transition-all hover:translate-x-1 hover:shadow-md cursor-pointer`}>
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <h4 className="text-xs font-semibold text-gray-400 uppercase">{activity.category}</h4>
                        <h3 className="text-lg font-bold text-gray-900">{activity.name}</h3>
                        <p className="text-sm text-gray-500 flex items-center gap-1"><Clock className="w-3 h-3" /> {formatDeadline(new Date(activity.deadline))}</p>
                      </div>
                      <span className={`${tag.color} px-3 py-1 rounded-full text-xs font-bold`}>{tag.label}</span>
                    </div>
                  </motion.div>
                );
              }) : (
                <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                  <CalendarDays className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">Tidak ada kegiatan mendatang</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-1 hover:bg-gray-100 rounded"><ChevronLeft className="w-5 h-5" /></button>
              <h3 className="text-lg font-bold text-gray-900 capitalize">{format(currentMonth, 'MMMM yyyy', { locale: id })}</h3>
              <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-1 hover:bg-gray-100 rounded"><ChevronRight className="w-5 h-5" /></button>
            </div>
            <div className="grid grid-cols-7 gap-2 text-center text-xs text-gray-400 mb-2">
              {['Min','Sen','Sel','Rab','Kam','Jum','Sab'].map(d => <div key={d}>{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {daysInMonth.map((day) => {
                const acts = activities.filter(a => isSameDay(new Date(a.deadline), day) && !a.completed);
                const priorityClass = acts.length > 0 ? (acts.some(a => a.priority === 'Tinggi') ? 'bg-red-200' : 'bg-green-200') : '';
                return (
                  <div key={day.toISOString()} onClick={() => { setSelectedDate(day); setSelectedActivities(acts); }} className={`aspect-square flex items-center justify-center text-sm rounded-lg cursor-pointer transition-all ${isToday(day) ? 'bg-[#8049FF] text-white font-bold' : acts.length > 0 ? `${priorityClass} hover:opacity-80` : 'hover:bg-gray-100'}`}>
                    {format(day, 'd')}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Pencapaian</h3>
              <span className="text-sm font-bold text-[#8049FF]">{Math.round(progressPercentage)}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div className="bg-[#8049FF] h-2 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }} />
            </div>
            <p className="text-xs text-gray-500 mt-2">{completedCount} dari {totalActivities} total tugas selesai</p>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {activeActivity && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm" onClick={() => setActiveActivity(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="bg-white rounded-xl shadow-2xl p-2 w-64 border" onClick={e => e.stopPropagation()}>
              <button onClick={() => handleMarkDone(activeActivity)} className="w-full text-left px-4 py-3 hover:bg-purple-50 rounded-lg text-purple-700 font-medium flex items-center gap-3">
                <CheckCircle className="w-4 h-4" /> Tandai Selesai
              </button>
              <button onClick={() => handleDelete(activeActivity)} className="w-full text-left px-4 py-3 hover:bg-red-50 rounded-lg text-red-600 font-medium flex items-center gap-3">
                <Trash2 className="w-4 h-4" /> Hapus
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
