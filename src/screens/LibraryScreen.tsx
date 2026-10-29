import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { kcalFor } from '../calories';
import { Icon } from '../components/Icon';
import { Card, Chip, ScreenTitle, SectionTitle, Tap } from '../components/ui';
import { Exercise, exercises, Group, groups, muscleNames, programs } from '../data/exercises';
import { useStore } from '../store';
import { colors, radius, spacing } from '../theme';

export function LibraryScreen({ onOpen }: { onOpen: (e: Exercise) => void }) {
  const { weightKg } = useStore();
  const [group, setGroup] = useState<Group | 'all'>('all');
  const [programId, setProgramId] = useState<string | null>(null);
  const program = programs.find((p) => p.id === programId);

  const list = program
    ? program.exerciseIds.map((id) => exercises.find((e) => e.id === id)!)
    : exercises.filter((e) => group === 'all' || e.group === group);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <ScreenTitle kicker={`${exercises.length} упражнений`} title="Упражнения" />

      <SectionTitle>Программы</SectionTitle>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.programs}>
        {programs.map((p) => {
          const active = p.id === programId;
          return (
            <Tap key={p.id} onPress={() => setProgramId(active ? null : p.id)}>
              <Card glow={p.color} style={[styles.program, active && { borderColor: p.color, borderWidth: 1.5 }]}>
                <View style={[styles.programIcon, { backgroundColor: `${p.color}26` }]}>
                  <Icon name="bolt" size={18} color={p.color} />
                </View>
                <Text style={styles.programTitle} numberOfLines={1}>
                  {p.title}
                </Text>
                <Text style={styles.programSub}>{p.subtitle}</Text>
              </Card>
            </Tap>
          );
        })}
      </ScrollView>

      {program ? (
        <View style={styles.programBar}>
          <Text style={styles.programBarText}>Программа «{program.title}»: выполняйте по порядку</Text>
          <Chip label="Сбросить" onPress={() => setProgramId(null)} />
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          <Chip label="Все" active={group === 'all'} onPress={() => setGroup('all')} />
          {groups.map((g) => (
            <Chip key={g.key} label={g.label} color={g.color} active={group === g.key} onPress={() => setGroup(g.key)} />
          ))}
        </ScrollView>
      )}

      <View style={styles.list}>
        {list.map((e, i) => {
          const g = groups.find((x) => x.key === e.group)!;
          const perSet = kcalFor(e.met, weightKg, e.mode === 'time' ? e.amount / 60 + 1 : 1.75);
          return (
            <Tap key={e.id} onPress={() => onOpen(e)}>
              <Card style={styles.item}>
                <View style={[styles.badge, { backgroundColor: `${g.color}22` }]}>
                  {program ? (
                    <Text style={[styles.badgeNum, { color: g.color }]}>{i + 1}</Text>
                  ) : (
                    <Icon name={e.group === 'cardio' ? 'run' : 'dumbbell'} size={22} color={g.color} />
                  )}
                </View>
                <View style={styles.itemBody}>
                  <Text style={styles.itemTitle}>{e.name}</Text>
                  <Text style={styles.itemMuscles} numberOfLines={1}>
                    {e.primary.map((m) => muscleNames[m]).join(', ')}
                    {e.secondary.length > 0 && <Text style={styles.itemSecondary}> + {e.secondary.map((m) => muscleNames[m]).join(', ')}</Text>}
                  </Text>
                  <View style={styles.itemMeta}>
                    <Text style={styles.metaText}>
                      {e.sets} × {e.amount}
                      {e.mode === 'time' ? ' с' : ''}
                    </Text>
                    <Text style={styles.metaDot}>·</Text>
                    <Icon name="flame" size={13} color={colors.move} />
                    <Text style={styles.metaText}>≈ {perSet} ккал/подход</Text>
                  </View>
                </View>
                <Icon name="chevron" size={18} color={colors.textDim} />
              </Card>
            </Tap>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: spacing.xl },
  programs: { paddingHorizontal: spacing.md, gap: spacing.sm },
  program: { width: 164, gap: 6 },
  programIcon: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  programTitle: { color: colors.text, fontWeight: '800', fontSize: 16 },
  programSub: { color: colors.textMuted, fontSize: 12 },
  chips: { paddingHorizontal: spacing.md, gap: spacing.sm, paddingTop: spacing.lg, paddingBottom: spacing.sm },
  programBar: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.md + 4, paddingTop: spacing.lg, paddingBottom: spacing.sm },
  programBarText: { color: colors.textMuted, flex: 1, fontSize: 13 },
  list: { paddingHorizontal: spacing.md, gap: spacing.sm, paddingTop: spacing.sm },
  item: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderRadius: radius.md },
  badge: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  badgeNum: { fontSize: 18, fontWeight: '800' },
  itemBody: { flex: 1, gap: 3 },
  itemTitle: { color: colors.text, fontSize: 16, fontWeight: '700' },
  itemMuscles: { color: colors.muscle, fontSize: 13, fontWeight: '600' },
  itemSecondary: { color: colors.textMuted, fontWeight: '500' },
  itemMeta: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  metaText: { color: colors.textMuted, fontSize: 12 },
  metaDot: { color: colors.textDim },
});
