import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { kcalFor } from '../calories';
import { Icon } from '../components/Icon';
import { Card, Chip, Pill, ScreenTitle, SectionTitle, Tap } from '../components/ui';
import { Exercise, exercises, Group, groups, muscleNames, programs } from '../data/exercises';
import { haptic } from '../haptics';
import { useStore } from '../store';
import { colors, radius, spacing } from '../theme';
import { Mannequin } from '../three/Mannequin';
import { animations } from '../three/poses';
import { Scene3D } from '../three/Scene3D';

// Pinned 3D preview: whichever exercise is selected in the list plays here.
function Preview({ exercise, onOpen }: { exercise: Exercise; onOpen: () => void }) {
  const g = groups.find((x) => x.key === exercise.group)!;
  return (
    <View style={styles.preview}>
      <View style={styles.previewScene}>
        <Scene3D style={StyleSheet.absoluteFill} cameraZ={6.2} autoRotate={0.35} initialAngle={0.6} tilt={0.1}>
          <Mannequin key={exercise.id} animation={animations[exercise.id]} primary={exercise.primary} secondary={exercise.secondary} />
        </Scene3D>
        <View style={styles.previewTop} pointerEvents="none">
          <Pill label={g.label} color={g.color} />
        </View>
      </View>
      <View style={styles.previewBar}>
        <View style={{ flex: 1 }}>
          <Text style={styles.previewName} numberOfLines={1}>
            {exercise.name}
          </Text>
          <Text style={styles.previewMuscles} numberOfLines={1}>
            {exercise.primary.map((m) => muscleNames[m]).join(', ')}
            {exercise.secondary.length > 0 && <Text style={styles.itemSecondary}> + {exercise.secondary.map((m) => muscleNames[m]).join(', ')}</Text>}
          </Text>
        </View>
        <Tap onPress={onOpen} style={[styles.open, { backgroundColor: g.color }]} label="Открыть упражнение">
          <Text style={styles.openText}>Начать</Text>
          <Icon name="chevron" size={16} color={colors.bg} strokeWidth={2.6} />
        </Tap>
      </View>
    </View>
  );
}

export function LibraryScreen({ onOpen }: { onOpen: (e: Exercise) => void }) {
  const { weightKg } = useStore();
  const [group, setGroup] = useState<Group | 'all'>('all');
  const [programId, setProgramId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState(exercises[0].id);
  const program = programs.find((p) => p.id === programId);
  const selected = exercises.find((e) => e.id === selectedId)!;

  const list = program
    ? program.exerciseIds.map((id) => exercises.find((e) => e.id === id)!)
    : exercises.filter((e) => group === 'all' || e.group === group);

  const pickProgram = (id: string | null) => {
    setProgramId(id);
    const first = programs.find((p) => p.id === id)?.exerciseIds[0];
    if (first) setSelectedId(first);
  };

  const select = (e: Exercise) => {
    haptic.tap();
    if (e.id === selectedId) onOpen(e);
    else setSelectedId(e.id);
  };

  return (
    <ScrollView contentContainerStyle={styles.content} stickyHeaderIndices={[1]}>
      <ScreenTitle kicker={`${exercises.length} упражнений · все на 3D-модели`} title="Упражнения" />
      <Preview exercise={selected} onOpen={() => onOpen(selected)} />

      <View>
        <SectionTitle>Программы</SectionTitle>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.programs}>
          {programs.map((p) => {
            const active = p.id === programId;
            return (
              <Tap key={p.id} onPress={() => pickProgram(active ? null : p.id)}>
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
            <Text style={styles.programBarText}>«{program.title}»: выполняйте по порядку</Text>
            <Chip label="Все упражнения" onPress={() => pickProgram(null)} />
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            <Chip label="Все" active={group === 'all'} onPress={() => setGroup('all')} />
            {groups.map((g) => (
              <Chip key={g.key} label={g.label} color={g.color} active={group === g.key} onPress={() => setGroup(g.key)} />
            ))}
          </ScrollView>
        )}

        <Text style={styles.hint}>Нажмите на упражнение, чтобы увидеть его на модели. Повторное нажатие откроет подходы.</Text>

        <View style={styles.list}>
          {list.map((e, i) => {
            const g = groups.find((x) => x.key === e.group)!;
            const active = e.id === selectedId;
            const perSet = kcalFor(e.met, weightKg, e.mode === 'time' ? e.amount / 60 + 1 : 1.75);
            return (
              <Tap key={e.id} onPress={() => select(e)}>
                <Card style={[styles.item, active && { borderColor: g.color, borderWidth: 1.5, backgroundColor: colors.surfaceRaised }]}>
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
                  {active ? (
                    <Text style={[styles.onModel, { color: g.color }]}>на модели</Text>
                  ) : (
                    <Icon name="chevron" size={18} color={colors.textDim} />
                  )}
                </Card>
              </Tap>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: spacing.xl },
  preview: { backgroundColor: colors.bg, paddingBottom: spacing.sm },
  previewScene: { height: 210 },
  previewTop: { position: 'absolute', top: spacing.sm, left: spacing.md + 4 },
  previewBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginHorizontal: spacing.md,
    padding: spacing.sm + 4,
    paddingLeft: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  previewName: { color: colors.text, fontWeight: '800', fontSize: 16 },
  previewMuscles: { color: colors.muscle, fontSize: 13, fontWeight: '600', marginTop: 2 },
  open: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 10, paddingHorizontal: 14, borderRadius: radius.pill },
  openText: { color: colors.bg, fontWeight: '800', fontSize: 14 },
  programs: { paddingHorizontal: spacing.md, gap: spacing.sm },
  program: { width: 164, gap: 6 },
  programIcon: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  programTitle: { color: colors.text, fontWeight: '800', fontSize: 16 },
  programSub: { color: colors.textMuted, fontSize: 12 },
  chips: { paddingHorizontal: spacing.md, gap: spacing.sm, paddingTop: spacing.lg, paddingBottom: spacing.sm },
  programBar: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.md + 4, paddingTop: spacing.lg, paddingBottom: spacing.sm },
  programBarText: { color: colors.textMuted, flex: 1, fontSize: 13 },
  hint: { color: colors.textDim, fontSize: 12, paddingHorizontal: spacing.md + 4, paddingBottom: spacing.sm },
  list: { paddingHorizontal: spacing.md, gap: spacing.sm },
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
  onModel: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
});
