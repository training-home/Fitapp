import { LinearGradient } from 'expo-linear-gradient';
import { ReactNode, useState } from 'react';
import { Animated, Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, radius, spacing, type } from '../theme';
import { Icon, IconName } from './Icon';

export function Card({ children, style, glow }: { children: ReactNode; style?: StyleProp<ViewStyle>; glow?: string }) {
  return (
    <View style={[styles.card, style]}>
      {glow && (
        <LinearGradient
          colors={[`${glow}26`, `${glow}00`]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
      )}
      {children}
    </View>
  );
}

// Pressable that shrinks slightly while held, for a soft tactile feel.
export function Tap({ onPress, style, children, disabled, label }: { onPress?: () => void; style?: StyleProp<ViewStyle>; children: ReactNode; disabled?: boolean; label?: string }) {
  const [scale] = useState(() => new Animated.Value(1));
  const to = (v: number) => Animated.spring(scale, { toValue: v, useNativeDriver: true, speed: 40, bounciness: 6 }).start();
  return (
    <Pressable onPress={onPress} onPressIn={() => to(0.96)} onPressOut={() => to(1)} disabled={disabled} accessibilityRole="button" accessibilityLabel={label}>
      <Animated.View style={[style, { transform: [{ scale }] }, disabled && { opacity: 0.4 }]}>{children}</Animated.View>
    </Pressable>
  );
}

export function Button({
  label,
  icon,
  onPress,
  variant = 'primary',
  color = colors.exercise,
  style,
  disabled,
}: {
  label: string;
  icon?: IconName;
  onPress?: () => void;
  variant?: 'primary' | 'secondary';
  color?: string;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}) {
  const primary = variant === 'primary';
  const fg = primary ? colors.bg : colors.text;
  return (
    <Tap onPress={onPress} disabled={disabled} style={[styles.button, primary ? { backgroundColor: color } : styles.buttonSecondary, style]}>
      {icon && <Icon name={icon} size={18} color={fg} strokeWidth={2.4} />}
      <Text style={[styles.buttonText, { color: fg }]}>{label}</Text>
    </Tap>
  );
}

export function RoundButton({ icon, label, onPress, color = colors.surfaceRaised, iconColor = colors.text, size = 64 }: { icon: IconName; label: string; onPress?: () => void; color?: string; iconColor?: string; size?: number }) {
  return (
    <Tap onPress={onPress} label={label} style={[styles.round, { width: size, height: size, borderRadius: size / 2, backgroundColor: color }]}>
      <Icon name={icon} size={size * 0.38} color={iconColor} strokeWidth={2.4} />
    </Tap>
  );
}

export function ScreenTitle({ kicker, title, right }: { kicker: string; title: string; right?: ReactNode }) {
  return (
    <View style={styles.titleRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.kicker}>{kicker}</Text>
        <Text style={styles.title}>{title}</Text>
      </View>
      {right}
    </View>
  );
}

export function SectionTitle({ children }: { children: string }) {
  return <Text style={styles.section}>{children}</Text>;
}

export function Stat({ label, value, color, icon }: { label: string; value: string; color?: string; icon?: IconName }) {
  return (
    <View style={styles.stat}>
      <View style={styles.statTop}>
        {icon && <Icon name={icon} size={15} color={color ?? colors.textMuted} />}
        <Text style={[styles.statValue, color ? { color } : null]}>{value}</Text>
      </View>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export function Chip({ label, active, color = colors.exercise, onPress }: { label: string; active?: boolean; color?: string; onPress?: () => void }) {
  return (
    <Tap onPress={onPress} style={[styles.chip, active && { backgroundColor: color, borderColor: color }]}>
      <Text style={[styles.chipText, active && { color: colors.bg }]}>{label}</Text>
    </Tap>
  );
}

export function Pill({ label, color }: { label: string; color: string }) {
  return (
    <View style={[styles.pill, { backgroundColor: `${color}22` }]}>
      <View style={[styles.pillDot, { backgroundColor: color }]} />
      <Text style={[styles.pillText, { color }]}>{label}</Text>
    </View>
  );
}

export function Stepper({ label, value, onChange, step = 1, min = 0, max = 999, suffix = '' }: { label: string; value: number; onChange: (v: number) => void; step?: number; min?: number; max?: number; suffix?: string }) {
  return (
    <View style={styles.stepper}>
      <Text style={styles.stepperLabel}>{label}</Text>
      <View style={styles.stepperRow}>
        <RoundButton icon="minus" label={`${label}: меньше`} size={34} onPress={() => onChange(Math.max(min, value - step))} />
        <Text style={styles.stepperValue}>
          {value}
          {suffix}
        </Text>
        <RoundButton icon="plus" label={`${label}: больше`} size={34} onPress={() => onChange(Math.min(max, value + step))} />
      </View>
    </View>
  );
}

export function Segmented<T extends string>({ options, value, onChange }: { options: { key: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <View style={styles.segmented}>
      {options.map((o) => (
        <Pressable key={o.key} onPress={() => onChange(o.key)} style={[styles.segment, o.key === value && styles.segmentActive]}>
          <Text style={[styles.segmentText, o.key === value && styles.segmentTextActive]}>{o.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: spacing.md + 2,
    overflow: 'hidden',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    height: 54,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
  },
  buttonSecondary: { backgroundColor: colors.surfaceRaised },
  buttonText: { fontSize: 16, fontWeight: '800' },
  round: { alignItems: 'center', justifyContent: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: spacing.md + 4, paddingTop: spacing.md },
  kicker: { ...type.label, color: colors.textMuted },
  title: { ...type.hero, color: colors.text, marginTop: 2 },
  section: { ...type.label, color: colors.textMuted, marginTop: spacing.lg, marginBottom: spacing.sm, paddingHorizontal: spacing.md + 4 },
  stat: { flex: 1, alignItems: 'center' },
  statTop: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  statValue: { color: colors.text, fontSize: 20, fontWeight: '800', ...type.number },
  statLabel: { color: colors.textMuted, fontSize: 12, marginTop: 3 },
  chip: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipText: { color: colors.text, fontWeight: '700', fontSize: 14 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 5, paddingHorizontal: 10, borderRadius: radius.pill },
  pillDot: { width: 7, height: 7, borderRadius: 4 },
  pillText: { fontSize: 13, fontWeight: '700' },
  stepper: { flex: 1, alignItems: 'center', gap: spacing.sm },
  stepperLabel: { color: colors.textMuted, fontSize: 12, fontWeight: '600' },
  stepperRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  stepperValue: { color: colors.text, fontSize: 18, fontWeight: '800', minWidth: 44, textAlign: 'center', ...type.number },
  segmented: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: radius.pill, padding: 4, marginHorizontal: spacing.md },
  segment: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: radius.pill },
  segmentActive: { backgroundColor: colors.surfaceRaised },
  segmentText: { color: colors.textMuted, fontWeight: '700' },
  segmentTextActive: { color: colors.text },
});
