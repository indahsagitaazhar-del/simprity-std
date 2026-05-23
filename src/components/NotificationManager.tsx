import { useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/services/database";
import { shouldNotify, hitungSkorKegiatan, tentukanLabelPrioritas, Activity } from "@/utils/ruleEngine";
import { showNotification, requestNotificationPermission } from "@/services/notificationService";
import { useNotification } from "@/context/NotificationContext";

export const NotificationManager = () => {
  const { user } = useAuth();
  const { increment } = useNotification();
  const notifiedTasks = useRef<Set<string>>(new Set());

  useEffect(() => {
    requestNotificationPermission();

    const checkNotifications = async () => {
      if (!user?.id) return;
      const activities = await db.getActivities(user.id);

      const avgScore =
        activities.length > 0
          ? activities.reduce((s, a) => s + hitungSkorKegiatan(a), 0) / activities.length
          : 0;
      const statusBeban =
        tentukanLabelPrioritas(avgScore) === 'Tinggi' ? 'BERAT' : 'STABIL';

      activities.forEach((act: Activity) => {
        if (act.completed || notifiedTasks.current.has(act.id)) return;
        if (shouldNotify(act, statusBeban)) {
          showNotification(
            "SIMPRITY Alert",
            `Tugas "${act.name}" membutuhkan perhatian Anda.`,
            `/tasks/${act.id}`
          );
          increment();
          notifiedTasks.current.add(act.id);
        }
      });
    };

    const interval = setInterval(checkNotifications, 30000);
    return () => clearInterval(interval);
  }, [user, increment]);

  return null;
};
