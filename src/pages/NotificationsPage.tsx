import { useEffect, useState } from "react";
import { useNotification } from "@/context/NotificationContext";
import { db } from "@/services/database";
import { useAuth } from "@/context/AuthContext";
import { Bell, Info, AlertTriangle, CheckCircle, Clock, ShieldAlert } from "lucide-react";

export default function NotificationPage() {
  const { user } = useAuth();
  const { markAsRead } = useNotification();
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (!user?.id) return;
    db.getNotifications(user.id).then((data) => {
      setNotifications(data);
      const unreadCount = data.filter(n => !n.read).length;
      data.forEach((n) => { if (!n.read) db.markNotificationAsRead(n.id); });
      markAsRead(unreadCount);
    });
  }, [user?.id, markAsRead]);

  const getNotificationStyle = (type: string) => {
    switch (type) {
      case 'danger': return { icon: <ShieldAlert className="w-5 h-5 text-rose-600" />, bg: "bg-rose-50", border: "border-rose-200", label: "KRITIS" };
      case 'warning': return { icon: <AlertTriangle className="w-5 h-5 text-amber-500" />, bg: "bg-amber-50", border: "border-amber-200", label: "PERINGATAN" };
      case 'success': return { icon: <CheckCircle className="w-5 h-5 text-emerald-500" />, bg: "bg-emerald-50", border: "border-emerald-200", label: "SELESAI" };
      default: return { icon: <Info className="w-5 h-5 text-blue-500" />, bg: "bg-blue-50", border: "border-blue-200", label: "INFO" };
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto min-h-screen bg-gray-50/50">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-purple-100 rounded-lg">
          <Bell className="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pusat Peringatan Cerdas</h1>
          <p className="text-xs text-gray-500">Sistem Notifikasi Berbasis Probabilitas</p>
        </div>
      </div>
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400">Tidak ada peringatan prioritas saat ini.</p>
          </div>
        ) : (
          notifications.map((notif) => {
            const { icon, bg, border, label } = getNotificationStyle(notif.type);
            return (
              <div key={notif.id} className={`relative group flex items-start gap-4 p-4 border-l-4 rounded-r-2xl transition-all duration-300 hover:shadow-md ${notif.read ? 'bg-white opacity-60' : `${bg} ${border} shadow-sm`}`}>
                <div className={`mt-1 p-2 rounded-full ${notif.read ? 'bg-gray-100' : 'bg-white'}`}>{icon}</div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-900">{notif.title}</h3>
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${notif.type === 'danger' ? 'bg-rose-600 text-white' : 'bg-gray-200 text-gray-600'}`}>{label}</span>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mt-1">{notif.message}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
