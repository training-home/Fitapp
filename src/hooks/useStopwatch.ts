import { useEffect, useEffectEvent, useState } from 'react';

// Drift-free stopwatch: elapsed time is derived from timestamps, the interval only refreshes `now`.
// `onTick` runs on every refresh with the current elapsed time; returning true stops the clock at that point.
export function useStopwatch(tickMs = 100, onTick?: (elapsed: number) => boolean | void) {
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [accumulated, setAccumulated] = useState(0);
  const [now, setNow] = useState(0);
  const running = startedAt !== null;

  const tick = useEffectEvent(() => {
    const t = Date.now();
    setNow(t);
    if (startedAt === null) return;
    const elapsed = accumulated + t - startedAt;
    if (onTick?.(elapsed) === true) {
      setAccumulated(elapsed);
      setStartedAt(null);
    }
  });

  useEffect(() => {
    if (!running) return;
    const id = setInterval(tick, tickMs);
    return () => clearInterval(id);
  }, [running, tickMs]);

  const elapsed = accumulated + (startedAt !== null ? Math.max(now - startedAt, 0) : 0);

  const start = () => {
    if (running) return;
    const t = Date.now();
    setStartedAt(t);
    setNow(t);
  };

  const pause = () => {
    if (startedAt === null) return;
    const t = Date.now();
    setAccumulated((a) => a + t - startedAt);
    setStartedAt(null);
    setNow(t);
  };

  const reset = () => {
    setAccumulated(0);
    setStartedAt(null);
  };

  return { elapsed, running, start, pause, reset };
}
