import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { ProgressScreen } from './src/screens/ProgressScreen';
import { TodayScreen } from './src/screens/TodayScreen';
import { WorkoutsScreen } from './src/screens/WorkoutsScreen';
import { colors, spacing } from './src/theme';

const tabs = [
  { key: 'today', label: 'Сегодня', icon: '◎', Screen: TodayScreen },
  { key: 'workouts', label: 'Тренировки', icon: '▲', Screen: WorkoutsScreen },
  { key: 'progress', label: 'Прогресс', icon: '▮', Screen: ProgressScreen },
] as const;

type TabKey = (typeof tabs)[number]['key'];

export default function App() {
  const [tab, setTab] = useState<TabKey>('today');
  const { Screen } = tabs.find((t) => t.key === tab)!;

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
        <StatusBar style="light" />
        <View style={styles.screen}>
          <Screen />
        </View>
        <View style={styles.tabBar}>
          {tabs.map((t) => {
            const active = t.key === tab;
            return (
              <Pressable key={t.key} style={styles.tab} onPress={() => setTab(t.key)}>
                <Text style={[styles.tabIcon, active && styles.active]}>{t.icon}</Text>
                <Text style={[styles.tabLabel, active && styles.active]}>{t.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  screen: { flex: 1 },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    paddingTop: spacing.sm,
  },
  tab: { flex: 1, alignItems: 'center', paddingVertical: spacing.xs },
  tabIcon: { color: colors.textMuted, fontSize: 18 },
  tabLabel: { color: colors.textMuted, fontSize: 12, marginTop: 2, fontWeight: '600' },
  active: { color: colors.exercise },
});
