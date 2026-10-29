import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Card, ScreenTitle, Stat } from '../components/ui';
import { demoWeek } from '../data/week';
import { useStore } from '../store';
import { colors, radius, spacing } from '../theme';
import { Scene3D } from '../three/Scene3D';
import { WeekChart3D } from '../three/WeekChart3D';

// Monday-based index of today.
const todayIndex = (new Date().getDay() + 6) % 7;

export function ProgressScreen() {
  const { today } = useStore();
  const [selected, setSelected] = useState(todayIndex);

  const week = demoWeek.map((d, i) =>
    i === todayIndex
      ? { ...d, kcal: today.reduce((s, e) => s + e.kcal, 0), minutes: Math.round(today.reduce((s, e) => s + e.minutes, 0)) }
      : d,
  );
  const day = week[selected];
  const totalKcal = week.reduce((s, d) => s + d.kcal, 0);
  const totalMin = week.reduce((s, d) => s + d.minutes, 0);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <ScreenTitle kicker="Эта неделя" title="Прогресс" />

      <Scene3D style={styles.scene} cameraZ={6.5} autoRotate={0}>
        <WeekChart3D days={week} selected={selected} />
      </Scene3D>

      <View style={styles.days}>
        {week.map((d, i) => (
          <Pressable key={d.day} onPress={() => setSelected(i)} style={[styles.day, i === selected && styles.dayActive]}>
            <Text style={[styles.dayText, i === selected && styles.dayTextActive]}>{d.day}</Text>
            {i === todayIndex && <View style={[styles.todayDot, i === selected && { backgroundColor: colors.bg }]} />}
          </Pressable>
        ))}
      </View>

      <Card style={styles.card} glow={colors.exercise}>
        <Text style={styles.cardTitle}>{selected === todayIndex ? 'Сегодня' : day.day}</Text>
        <View style={styles.row}>
          <Stat icon="flame" label="ккал" value={String(day.kcal)} color={colors.move} />
          <Stat icon="clock" label="минут" value={String(day.minutes)} />
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Итого за неделю</Text>
        <View style={styles.row}>
          <Stat label="ккал" value={totalKcal.toLocaleString('ru-RU')} color={colors.move} />
          <Stat label="минут" value={String(totalMin)} color={colors.steps} />
          <Stat label="ккал в день" value={`${Math.round(totalKcal / week.length)}`} />
        </View>
      </Card>
      <Text style={styles.note}>Прошлые дни недели — пример. Сегодняшний день считается по журналу.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: spacing.xl },
  scene: { height: 300 },
  days: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: spacing.md, marginBottom: spacing.md },
  day: { paddingVertical: spacing.sm, width: 42, alignItems: 'center', borderRadius: radius.sm },
  dayActive: { backgroundColor: colors.exercise },
  dayText: { color: colors.textMuted, fontWeight: '700' },
  dayTextActive: { color: colors.bg },
  todayDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.exercise, marginTop: 3 },
  card: { marginHorizontal: spacing.md, marginBottom: spacing.sm },
  cardTitle: { color: colors.text, fontSize: 17, fontWeight: '800', marginBottom: spacing.sm },
  row: { flexDirection: 'row' },
  note: { color: colors.textDim, fontSize: 12, textAlign: 'center', marginTop: spacing.sm, paddingHorizontal: spacing.md },
});
