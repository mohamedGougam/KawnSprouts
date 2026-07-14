import { useMemo, useRef, useState, type MutableRefObject } from 'react';
import { Canvas, useFrame, type ThreeEvent } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import type { InteriorSceneConfig } from '../../../../config/interiorSceneConfig';
import type { SproutColor } from '../../../../models';
import type { FurniturePlacement } from '../../../../features/shop/models/shopTypes';
import { placementsToInteriorProps } from '../../../../features/shop/services/furnitureService';
import { buildHouseInteriorProps } from '../../../../services/houseDecorService';
import { CozyDioramaShell } from './CozyDioramaShell';
import { CozyPropMesh } from './CozyPropMesh';
import { InteriorCameraRig } from './InteriorCamera';
import { clampWalkTarget } from './interiorCollision';
import {
  INTERIOR_CHARACTER_HEIGHT,
  INTERIOR_DPR_MAX,
  INTERIOR_DPR_MIN,
  INTERIOR_FLOOR_CLICK_RADIUS,
  INTERIOR_MARKER_DISTANCE,
  INTERIOR_MARKER_SCALE,
  INTERIOR_SHADOW_RADIUS,
} from './roomConstants';
import { playHouseSound } from '../../../../services/houseAudioService';
import { VillageSproutMarker } from '../../VillageSproutMarker';

export interface CozyHouseSceneProps {
  scene: InteriorSceneConfig;
  theme: 'day' | 'evening' | 'night';
  sproutColor: SproutColor;
  sproutName: string;
  residentName: string;
  residentEmoji: string;
  interactive: boolean;
  onDoorExit: () => void;
  furniturePlacements?: FurniturePlacement[];
  ownedItemIds?: string[];
  hatOverlay?: string | null;
  hatOffset?: { offsetX?: number; offsetY?: number; scale?: number } | null;
}

function RoomLighting({ themeTime, lampOn }: { themeTime: 'day' | 'evening' | 'night'; lampOn: boolean }) {
  const ambient = themeTime === 'night' ? 0.48 : themeTime === 'evening' ? 0.58 : 0.68;
  return (
    <>
      <ambientLight intensity={ambient} color="#fff7ed" />
      <directionalLight position={[-3, 5, 2]} intensity={themeTime === 'day' ? 0.7 : 0.38} color="#fde68a" />
      <directionalLight position={[2, 3, 4]} intensity={0.22} color="#fed7aa" />
      <hemisphereLight args={['#fff7ed', '#57534e', 0.38]} />
      {lampOn && <pointLight position={[-1.1, 0.8, -1]} intensity={0.45} color="#fbbf24" distance={2.5} />}
    </>
  );
}

function ContactShadow() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
      <circleGeometry args={[INTERIOR_SHADOW_RADIUS, 12]} />
      <meshBasicMaterial color="#000000" transparent opacity={0.2} depthWrite={false} />
    </mesh>
  );
}

function PlayerCharacter({
  color,
  name,
  positionRef,
  hatOverlay,
  hatOffset,
}: {
  color: SproutColor;
  name: string;
  positionRef: MutableRefObject<THREE.Vector3>;
  hatOverlay?: string | null;
  hatOffset?: { offsetX?: number; offsetY?: number; scale?: number } | null;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.position.copy(positionRef.current);
      groupRef.current.renderOrder = Math.round(positionRef.current.z * 100);
    }
  });

  return (
    <group ref={groupRef}>
      <ContactShadow />
      <Html
        center
        position={[0, INTERIOR_CHARACTER_HEIGHT, 0]}
        distanceFactor={INTERIOR_MARKER_DISTANCE}
        style={{ pointerEvents: 'none' }}
        zIndexRange={[100, 0]}
        transform
        sprite
      >
        <VillageSproutMarker
          color={color}
          name={name}
          isPlayer
          position={{ x: 0, y: 0 }}
          onTap={() => {}}
          embedded
          animate={false}
          labelScale={0.48}
          interiorScale={INTERIOR_MARKER_SCALE}
          hatOverlay={hatOverlay}
          hatOffset={hatOffset}
        />
      </Html>
    </group>
  );
}

