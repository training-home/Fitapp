import { Canvas, useFrame } from '@react-three/fiber/native';
import { ReactNode, useRef } from 'react';
import { PanResponder, StyleProp, View, ViewStyle } from 'react-native';
import { Group } from 'three';

type Props = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  cameraZ?: number;
  autoRotate?: number;
};

type Drag = { x: number; y: number; vx: number; dragging: boolean };

// Rotates its children from drag input, with inertia and a slow idle spin.
function DragRotator({ drag, autoRotate, children }: { drag: Drag; autoRotate: number; children: ReactNode }) {
  const group = useRef<Group>(null);

  useFrame((_, delta) => {
    const g = group.current;
    if (!g) return;
    if (!drag.dragging) {
      drag.vx *= 0.94;
      drag.x += drag.vx + autoRotate * delta;
      drag.y *= 0.92;
    }
    g.rotation.y += (drag.x - g.rotation.y) * 0.2;
    g.rotation.x += (drag.y - g.rotation.x) * 0.2;
  });

  return <group ref={group}>{children}</group>;
}

export function Scene3D({ children, style, cameraZ = 6, autoRotate = 0.25 }: Props) {
  const drag = useRef<Drag>({ x: 0, y: 0, vx: 0, dragging: false }).current;
  const last = useRef({ dx: 0, dy: 0 });

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 4 || Math.abs(g.dy) > 4,
      onPanResponderGrant: () => {
        drag.dragging = true;
        last.current = { dx: 0, dy: 0 };
      },
      onPanResponderMove: (_, g) => {
        const ddx = (g.dx - last.current.dx) * 0.01;
        const ddy = (g.dy - last.current.dy) * 0.01;
        last.current = { dx: g.dx, dy: g.dy };
        drag.x += ddx;
        drag.y = Math.max(-0.8, Math.min(0.8, drag.y + ddy));
        drag.vx = ddx;
      },
      onPanResponderRelease: () => {
        drag.dragging = false;
      },
      onPanResponderTerminate: () => {
        drag.dragging = false;
      },
    }),
  ).current;

  return (
    <View style={style} {...pan.panHandlers}>
      <Canvas camera={{ position: [0, 0, cameraZ], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[4, 6, 5]} intensity={2.2} />
        <pointLight position={[-4, -3, 3]} intensity={30} color="#7C5CFF" />
        <DragRotator drag={drag} autoRotate={autoRotate}>
          {children}
        </DragRotator>
      </Canvas>
    </View>
  );
}
