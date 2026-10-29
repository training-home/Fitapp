// Joint angles for the mannequin. The body faces +z, arms and legs hang along -y.
// Angles are XYZ Euler radians in each joint's parent frame; left limbs sit at +x.
// Root rotation -PI/2 lays the body face up (head toward -z), +PI/2 lays it face down.

export type Vec3 = [number, number, number];
export type JointKey = 'sL' | 'sR' | 'eL' | 'eR' | 'hL' | 'hR' | 'kL' | 'kR';

export type Pose = {
  joints: Partial<Record<JointKey, Vec3>>;
  spine?: number;
  rootRx?: number;
  // Explicit pelvis height; ignored when grounded.
  rootY?: number;
  // Place the pelvis so the lowest foot touches the floor.
  grounded?: boolean;
  // Extra rise after grounding, with toes pointed (calf raises).
  tiptoe?: number;
};

export type Prop = 'seat' | 'bench' | 'bar' | 'mat';

export type Animation = {
  a: Pose;
  b: Pose;
  period: number;
  props?: Prop[];
  dumbbells?: boolean;
};

export const GROUND = -1.8;
export const THIGH = 0.84;
export const SHIN = 0.82;
export const FOOT = 0.08;
const LYING_Y = GROUND + 0.24;
const BENCH_TOP = -1.05;
export const SEAT_TOP = -1.0;
export const BAR_Y = 1.4;

const PI = Math.PI;
const mirror = (v: Vec3): Vec3 => [v[0], -v[1], -v[2]];
const arms = (s: Vec3, e: Vec3 = [0, 0, 0]) => ({ sL: s, sR: mirror(s), eL: e, eR: mirror(e) });
const legs = (h: Vec3, k: Vec3 = [0, 0, 0]) => ({ hL: h, hR: mirror(h), kL: k, kR: mirror(k) });

const standing = (extra: Partial<Record<JointKey, Vec3>> = {}, spine = 0): Pose => ({
  grounded: true,
  spine,
  joints: { ...arms([0, 0, 0.08], [-0.1, 0, 0]), ...legs([0, 0, 0.03]), ...extra },
});

// Straight-arm plank: alpha is the body's angle above the floor; the pelvis height keeps the toes on the floor.
const plank = (alpha: number) => ({ rootRx: PI / 2 - alpha, rootY: GROUND + 1.75 * Math.sin(alpha) });

const hinge = (spine: number, extra: Partial<Record<JointKey, Vec3>>): Pose => ({
  grounded: true,
  spine,
  joints: { ...legs([-0.35, 0, 0.05], [0.55, 0, 0]), ...extra },
});

const seated = (extra: Partial<Record<JointKey, Vec3>>): Pose => ({
  rootY: SEAT_TOP + 0.15,
  joints: { ...legs([-1.57, 0, 0.15], [1.57, 0, 0]), ...extra },
});

const onBench = (extra: Partial<Record<JointKey, Vec3>>): Pose => ({
  rootRx: -PI / 2,
  rootY: BENCH_TOP + 0.22,
  joints: { ...legs([0.15, 0, 0.18], [1.4, 0, 0]), ...extra },
});

const lyingKneesBent = legs([-1.0, 0, 0.08], [2.2, 0, 0]);

