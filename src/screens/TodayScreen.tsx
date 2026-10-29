import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Icon, IconName } from '../components/Icon';
import { Card, Pill, ScreenTitle, SectionTitle, Stepper, Tap } from '../components/ui';
import { exercises, Muscle, muscleNames } from '../data/exercises';
import { demoSteps, goals as targets } from '../data/week';
import { LogEntry, useStore } from '../store';
import { colors, radius, spacing, type } from '../theme';
import { Mannequin } from '../three/Mannequin';
import { animations } from '../three/poses';
import { Scene3D } from '../three/Scene3D';

const formatter = new Intl.NumberFormat('ru-RU');
const kindIcon = { strength: 'dumbbell', run: 'run', interval: 'timer' } as const;
const runMuscles: Muscle[] = ['quads', 'calves', 'hamstrings', 'glutes'];

// Muscles trained today: main targets of logged exercises, plus legs for runs and intervals.
function trainedMuscles(entries: LogEntry[]) {
  const primary = new Set<Muscle>();
  const secondary = new Set<Muscle>();
  for (const e of entries) {
    const ex = exercises.find((x) => x.id === e.exerciseId);
    if (ex) {
      ex.primary.forEach((m) => primary.add(m));
      ex.secondary.forEach((m) => secondary.add(m));
    } else if (e.kind !== 'strength') {
      runMuscles.forEach((m) => primary.add(m));
    }
  }
  primary.forEach((m) => secondary.delete(m));
  return { primary: [...primary], secondary: [...secondary] };
}

