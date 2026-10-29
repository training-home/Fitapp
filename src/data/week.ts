export type DayStat = { day: string; kcal: number; minutes: number };

// Demo history for past days; today's numbers come from the workout log.
export const demoWeek: DayStat[] = [
  { day: 'Пн', kcal: 520, minutes: 42 },
  { day: 'Вт', kcal: 380, minutes: 25 },
  { day: 'Ср', kcal: 610, minutes: 55 },
  { day: 'Чт', kcal: 290, minutes: 18 },
  { day: 'Пт', kcal: 700, minutes: 60 },
  { day: 'Сб', kcal: 450, minutes: 38 },
  { day: 'Вс', kcal: 320, minutes: 30 },
];

export const goals = { kcal: 500, minutes: 45, steps: 10000 };

// No pedometer yet, so steps stay a fixed sample value.
export const demoSteps = 6240;
