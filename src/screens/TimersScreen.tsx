import { useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { formatClock, INTERVAL_REST_MET, INTERVAL_WORK_MET, kcalFor, paces } from '../calories';
import { KeepAwake } from '../components/KeepAwake';
import { Button, Card, Chip, RoundButton, ScreenTitle, Segmented, Stat, Stepper } from '../components/ui';
import { haptic } from '../haptics';
import { useStopwatch } from '../hooks/useStopwatch';
import { useStore } from '../store';
import { colors, spacing, type } from '../theme';
import { Scene3D } from '../three/Scene3D';
import { TimerRing } from '../three/TimerRing';

function SavedNote({ text }: { text: string | null }) {
  if (!text) return null;
  return <Text style={styles.saved}>{text}</Text>;
}

function RunTimer() {
  const { weightKg, addEntry } = useStore();
  const sw = useStopwatch(100);
  const [paceIdx, setPaceIdx] = useState(2);
  const [laps, setLaps] = useState<number[]>([]);
  const [saved, setSaved] = useState<string | null>(null);
  const pace = paces[paceIdx];

  const minutes = sw.elapsed / 60000;
  const km = (pace.kmh * minutes) / 60;
  const kcal = kcalFor(pace.met, weightKg, minutes);
  const minPerKm = 60 / pace.kmh;

  const lap = () => {
    setLaps((l) => [sw.elapsed, ...l]);
    haptic.tap();
  };

  const reset = () => {
    sw.reset();
    setLaps([]);
  };

  const save = () => {
    addEntry({ title: `${pace.label}`, kind: 'run', minutes: Math.round(minutes * 10) / 10, kcal, details: `${km.toFixed(2)} км · ${formatClock(sw.elapsed)}` });
    setSaved(`Сохранено: ≈ ${kcal} ккал`);
    haptic.success();
    reset();
  };

  return (
    <View style={styles.pane}>
      {sw.running && <KeepAwake />}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {paces.map((p, i) => (
          <Chip key={p.kmh} label={`${p.label} · ${p.kmh} км/ч`} active={i === paceIdx} color={colors.steps} onPress={() => setPaceIdx(i)} />
        ))}
      </ScrollView>

      <Card style={styles.clockCard} glow={colors.steps}>
        <Text style={styles.clockLabel}>{sw.running ? 'Бег' : sw.elapsed > 0 ? 'Пауза' : 'Готов к старту'}</Text>
        <Text style={styles.clock}>{formatClock(sw.elapsed, true)}</Text>
        <View style={styles.row}>
          <Stat label="км" value={km.toFixed(2)} color={colors.steps} />
          <Stat label="мин/км" value={`${Math.floor(minPerKm)}:${String(Math.round((minPerKm % 1) * 60)).padStart(2, '0')}`} />
          <Stat icon="flame" label="ккал" value={String(kcal)} color={colors.move} />
        </View>
      </Card>

      <View style={styles.controls}>
        <RoundButton icon="reset" label="Сбросить" onPress={reset} />
        <RoundButton
          icon={sw.running ? 'pause' : 'play'}
          label={sw.running ? 'Пауза' : 'Старт'}
          size={84}
          color={sw.running ? colors.surfaceRaised : colors.steps}
          iconColor={sw.running ? colors.text : colors.bg}
          onPress={sw.running ? sw.pause : sw.start}
        />
        <RoundButton icon="flag" label="Круг" onPress={lap} />
      </View>

      {!sw.running && sw.elapsed > 1000 && <Button label="Сохранить пробежку" icon="check" color={colors.steps} onPress={save} />}
      <SavedNote text={saved} />

      {laps.length > 0 && (
        <Card style={styles.laps}>
          {laps.map((t, i) => {
            const prev = laps[i + 1] ?? 0;
            return (
              <View key={t} style={styles.lapRow}>
                <Text style={styles.lapName}>Круг {laps.length - i}</Text>
                <Text style={styles.lapSplit}>+{formatClock(t - prev, true)}</Text>
                <Text style={styles.lapTotal}>{formatClock(t, true)}</Text>
              </View>
            );
          })}
        </Card>
      )}
      <Text style={styles.note}>Дистанция и калории рассчитываются по выбранному темпу, без GPS.</Text>
    </View>
  );
}

const presets = [
  { label: 'Tabata', work: 20, rest: 10, rounds: 8 },
  { label: 'HIIT 40/20', work: 40, rest: 20, rounds: 10 },
  { label: 'Кардио 60/30', work: 60, rest: 30, rounds: 8 },
];

const PREP = 5;

type Segment = { kind: 'prep' | 'work' | 'rest'; start: number; length: number; round: number };

function buildTimeline(work: number, rest: number, rounds: number): Segment[] {
  const segs: Segment[] = [{ kind: 'prep', start: 0, length: PREP, round: 0 }];
  let t = PREP;
  for (let r = 1; r <= rounds; r++) {
    segs.push({ kind: 'work', start: t, length: work, round: r });
    t += work;
    if (r < rounds) {
      segs.push({ kind: 'rest', start: t, length: rest, round: r });
      t += rest;
    }
  }
  return segs;
}

const phaseInfo = {
  prep: { label: 'Приготовьтесь', color: '#FFC845' },
  work: { label: 'Работа', color: colors.exercise },
  rest: { label: 'Отдых', color: colors.steps },
};

function IntervalTimer() {
  const { weightKg, addEntry } = useStore();
  const [work, setWork] = useState(20);
  const [rest, setRest] = useState(10);
  const [rounds, setRounds] = useState(8);
  const [saved, setSaved] = useState<string | null>(null);

  const timeline = buildTimeline(work, rest, rounds);
  const total = timeline[timeline.length - 1].start + timeline[timeline.length - 1].length;
  const segmentAt = (sec: number) => timeline.find((s) => sec < s.start + s.length) ?? timeline[timeline.length - 1];
  const lastSeg = useRef<string | null>(null);

  // Runs on every stopwatch tick: buzzes on phase changes and saves the session at the end.
  const onTick = (elapsed: number) => {
    const sec = elapsed / 1000;
    if (sec >= total) {
      const workMin = (work * rounds) / 60;
      const restMin = (rest * (rounds - 1)) / 60;
      const kcal = kcalFor(INTERVAL_WORK_MET, weightKg, workMin) + kcalFor(INTERVAL_REST_MET, weightKg, restMin);
      addEntry({ title: 'Интервальная тренировка', kind: 'interval', minutes: Math.round((workMin + restMin) * 10) / 10, kcal, details: `${rounds} × ${work}/${rest} с · ${formatClock(total * 1000)}` });
      setSaved(`Сохранено в журнал: ≈ ${kcal} ккал`);
      haptic.success();
      lastSeg.current = null;
      return true;
    }
    const seg = segmentAt(sec);
    const key = `${seg.kind}-${seg.round}`;
    if (lastSeg.current && lastSeg.current !== key) haptic.phase();
    lastSeg.current = key;
    return false;
  };

  const sw = useStopwatch(100, onTick);
  const sec = sw.elapsed / 1000;
  const finished = sec >= total;
  const seg = segmentAt(sec);
  const left = finished ? 0 : seg.start + seg.length - sec;
  const info = finished ? { label: 'Готово!', color: colors.exercise } : phaseInfo[seg.kind];
  const started = sw.elapsed > 0;

  const applyPreset = (p: (typeof presets)[number]) => {
    sw.reset();
    setWork(p.work);
    setRest(p.rest);
    setRounds(p.rounds);
  };

  const toggle = () => {
    if (finished) {
      sw.reset();
      setSaved(null);
      return;
    }
    if (sw.running) sw.pause();
    else {
      setSaved(null);
      sw.start();
    }
  };

  return (
    <View style={styles.pane}>
      {sw.running && <KeepAwake />}
      <View style={styles.ringBox}>
        <Scene3D style={styles.ring} cameraZ={6} autoRotate={0} tilt={0.25}>
          <TimerRing progress={finished ? 1 : started ? 1 - left / seg.length : 0} color={info.color} />
        </Scene3D>
        <View style={styles.ringCenter} pointerEvents="none">
          <Text style={[styles.phase, { color: info.color }]}>{info.label}</Text>
          <Text style={styles.countdown}>{formatClock(Math.ceil(left) * 1000)}</Text>
          <Text style={styles.round}>{seg.kind === 'prep' ? `${rounds} раундов` : `Раунд ${seg.round} / ${rounds}`}</Text>
        </View>
      </View>

      <View style={styles.controls}>
        <RoundButton icon="reset" label="Сбросить" onPress={() => sw.reset()} />
        <RoundButton icon={sw.running ? 'pause' : 'play'} label={sw.running ? 'Пауза' : 'Старт'} size={84} color={sw.running ? colors.surfaceRaised : info.color} iconColor={sw.running ? colors.text : colors.bg} onPress={toggle} />
        <View style={styles.totalBox}>
          <Text style={styles.totalLabel}>всего</Text>
          <Text style={styles.totalValue}>{formatClock(total * 1000)}</Text>
        </View>
      </View>
      <SavedNote text={saved} />

      {!started && (
        <>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            {presets.map((p) => (
              <Chip key={p.label} label={p.label} active={p.work === work && p.rest === rest && p.rounds === rounds} onPress={() => applyPreset(p)} />
            ))}
          </ScrollView>
          <Card style={styles.settings}>
            <Stepper label="Работа" value={work} onChange={setWork} step={5} min={5} max={300} suffix=" с" />
            <Stepper label="Отдых" value={rest} onChange={setRest} step={5} min={0} max={300} suffix=" с" />
            <Stepper label="Раунды" value={rounds} onChange={setRounds} min={1} max={30} />
          </Card>
        </>
      )}
    </View>
  );
}

export function TimersScreen() {
  const [mode, setMode] = useState<'run' | 'interval'>('run');
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <ScreenTitle kicker="Секундомер и интервалы" title="Таймеры" />
      <View style={{ height: spacing.md }} />
      <Segmented
        options={[
          { key: 'run', label: 'Бег' },
          { key: 'interval', label: 'Кардио-интервалы' },
        ]}
        value={mode}
        onChange={setMode}
      />
      {mode === 'run' ? <RunTimer /> : <IntervalTimer />}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: spacing.xl },
  pane: { gap: spacing.md, paddingTop: spacing.md, paddingHorizontal: spacing.md },
  chips: { gap: spacing.sm },
  clockCard: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.lg },
  clockLabel: { ...type.label, color: colors.textMuted },
  clock: { color: colors.text, fontSize: 60, fontWeight: '800', letterSpacing: -1, ...type.number },
  row: { flexDirection: 'row', alignSelf: 'stretch', marginTop: spacing.sm },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly' },
  saved: { color: colors.exercise, textAlign: 'center', fontWeight: '700' },
  laps: { gap: spacing.sm },
  lapRow: { flexDirection: 'row', alignItems: 'center' },
  lapName: { color: colors.text, fontWeight: '700', flex: 1 },
  lapSplit: { color: colors.steps, fontWeight: '700', width: 90, textAlign: 'right', ...type.number },
  lapTotal: { color: colors.textMuted, width: 90, textAlign: 'right', ...type.number },
  note: { color: colors.textDim, fontSize: 12, textAlign: 'center' },
  ringBox: { height: 320, justifyContent: 'center' },
  ring: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  ringCenter: { alignItems: 'center' },
  phase: { ...type.label, fontSize: 14 },
  countdown: { color: colors.text, fontSize: 64, fontWeight: '800', ...type.number },
  round: { color: colors.textMuted, fontWeight: '600' },
  totalBox: { width: 64, alignItems: 'center' },
  totalLabel: { color: colors.textMuted, fontSize: 11 },
  totalValue: { color: colors.text, fontWeight: '800', ...type.number },
  settings: { flexDirection: 'row' },
});