function Metric({ icon, value, label, sub, color, pct }: { icon: IconName; value: string; label: string; sub: string; color: string; pct: number }) {
  return (
    <View style={styles.metric}>
      <View style={[styles.metricIcon, { backgroundColor: `${color}22` }]}>
        <Icon name={icon} size={18} color={color} />
      </View>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${Math.min(pct, 100)}%`, backgroundColor: color }]} />
      </View>
      <Text style={styles.metricSub}>{sub}</Text>
    </View>
  );
}

export function TodayScreen({ onNavigate }: { onNavigate: (tab: 'library' | 'timers') => void }) {
  const { today, weightKg, setWeightKg, removeEntry } = useStore();
  const date = new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' });
  const kcal = today.reduce((s, e) => s + e.kcal, 0);
  const minutes = Math.round(today.reduce((s, e) => s + e.minutes, 0));
  const muscles = trainedMuscles(today);
  const trained = muscles.primary.length > 0;

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <ScreenTitle kicker={date} title="Сегодня" />

      <View style={styles.bodyBox}>
        <Scene3D style={styles.body} cameraZ={6.4} autoRotate={0.3} initialAngle={-0.5} tilt={0.08}>
          <Mannequin animation={animations.idle} primary={muscles.primary} secondary={muscles.secondary} />
        </Scene3D>
        <View style={styles.bodyCaption} pointerEvents="none">
          <Text style={styles.bodyTitle}>Проработано сегодня</Text>
          <Text style={styles.bodyHint}>{trained ? 'Красным — основная нагрузка' : 'Пока ни одной мышцы'}</Text>
        </View>
      </View>

      {trained ? (
        <View style={styles.muscles}>
          {muscles.primary.map((m) => (
            <Pill key={m} label={muscleNames[m]} color={colors.muscle} />
          ))}
          {muscles.secondary.map((m) => (
            <Pill key={m} label={muscleNames[m]} color={colors.muscleSecondary} />
          ))}
        </View>
      ) : (
        <Text style={styles.emptyMuscles}>Выполните упражнение — мышцы загорятся на модели.</Text>
      )}

      <View style={styles.actions}>
        <Tap grow style={[styles.action, { backgroundColor: colors.exercise }]} onPress={() => onNavigate('library')}>
          <Icon name="dumbbell" size={22} color={colors.bg} strokeWidth={2.4} />
          <Text style={[styles.actionText, { color: colors.bg }]}>Тренировка</Text>
        </Tap>
        <Tap grow style={styles.action} onPress={() => onNavigate('timers')}>
          <Icon name="run" size={22} color={colors.steps} strokeWidth={2.2} />
          <Text style={styles.actionText}>Бег и кардио</Text>
        </Tap>
      </View>

      <View style={styles.metrics}>
        <Metric icon="flame" value={formatter.format(kcal)} label="ккал" sub={`цель ${targets.kcal}`} color={colors.move} pct={(kcal / targets.kcal) * 100} />
        <Metric icon="clock" value={String(minutes)} label="минут" sub={`цель ${targets.minutes}`} color={colors.exercise} pct={(minutes / targets.minutes) * 100} />
        <Metric icon="body" value={formatter.format(demoSteps)} label="шагов" sub="пример" color={colors.steps} pct={(demoSteps / targets.steps) * 100} />
      </View>

      <SectionTitle>Журнал за сегодня</SectionTitle>
      <View style={styles.list}>
        {today.length === 0 ? (
          <Card style={styles.empty}>
            <Icon name="flame" size={28} color={colors.textDim} />
            <Text style={styles.emptyText}>Здесь появятся упражнения и пробежки с расходом калорий.</Text>
          </Card>
        ) : (
          today.map((e) => (
            <Card key={e.id} style={styles.entry}>
              <View style={styles.entryIcon}>
                <Icon name={kindIcon[e.kind]} size={20} color={colors.exercise} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.entryTitle}>{e.title}</Text>
                <Text style={styles.entryMeta}>
                  {e.time} · {e.details}
                </Text>
              </View>
              <View style={styles.entryKcalBox}>
                <Text style={styles.entryKcal}>{e.kcal}</Text>
                <Text style={styles.entryUnit}>ккал</Text>
              </View>
              <Pressable hitSlop={10} onPress={() => removeEntry(e.id)} style={styles.remove} accessibilityLabel="Удалить запись">
                <Icon name="close" size={14} color={colors.textDim} />
              </Pressable>
            </Card>
          ))
        )}
      </View>

      <SectionTitle>Для расчёта калорий</SectionTitle>
      <Card style={styles.weight}>
        <Stepper label="Ваш вес" value={weightKg} onChange={setWeightKg} min={30} max={250} suffix=" кг" />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: spacing.xl },
  bodyBox: { height: 380 },
  body: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  bodyCaption: { position: 'absolute', left: spacing.md + 4, top: spacing.md },
  bodyTitle: { color: colors.text, fontWeight: '800', fontSize: 16 },
  bodyHint: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  muscles: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, paddingHorizontal: spacing.md + 4 },
  emptyMuscles: { color: colors.textMuted, fontSize: 14, paddingHorizontal: spacing.md + 4 },
  actions: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.md, marginTop: spacing.lg },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    height: 56,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceRaised,
  },
  actionText: { color: colors.text, fontWeight: '800', fontSize: 15 },
  metrics: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.md, marginTop: spacing.sm },
  metric: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md - 2, gap: 3 },
  metricIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  metricValue: { color: colors.text, fontSize: 22, fontWeight: '800', ...type.number },
  metricLabel: { color: colors.textMuted, fontSize: 12, fontWeight: '600' },
  metricSub: { color: colors.textDim, fontSize: 11 },
  track: { height: 5, borderRadius: 3, backgroundColor: colors.surfaceRaised, overflow: 'hidden', marginTop: 6 },
  fill: { height: '100%', borderRadius: 3 },
  list: { paddingHorizontal: spacing.md, gap: spacing.sm },
  empty: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.lg },
  emptyText: { color: colors.textMuted, textAlign: 'center', fontSize: 14, lineHeight: 20 },
  entry: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderRadius: radius.md },
  entryIcon: { width: 40, height: 40, borderRadius: 14, backgroundColor: `${colors.exercise}1F`, alignItems: 'center', justifyContent: 'center' },
  entryTitle: { color: colors.text, fontWeight: '700', fontSize: 15 },
  entryMeta: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  entryKcalBox: { alignItems: 'flex-end' },
  entryKcal: { color: colors.move, fontWeight: '800', fontSize: 18, ...type.number },
  entryUnit: { color: colors.textMuted, fontSize: 11 },
  remove: { padding: 4 },
  weight: { marginHorizontal: spacing.md },
});