export const animations: Record<string, Animation> = {
  'overhead-press': {
    a: seated(arms([0, 0, 1.45], [0, 0, 1.65])),
    b: seated(arms([0, 0, 2.75], [0, 0, 0.3])),
    period: 2.6,
    props: ['seat'],
    dumbbells: true,
  },
  'front-raise': {
    a: standing(arms([-0.15, 0, 0.08], [-0.1, 0, 0])),
    b: standing(arms([-1.55, 0, 0.08], [-0.1, 0, 0])),
    period: 2.8,
    dumbbells: true,
  },
  'lateral-raise': {
    a: standing(arms([0, 0, 0.12], [0, 0, 0.1])),
    b: standing(arms([0, 0, 1.45], [0, 0, 0.15])),
    period: 2.6,
    dumbbells: true,
  },
  'rear-delt-fly': {
    a: hinge(1.15, arms([-1.1, 0, 0.1], [0, 0, 0.1])),
    b: hinge(1.15, arms([-1.1, 0, 1.35], [0, 0, 0.15])),
    period: 2.6,
    dumbbells: true,
  },
  'bench-press': {
    a: onBench(arms([-1.5, 0, 1.4], [0, 0, -1.4])),
    b: onBench(arms([-1.5, 0, 0.05], [0, 0, 0])),
    period: 2.6,
    props: ['bench'],
    dumbbells: true,
  },
  'chest-fly': {
    a: onBench(arms([-1.5, 0, 1.35], [0, 0, -0.3])),
    b: onBench(arms([-1.5, 0, 0.12], [0, 0, -0.3])),
    period: 3,
    props: ['bench'],
    dumbbells: true,
  },
  pushup: {
    a: { ...plank(0.48), joints: { ...arms([-1.09, 0, 0.05]), ...legs([0, 0, 0.04]) } },
    b: { ...plank(0.235), joints: { ...arms([-1.336, 0, 1.3], [0, 0, -1.3]), ...legs([0, 0, 0.04]) } },
    period: 2.2,
    props: ['mat'],
  },
  pullup: {
    a: { rootY: BAR_Y - 2.27, joints: { ...arms([0, 0, 2.75], [0, 0, 0.1]), ...legs([-0.1, 0, 0], [0.6, 0, 0]) } },
    b: { rootY: BAR_Y - 1.48, joints: { ...arms([0, 0, 1.2], [0, 0, 1.9]), ...legs([-0.25, 0, 0], [0.8, 0, 0]) } },
    period: 2.6,
    props: ['bar'],
  },
  row: {
    a: hinge(0.9, arms([-0.9, 0, 0.05])),
    b: hinge(0.9, arms([0.25, 0, 0.12], [-1.15, 0, 0])),
    period: 2.4,
    dumbbells: true,
  },
  'romanian-deadlift': {
    a: { grounded: true, spine: 0.05, joints: { ...arms([-0.05, 0, 0.05]), ...legs([-0.1, 0, 0.05], [0.2, 0, 0]) } },
    b: { grounded: true, spine: 1.2, joints: { ...arms([-1.2, 0, 0.05]), ...legs([-0.15, 0, 0.05], [0.3, 0, 0]) } },
    period: 3,
    dumbbells: true,
  },
  superman: {
    a: { rootRx: PI / 2, rootY: LYING_Y, joints: { ...arms([-3, 0, 0.15]), ...legs([0, 0, 0.05]) } },
    b: { rootRx: PI / 2, rootY: LYING_Y, spine: -0.35, joints: { ...arms([-2.8, 0, 0.15]), ...legs([0.35, 0, 0.05]) } },
    period: 2.6,
    props: ['mat'],
  },
  'biceps-curl': {
    a: standing(arms([0.05, 0, 0.06], [-0.1, 0, 0])),
    b: standing(arms([-0.1, 0, 0.06], [-2.3, 0, 0])),
    period: 2.4,
    dumbbells: true,
  },
  'hammer-curl': {
    a: standing(arms([0.05, 0, 0.1], [-0.1, 0, 0])),
    b: standing(arms([-0.15, 0, 0.1], [-2.1, 0, 0])),
    period: 2.4,
    dumbbells: true,
  },
  'triceps-extension': {
    a: standing(arms([-2.95, 0, 0.1], [0, 0, 0])),
    b: standing(arms([-2.95, 0, 0.1], [-2.1, 0, 0])),
    period: 2.6,
    dumbbells: true,
  },
  kickback: {
    a: hinge(0.9, arms([0.67, 0, 0.08], [-1.57, 0, 0])),
    b: hinge(0.9, arms([0.67, 0, 0.08], [0, 0, 0])),
    period: 2.2,
    dumbbells: true,
  },
  squat: {
    a: standing(arms([-0.2, 0, 0.08])),
    b: { grounded: true, spine: 0.5, joints: { ...arms([-1.4, 0, 0.1], [-0.2, 0, 0]), ...legs([-1.45, 0, 0.15], [1.55, 0, 0]) } },
    period: 2.6,
  },
  lunge: {
    a: standing(),
    b: {
      grounded: true,
      joints: { ...arms([0, 0, 0.1]), hL: [-1.2, 0, 0.05], kL: [1.3, 0, 0], hR: [0.15, 0, -0.05], kR: [1.4, 0, 0] },
    },
    period: 2.8,
  },
  'glute-bridge': {
    a: { rootRx: -PI / 2, rootY: LYING_Y - 0.04, joints: { ...arms([0, 0, 0.15]), ...lyingKneesBent } },
    b: { rootRx: -PI / 2, rootY: GROUND + 0.5, spine: -0.4, joints: { ...arms([0.3, 0, 0.15]), ...legs([-0.3, 0, 0.08], [1.9, 0, 0]) } },
    period: 2.6,
    props: ['mat'],
  },
  'calf-raise': {
    a: standing(),
    b: { ...standing(), tiptoe: 0.14 },
    period: 1.8,
  },
  crunch: {
    a: { rootRx: -PI / 2, rootY: LYING_Y, joints: { ...arms([-0.6, 0, 0.25], [-2.2, 0, 0]), ...lyingKneesBent } },
    b: { rootRx: -PI / 2, rootY: LYING_Y, spine: 0.6, joints: { ...arms([-0.6, 0, 0.25], [-2.2, 0, 0]), ...lyingKneesBent } },
    period: 2,
    props: ['mat'],
  },
  'leg-raise': {
    a: { rootRx: -PI / 2, rootY: LYING_Y, joints: { ...arms([0, 0, 0.12]), ...legs([-0.2, 0, 0.04]) } },
    b: { rootRx: -PI / 2, rootY: LYING_Y, joints: { ...arms([0, 0, 0.12]), ...legs([-1.5, 0, 0.04]) } },
    period: 3,
    props: ['mat'],
  },
  plank: {
    a: { ...plank(0.48), joints: { ...arms([-1.09, 0, 0.05]), ...legs([0, 0, 0.04]) } },
    b: { ...plank(0.47), joints: { ...arms([-1.1, 0, 0.05]), ...legs([0, 0, 0.04]) } },
    period: 3.5,
    props: ['mat'],
  },
  'jumping-jack': {
    a: standing(arms([0, 0, 0.1], [0, 0, 0.05])),
    b: standing({ ...arms([0, 0, 2.8], [0, 0, 0.1]), ...legs([0, 0, 0.35]) }),
    period: 0.9,
  },
  'high-knees': {
    a: {
      grounded: true,
      joints: { hL: [-1.5, 0, 0], kL: [1.6, 0, 0], hR: [0, 0, 0], kR: [0.1, 0, 0], sL: [0.5, 0, 0.1], eL: [-1.4, 0, 0], sR: [-0.6, 0, -0.1], eR: [-1.4, 0, 0] },
    },
    b: {
      grounded: true,
      joints: { hR: [-1.5, 0, 0], kR: [1.6, 0, 0], hL: [0, 0, 0], kL: [0.1, 0, 0], sR: [0.5, 0, -0.1], eR: [-1.4, 0, 0], sL: [-0.6, 0, 0.1], eL: [-1.4, 0, 0] },
    },
    period: 0.8,
  },
  'mountain-climber': {
    a: { ...plank(0.48), joints: { ...arms([-1.09, 0, 0.05]), hL: [-1.4, 0, 0], kL: [1.7, 0, 0], hR: [0, 0, 0], kR: [0, 0, 0] } },
    b: { ...plank(0.48), joints: { ...arms([-1.09, 0, 0.05]), hR: [-1.4, 0, 0], kR: [1.7, 0, 0], hL: [0, 0, 0], kL: [0, 0, 0] } },
    period: 0.9,
    props: ['mat'],
  },
};

