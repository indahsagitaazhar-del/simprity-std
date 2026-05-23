// 1. Interface — diselaraskan dengan Activity di database.ts
export interface Activity {
  id: string;
  userId: string;
  name: string;
  category: 'Akademik' | 'Organisasi' | 'Pribadi';
  priority: 'Tinggi' | 'Sedang' | 'Rendah';
  deadline: string | Date;
  completed: boolean;
  // BUG FIX #2: Tambah field importance & consequence agar sesuai dengan database.ts
  // Sebelumnya interface ini tidak punya kedua field tersebut, menyebabkan type mismatch
  // saat NotificationManager memanggil hitungSkorKegiatan() dengan data dari db.getActivities().
  importance?: 'Normal' | 'Sedang' | 'Penting';
  consequence?: 'Santai' | 'Sedang' | 'Bahaya';
  estimatedTime?: number;
}

// 2. Mesin Skoring (MADM)
export const hitungSkorKegiatan = (activity: Activity): number => {
  const bobotPriority = { 'Tinggi': 0.9, 'Sedang': 0.6, 'Rendah': 0.3 };
  const bobotCategory = { 'Akademik': 0.4, 'Organisasi': 0.3, 'Pribadi': 0.2 };
  
  const scoreP = bobotPriority[activity.priority] || 0.5;
  const scoreC = bobotCategory[activity.category] || 0.2;

  return (scoreP * 0.7) + (scoreC * 0.3);
};

// 3. Klasifikasi Beban
export const tentukanLabelPrioritas = (skor: number): 'Tinggi' | 'Sedang' | 'Rendah' => {
  if (skor >= 0.75) return 'Tinggi';
  if (skor >= 0.55) return 'Sedang';
  return 'Rendah';
};

// 4. Logika Temporal
const isDeadlineNear = (deadline: string | Date): boolean => {
  const d = new Date(deadline);
  const now = new Date();
  const diffInHours = (d.getTime() - now.getTime()) / (1000 * 60 * 60);
  return diffInHours > 0 && diffInHours <= 24;
};

// 5. Notifikasi Cerdas
// BUG FIX #3: Case 'RINGAN' sebelumnya masuk ke default yang return false,
// sehingga tidak ada notifikasi sama sekali saat beban ringan — termasuk untuk
// tugas prioritas Tinggi yang deadlinenya mepet. Sekarang RINGAN tetap
// menampilkan notifikasi untuk tugas Tinggi yang deadlinenya dekat.
export const shouldNotify = (
  activity: Activity, 
  bebanStatus: 'RINGAN' | 'STABIL' | 'BERAT'
): boolean => {
  if (activity.completed) return false;

  switch (bebanStatus) {
    case 'BERAT':
      return activity.priority === 'Tinggi';
    case 'STABIL':
      return activity.priority === 'Tinggi' && isDeadlineNear(activity.deadline);
    case 'RINGAN':
      // Tetap notifikasi jika prioritas Tinggi & deadline sudah dekat
      return activity.priority === 'Tinggi' && isDeadlineNear(activity.deadline);
    default:
      return false;
  }
};
