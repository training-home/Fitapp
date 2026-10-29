import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Card, ScreenTitle } from '../components/ui';
import { todayGoals } from '../data';
import { colors, spacing } from '../theme';
import { ActivityRings } from '../three/ActivityRings';
import { Scene3D } from '../three/Scene3D';

const formatter = new Intl.NumberFormat('ru-RU');

export function TodayScreen() {
  const date = new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <ScreenTitle kicker={date} title="Сегодня" />
      <Scene3D style={styles.scene} cameraZ={6.2}>
        <ActivityRings goals={todayGoals} />
      </Scene3D>
      <Text style={styles.hint}>Покрутите кольца пальцем</Text>

      <View style={styles.list}>
        {todayGoals.map((g) => {
          const pct = Math.round((g.value / g.target) * 100);
          return (
            <Card key={g.key} style={styles.goal}>
              <View style={[styles.dot, { backgroundColor: g.color }]} />
              <View style={styles.goalText}>
                <Text style={styles.goalLabel}>{g.label}</Text>
                <Text style={styles.goalValue}>
                  {formatter.format(g.value)} / {formatter.format(g.target)} {g.unit}
                </Text>
                <View style={styles.track}>
                  <View style={[styles.fill, { width: `${Math.min(pct, 100)}%`, backgroundColor: g.color }]} />
                </View>
              </View>
              <Text style={[styles.pct, { color: g.color }]}>{pct}%</Text>
            </Card>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: spacing.xl },
  scene: { height: 340, marginTop: spacing.sm },
  hint: { color: colors.textMuted, textAlign: 'center', fontSize: 12, marginTop: -spacing.sm },
  list: { padding: spacing.md, gap: spacing.sm },
  goal: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  dot: { width: 12, height: 12, borderRadius: 6 },
  goalText: { flex: 1 },
  goalLabel: { color: colors.text, fontSize: 16, fontWeight: '700' },
  goalValue: { color: colors.textMuted, fontSize: 13, marginTop: 2 },
  track: { height: 6, borderRadius: 3, backgroundColor: colors.surfaceRaised, marginTop: spacing.sm, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 3 },
  pct: { fontSize: 18, fontWeight: '800' },
});
