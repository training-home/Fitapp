import { useFrame } from '@react-three/fiber/native';
import { useMemo, useRef } from 'react';
import { Group, MeshStandardMaterial } from 'three';
import { Muscle } from '../data/exercises';
import { colors } from '../theme';
import { Animation, BAR_Y, blend, FOOT, GROUND, JointKey, SEAT_TOP, SHIN, THIGH } from './poses';

type Materials = Record<'base' | 'primary' | 'secondary' | 'dark' | 'metal' | 'prop', MeshStandardMaterial>;

function useMaterials(): Materials {
  return useMemo(
    () => ({
      base: new MeshStandardMaterial({ color: colors.body, roughness: 0.55, metalness: 0.05 }),
      primary: new MeshStandardMaterial({ color: colors.muscle, emissive: colors.muscle, emissiveIntensity: 0.35, roughness: 0.45 }),
      secondary: new MeshStandardMaterial({ color: colors.muscleSecondary, emissive: colors.muscleSecondary, emissiveIntensity: 0.15, roughness: 0.5 }),
      dark: new MeshStandardMaterial({ color: '#2B2F45', roughness: 0.7 }),
      metal: new MeshStandardMaterial({ color: '#1C1F2E', metalness: 0.7, roughness: 0.3 }),
      prop: new MeshStandardMaterial({ color: '#3A3F5C', roughness: 0.6 }),
    }),
    [],
  );
}

type Highlight = (m: Muscle) => MeshStandardMaterial;

// A muscle drawn as a scaled sphere, colored by its role in the exercise.
function M({ muscle, hl, position, radius, scale }: { muscle: Muscle; hl: Highlight; position: [number, number, number]; radius: number; scale: [number, number, number] }) {
  return (
    <mesh position={position} scale={scale} material={hl(muscle)}>
      <sphereGeometry args={[radius, 24, 16]} />
    </mesh>
  );
}

function Limb({ length, radius, mat }: { length: number; radius: number; mat: MeshStandardMaterial }) {
  return (
    <mesh position={[0, -length / 2, 0]} material={mat}>
      <capsuleGeometry args={[radius, length - radius * 2, 8, 16]} />
    </mesh>
  );
}

