import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Icon } from '../components/Icon';
import { Card, ScreenTitle, SectionTitle, Stepper } from '../components/ui';
import { demoSteps, goals as targets } from '../data/week';
import { useStore } from '../store';
import { colors, radius, spacing, type } from '../theme';
import { ActivityRings, Goal } from '../three/ActivityRings';
import { Scene3D } from '../three/Scene3D';

const formatter = new Intl.NumberFormat('ru-RU');
const kindIcon = { strength: 'dumbbell', run: 'run', interval: 'timer' } as const;

export function TodayScreen() {
  const { today, weightKg, setWeightKg, removeEntry } = useStore();
  const date = new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' });
  const kcal = today.reduce((s, e) => s + e.kcal, 0);
  const minutes = Math.round(today.reduce((s, e) => s + e.minutes, 0));

  const goals: Goal[] = [
    { key: 'move', label: 'Калории', unit: 'ккал', value: kcal, target: targets.kcal, color: colors.move },
    { key: 'exercise', label: 'Тренировка', unit: 'мин', value: minutes, target: targets.minutes, color: colors.exercise },
    { key: 'steps', label: 'Шаги', unit: '', value: demoSteps, target: targets.steps, color: colors.steps },
  ];

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <ScreenTitle kicker={date} title="Сегодня" />
      <View>
        <Scene3D style={styles.scene} cameraZ={6.2} tilt={0.1}>
          <ActivityRings goals={goals} />
        </Scene3D>
      </View>

      <View style={styles.summary}>
        {goals.map((g) => {
          const pct = Math.round((g.value / g.target) * 100);
          return (
            <View key={g.key} style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: g.color }]}>{formatter.format(g.value)}</Text>
              <Text style={styles.summaryLabel}>{g.label}</Text>
              <View style={styles.track}>
                <View style={[styles.fill, { width: `${Math.min(pct, 100)}%`, backgroundColor: g.color }]} />
              </View>
              <Text style={styles.summaryTarget}>
                {g.key === 'steps' ? 'пример, без шагомера' : `${pct}% из ${formatter.format(g.target)} ${g.unit}`}
              </Text>
            </View>
          );
        })}
      </View>

      <SectionTitle>Журнал за сегодня</SectionTitle>
      <View style={styles.list}>
        {today.length === 0 ? (
          <Card style={styles.empty}>
            <Icon name="flame" size={28} color={colors.textDim} />
            <Text style={styles.emptyTitle}>Пока пусто</Text>
            <Text style={styles.emptyText}>Выполните упражнение или запустите таймер — калории появятся здесь и в кольцах.</Text>
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
              <Text style={styles.entryKcal}>{e.kcal}</Text>
              <Text style={styles.entryUnit}>ккал</Text>
              <Pressable hitSlop={10} onPress={() => removeEntry(e.id)} style={styles.remove}>
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
  scene: { height: 320 },
  summary: { flexDirection: 'row', paddingHorizontal: spacing.md, gap: spacing.sm },
  summaryItem: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md - 2, gap: 4 },
  summaryValue: { fontSize: 22, fontWeight: '800', ...type.number },
  summaryLabel: { color: colors.text, fontSize: 13, fontWeight: '700' },
  summaryTarget: { color: colors.textMuted, fontSize: 11 },
  track: { height: 5, borderRadius: 3, backgroundColor: colors.surfaceRaised, overflow: 'hidden', marginTop: 4 },
  fill: { height: '100%', borderRadius: 3 },
  list: { paddingHorizontal: spacing.md, gap: spacing.sm },
  empty: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.lg },
  emptyTitle: { color: colors.text, fontWeight: '800', fontSize: 16 },
  emptyText: { color: colors.textMuted, textAlign: 'center', fontSize: 14, lineHeight: 20 },
  entry: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderRadius: radius.md },
  entryIcon: { width: 40, height: 40, borderRadius: 14, backgroundColor: `${colors.exercise}1F`, alignItems: 'center', justifyContent: 'center' },
  entryTitle: { color: colors.text, fontWeight: '700', fontSize: 15 },
  entryMeta: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  entryKcal: { color: colors.move, fontWeight: '800', fontSize: 18, ...type.number },
  entryUnit: { color: colors.textMuted, fontSize: 11, marginLeft: -10 },
  remove: { padding: 4 },
  weight: { marginHorizontal: spacing.md },
});
