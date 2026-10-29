import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

const enabled = Platform.OS !== 'web';

export const haptic = {
  tap: () => enabled && Haptics.selectionAsync(),
  success: () => enabled && Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  phase: () => enabled && Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),
};
