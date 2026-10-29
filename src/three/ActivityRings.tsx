import { useFrame } from '@react-three/fiber/native';
import { useRef } from 'react';
import { Mesh, TorusGeometry } from 'three';
import { Goal } from '../data';

const TUBE = 0.16;

// Progress arc that grows from 0 to its goal fraction when mounted.
function Ring({ radius, goal, depth }: { radius: number; goal: Goal; depth: number }) {
  const arc = useRef<Mesh>(null);
  const cap = useRef<Mesh>(null);
  const shown = useRef(0);
  const target = Math.min(goal.value / goal.target, 1);

  useFrame((_, delta) => {
    const next = shown.current + (target - shown.current) * Math.min(delta * 3, 1);
    if (!arc.current || !cap.current || Math.abs(next - shown.current) < 0.0005) return;
    shown.current = next;
    const angle = Math.max(next, 0.001) * Math.PI * 2;
    arc.current.geometry.dispose();
    arc.current.geometry = new TorusGeometry(radius, TUBE, 16, 96, angle);
    cap.current.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 0);
  });

  return (
    // Start at 12 o'clock and run clockwise, like a watch face.
    <group position={[0, 0, depth]} rotation={[0, Math.PI, Math.PI / 2]}>
      <mesh>
        <torusGeometry args={[radius, TUBE * 0.9, 12, 96]} />
        <meshStandardMaterial color={goal.color} transparent opacity={0.15} />
      </mesh>
      <mesh ref={arc}>
        <torusGeometry args={[radius, TUBE, 16, 96, 0.001]} />
        <meshStandardMaterial color={goal.color} emissive={goal.color} emissiveIntensity={0.6} roughness={0.3} metalness={0.4} />
      </mesh>
      <mesh ref={cap} position={[radius, 0, 0]}>
        <sphereGeometry args={[TUBE * 1.15, 16, 16]} />
        <meshStandardMaterial color="#ffffff" emissive={goal.color} emissiveIntensity={1} />
      </mesh>
    </group>
  );
}

function Core() {
  const mesh = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    if (!mesh.current) return;
    const s = 1 + Math.sin(clock.elapsedTime * 2) * 0.06;
    mesh.current.scale.setScalar(s);
    mesh.current.rotation.y = clock.elapsedTime * 0.6;
  });
  return (
    <mesh ref={mesh}>
      <icosahedronGeometry args={[0.55, 1]} />
      <meshStandardMaterial color="#7C5CFF" emissive="#7C5CFF" emissiveIntensity={0.5} flatShading metalness={0.6} roughness={0.25} />
    </mesh>
  );
}

export function ActivityRings({ goals }: { goals: Goal[] }) {
  return (
    <group rotation={[0.35, 0, 0]}>
      <Core />
      {goals.map((goal, i) => (
        <Ring key={goal.key} goal={goal} radius={2 - i * 0.45} depth={(i - 1) * 0.25} />
      ))}
    </group>
  );
}
