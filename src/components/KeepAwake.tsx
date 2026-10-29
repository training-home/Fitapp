import { useKeepAwake } from 'expo-keep-awake';

// Keeps the screen on while mounted, e.g. during a running timer.
export function KeepAwake() {
  useKeepAwake(undefined, { suppressDeactivateWarnings: true });
  return null;
}