const zero: Vec3 = [0, 0, 0];
const jointKeys: JointKey[] = ['sL', 'sR', 'eL', 'eR', 'hL', 'hR', 'kL', 'kR'];

export type ResolvedPose = {
  joints: Record<JointKey, Vec3>;
  spine: number;
  rootRx: number;
  rootY: number;
  toe: number;
};

const legExtent = (h: Vec3, k: Vec3) => (THIGH * Math.cos(h[0]) + SHIN * Math.cos(h[0] + k[0])) * Math.cos(h[2]) + FOOT;

export function blend(anim: Animation, t: number): ResolvedPose {
  const { a, b } = anim;
  const mix = (x = 0, y = 0) => x + (y - x) * t;
  const joints = {} as Record<JointKey, Vec3>;
  for (const key of jointKeys) {
    const ja = a.joints[key] ?? zero;
    const jb = b.joints[key] ?? zero;
    joints[key] = [mix(ja[0], jb[0]), mix(ja[1], jb[1]), mix(ja[2], jb[2])];
  }
  const tiptoe = mix(a.tiptoe, b.tiptoe);
  let rootY = mix(a.rootY, b.rootY);
  if (a.grounded) {
    const extent = Math.max(legExtent(joints.hL, joints.kL), legExtent(joints.hR, joints.kR));
    // Hip joints sit 0.05 below the pelvis origin.
    rootY = GROUND + extent + 0.05 + tiptoe;
  }
  return { joints, spine: mix(a.spine, b.spine), rootRx: mix(a.rootRx, b.rootRx), rootY, toe: tiptoe * 5 };
}