function ResidentCharacter({
  name,
  emoji,
  positionRef,
}: {
  name: string;
  emoji: string;
  positionRef: MutableRefObject<THREE.Vector3>;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.position.copy(positionRef.current);
      groupRef.current.renderOrder = Math.round(positionRef.current.z * 100);
    }
  });

  return (
    <group ref={groupRef}>
      <ContactShadow />
      <Html
        center
        position={[0, INTERIOR_CHARACTER_HEIGHT, 0]}
        distanceFactor={INTERIOR_MARKER_DISTANCE}
        style={{ pointerEvents: 'none' }}
        transform
        sprite
      >
        <div
          className="flex flex-col items-center"
          style={{ transform: `scale(${INTERIOR_MARKER_SCALE})`, transformOrigin: 'center bottom' }}
        >
          <span className="text-xl drop-shadow-lg">{emoji}</span>
          <span className="mt-0.5 rounded-full bg-amber-100/95 px-2 py-0.5 text-[9px] font-semibold text-amber-900 shadow">
            {name}
          </span>
        </div>
      </Html>
    </group>
  );
}

function SceneContent({
  scene,
  theme,
  sproutColor,
  sproutName,
  residentName,
  residentEmoji,
  interactive,
  onDoorExit,
  furniturePlacements = [],
  ownedItemIds = [],
  hatOverlay,
  hatOffset,
}: CozyHouseSceneProps) {
  const [lampOn, setLampOn] = useState(theme !== 'day');
  const playerPos = useRef(new THREE.Vector3(scene.playerStart.x, 0.02, scene.playerStart.z));
  const targetPos = useRef(new THREE.Vector3(scene.playerStart.x, 0.02, scene.playerStart.z));
  const npcPos = useRef(new THREE.Vector3(scene.npcStart.x, 0.02, scene.npcStart.z));
  const stepRef = useRef(0);

  useFrame((_, delta) => {
    playerPos.current.lerp(targetPos.current, 1 - Math.exp(-8 * delta));
    if (playerPos.current.distanceTo(targetPos.current) > 0.05) {
      stepRef.current += delta;
      if (stepRef.current > 0.28) {
        stepRef.current = 0;
        playHouseSound('footstep', 0.07);
      }
    }
  });

  const onFloorClick = (e: ThreeEvent<MouseEvent>) => {
    if (!interactive) return;
    e.stopPropagation();
    const next = clampWalkTarget(e.point.x, e.point.z, scene.walkBounds, scene.collisions);
    targetPos.current.set(next.x, 0.02, next.z);
  };

  const renderProps = useMemo(
    () => buildHouseInteriorProps(
      scene.props.filter((p) => p.type !== 'window'),
      ownedItemIds,
    ),
    [scene.props, ownedItemIds],
  );
  const shopProps = useMemo(
    () => placementsToInteriorProps(furniturePlacements),
    [furniturePlacements],
  );
  const allProps = useMemo(() => [...renderProps, ...shopProps], [renderProps, shopProps]);

  return (
    <>
      <InteriorCameraRig />
      <RoomLighting themeTime={theme} lampOn={lampOn} />
      <CozyDioramaShell theme={scene.theme} themeTime={theme} lampOn={lampOn} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]} onClick={onFloorClick}>
        <circleGeometry args={[INTERIOR_FLOOR_CLICK_RADIUS, 32]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {allProps.map((prop) => (
        <CozyPropMesh
          key={prop.id}
          prop={prop}
          theme={scene.theme}
          lampOn={lampOn}
          ownedItemIds={ownedItemIds}
          onLampToggle={() => setLampOn((v) => !v)}
          onDoorExit={prop.type === 'door' ? onDoorExit : undefined}
        />
      ))}

      {scene.props.some((p) => p.type === 'window') && (
        <mesh
          position={[-2.45, 1.35, -0.5]}
          onClick={(e) => {
            e.stopPropagation();
            playHouseSound('wind-window');
          }}
        >
          <sphereGeometry args={[0.35, 8, 8]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      )}

      <PlayerCharacter
        color={sproutColor}
        name={sproutName}
        positionRef={playerPos}
        hatOverlay={hatOverlay}
        hatOffset={hatOffset}
      />
      <ResidentCharacter name={residentName} emoji={residentEmoji} positionRef={npcPos} />
    </>
  );
}

export function CozyHouseCanvas(props: CozyHouseSceneProps) {
  const dpr = useMemo(() => {
    if (typeof window === 'undefined') return INTERIOR_DPR_MIN;
    return Math.min(INTERIOR_DPR_MAX, Math.max(INTERIOR_DPR_MIN, window.devicePixelRatio));
  }, []);

  return (
    <Canvas
      orthographic
      dpr={dpr}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      style={{ width: '100%', height: '100%', touchAction: 'none' }}
    >
      <color attach="background" args={['#3d2e24']} />
      <fog attach="fog" args={['#3d2e24', 14, 32]} />
      <SceneContent {...props} />
    </Canvas>
  );
}
