import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Card, ScreenTitle, Stat } from '../components/ui';
import { week } from '../data';
import { colors, radius, spacing } from '../theme';
import { Scene3D } from '../three/Scene3D';
import { WeekChart3D } from '../three/WeekChart3D';

export function ProgressScreen() {
  const [selected, setSelected] = useState(week.length - 1);
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
          </Pressable>
        ))}
      </View>

      <Card style={styles.card}>
        <Text style={styles.cardTitle}>{day.day}</Text>
        <View style={styles.row}>
          <Stat label="ккал" value={String(day.kcal)} color={colors.exercise} />
          <Stat label="минут" value={String(day.minutes)} />
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Итого за неделю</Text>
        <View style={styles.row}>
          <Stat label="ккал" value={totalKcal.toLocaleString('ru-RU')} color={colors.move} />
          <Stat label="минут" value={String(totalMin)} color={colors.steps} />
          <Stat label="в среднем" value={`${Math.round(totalKcal / week.length)}`} />
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: spacing.xl },
  scene: { height: 300 },
  days: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: spacing.md, marginBottom: spacing.md },
  day: { paddingVertical: spacing.sm, paddingHorizontal: spacing.sm + 2, borderRadius: radius.sm },
  dayActive: { backgroundColor: colors.exercise },
  dayText: { color: colors.textMuted, fontWeight: '700' },
  dayTextActive: { color: colors.bg },
  card: { marginHorizontal: spacing.md, marginBottom: spacing.sm },
  cardTitle: { color: colors.text, fontSize: 17, fontWeight: '800', marginBottom: spacing.sm },
  row: { flexDirection: 'row' },
});
