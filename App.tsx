import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Icon, IconName } from './src/components/Icon';
import { Exercise } from './src/data/exercises';
import { haptic } from './src/haptics';
import { ExerciseScreen } from './src/screens/ExerciseScreen';
import { LibraryScreen } from './src/screens/LibraryScreen';
import { ProgressScreen } from './src/screens/ProgressScreen';
import { TimersScreen } from './src/screens/TimersScreen';
import { TodayScreen } from './src/screens/TodayScreen';
import { StoreProvider } from './src/store';
import { colors, radius, spacing } from './src/theme';

const tabs: { key: string; label: string; icon: IconName }[] = [
  { key: 'today', label: 'Сегодня', icon: 'rings' },
  { key: 'library', label: 'Упражнения', icon: 'dumbbell' },
  { key: 'timers', label: 'Таймеры', icon: 'timer' },
  { key: 'progress', label: 'Прогресс', icon: 'chart' },
];

export default function App() {
  const [tab, setTab] = useState('today');
  const [exercise, setExercise] = useState<Exercise | null>(null);

  return (
    <SafeAreaProvider>
      <StoreProvider>
        <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
          <StatusBar style="light" />
          <View style={styles.screen}>
            {tab === 'today' && <TodayScreen />}
            {tab === 'library' && <LibraryScreen onOpen={setExercise} />}
            {tab === 'timers' && <TimersScreen />}
            {tab === 'progress' && <ProgressScreen />}
          </View>
          <View style={styles.tabBar}>
            {tabs.map((t) => {
              const active = t.key === tab;
              return (
                <Pressable
                  key={t.key}
                  style={styles.tab}
                  onPress={() => {
                    haptic.tap();
                    setTab(t.key);
                  }}
                >
                  <View style={[styles.tabIcon, active && styles.tabIconActive]}>
                    <Icon name={t.icon} size={21} color={active ? colors.bg : colors.textMuted} strokeWidth={2.2} />
                  </View>
                  <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{t.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </SafeAreaView>

        <Modal visible={!!exercise} animationType="slide" presentationStyle="fullScreen" onRequestClose={() => setExercise(null)}>
          <SafeAreaProvider>{exercise && <ExerciseScreen exercise={exercise} onClose={() => setExercise(null)} />}</SafeAreaProvider>
        </Modal>
      </StoreProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  screen: { flex: 1 },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: radius.lg,
    paddingVertical: spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  tab: { flex: 1, alignItems: 'center', gap: 3 },
  tabIcon: { width: 44, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  tabIconActive: { backgroundColor: colors.exercise },
  tabLabel: { color: colors.textMuted, fontSize: 11, fontWeight: '600' },
  tabLabelActive: { color: colors.text },
});
