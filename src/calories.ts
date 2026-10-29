// Calorie estimates use the standard MET formula: kcal = MET × body weight (kg) × hours.
export function kcalFor(met: number, weightKg: number, minutes: number) {
  return Math.round(met * weightKg * (minutes / 60));
}

// Compendium of Physical Activities values for running and walking by speed.
export const paces = [
  { label: 'Ходьба', kmh: 5, met: 3.5 },
  { label: 'Лёгкий бег', kmh: 8, met: 8.3 },
  { label: 'Бег', kmh: 10, met: 9.8 },
  { label: 'Быстрый бег', kmh: 12, met: 11.8 },
];

export const INTERVAL_WORK_MET = 8;
export const INTERVAL_REST_MET = 3;

export function formatClock(ms: number, tenths = false) {
  const total = Math.max(ms, 0) / 1000;
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = Math.floor(total % 60);
  const pad = (n: number) => String(n).padStart(2, '0');
  const base = h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
  return tenths ? `${base}.${Math.floor((total * 10) % 10)}` : base;
}
