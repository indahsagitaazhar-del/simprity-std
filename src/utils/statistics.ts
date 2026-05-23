import { hitungSkorKegiatan } from '@/utils/ruleEngine';

// BUG FIX #4: Sebelumnya semua nilai statistik dikunci (hardcoded) sesuai
// dokumen Excel statis, sehingga tidak pernah mencerminkan data pengguna nyata.
// Sekarang semua metrik dihitung secara dinamis dari data aktual.
export const hitungStatistikDeskriptif = (activities: any[]) => {
  const scores = activities.map(a => hitungSkorKegiatan(a));

  if (scores.length === 0) {
    return {
      totalKegiatan: 0,
      mean: 0,
      median: 0,
      modus: 0,
      varians: 0,
      stdDev: 0,
      min: 0,
      max: 0,
      probabilitasTidakSelesai: "0%",
    };
  }

  // Mean
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;

  // Median
  const sorted = [...scores].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;

  // Modus (nilai paling sering muncul, dibulatkan ke 2 desimal)
  const freq: Record<string, number> = {};
  scores.forEach(s => {
    const key = s.toFixed(2);
    freq[key] = (freq[key] || 0) + 1;
  });
  const modusKey = Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0];
  const modus = parseFloat(modusKey);

  // Varians & Standar Deviasi
  const varians = scores.reduce((acc, s) => acc + Math.pow(s - mean, 2), 0) / scores.length;
  const stdDev = Math.sqrt(varians);

  const min = sorted[0];
  const max = sorted[sorted.length - 1];

  // Probabilitas tidak selesai
  const tidakSelesai = activities.filter(a => !a.completed).length;
  const probabilitasTidakSelesai = `${Math.round((tidakSelesai / activities.length) * 100)}%`;

  return {
    totalKegiatan: scores.length,
    mean,
    median,
    modus,
    varians,
    stdDev,
    min,
    max,
    probabilitasTidakSelesai,
  };
};
