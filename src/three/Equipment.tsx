import { useFrame } from '@react-three/fiber/native';
import { useMemo, useRef } from 'react';
import { CatmullRomCurve3, Group, Vector3 } from 'three';
import { EquipmentKind } from '../data';

type Props = { color: string };

const metal = { color: '#C9CCDA', metalness: 0.9, roughness: 0.25 };

function Dumbbell({ color }: Props) {
  const plates = [-1.15, -0.85, 0.85, 1.15];
  return (
    <group rotation={[0, 0, 0.35]}>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.09, 0.09, 2.9, 24]} />
        <meshStandardMaterial {...metal} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.13, 0.13, 1.2, 24]} />
        <meshStandardMaterial color="#2A2F4A" roughness={0.9} />
      </mesh>
      {plates.map((x) => (
        <mesh key={x} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[Math.abs(x) > 1 ? 0.5 : 0.65, Math.abs(x) > 1 ? 0.5 : 0.65, 0.22, 6]} />
          <meshStandardMaterial color={color} metalness={0.3} roughness={0.4} flatShading />
        </mesh>
      ))}
    </group>
  );
}

function Kettlebell({ color }: Props) {
  return (
    <group position={[0, -0.3, 0]}>
      <mesh>
        <sphereGeometry args={[0.95, 32, 32]} />
        <meshStandardMaterial color={color} metalness={0.4} roughness={0.35} />
      </mesh>
      <mesh position={[0, -0.85, 0]}>
        <cylinderGeometry args={[0.55, 0.55, 0.15, 32]} />
        <meshStandardMaterial color={color} metalness={0.4} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.95, 0]}>
        <torusGeometry args={[0.55, 0.12, 16, 48, Math.PI]} />
        <meshStandardMaterial {...metal} />
      </mesh>
      {[-0.55, 0.55].map((x) => (
        <mesh key={x} position={[x, 0.75, 0]}>
          <cylinderGeometry args={[0.12, 0.14, 0.4, 16]} />
          <meshStandardMaterial {...metal} />
        </mesh>
      ))}
    </group>
  );
}

function Rope({ color }: Props) {
  const curve = useMemo(() => {
    const pts: Vector3[] = [];
    for (let i = 0; i <= 40; i++) {
      const t = i / 40;
      const a = t * Math.PI;
      pts.push(new Vector3(Math.cos(a) * 1.2, -Math.sin(a) * 1.5 + 0.6, Math.sin(a * 2) * 0.25));
    }
    return new CatmullRomCurve3(pts);
  }, []);
  return (
    <group rotation={[0, 0, Math.PI]}>
      <mesh>
        <tubeGeometry args={[curve, 80, 0.06, 10, false]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
      </mesh>
      {[1.2, -1.2].map((x) => (
        <mesh key={x} position={[x, 0.95, 0]}>
          <cylinderGeometry args={[0.13, 0.11, 0.7, 20]} />
          <meshStandardMaterial color="#2A2F4A" roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
}

function Mat({ color }: Props) {
  return (
    <group rotation={[0.9, 0, 0]}>
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[1.4, 2.2, 0.06]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      <mesh position={[0, -1.05, 0.25]} rotation={[0, Math.PI / 2, 0]}>
        <cylinderGeometry args={[0.32, 0.32, 1.4, 32]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
    </group>
  );
}

const models: Record<EquipmentKind, (p: Props) => React.JSX.Element> = {
  dumbbell: Dumbbell,
  kettlebell: Kettlebell,
  rope: Rope,
  mat: Mat,
};

export function Equipment({ kind, color }: { kind: EquipmentKind; color: string }) {
  const group = useRef<Group>(null);
  const Model = models[kind];

  useFrame(({ clock }) => {
    if (group.current) group.current.position.y = Math.sin(clock.elapsedTime * 1.6) * 0.12;
  });

  return (
    <group ref={group}>
      <Model color={color} />
    </group>
  );
}
