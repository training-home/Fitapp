import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Card, ScreenTitle, Stat } from '../components/ui';
import { workouts } from '../data';
import { colors, radius, spacing } from '../theme';
import { Equipment } from '../three/Equipment';
import { Scene3D } from '../three/Scene3D';

export function WorkoutsScreen() {
  const [selectedId, setSelectedId] = useState(workouts[0].id);
  const selected = workouts.find((w) => w.id === selectedId) ?? workouts[0];

  const select = (id: string) => {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    setSelectedId(id);
  };

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <ScreenTitle kicker="Программа" title="Тренировки" />

      <Scene3D style={styles.scene} cameraZ={5} autoRotate={0.5}>
        <Equipment key={selected.id} kind={selected.equipment} color={selected.color} />
      </Scene3D>

      <Card style={styles.detail}>
        <Text style={styles.detailTitle}>{selected.title}</Text>
        <View style={styles.stats}>
          <Stat label="минут" value={String(selected.minutes)} color={selected.color} />
          <Stat label="ккал" value={String(selected.kcal)} />
          <Stat label="уровень" value={selected.level} />
        </View>
        {selected.exercises.map((e, i) => (
          <Text key={e} style={styles.exercise}>
            <Text style={{ color: selected.color }}>{i + 1}. </Text>
            {e}
          </Text>
        ))}
      </Card>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {workouts.map((w) => {
          const active = w.id === selected.id;
          return (
            <Pressable
              key={w.id}
              onPress={() => select(w.id)}
              style={[styles.chip, active && { borderColor: w.color, backgroundColor: colors.surfaceRaised }]}
            >
              <View style={[styles.chipDot, { backgroundColor: w.color }]} />
              <View>
                <Text style={styles.chipTitle}>{w.title}</Text>
                <Text style={styles.chipSub}>
                  {w.subtitle} · {w.minutes} мин
                </Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: spacing.xl },
  scene: { height: 280 },
  detail: { marginHorizontal: spacing.md, gap: spacing.sm },
  detailTitle: { color: colors.text, fontSize: 20, fontWeight: '800' },
  stats: { flexDirection: 'row', paddingVertical: spacing.sm },
  exercise: { color: colors.text, fontSize: 15 },
  chips: { padding: spacing.md, gap: spacing.sm },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipDot: { width: 10, height: 10, borderRadius: 5 },
  chipTitle: { color: colors.text, fontWeight: '700', fontSize: 14 },
  chipSub: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
});
