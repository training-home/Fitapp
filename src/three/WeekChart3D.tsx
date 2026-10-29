import { useFrame } from '@react-three/fiber/native';
import { useRef } from 'react';
import { Mesh } from 'three';
import { DayStat } from '../data';
import { colors } from '../theme';

const MAX_HEIGHT = 2.6;

function Bar({ x, height, delay, highlight }: { x: number; height: number; delay: number; highlight: boolean }) {
  const mesh = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    if (!mesh.current) return;
    const t = Math.min(Math.max((clock.elapsedTime - delay) * 1.8, 0), 1);
    const eased = 1 - Math.pow(1 - t, 3);
    const h = Math.max(height * eased, 0.001);
    mesh.current.scale.y = h;
    mesh.current.position.y = h / 2 - 1.2;
  });
  const color = highlight ? colors.exercise : colors.accent;
  return (
    <mesh ref={mesh} position={[x, -1.2, 0]}>
      <boxGeometry args={[0.42, 1, 0.42]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={highlight ? 0.5 : 0.2} metalness={0.3} roughness={0.35} />
    </mesh>
  );
}

export function WeekChart3D({ days, selected }: { days: DayStat[]; selected: number }) {
  const max = Math.max(...days.map((d) => d.kcal));
  return (
    <group rotation={[0.3, -0.4, 0]}>
      <mesh position={[0, -1.25, 0]}>
        <boxGeometry args={[days.length * 0.6 + 0.4, 0.06, 1.1]} />
        <meshStandardMaterial color={colors.surfaceRaised} />
      </mesh>
      {days.map((d, i) => (
        <Bar
          key={d.day}
          x={(i - (days.length - 1) / 2) * 0.6}
          height={(d.kcal / max) * MAX_HEIGHT}
          delay={i * 0.08}
          highlight={i === selected}
        />
      ))}
    </group>
  );
}
