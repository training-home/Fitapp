import { useEffect, useEffectEvent, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { formatClock, kcalFor } from '../calories';
import { Icon } from '../components/Icon';
import { KeepAwake } from '../components/KeepAwake';
import { Button, Card, Pill, RoundButton, SectionTitle, Stat, Stepper } from '../components/ui';
import { Exercise, groups, muscleNames } from '../data/exercises';
import { haptic } from '../haptics';
import { useStore } from '../store';
import { colors, spacing, type } from '../theme';
import { Mannequin } from '../three/Mannequin';
import { animations } from '../three/poses';
import { Scene3D } from '../three/Scene3D';

type Phase = 'idle' | 'ready' | 'working' | 'resting' | 'done';
type Result = { kcal: number; minutes: number; sets: number };

export function ExerciseScreen({ exercise, onClose }: { exercise: Exercise; onClose: () => void }) {
  const { weightKg, addEntry } = useStore();
  const group = groups.find((g) => g.key === exercise.group)!;
  const timed = exercise.mode === 'time';
  const usesWeights = exercise.equipment === 'Гантели' || exercise.equipment === 'Скамья и гантели';

  const [targetSets, setTargetSets] = useState(exercise.sets);
  const [amount, setAmount] = useState(exercise.amount);
  const [load, setLoad] = useState(8);
  const [restSec, setRestSec] = useState(60);
  const [setsDone, setSetsDone] = useState(0);
  const [phase, setPhase] = useState<Phase>('idle');
  const [result, setResult] = useState<Result | null>(null);
  const [now, setNow] = useState(0);
  const [sessionStart, setSessionStart] = useState(0);
  const [phaseStart, setPhaseStart] = useState(0);

  const phaseElapsed = Math.max(now - phaseStart, 0) / 1000;
  const restLeft = Math.ceil(restSec - phaseElapsed);
  const workLeft = Math.ceil(amount - phaseElapsed);
  const perSetKcal = kcalFor(exercise.met, weightKg, timed ? amount / 60 + restSec / 60 : 0.75 + restSec / 60);

  const finish = (sets: number) => {
    const actual = (Date.now() - sessionStart) / 60000;
    // Quick taps through the sets shouldn't produce a near-zero estimate.
    const minimum = sets * (timed ? amount / 60 : 0.75);
    const minutes = Math.max(actual, minimum);
    const kcal = kcalFor(exercise.met, weightKg, minutes);
    const details = `${sets} × ${amount}${timed ? ' с' : ''}${usesWeights ? ` · ${load} кг` : ''} · ${minutes.toFixed(1)} мин`;
    addEntry({ title: exercise.name, kind: 'strength', minutes: Math.round(minutes * 10) / 10, kcal, details });
    setResult({ kcal, minutes, sets });
    setPhase('done');
    haptic.success();
  };

  const enterPhase = (next: Phase) => {
    const t = Date.now();
    setPhaseStart(t);
    setNow(t);
    setPhase(next);
  };

  const completeSet = () => {
    const sets = setsDone + 1;
    setSetsDone(sets);
    if (sets >= targetSets) return finish(sets);
    enterPhase('resting');
    haptic.tap();
  };

  // Advances timed sets and rest periods; runs from the interval, never during render.
  const tick = useEffectEvent(() => {
    const t = Date.now();
    setNow(t);
    const elapsed = (t - phaseStart) / 1000;
    if (phase === 'resting' && elapsed >= restSec) {
      setPhase('ready');
      haptic.phase();
    }
    if (phase === 'working' && elapsed >= amount) completeSet();
  });

  const active = phase === 'ready' || phase === 'working' || phase === 'resting';
  useEffect(() => {
    if (!active) return;
    const id = setInterval(tick, 200);
    return () => clearInterval(id);
  }, [active]);

  const start = () => {
    const t = Date.now();
    setSessionStart(t);
    setNow(t);
    setSetsDone(0);
    setResult(null);
    setPhase('ready');
    haptic.tap();
  };

  const startTimedSet = () => {
    enterPhase('working');
    haptic.phase();
  };

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      {active && <KeepAwake />}
      <View style={styles.header}>
        <Pill label={group.label} color={group.color} />
        <RoundButton icon="close" label="Закрыть" size={40} onPress={onClose} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.name}>{exercise.name}</Text>
        <Text style={styles.meta}>
          {exercise.equipment} · {exercise.sets} × {exercise.amount}
          {timed ? ' с' : ' повт.'}
        </Text>

        <View style={styles.sceneBox}>
          <Scene3D style={styles.scene} cameraZ={6.2} autoRotate={0.35} initialAngle={0.6} tilt={0.12}>
            <Mannequin animation={animations[exercise.id]} primary={exercise.primary} secondary={exercise.secondary} />
          </Scene3D>
          <View style={styles.legend} pointerEvents="none">
            <View style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: colors.muscle }]} />
              <Text style={styles.legendText}>Основные</Text>
            </View>
            {exercise.secondary.length > 0 && (
              <View style={styles.legendRow}>
                <View style={[styles.legendDot, { backgroundColor: colors.muscleSecondary }]} />
                <Text style={styles.legendText}>Вспомогательные</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.muscles}>
          {exercise.primary.map((m) => (
            <Pill key={m} label={muscleNames[m]} color={colors.muscle} />
          ))}
          {exercise.secondary.map((m) => (
            <Pill key={m} label={muscleNames[m]} color={colors.muscleSecondary} />
          ))}
        </View>

        <SectionTitle>Подходы</SectionTitle>
        <Card style={styles.setsCard} glow={group.color}>
          {phase === 'done' && result ? (
            <View style={styles.result}>
              <View style={[styles.resultIcon, { backgroundColor: colors.exercise }]}>
                <Icon name="check" size={28} color={colors.bg} strokeWidth={3} />
              </View>
              <Text style={styles.resultTitle}>Упражнение выполнено</Text>
              <View style={styles.row}>
                <Stat icon="flame" label="ккал" value={`≈ ${result.kcal}`} color={colors.move} />
                <Stat icon="clock" label="минут" value={result.minutes.toFixed(1)} />
                <Stat label="подходов" value={String(result.sets)} />
              </View>
              <Text style={styles.hint}>Добавлено в журнал на вкладке «Сегодня»</Text>
              <Button label="Ещё раз" icon="reset" variant="secondary" onPress={start} style={styles.wide} />
            </View>
          ) : (
            <>
              <View style={styles.dots}>
                {Array.from({ length: targetSets }, (_, i) => (
                  <View key={i} style={[styles.setDot, i < setsDone && { backgroundColor: group.color, borderColor: group.color }]}>
                    {i < setsDone ? <Icon name="check" size={16} color={colors.bg} strokeWidth={3} /> : <Text style={styles.setNum}>{i + 1}</Text>}
                  </View>
                ))}
              </View>

              {phase === 'idle' && (
                <>
                  <View style={styles.row}>
                    <Stepper label="Подходы" value={targetSets} onChange={setTargetSets} min={1} max={10} />
                    <Stepper label={timed ? 'Секунд' : 'Повторы'} value={amount} onChange={setAmount} step={timed ? 5 : 1} min={1} max={timed ? 300 : 100} />
                  </View>
                  <View style={styles.row}>
                    <Stepper label="Отдых" value={restSec} onChange={setRestSec} step={15} min={15} max={300} suffix=" с" />
                    {usesWeights && <Stepper label="Вес гантели" value={load} onChange={setLoad} min={1} max={60} suffix=" кг" />}
                  </View>
                  <Text style={styles.hint}>
                    ≈ {perSetKcal} ккал за подход с отдыхом · ваш вес {weightKg} кг
                  </Text>
                  <Button label="Начать упражнение" icon="play" color={group.color} onPress={start} style={styles.wide} />
                </>
              )}

              {phase === 'ready' && (
                <>
                  <Text style={styles.bigLabel}>
                    Подход {setsDone + 1} из {targetSets}
                  </Text>
                  <Text style={styles.big}>
                    {amount}
                    <Text style={styles.bigUnit}>{timed ? ' сек' : ' повт.'}</Text>
                  </Text>
                  {timed ? (
                    <Button label="Старт подхода" icon="play" color={group.color} onPress={startTimedSet} style={styles.wide} />
                  ) : (
                    <Button label="Подход выполнен" icon="check" color={group.color} onPress={completeSet} style={styles.wide} />
                  )}
                </>
              )}

              {phase === 'working' && (
                <>
                  <Text style={styles.bigLabel}>Работаем</Text>
                  <Text style={[styles.big, { color: group.color }]}>{formatClock(workLeft * 1000)}</Text>
                  <Button label="Завершить подход" icon="check" variant="secondary" onPress={completeSet} style={styles.wide} />
                </>
              )}

              {phase === 'resting' && (
                <>
                  <Text style={styles.bigLabel}>Отдых</Text>
                  <Text style={[styles.big, { color: colors.steps }]}>{formatClock(restLeft * 1000)}</Text>
                  <View style={styles.restTrack}>
                    <View style={[styles.restFill, { width: `${Math.min((phaseElapsed / restSec) * 100, 100)}%` }]} />
                  </View>
                  <Button label="Пропустить отдых" variant="secondary" onPress={() => setPhase('ready')} style={styles.wide} />
                </>
              )}

              {active && (
                <View style={styles.footer}>
                  <Text style={styles.hint}>Время: {formatClock(now - sessionStart)}</Text>
                  {setsDone > 0 && (
                    <Text style={styles.finish} onPress={() => finish(setsDone)}>
                      Завершить упражнение
                    </Text>
                  )}
                </View>
              )}
            </>
          )}
        </Card>

        <SectionTitle>Техника</SectionTitle>
        <Card style={styles.list}>
          {exercise.steps.map((s, i) => (
            <View key={s} style={styles.step}>
              <View style={[styles.stepNum, { backgroundColor: `${group.color}22` }]}>
                <Text style={[styles.stepNumText, { color: group.color }]}>{i + 1}</Text>
              </View>
              <Text style={styles.stepText}>{s}</Text>
            </View>
          ))}
        </Card>

        <SectionTitle>Частые ошибки</SectionTitle>
        <Card style={styles.list}>
          {exercise.mistakes.map((m) => (
            <View key={m} style={styles.step}>
              <Icon name="close" size={18} color={colors.move} strokeWidth={2.6} />
              <Text style={styles.stepText}>{m}</Text>
            </View>
          ))}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.md + 4, paddingVertical: spacing.sm },
  content: { paddingBottom: spacing.xl * 2 },
  name: { ...type.hero, color: colors.text, paddingHorizontal: spacing.md + 4 },
  meta: { color: colors.textMuted, fontSize: 15, marginTop: 4, paddingHorizontal: spacing.md + 4 },
  sceneBox: { marginTop: spacing.sm },
  scene: { height: 360 },
  legend: { position: 'absolute', left: spacing.md + 4, bottom: spacing.sm, gap: 4 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 9, height: 9, borderRadius: 5 },
  legendText: { color: colors.textMuted, fontSize: 12, fontWeight: '600' },
  muscles: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, paddingHorizontal: spacing.md + 4, marginTop: spacing.sm },
  setsCard: { marginHorizontal: spacing.md, gap: spacing.md, alignItems: 'stretch' },
  dots: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'center' },
  setDot: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  setNum: { color: colors.textMuted, fontWeight: '800' },
  row: { flexDirection: 'row', gap: spacing.sm },
  hint: { color: colors.textMuted, fontSize: 13, textAlign: 'center' },
  wide: { alignSelf: 'stretch' },
  bigLabel: { ...type.label, color: colors.textMuted, textAlign: 'center' },
  big: { color: colors.text, fontSize: 56, fontWeight: '800', textAlign: 'center', ...type.number },
  bigUnit: { fontSize: 20, color: colors.textMuted },
  restTrack: { height: 8, borderRadius: 4, backgroundColor: colors.surfaceRaised, overflow: 'hidden' },
  restFill: { height: '100%', backgroundColor: colors.steps, borderRadius: 4 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  finish: { color: colors.move, fontWeight: '700', fontSize: 14 },
  result: { alignItems: 'center', gap: spacing.md },
  resultIcon: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  resultTitle: { ...type.title, color: colors.text },
  list: { marginHorizontal: spacing.md, gap: spacing.md },
  step: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  stepNum: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  stepNumText: { fontWeight: '800', fontSize: 13 },
  stepText: { color: colors.text, fontSize: 15, lineHeight: 21, flex: 1 },
});