function Dumbbell({ mats }: { mats: Materials }) {
  return (
    <group position={[0, -0.64, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <mesh material={mats.metal}>
        <cylinderGeometry args={[0.03, 0.03, 0.42, 12]} />
      </mesh>
      {[-0.17, 0.17].map((y) => (
        <mesh key={y} position={[0, y, 0]} material={mats.dark}>
          <cylinderGeometry args={[0.1, 0.1, 0.1, 20]} />
        </mesh>
      ))}
    </group>
  );
}

function Arm({ side, refs, hl, mats, dumbbell }: { side: 1 | -1; refs: Refs; hl: Highlight; mats: Materials; dumbbell: boolean }) {
  const s = side === 1 ? 'L' : 'R';
  return (
    <group ref={refs[`s${s}` as JointKey]} position={[0.4 * side, 0.92, 0]}>
      <M muscle="shoulders" hl={hl} position={[0.03 * side, -0.04, 0]} radius={0.13} scale={[1, 1.15, 1.05]} />
      <Limb length={0.62} radius={0.08} mat={mats.base} />
      <M muscle="biceps" hl={hl} position={[0, -0.32, 0.05]} radius={0.075} scale={[1, 2.3, 1]} />
      <M muscle="triceps" hl={hl} position={[0, -0.28, -0.05]} radius={0.075} scale={[1, 2.4, 1]} />
      <group ref={refs[`e${s}` as JointKey]} position={[0, -0.62, 0]}>
        <Limb length={0.58} radius={0.065} mat={mats.base} />
        <M muscle="forearms" hl={hl} position={[0, -0.17, 0.02]} radius={0.07} scale={[1, 2.1, 1]} />
        <mesh position={[0, -0.62, 0]} material={mats.base}>
          <sphereGeometry args={[0.075, 16, 12]} />
        </mesh>
        {dumbbell && <Dumbbell mats={mats} />}
      </group>
    </group>
  );
}

function Leg({ side, refs, feet, hl, mats }: { side: 1 | -1; refs: Refs; feet: React.RefObject<Group | null>[]; hl: Highlight; mats: Materials }) {
  const s = side === 1 ? 'L' : 'R';
  return (
    <group ref={refs[`h${s}` as JointKey]} position={[0.16 * side, -0.05, 0]}>
      <Limb length={THIGH} radius={0.1} mat={mats.base} />
      <M muscle="quads" hl={hl} position={[0, -0.38, 0.05]} radius={0.1} scale={[1.05, 2.7, 1]} />
      <M muscle="hamstrings" hl={hl} position={[0, -0.42, -0.05]} radius={0.095} scale={[1, 2.6, 1]} />
      <group ref={refs[`k${s}` as JointKey]} position={[0, -THIGH, 0]}>
        <Limb length={SHIN} radius={0.075} mat={mats.base} />
        <M muscle="calves" hl={hl} position={[0, -0.26, -0.045]} radius={0.075} scale={[1, 2.3, 1]} />
        <group ref={feet[side === 1 ? 0 : 1]} position={[0, -SHIN, 0.1]}>
          <mesh position={[0, -FOOT / 2, 0]} material={mats.base}>
            <boxGeometry args={[0.13, FOOT, 0.3]} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

type Refs = Record<JointKey, React.RefObject<Group | null>>;

function Props({ list, mats }: { list: Animation['props']; mats: Materials }) {
  if (!list) return null;
  return (
    <>
      {list.includes('seat') && (
        <group>
          <mesh position={[0, (GROUND + SEAT_TOP) / 2, 0.15]} material={mats.prop}>
            <boxGeometry args={[0.6, SEAT_TOP - GROUND, 0.7]} />
          </mesh>
          <mesh position={[0, SEAT_TOP + 0.65, -0.32]} rotation={[-0.08, 0, 0]} material={mats.prop}>
            <boxGeometry args={[0.6, 1.3, 0.1]} />
          </mesh>
        </group>
      )}
      {list.includes('bench') && (
        <group>
          <mesh position={[0, -1.12, -0.6]} material={mats.prop}>
            <boxGeometry args={[0.55, 0.14, 1.9]} />
          </mesh>
          {[-1.3, 0.1].map((z) => (
            <mesh key={z} position={[0, (GROUND - 1.12) / 2, z]} material={mats.metal}>
              <boxGeometry args={[0.4, -1.12 - GROUND, 0.08]} />
            </mesh>
          ))}
        </group>
      )}
      {list.includes('bar') && (
        <group>
          <mesh position={[0, BAR_Y, 0]} rotation={[0, 0, Math.PI / 2]} material={mats.metal}>
            <cylinderGeometry args={[0.04, 0.04, 2.6, 16]} />
          </mesh>
          {[-1.3, 1.3].map((x) => (
            <mesh key={x} position={[x, (BAR_Y + GROUND) / 2, 0]} material={mats.prop}>
              <boxGeometry args={[0.08, BAR_Y - GROUND, 0.08]} />
            </mesh>
          ))}
        </group>
      )}
      {list.includes('mat') && (
        <mesh position={[0, GROUND + 0.01, 0]} material={mats.prop}>
          <boxGeometry args={[1.2, 0.02, 3.6]} />
        </mesh>
      )}
    </>
  );
}

export function Mannequin({ animation, primary, secondary }: { animation: Animation; primary: Muscle[]; secondary: Muscle[] }) {
  const mats = useMaterials();
  const root = useRef<Group>(null);
  const spine = useRef<Group>(null);
  const refs: Refs = {
    sL: useRef<Group>(null),
    sR: useRef<Group>(null),
    eL: useRef<Group>(null),
    eR: useRef<Group>(null),
    hL: useRef<Group>(null),
    hR: useRef<Group>(null),
    kL: useRef<Group>(null),
    kR: useRef<Group>(null),
  };
  const feet = [useRef<Group>(null), useRef<Group>(null)];

  const hl: Highlight = (m) => (primary.includes(m) ? mats.primary : secondary.includes(m) ? mats.secondary : mats.base);

  useFrame(({ clock }) => {
    // Cosine easing gives a natural slow-fast-slow rep tempo.
    const t = (1 - Math.cos((clock.elapsedTime / animation.period) * Math.PI * 2)) / 2;
    const pose = blend(animation, t);
    if (!root.current || !spine.current) return;
    root.current.position.y = pose.rootY;
    root.current.rotation.x = pose.rootRx;
    spine.current.rotation.x = pose.spine;
    for (const key of Object.keys(refs) as JointKey[]) {
      const [x, y, z] = pose.joints[key];
      refs[key].current?.rotation.set(x, y, z);
    }
    for (const foot of feet) foot.current?.rotation.set(pose.toe, 0, 0);
  });

  // Floor and bench exercises sit low, so raise them toward the middle of the frame.
  const lift = animation.a.rootRx ? 0.9 : 0.15;

  return (
    <group position={[0, lift, 0]}>
      <mesh position={[0, GROUND, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.9, 48]} />
        <meshStandardMaterial color="#1A1D30" />
      </mesh>
      <Props list={animation.props} mats={mats} />
      <group ref={root}>
        <mesh material={mats.base} scale={[1.25, 0.8, 0.85]}>
          <sphereGeometry args={[0.22, 24, 16]} />
        </mesh>
        <M muscle="glutes" hl={hl} position={[0.1, -0.06, -0.12]} radius={0.13} scale={[1, 1, 0.8]} />
        <M muscle="glutes" hl={hl} position={[-0.1, -0.06, -0.12]} radius={0.13} scale={[1, 1, 0.8]} />
        <group ref={spine} position={[0, 0.1, 0]}>
          <mesh position={[0, 0.5, 0]} material={mats.base} scale={[1.3, 1, 0.8]}>
            <capsuleGeometry args={[0.22, 0.55, 8, 20]} />
          </mesh>
          <M muscle="chest" hl={hl} position={[0.13, 0.74, 0.15]} radius={0.14} scale={[1.15, 0.75, 0.55]} />
          <M muscle="chest" hl={hl} position={[-0.13, 0.74, 0.15]} radius={0.14} scale={[1.15, 0.75, 0.55]} />
          <M muscle="abs" hl={hl} position={[0, 0.36, 0.15]} radius={0.15} scale={[0.95, 1.7, 0.45]} />
          <M muscle="back" hl={hl} position={[0.14, 0.58, -0.14]} radius={0.16} scale={[0.95, 1.6, 0.45]} />
          <M muscle="back" hl={hl} position={[-0.14, 0.58, -0.14]} radius={0.16} scale={[0.95, 1.6, 0.45]} />
          <M muscle="back" hl={hl} position={[0, 0.9, -0.1]} radius={0.14} scale={[1.7, 0.7, 0.5]} />
          <mesh position={[0, 1.1, 0]} material={mats.base}>
            <cylinderGeometry args={[0.07, 0.08, 0.16, 12]} />
          </mesh>
          <mesh position={[0, 1.32, 0.01]} material={mats.base} scale={[0.9, 1.05, 0.95]}>
            <sphereGeometry args={[0.2, 24, 20]} />
          </mesh>
          <Arm side={1} refs={refs} hl={hl} mats={mats} dumbbell={!!animation.dumbbells} />
          <Arm side={-1} refs={refs} hl={hl} mats={mats} dumbbell={!!animation.dumbbells} />
        </group>
        <Leg side={1} refs={refs} feet={feet} hl={hl} mats={mats} />
        <Leg side={-1} refs={refs} feet={feet} hl={hl} mats={mats} />
      </group>
    </group>
  );
}
