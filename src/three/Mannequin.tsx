import { useFrame } from '@react-three/fiber/native';
import { useMemo, useRef } from 'react';
import { BufferGeometry, Group, LatheGeometry, Mesh, MeshStandardMaterial, Quaternion, Vector2, Vector3 } from 'three';
import { Muscle } from '../data/exercises';
import { colors } from '../theme';
import { Animation, BAR_Y, blend, GROUND, JointKey, Pose, SEAT_TOP, SHIN, THIGH } from './poses';

type MaterialKey = 'skin' | 'primary' | 'secondary' | 'shorts' | 'hair' | 'eye' | 'metal' | 'plate' | 'prop' | 'pad';
type Materials = Record<MaterialKey, MeshStandardMaterial>;

function useMaterials(): Materials {
  return useMemo(
    () => ({
      skin: new MeshStandardMaterial({ color: colors.body, roughness: 0.55, metalness: 0.02 }),
      primary: new MeshStandardMaterial({ color: colors.muscle, emissive: colors.muscle, emissiveIntensity: 0.3, roughness: 0.45 }),
      secondary: new MeshStandardMaterial({ color: colors.muscleSecondary, emissive: colors.muscleSecondary, emissiveIntensity: 0.12, roughness: 0.5 }),
      shorts: new MeshStandardMaterial({ color: '#23263A', roughness: 0.8 }),
      hair: new MeshStandardMaterial({ color: '#3A302B', roughness: 0.9 }),
      eye: new MeshStandardMaterial({ color: '#1B1D29', roughness: 0.3 }),
      metal: new MeshStandardMaterial({ color: '#9AA0B8', metalness: 0.8, roughness: 0.3 }),
      plate: new MeshStandardMaterial({ color: '#1C1F2E', metalness: 0.4, roughness: 0.45 }),
      prop: new MeshStandardMaterial({ color: '#3A3F5C', roughness: 0.6 }),
      pad: new MeshStandardMaterial({ color: '#191B29', roughness: 0.75 }),
    }),
    [],
  );
}

// Surface of revolution from [radius, y] pairs listed bottom to top.
function lathe(profile: [number, number][], segments = 28): BufferGeometry {
  return new LatheGeometry(
    profile.map(([r, y]) => new Vector2(r, y)),
    segments,
  );
}

function useGeometries() {
  return useMemo(
    () => ({
      torso: lathe([
        [0, -0.02],
        [0.15, 0],
        [0.165, 0.12],
        [0.16, 0.3],
        [0.18, 0.5],
        [0.215, 0.7],
        [0.23, 0.85],
        [0.2, 0.97],
        [0.12, 1.04],
        [0, 1.07],
      ]),
      pelvis: lathe([
        [0, -0.2],
        [0.13, -0.17],
        [0.19, -0.08],
        [0.19, 0.05],
        [0.155, 0.14],
        [0, 0.16],
      ]),
      upperArm: lathe([
        [0, -0.65],
        [0.055, -0.63],
        [0.06, -0.56],
        [0.075, -0.38],
        [0.082, -0.22],
        [0.085, -0.08],
        [0.07, 0.01],
        [0, 0.04],
      ]),
      forearm: lathe([
        [0, -0.6],
        [0.038, -0.585],
        [0.04, -0.5],
        [0.055, -0.3],
        [0.066, -0.13],
        [0.06, 0.0],
        [0, 0.04],
      ]),
      thigh: lathe([
        [0, -0.88],
        [0.072, -0.85],
        [0.078, -0.76],
        [0.098, -0.52],
        [0.118, -0.26],
        [0.128, -0.08],
        [0.11, 0.02],
        [0, 0.05],
      ]),
      shin: lathe([
        [0, -0.84],
        [0.042, -0.81],
        [0.046, -0.66],
        [0.066, -0.38],
        [0.078, -0.24],
        [0.064, -0.06],
        [0.062, 0.02],
        [0, 0.05],
      ]),
      shortsLeg: lathe([
        [0.124, -0.3],
        [0.132, -0.15],
        [0.138, 0.04],
      ]),
    }),
    [],
  );
}

type Highlight = (keys: Muscle[]) => MeshStandardMaterial;
type Vec = [number, number, number];

