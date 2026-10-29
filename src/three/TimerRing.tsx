import { useFrame } from '@react-three/fiber/native';
import { useRef, useState } from 'react';
import { Color, Mesh, MeshStandardMaterial, TorusGeometry } from 'three';

const RADIUS = 1.9;
const TUBE = 0.2;

// Single progress ring that eases toward `progress` (0–1) and blends to the current phase color.
export function TimerRing({ progress, color }: { progress: number; color: string }) {
  const arc = useRef<Mesh>(null);
  const cap = useRef<Mesh>(null);
  const shown = useRef(-1);
  const [target] = useState(() => new Color());

  useFrame((_, delta) => {
    if (!arc.current || !cap.current) return;
    const mat = arc.current.material as MeshStandardMaterial;
    target.set(color);
    mat.color.lerp(target, Math.min(delta * 6, 1));
    mat.emissive.copy(mat.color);
    (cap.current.material as MeshStandardMaterial).emissive.copy(mat.color);

    const goal = Math.min(Math.max(progress, 0), 1);
    const next = shown.current < 0 ? goal : shown.current + (goal - shown.current) * Math.min(delta * 10, 1);
    if (Math.abs(next - shown.current) < 0.0005) return;
    shown.current = next;
    const angle = Math.max(next, 0.001) * Math.PI * 2;
    arc.current.geometry.dispose();
    arc.current.geometry = new TorusGeometry(RADIUS, TUBE, 20, 128, angle);
    cap.current.position.set(Math.cos(angle) * RADIUS, Math.sin(angle) * RADIUS, 0);
  });

  return (
    <group rotation={[0, Math.PI, Math.PI / 2]}>
      <mesh>
        <torusGeometry args={[RADIUS, TUBE * 0.85, 16, 128]} />
        <meshStandardMaterial color="#272B44" />
      </mesh>
      <mesh ref={arc}>
        <torusGeometry args={[RADIUS, TUBE, 20, 128, 0.001]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} roughness={0.3} metalness={0.3} />
      </mesh>
      <mesh ref={cap} position={[RADIUS, 0, 0]}>
        <sphereGeometry args={[TUBE * 1.2, 20, 20]} />
        <meshStandardMaterial color="#ffffff" emissive={color} emissiveIntensity={0.9} />
      </mesh>
    </group>
  );
}
