import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { db, Activity } from "@/services/database";
import { hitungSkorKegiatan } from "@/utils/ruleEngine";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid
} from "recharts";
import { motion } from "motion/react";

const HARI_LABELS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

export default function StatistikPage() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    if (!user?.id) return;
    db.getActivities(user.id).then(setActivities);
    const interval = setInterval(() => {
      db.getActivities(user.id).then(setActivities);
    }, 5000);
    return () => clearInterval(interval);
  }, [user?.id]);

  const stats = useMemo(() => {
    const total = activities.length;
    const now = new Date();
    const rataRata = total > 0 ? activities.reduce((s, a) => s + hitungSkorKegiatan(a), 0) / total : 0;
    const tidakSelesai = activities.filter(a => !a.completed).length;
    const risikoTelat = total > 0 ? Math.round((tidakSelesai / total) * 100) : 0;

    const distribusi = [
      { name: "Tinggi", value: activities.filter(a => a.priority === "Tinggi" && !a.completed).length, color: "#EF4444" },
      { name: "Sedang", value: activities.filter(a => a.priority === "Sedang" && !a.completed).length, color: "#F59E0B" },
      { name: "Rendah", value: activities.filter(a => a.priority === "Rendah" && !a.completed).length, color: "#22C55E" },
    ];

    const proporsi = [
      { name: "Akademik",   value: activities.filter(a => a.category === "Akademik").length,   color: "#7C3AED" },
      { name: "Organisasi", value: activities.filter(a => a.category === "Organisasi").length, color: "#22C55E" },
      { name: "Pribadi",    value: activities.filter(a => a.category === "Pribadi").length,    color: "#CBD5E1" },
    ];

    const hariIni = now.getDay();
    const senin = new Date(now);
    senin.setDate(now.getDate() - ((hariIni + 6) % 7));
    senin.setHours(0, 0, 0, 0);

    const tren = HARI_LABELS.map((label, i) => {
      const targetDate = new Date(senin);
      targetDate.setDate(senin.getDate() + i);
      targetDate.setHours(0, 0, 0, 0);
      const targetEnd = new Date(targetDate);
      targetEnd.setHours(23, 59, 59, 999);
      const selesai = activities.filter(a => {
        if (!a.completed) return false;
        const t = new Date(a.updatedAt ?? a.createdAt);
        return t >= targetDate && t <= targetEnd;
      }).length;
      return { label, selesai };
    });

    return { total, rataRata, risikoTelat, tidakSelesai, distribusi, proporsi, tren };
  }, [activities]);

  if (!user) return null;

  return (
    <div className="p-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Analitik</h1>
        <p className="text-gray-600">Visualisasi data dan statistik deskriptif aktivitasmu.</p>
      </motion.div>

      <div className="grid grid-cols-3 gap-6 mb-8">
        {[
          { label: "Total Kegiatan", value: stats.total,               hint: "semua yang tercatat",                                    border: "border-purple-500" },
          { label: "Rata-rata Skor", value: stats.rataRata.toFixed(2), hint: "skor prioritas (0–1)",                                   border: "border-yellow-500" },
          { label: "Risiko Telat",   value: `${stats.risikoTelat}%`,   hint: `${stats.tidakSelesai} dari ${stats.total} belum selesai`, border: "border-red-400"    },
        ].map((s, i) => (
          <motion.div key={i} whileHover={{ y: -4 }} className={`bg-white p-6 rounded-2xl border-t-4 ${s.border} border border-gray-100 shadow-sm`}>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{s.label}</p>
            <h3 className="text-3xl font-bold mt-2 text-gray-900">{s.value}</h3>
            <p className="text-xs text-gray-400 mt-1">{s.hint}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-1">Distribusi Prioritas</h2>
          <p className="text-xs text-gray-400 mb-5">Kegiatan aktif per level prioritas</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={stats.distribusi} margin={{ top: 16, right: 8, left: -24, bottom: 0 }}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 13, fontWeight: 600 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip cursor={{ fill: "#F9FAFB" }} formatter={(v: number) => [v, "kegiatan"]} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={48}>
                {stats.distribusi.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-1">Proporsi Jenis Kegiatan</h2>
          <p className="text-xs text-gray-400 mb-5">Komposisi berdasarkan kategori</p>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width={130} height={130}>
              <PieChart>
                <Pie data={stats.proporsi} innerRadius={40} outerRadius={60} dataKey="value" paddingAngle={3}>
                  {stats.proporsi.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-3 flex-1">
              {stats.proporsi.map(item => {
                const pct = stats.total > 0 ? Math.round((item.value / stats.total) * 100) : 0;
                return (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: item.color }} />
                    <span className="text-sm text-gray-600 flex-1">{item.name}</span>
                    <span className="text-sm font-bold text-gray-800">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm col-span-2">
          <h2 className="font-bold text-gray-900 mb-1">Tren Kegiatan</h2>
          <p className="text-xs text-gray-400 mb-5">Jumlah kegiatan selesai per hari — minggu ini</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={stats.tren} margin={{ top: 10, right: 16, left: -16, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#f3f4f6" strokeDasharray="4 4" />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: "#9CA3AF", fontWeight: 600 }} />
              <YAxis axisLine={false} tickLine={false} allowDecimals={false} tick={{ fontSize: 11, fill: "#9CA3AF" }} />
              <Tooltip formatter={(v: number) => [v, "kegiatan selesai"]} />
              <Line type="monotone" dataKey="selesai" stroke="#7C3AED" strokeWidth={3}
                dot={{ r: 5, fill: "#7C3AED", stroke: "#fff", strokeWidth: 2 }} activeDot={{ r: 7 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
}