// One muscle belly, an ellipsoid that bulges out of the body and lights up when trained.
function M({ keys, hl, p, r, s, rot }: { keys: Muscle[]; hl: Highlight; p: Vec; r: number; s: Vec; rot?: Vec }) {
  return (
    <mesh position={p} scale={s} rotation={rot} material={hl(keys)}>
      <sphereGeometry args={[r, 24, 16]} />
    </mesh>
  );
}

function Dumbbell({ mats }: { mats: Materials }) {
  return (
    <group position={[0, -0.7, 0.01]} rotation={[Math.PI / 2, 0, 0]}>
      <mesh material={mats.metal}>
        <cylinderGeometry args={[0.022, 0.022, 0.4, 12]} />
      </mesh>
      {[-0.15, 0.15].map((y) => (
        <mesh key={y} position={[0, y, 0]} material={mats.plate}>
          <cylinderGeometry args={[0.095, 0.095, 0.09, 24]} />
        </mesh>
      ))}
    </group>
  );
}

type Refs = Record<JointKey, React.RefObject<Group | null>>;
type Geo = ReturnType<typeof useGeometries>;

function Hand({ side, mats, handRef }: { side: 1 | -1; mats: Materials; handRef: React.RefObject<Mesh | null> }) {
  return (
    <group position={[0, -0.6, 0]}>
      <mesh ref={handRef} position={[0, -0.07, 0]} scale={[0.55, 1, 1]} material={mats.skin}>
        <sphereGeometry args={[0.075, 16, 12]} />
      </mesh>
      <mesh position={[0, -0.14, 0.005]} scale={[0.5, 1, 0.9]} material={mats.skin}>
        <capsuleGeometry args={[0.04, 0.05, 6, 10]} />
      </mesh>
      <mesh position={[0, -0.07, 0.06]} rotation={[0.5, 0, -0.3 * side]} material={mats.skin}>
        <capsuleGeometry args={[0.018, 0.05, 6, 8]} />
      </mesh>
    </group>
  );
}

function Arm({ side, refs, hl, mats, geo, dumbbell, handRef }: { side: 1 | -1; refs: Refs; hl: Highlight; mats: Materials; geo: Geo; dumbbell: boolean; handRef: React.RefObject<Mesh | null> }) {
  const s = side === 1 ? 'L' : 'R';
  return (
    <group ref={refs[`s${s}` as JointKey]} position={[0.37 * side, 0.92, 0]}>
      <M keys={['shoulders']} hl={hl} p={[0.025 * side, -0.06, 0]} r={0.115} s={[1, 1.3, 1.1]} />
      <mesh geometry={geo.upperArm} material={mats.skin} />
      <M keys={['biceps']} hl={hl} p={[0, -0.33, 0.045]} r={0.062} s={[1, 2.5, 1]} />
      <M keys={['triceps']} hl={hl} p={[0, -0.28, -0.045]} r={0.066} s={[1.05, 2.6, 1]} />
      <group ref={refs[`e${s}` as JointKey]} position={[0, -0.62, 0]}>
        <mesh material={mats.skin}>
          <sphereGeometry args={[0.058, 14, 10]} />
        </mesh>
        <mesh geometry={geo.forearm} material={mats.skin} />
        <M keys={['forearms']} hl={hl} p={[0, -0.17, 0.012]} r={0.058} s={[1.05, 2.3, 1]} />
        <Hand side={side} mats={mats} handRef={handRef} />
        {dumbbell && <Dumbbell mats={mats} />}
      </group>
    </group>
  );
}

