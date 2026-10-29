import { colors } from './theme';

export type Goal = {
  key: 'move' | 'exercise' | 'steps';
  label: string;
  unit: string;
  value: number;
  target: number;
  color: string;
};

export const todayGoals: Goal[] = [
  { key: 'move', label: 'Калории', unit: 'ккал', value: 420, target: 600, color: colors.move },
  { key: 'exercise', label: 'Тренировка', unit: 'мин', value: 34, target: 45, color: colors.exercise },
  { key: 'steps', label: 'Шаги', unit: '', value: 8240, target: 10000, color: colors.steps },
];

export type EquipmentKind = 'dumbbell' | 'kettlebell' | 'mat' | 'rope';

export type Workout = {
  id: string;
  title: string;
  subtitle: string;
  minutes: number;
  kcal: number;
  level: 'Лёгкий' | 'Средний' | 'Сложный';
  equipment: EquipmentKind;
  color: string;
  exercises: string[];
};

export const workouts: Workout[] = [
  {
    id: 'strength',
    title: 'Сила: верх тела',
    subtitle: 'Гантели',
    minutes: 40,
    kcal: 320,
    level: 'Средний',
    equipment: 'dumbbell',
    color: colors.move,
    exercises: ['Жим гантелей лёжа', 'Тяга в наклоне', 'Жим стоя', 'Сгибания на бицепс'],
  },
  {
    id: 'hiit',
    title: 'HIIT с гирей',
    subtitle: 'Гиря',
    minutes: 25,
    kcal: 380,
    level: 'Сложный',
    equipment: 'kettlebell',
    color: colors.exercise,
    exercises: ['Махи гирей', 'Гоблет-присед', 'Рывок одной рукой', 'Турецкий подъём'],
  },
  {
    id: 'cardio',
    title: 'Кардио-скакалка',
    subtitle: 'Скакалка',
    minutes: 20,
    kcal: 260,
    level: 'Средний',
    equipment: 'rope',
    color: colors.steps,
    exercises: ['Базовые прыжки', 'Двойные прыжки', 'Бег на месте', 'Крест-накрест'],
  },
  {
    id: 'yoga',
    title: 'Йога и растяжка',
    subtitle: 'Коврик',
    minutes: 30,
    kcal: 140,
    level: 'Лёгкий',
    equipment: 'mat',
    color: colors.accent,
    exercises: ['Собака мордой вниз', 'Воин II', 'Поза голубя', 'Шавасана'],
  },
];

export type DayStat = { day: string; kcal: number; minutes: number };

export const week: DayStat[] = [
  { day: 'Пн', kcal: 520, minutes: 42 },
  { day: 'Вт', kcal: 380, minutes: 25 },
  { day: 'Ср', kcal: 610, minutes: 55 },
  { day: 'Чт', kcal: 290, minutes: 18 },
  { day: 'Пт', kcal: 700, minutes: 60 },
  { day: 'Сб', kcal: 450, minutes: 38 },
  { day: 'Вс', kcal: 420, minutes: 34 },
];
