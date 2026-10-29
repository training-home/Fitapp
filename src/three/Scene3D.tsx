import { Canvas, useFrame } from '@react-three/fiber/native';
import { ReactNode, RefObject, useRef } from 'react';
import { GestureResponderEvent, StyleProp, View, ViewStyle } from 'react-native';
import { Group } from 'three';

type Props = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  cameraZ?: number;
  autoRotate?: number;
  initialAngle?: number;
  tilt?: number;
};

type Drag = { x: number; y: number; rest: number; vx: number; dragging: boolean };

// Rotates its children from drag input, with inertia and a slow idle spin.
function DragRotator({ dragRef, autoRotate, children }: { dragRef: RefObject<Drag>; autoRotate: number; children: ReactNode }) {
  const group = useRef<Group>(null);

  useFrame((_, delta) => {
    const g = group.current;
    if (!g) return;
    if (!dragRef.current.dragging) {
      dragRef.current.vx *= 0.94;
      dragRef.current.x += dragRef.current.vx + autoRotate * delta;
      dragRef.current.y += (dragRef.current.rest - dragRef.current.y) * 0.08;
    }
    g.rotation.y += (dragRef.current.x - g.rotation.y) * 0.2;
    g.rotation.x += (dragRef.current.y - g.rotation.x) * 0.2;
  });

  return <group ref={group}>{children}</group>;
}

export function Scene3D({ children, style, cameraZ = 6, autoRotate = 0.25, initialAngle = 0, tilt = 0 }: Props) {
  const drag = useRef<Drag>({ x: initialAngle, y: tilt, rest: tilt, vx: 0, dragging: false });
  const start = useRef({ x: 0, y: 0, lastX: 0, lastY: 0 });

  // Gesture responder props: claim only horizontal drags so vertical swipes still scroll the screen.
  const onMoveShouldSet = (e: GestureResponderEvent) => {
    const dx = e.nativeEvent.pageX - start.current.x;
    const dy = e.nativeEvent.pageY - start.current.y;
    return Math.abs(dx) > 6 && Math.abs(dx) > Math.abs(dy);
  };
  const onTouchStart = (e: GestureResponderEvent) => {
    start.current = { x: e.nativeEvent.pageX, y: e.nativeEvent.pageY, lastX: e.nativeEvent.pageX, lastY: e.nativeEvent.pageY };
  };
  const onGrant = (e: GestureResponderEvent) => {
    drag.current.dragging = true;
    start.current.lastX = e.nativeEvent.pageX;
    start.current.lastY = e.nativeEvent.pageY;
  };
  const onMove = (e: GestureResponderEvent) => {
    const ddx = (e.nativeEvent.pageX - start.current.lastX) * 0.01;
    const ddy = (e.nativeEvent.pageY - start.current.lastY) * 0.01;
    start.current.lastX = e.nativeEvent.pageX;
    start.current.lastY = e.nativeEvent.pageY;
    drag.current.x += ddx;
    drag.current.y = Math.max(-0.8, Math.min(0.8, drag.current.y + ddy));
    drag.current.vx = ddx;
  };
  const onEnd = () => {
    drag.current.dragging = false;
  };

  return (
    <View
      style={style}
      onTouchStart={onTouchStart}
      onMoveShouldSetResponder={onMoveShouldSet}
      onResponderTerminationRequest={() => false}
      onResponderGrant={onGrant}
      onResponderMove={onMove}
      onResponderRelease={onEnd}
      onResponderTerminate={onEnd}
    >
      <Canvas camera={{ position: [0, 0, cameraZ], fov: 45 }}>
        <hemisphereLight args={['#E8EBFF', '#1A1D30', 1.1]} />
        <directionalLight position={[4, 6, 5]} intensity={1.8} />
        <directionalLight position={[-5, 2, -4]} intensity={0.6} color="#8B6CFF" />
        <DragRotator dragRef={drag} autoRotate={autoRotate}>
          {children}
        </DragRotator>
      </Canvas>
    </View>
  );
}