function Leg({ side, refs, feet, hl, mats, geo }: { side: 1 | -1; refs: Refs; feet: React.RefObject<Group | null>[]; hl: Highlight; mats: Materials; geo: Geo }) {
  const s = side === 1 ? 'L' : 'R';
  return (
    <group ref={refs[`h${s}` as JointKey]} position={[0.15 * side, -0.05, 0]}>
      <mesh geometry={geo.thigh} material={mats.skin} />
      <mesh geometry={geo.shortsLeg} material={mats.shorts} />
      <M keys={['quads']} hl={hl} p={[0.01 * side, -0.46, 0.05]} r={0.092} s={[1, 2.6, 0.9]} />
      <M keys={['hamstrings']} hl={hl} p={[0, -0.48, -0.05]} r={0.088} s={[1, 2.5, 0.9]} />
      <group ref={refs[`k${s}` as JointKey]} position={[0, -THIGH, 0]}>
        <mesh position={[0, 0, 0.02]} material={mats.skin}>
          <sphereGeometry args={[0.056, 14, 10]} />
        </mesh>
        <mesh geometry={geo.shin} material={mats.skin} />
        <M keys={['calves']} hl={hl} p={[0, -0.25, -0.042]} r={0.07} s={[1, 2.3, 1]} />
        <group ref={feet[side === 1 ? 0 : 1]} position={[0, -SHIN, 0]}>
          <mesh position={[0, -0.035, 0.07]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 1, 0.65]} material={mats.skin}>
            <capsuleGeometry args={[0.052, 0.17, 6, 12]} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

function Head({ mats }: { mats: Materials }) {
  return (
    <group position={[0, 1.31, 0.01]}>
      <mesh scale={[0.9, 1.05, 1]} material={mats.skin}>
        <sphereGeometry args={[0.17, 28, 20]} />
      </mesh>
      <mesh position={[0, -0.09, 0.035]} scale={[0.82, 0.75, 0.9]} material={mats.skin}>
        <sphereGeometry args={[0.13, 20, 14]} />
      </mesh>
      <mesh position={[0, 0.03, -0.012]} rotation={[-0.25, 0, 0]} scale={[0.95, 0.9, 1.03]} material={mats.hair}>
        <sphereGeometry args={[0.172, 28, 14, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
      </mesh>
      <mesh position={[0, -0.02, 0.165]} rotation={[Math.PI / 2, 0, 0]} material={mats.skin}>
        <coneGeometry args={[0.022, 0.06, 10]} />
      </mesh>
      {[1, -1].map((side) => (
        <group key={side}>
          <mesh position={[0.058 * side, 0.015, 0.145]} material={mats.eye}>
            <sphereGeometry args={[0.016, 10, 8]} />
          </mesh>
          <mesh position={[0.155 * side, -0.01, 0]} scale={[0.4, 1, 0.7]} material={mats.skin}>
            <sphereGeometry args={[0.04, 12, 10]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// Bench board under the torso that follows the body's tilt, for flat, incline and decline presses.
function BenchBoard({ pose, mats, seat, roller }: { pose: Pose; mats: Materials; seat?: boolean; roller?: boolean }) {
  const rx = pose.rootRx ?? 0;
  const y = pose.rootY ?? 0;
  const up = new Vector3(0, Math.cos(rx), Math.sin(rx));
  const back = new Vector3(0, Math.sin(rx), -Math.cos(rx));
  const center = up.clone().multiplyScalar(0.55).add(back.clone().multiplyScalar(0.27)).add(new Vector3(0, y, 0));
  const head = up.clone().multiplyScalar(1.3).add(back.clone().multiplyScalar(0.3)).add(new Vector3(0, y, 0));
  const foot = up.clone().multiplyScalar(-0.2).add(back.clone().multiplyScalar(0.3)).add(new Vector3(0, y, 0));
  return (
    <group>
      <mesh position={center} rotation={[rx, 0, 0]} material={mats.pad}>
        <boxGeometry args={[0.5, 1.7, 0.09]} />
      </mesh>
      {[head, foot].map((p, i) => (
        <mesh key={i} position={[0, (p.y + GROUND) / 2, p.z]} material={mats.metal}>
          <boxGeometry args={[0.36, Math.max(p.y - GROUND, 0.05), 0.06]} />
        </mesh>
      ))}
      {seat && (
        <mesh position={[0, y - 0.2, 0.12]} material={mats.pad}>
          <boxGeometry args={[0.5, 0.09, 0.5]} />
        </mesh>
      )}
      {roller && (
        <mesh position={[0, -1.05, 1.0]} rotation={[0, 0, Math.PI / 2]} material={mats.pad}>
          <cylinderGeometry args={[0.08, 0.08, 0.5, 16]} />
        </mesh>
      )}
    </group>
  );
}

function Props({ anim, mats }: { anim: Animation; mats: Materials }) {
  const list = anim.props ?? [];
  return (
    <>
      {list.includes('seat') && (
        <group>
          <mesh position={[0, (GROUND + SEAT_TOP) / 2, 0.15]} material={mats.prop}>
            <boxGeometry args={[0.55, SEAT_TOP - GROUND, 0.6]} />
          </mesh>
          <mesh position={[0, SEAT_TOP + 0.65, -0.32]} rotation={[-0.08, 0, 0]} material={mats.pad}>
            <boxGeometry args={[0.55, 1.3, 0.1]} />
          </mesh>
        </group>
      )}
      {list.includes('stool') && (
        <group>
          <mesh position={[0, (GROUND + SEAT_TOP) / 2, 0.1]} material={mats.prop}>
            <boxGeometry args={[0.5, SEAT_TOP - GROUND, 0.5]} />
          </mesh>
          <mesh position={[0, SEAT_TOP + 0.35, 0.5]} rotation={[0, 0, Math.PI / 2]} material={mats.pad}>
            <cylinderGeometry args={[0.07, 0.07, 0.6, 16]} />
          </mesh>
        </group>
      )}
      {list.includes('cable') && (
        <group>
          {[-0.45, 0.45].map((x) => (
            <mesh key={x} position={[x, (GROUND + BAR_Y + 0.9) / 2, -0.6]} material={mats.prop}>
              <boxGeometry args={[0.08, BAR_Y + 0.9 - GROUND, 0.08]} />
            </mesh>
          ))}
          <mesh position={[0, BAR_Y + 0.9, -0.25]} material={mats.prop}>
            <boxGeometry args={[1, 0.08, 0.8]} />
          </mesh>
        </group>
      )}
      {list.includes('bench') && <BenchBoard pose={anim.a} mats={mats} />}
      {list.includes('incline') && <BenchBoard pose={anim.a} mats={mats} seat />}
      {list.includes('decline') && <BenchBoard pose={anim.a} mats={mats} roller />}
      {list.includes('bar') && (
        <group>
          <mesh position={[0, BAR_Y, 0]} rotation={[0, 0, Math.PI / 2]} material={mats.metal}>
            <cylinderGeometry args={[0.035, 0.035, 2.6, 16]} />
          </mesh>
          {[-1.3, 1.3].map((x) => (
            <mesh key={x} position={[x, (BAR_Y + GROUND) / 2, 0]} material={mats.prop}>
              <boxGeometry args={[0.08, BAR_Y - GROUND, 0.08]} />
            </mesh>
          ))}
        </group>
      )}
      {list.includes('mat') && (
        <mesh position={[0, GROUND + 0.01, 0]} material={mats.pad}>
          <boxGeometry args={[1.2, 0.02, 3.6]} />
        </mesh>
      )}
    </>
  );
}

const X_AXIS = new Vector3(1, 0, 0);

export function Mannequin({ animation, primary, secondary }: { animation: Animation; primary: Muscle[]; secondary: Muscle[] }) {
  const mats = useMaterials();
  const geo = useGeometries();
  const top = useRef<Group>(null);
  const root = useRef<Group>(null);
  const spine = useRef<Group>(null);
  const handL = useRef<Mesh>(null);
  const handR = useRef<Mesh>(null);
  const cableBar = useRef<Group>(null);
  const cable = useRef<Mesh>(null);
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
  const tmp = useMemo(() => ({ a: new Vector3(), b: new Vector3(), dir: new Vector3(), q: new Quaternion() }), []);

  // Muscle groups light up through their parent group too: "chest" lights both chest zones, "back" lights the lats.
  const parents: Partial<Record<Muscle, Muscle>> = { upperChest: 'chest', lowerChest: 'chest', lats: 'back' };
  const role = (keys: Muscle[], list: Muscle[]) => keys.some((k) => list.includes(k) || (parents[k] !== undefined && list.includes(parents[k]!)));
  const hl: Highlight = (keys) => (role(keys, primary) ? mats.primary : role(keys, secondary) ? mats.secondary : mats.skin);

  const hasCable = animation.props?.includes('cable');

  useFrame(({ clock }) => {
    // Cosine easing gives a natural slow-fast-slow rep tempo.
    const t = (1 - Math.cos((clock.elapsedTime / animation.period) * Math.PI * 2)) / 2;
    const pose = blend(animation, t);
    if (!root.current || !spine.current || !top.current) return;
    root.current.position.y = pose.rootY;
    root.current.rotation.x = pose.rootRx;
    spine.current.rotation.x = pose.spine;
    for (const key of Object.keys(refs) as JointKey[]) {
      const [x, y, z] = pose.joints[key];
      refs[key].current?.rotation.set(x, y, z);
    }
    for (const foot of feet) foot.current?.rotation.set(pose.toe, 0, 0);

    // The pulldown bar spans both hands and hangs from the pulley by a cable.
    if (hasCable && handL.current && handR.current && cableBar.current && cable.current) {
      top.current.updateMatrixWorld(true);
      top.current.worldToLocal(handL.current.getWorldPosition(tmp.a));
      top.current.worldToLocal(handR.current.getWorldPosition(tmp.b));
      const width = tmp.a.distanceTo(tmp.b);
      tmp.dir.subVectors(tmp.a, tmp.b).normalize();
      cableBar.current.position.addVectors(tmp.a, tmp.b).multiplyScalar(0.5);
      cableBar.current.quaternion.copy(tmp.q.setFromUnitVectors(X_AXIS, tmp.dir));
      cableBar.current.scale.set(width + 0.35, 1, 1);
      const midY = cableBar.current.position.y;
      const topY = BAR_Y + 0.86;
      cable.current.position.set(cableBar.current.position.x, (midY + topY) / 2, (cableBar.current.position.z - 0.25) / 2);
      cable.current.scale.set(1, Math.max(topY - midY, 0.01), 1);
    }
  });

  // Floor and bench exercises sit low, so raise them toward the middle of the frame.
  const low = animation.a.rootRx !== undefined || (animation.a.rootY !== undefined && animation.a.rootY < -1.2);
  const lift = low ? 0.9 : 0.15;

  return (
    <group position={[0, lift, 0]} ref={top}>
      <mesh position={[0, GROUND, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.9, 48]} />
        <meshStandardMaterial color="#1A1D30" />
      </mesh>
      <Props anim={animation} mats={mats} />
      {hasCable && (
        <>
          <group ref={cableBar}>
            <mesh rotation={[0, 0, Math.PI / 2]} material={mats.metal}>
              <cylinderGeometry args={[0.022, 0.022, 1, 12]} />
            </mesh>
          </group>
          <mesh ref={cable} material={mats.metal}>
            <cylinderGeometry args={[0.008, 0.008, 1, 6]} />
          </mesh>
        </>
      )}
      <group ref={root}>
        <mesh geometry={geo.pelvis} scale={[1.25, 1, 0.85]} material={mats.shorts} />
        <M keys={['glutes']} hl={hl} p={[0.1, -0.07, -0.12]} r={0.125} s={[1, 1.05, 0.8]} />
        <M keys={['glutes']} hl={hl} p={[-0.1, -0.07, -0.12]} r={0.125} s={[1, 1.05, 0.8]} />
        <group ref={spine} position={[0, 0.1, 0]}>
          <mesh geometry={geo.torso} scale={[1.3, 1, 0.78]} material={mats.skin} />
          {[1, -1].map((x) => (
            <group key={x}>
              <M keys={['upperChest']} hl={hl} p={[0.12 * x, 0.84, 0.125]} r={0.12} s={[1.25, 0.55, 0.45]} rot={[0, 0, -0.15 * x]} />
              <M keys={['lowerChest']} hl={hl} p={[0.12 * x, 0.72, 0.125]} r={0.125} s={[1.2, 0.6, 0.45]} rot={[0, 0, 0.12 * x]} />
              <M keys={['lats']} hl={hl} p={[0.17 * x, 0.6, -0.08]} r={0.15} s={[0.7, 1.75, 0.5]} rot={[0, 0, 0.25 * x]} />
              <M keys={['back']} hl={hl} p={[0.06 * x, 0.3, -0.12]} r={0.065} s={[0.85, 2.3, 0.5]} />
              {[0.25, 0.37, 0.49].map((y) => (
                <M key={y} keys={['abs']} hl={hl} p={[0.05 * x, y, 0.12]} r={0.046} s={[1.05, 0.85, 0.42]} />
              ))}
            </group>
          ))}
          <M keys={['back']} hl={hl} p={[0, 0.92, -0.1]} r={0.15} s={[1.6, 0.85, 0.42]} />
          <mesh position={[0, 1.1, 0]} material={mats.skin}>
            <cylinderGeometry args={[0.065, 0.075, 0.2, 14]} />
          </mesh>
          <Head mats={mats} />
          <Arm side={1} refs={refs} hl={hl} mats={mats} geo={geo} dumbbell={!!animation.dumbbells} handRef={handL} />
          <Arm side={-1} refs={refs} hl={hl} mats={mats} geo={geo} dumbbell={!!animation.dumbbells} handRef={handR} />
        </group>
        <Leg side={1} refs={refs} feet={feet} hl={hl} mats={mats} geo={geo} />
        <Leg side={-1} refs={refs} feet={feet} hl={hl} mats={mats} geo={geo} />
      </group>
    </group>
  );
}
